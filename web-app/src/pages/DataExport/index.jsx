import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { useModal } from '../../components/Modal.jsx'
import storage from '../../storage/LocalStorageAdapter.js'
import { buildDeepSeekPayload, buildDeepSeekPrompt } from '../../domain/deepseekExport.js'
import './export.css'

const EXPORT_OPTIONS = [
  { key: 'all', label: '全部决策记录', desc: '导出所有决策及浇水历史', icon: '📋' },
  { key: 'reviewed', label: '已完成复盘', desc: '只导出有浇水记录的决策', icon: '✅' },
  { key: 'lessons', label: '成长片段合集', desc: '导出所有复盘中的经验总结', icon: '💡' },
  { key: 'stats', label: '统计摘要', desc: '导出决策统计数据', icon: '📊' },
]

const DEEPSEEK_CHAT_URL = 'https://chat.deepseek.com/'

function buildFullExport(decisions) {
  return {
    exportDate: new Date().toISOString(),
    exportType: 'full',
    totalDecisions: decisions.length,
    decisions: decisions.map(d => ({
      id: d.id,
      title: d.title,
      category: d.category || '',
      background: d.background || '',
      options: d.options || [],
      choice: d.choice,
      reason: d.reason || '',
      expectation: d.expectation || '',
      mood: d.mood || '',
      createdAt: d.createdAt,
      reviewDate: d.reviewDate || '',
      stage: d.stage,
      actionStarted: d.actionStarted || false,
      firstReviewDone: d.firstReviewDone || false,
      resultReviewDone: d.resultReviewDone || false,
      wateringHistory: d.wateringHistory || [],
    })),
  }
}

function buildLessonsExport(decisions) {
  const lessons = []
  decisions.forEach(d => {
    if (d.wateringHistory && d.wateringHistory.length > 0) {
      d.wateringHistory.forEach(w => {
        if (w.lesson) {
          lessons.push({ lesson: w.lesson, from: d.title, date: w.date, type: w.type || 'current' })
        }
      })
    }
  })
  return {
    exportDate: new Date().toISOString(),
    exportType: 'lessons',
    totalLessons: lessons.length,
    lessons,
  }
}

function buildStatsExport(decisions) {
  const stageCounts = { seed: 0, sprout: 0, leaf: 0, first_bloom: 0, full_bloom: 0 }
  const categoryCounts = {}
  let reviewedCount = 0

  decisions.forEach(d => {
    const s = d.stage === 'bloom' ? 'full_bloom' : d.stage
    if (stageCounts[s] !== undefined) stageCounts[s]++
    const cat = d.category || 'other'
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1
    if (d.firstReviewDone || d.resultReviewDone) reviewedCount++
  })

  return {
    exportDate: new Date().toISOString(),
    exportType: 'stats',
    totalDecisions: decisions.length,
    reviewRate: decisions.length > 0 ? Math.round(reviewedCount / decisions.length * 100) + '%' : '0%',
    stageCounts,
    categoryCounts,
  }
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.warn('[DataExport] navigator clipboard failed, using fallback:', err)
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(textarea)
  return ok
}

export default function DataExport() {
  const navigate = useNavigate()
  const { decisions, decisionStyle, reloadFromStorage } = useApp()
  const toast = useToast()
  const modal = useModal()
  const [selected, setSelected] = useState('all')
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [openingDeepSeek, setOpeningDeepSeek] = useState(false)
  const [result, setResult] = useState(null)

  const handleExport = () => {
    setExporting(true)

    let data
    if (selected === 'all') {
      data = buildFullExport(decisions)
    } else if (selected === 'reviewed') {
      const reviewed = decisions.filter(d => d.firstReviewDone || d.resultReviewDone)
      data = buildFullExport(reviewed)
    } else if (selected === 'lessons') {
      data = buildLessonsExport(decisions)
    } else {
      data = buildStatsExport(decisions)
    }

    setTimeout(() => {
      const itemCount =
        selected === 'lessons'
          ? data.lessons.length
          : data.decisions
            ? data.decisions.length
            : 1

      const preview = JSON.stringify(data, null, 2).substring(0, 500) + '...'

      setResult({ format: 'JSON', itemCount, preview, data })
      setExporting(false)

      downloadJSON(data, `decision-diary-${selected}-${Date.now()}.json`)
      toast.show('导出成功')
    }, 600)
  }

  const handleCopyPreview = () => {
    if (result?.preview) {
      navigator.clipboard.writeText(result.preview).then(() => {
        toast.show('已复制预览')
      }).catch(() => {
        toast.show('复制失败')
      })
    }
  }

  const handleOpenDeepSeek = async () => {
    setOpeningDeepSeek(true)
    window.open(DEEPSEEK_CHAT_URL, '_blank', 'noopener,noreferrer')

    try {
      const payload = buildDeepSeekPayload({ decisions, decisionStyle })
      const prompt = buildDeepSeekPrompt(payload)
      await copyText(prompt)
      toast.show('已复制分析包，打开 DeepSeek 后直接粘贴发送')
    } catch (err) {
      console.error('[DataExport] DeepSeek package failed:', err)
      toast.show('复制失败，请检查浏览器剪贴板权限')
    } finally {
      setOpeningDeepSeek(false)
    }
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const confirmed = await modal.confirm({
      title: '导入备份',
      content: '将按决策 ID 合并到当前浏览器本地数据。若存在同一条记录，会以备份中的内容为准。',
      confirmText: '确认导入',
      cancelText: '取消',
    })

    if (!confirmed) {
      e.target.value = ''
      return
    }

    setImporting(true)
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result)
        const decisionsPayload = Array.isArray(payload.decisions)
          ? { decisions: payload.decisions }
          : payload
        const ok = storage.importAll(decisionsPayload, 'merge')
        if (!ok) {
          toast.show('导入失败，请检查文件格式')
          return
        }
        reloadFromStorage()
        toast.show('导入成功，已合并到本地数据')
        setTimeout(() => navigate('/'), 700)
      } catch (err) {
        console.error('[DataExport] import failed:', err)
        toast.show('导入失败，请选择有效的 JSON 文件')
      } finally {
        setImporting(false)
        e.target.value = ''
      }
    }
    reader.onerror = () => {
      setImporting(false)
      e.target.value = ''
      toast.show('读取文件失败')
    }
    reader.readAsText(file)
  }

  return (
    <div className="export-page">
      <div className="export-section">
        <span className="export-section-title">选择导出内容</span>
        <div className="option-list">
          {EXPORT_OPTIONS.map(opt => (
            <div
              key={opt.key}
              className={`option-card ${opt.key === selected ? 'selected' : ''}`}
              onClick={() => { setSelected(opt.key); setResult(null) }}
            >
              <span className="option-icon">{opt.icon}</span>
              <div className="option-info">
                <span className="option-label">{opt.label}</span>
                <span className="option-desc">{opt.desc}</span>
              </div>
              {opt.key === selected && <span className="option-check">✓</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="export-action">
        <button
          className={`export-btn ${exporting ? 'loading' : ''}`}
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? '导出中...' : '开始导出'}
        </button>
      </div>

      <div className="deepseek-section">
        <span className="export-section-title">DeepSeek 分析</span>
        <div className="deepseek-card">
          <div className="deepseek-copy">
            <span className="deepseek-title">一键生成 AI 可读分析包</span>
            <span className="deepseek-desc">
              会把决策性格测试、本地决策和复盘整理成结构化提示词，复制后打开 DeepSeek。
            </span>
          </div>
          <button
            className={`deepseek-btn ${openingDeepSeek ? 'loading' : ''}`}
            onClick={handleOpenDeepSeek}
            disabled={openingDeepSeek}
          >
            {openingDeepSeek ? '准备中...' : '复制并打开'}
          </button>
        </div>
      </div>

      {result && (
        <div className="export-result">
          <span className="export-section-title">导出完成</span>
          <div className="export-result-card">
            <div className="result-info">
              <div className="result-item">
                <span className="result-label">格式</span>
                <span className="result-value">{result.format}</span>
              </div>
              <div className="result-item">
                <span className="result-label">条目数</span>
                <span className="result-value">{result.itemCount}</span>
              </div>
            </div>
            <div className="result-preview" onClick={handleCopyPreview}>
              <span className="preview-title">数据预览（点击复制）</span>
              <span className="preview-content">{result.preview}</span>
            </div>
          </div>
        </div>
      )}

      <div className="import-section">
        <span className="export-section-title">恢复备份</span>
        <label className={`import-card ${importing ? 'loading' : ''}`}>
          <span className="option-icon">📥</span>
          <span className="import-info">
            <span className="option-label">{importing ? '导入中...' : '导入 JSON 备份'}</span>
            <span className="option-desc">会按决策 ID 合并；建议先导出当前数据再导入</span>
          </span>
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            disabled={importing}
          />
        </label>
      </div>

      <div className="export-hint">
        <p>当前 Web 版数据保存在本机浏览器。换设备、清缓存或更换浏览器可能看不到原数据，建议定期导出 JSON 备份。</p>
      </div>
    </div>
  )
}
