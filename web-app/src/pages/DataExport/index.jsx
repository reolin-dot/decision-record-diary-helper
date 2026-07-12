import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useIdentity } from '../../context/IdentityContext.js'
import { useToast } from '../../components/Toast.jsx'
import { useModal } from '../../components/Modal.jsx'
import { supabase } from '../../lib/supabase.js'
import { getLatestCloudBackup, saveCloudBackup } from '../../cloud/cloudBackup.js'
import storage from '../../storage/LocalStorageAdapter.js'
import { STORAGE_KEYS } from '../../storage/storageKeys.js'
import { buildDeepSeekPayload, buildDeepSeekPrompt } from '../../domain/deepseekExport.js'
import { buildLocalBackup, prepareBackupImport } from '../../domain/backupRecovery.js'
import {
  checkDataHealth,
  describeBackupFreshness,
  repairDataHealth,
} from '../../domain/dataHealth.js'
import './export.css'

const EXPORT_OPTIONS = [
  { key: 'backup', label: '完整本地备份', desc: '导出全部本地数据，适合恢复使用', icon: '🧳' },
  { key: 'all', label: '全部决策记录', desc: '导出所有决策及浇水历史', icon: '📋' },
  { key: 'reviewed', label: '已完成复盘', desc: '只导出有浇水记录的决策', icon: '✅' },
  { key: 'lessons', label: '成长片段合集', desc: '导出所有复盘中的经验总结', icon: '💡' },
  { key: 'stats', label: '统计摘要', desc: '导出决策统计数据', icon: '📊' },
]

const DEEPSEEK_CHAT_URL = 'https://chat.deepseek.com/'

function buildFullExport(decisions, decisionStyle, aiInsights = [], dataHealth = null) {
  return {
    exportDate: new Date().toISOString(),
    exportType: 'full',
    totalDecisions: decisions.length,
    dataHealth,
    decisionStyle: decisionStyle || null,
    aiInsights,
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

function buildLessonsExport(decisions, decisionStyle) {
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
    decisionStyle: decisionStyle || null,
    totalLessons: lessons.length,
    lessons,
  }
}

function buildStatsExport(decisions, decisionStyle) {
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
    decisionStyle: decisionStyle || null,
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
  const { decisions, decisionStyle, aiInsights, saveAiInsight, reloadFromStorage } = useApp()
  const { user } = useIdentity()
  const toast = useToast()
  const modal = useModal()
  const [selected, setSelected] = useState('all')
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [openingDeepSeek, setOpeningDeepSeek] = useState(false)
  const [result, setResult] = useState(null)
  const [insightTitle, setInsightTitle] = useState('')
  const [insightContent, setInsightContent] = useState('')
  const [lastBackupAt, setLastBackupAt] = useState(storage.get(STORAGE_KEYS.LAST_BACKUP_AT, ''))
  const [cloudBackup, setCloudBackup] = useState(null)
  const [cloudLoading, setCloudLoading] = useState(false)
  const [cloudError, setCloudError] = useState('')
  const storedDecisions = storage.get(STORAGE_KEYS.DECISIONS, decisions)
  const dataHealth = checkDataHealth({ decisions: storedDecisions, aiInsights, decisionStyle })
  const backupFreshness = describeBackupFreshness(lastBackupAt)
  const healthLabel = {
    healthy: '数据状态良好',
    warning: '有几处需要留意',
    error: '发现需要处理的问题',
  }[dataHealth.status]
  const healthItems = dataHealth.issues.length > 0 ? dataHealth.issues : dataHealth.warnings.slice(0, 3)
  const repairPreview = repairDataHealth({ decisions: storedDecisions })
  const canRepair = dataHealth.status === 'warning' && dataHealth.issues.length === 0 && repairPreview.repaired
  const buildCurrentBackup = () => buildLocalBackup(storage.exportAll(), { dataHealth })
  const markBackupExported = () => {
    const exportedAt = new Date().toISOString()
    storage.set(STORAGE_KEYS.LAST_BACKUP_AT, exportedAt)
    setLastBackupAt(exportedAt)
  }

  useEffect(() => {
    let active = true
    if (!user) {
      setCloudBackup(null)
      setCloudError('')
      return undefined
    }

    setCloudLoading(true)
    setCloudError('')
    getLatestCloudBackup(supabase, user.id)
      .then(result => {
        if (active && result.ok) setCloudBackup(result.backup)
        if (active && !result.ok) setCloudError(result.error)
      })
      .finally(() => {
        if (active) setCloudLoading(false)
      })

    return () => { active = false }
  }, [user?.id])

  const handleCloudBackup = async () => {
    if (!user || cloudLoading) return
    setCloudLoading(true)
    const payload = buildCurrentBackup()
    const result = await saveCloudBackup(supabase, { userId: user.id, payload })
    setCloudLoading(false)

    if (!result.ok) {
      setCloudError(result.error)
      toast.show(`云备份失败：${result.error}`)
      return
    }

    setCloudError('')
    setCloudBackup({ ...result.backup, payload })
    markBackupExported()
    toast.show('已上传完整云备份', { type: 'success' })
  }

  const handleCloudRestore = async () => {
    if (!cloudBackup?.payload || cloudLoading) return
    const prepared = prepareBackupImport(cloudBackup.payload, storedDecisions)
    if (!prepared.ok) {
      toast.show(`云备份不可恢复：${prepared.error}`)
      return
    }

    const { payload, summary } = prepared
    const confirmed = await modal.confirm({
      title: '从云端恢复',
      content: `云备份包含 ${summary.decisions} 条决策、${summary.aiInsights} 条洞察；预计新增 ${summary.addedDecisions} 条，同 ID 合并 ${summary.mergedDecisions} 条。恢复前会先下载当前本地备份。`,
      confirmText: '确认恢复',
      cancelText: '取消',
    })
    if (!confirmed) return

    setCloudLoading(true)
    downloadJSON(buildCurrentBackup(), `decision-diary-before-cloud-restore-${Date.now()}.json`)
    const ok = storage.importAll(payload, 'merge')
    setCloudLoading(false)
    if (!ok) {
      toast.show('云端恢复失败，本地数据未完整写入')
      return
    }

    reloadFromStorage()
    toast.show('云备份已合并到本地', { type: 'success' })
    setTimeout(() => navigate('/'), 700)
  }

  const handleExport = () => {
    setExporting(true)

    let data
    if (selected === 'backup') {
      data = buildCurrentBackup()
    } else if (selected === 'all') {
      data = buildFullExport(decisions, decisionStyle, aiInsights, dataHealth)
    } else if (selected === 'reviewed') {
      const reviewed = decisions.filter(d => d.firstReviewDone || d.resultReviewDone)
      data = buildFullExport(
        reviewed,
        decisionStyle,
        aiInsights,
        checkDataHealth({ decisions: reviewed, aiInsights, decisionStyle })
      )
    } else if (selected === 'lessons') {
      data = buildLessonsExport(decisions, decisionStyle)
    } else {
      data = buildStatsExport(decisions, decisionStyle)
    }

    setTimeout(() => {
      const exportedDecisions = data.decisions || data[STORAGE_KEYS.DECISIONS]
      const itemCount =
        selected === 'lessons'
          ? data.lessons.length
          : exportedDecisions
            ? exportedDecisions.length
            : 1

      const preview = JSON.stringify(data, null, 2).substring(0, 500) + '...'

      setResult({ format: 'JSON', itemCount, preview, data })
      setExporting(false)

      if (selected === 'backup') {
        markBackupExported()
      }
      downloadJSON(data, `decision-diary-${selected}-${Date.now()}.json`)
      toast.show('导出成功')
    }, 600)
  }

  const handleQuickBackup = () => {
    const data = buildCurrentBackup()
    markBackupExported()
    downloadJSON(data, `decision-diary-backup-${Date.now()}.json`)
    toast.show('已导出完整本地备份', { type: 'success' })
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

  const handleSaveInsight = () => {
    if (!insightContent.trim()) {
      toast.show('先粘贴 DeepSeek 的分析结果')
      return
    }

    const ok = saveAiInsight({
      title: insightTitle,
      content: insightContent,
      source: 'deepseek',
    })

    if (!ok) {
      toast.show('保存失败，请稍后重试')
      return
    }

    setInsightTitle('')
    setInsightContent('')
    toast.show('已保存为成长洞察', { type: 'success' })
  }

  const handleRepairData = async () => {
    const confirmed = await modal.confirm({
      title: '修复本地数据',
      content: '只会修复低风险格式问题，例如空数组、默认状态和布尔字段。建议先导出备份。',
      confirmText: '开始修复',
      cancelText: '取消',
    })
    if (!confirmed) return

    const result = repairDataHealth({ decisions: storedDecisions })
    if (!result.repaired) {
      toast.show('没有可自动修复的问题')
      return
    }

    downloadJSON(buildCurrentBackup(), `decision-diary-before-repair-${Date.now()}.json`)

    const ok = storage.set(STORAGE_KEYS.DECISIONS, result.decisions)
    if (!ok) {
      toast.show('修复失败，请先导出备份')
      return
    }

    reloadFromStorage()
    toast.show(`已修复 ${result.changedCount} 条记录`, { type: 'success' })
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const payload = JSON.parse(reader.result)
        const prepared = prepareBackupImport(payload, storedDecisions)
        if (!prepared.ok) {
          toast.show(`导入失败：${prepared.error}`)
          return
        }
        const { payload: safePayload, repair: repairResult, summary: importSummary } = prepared
        const confirmed = await modal.confirm({
          title: '确认导入备份',
          content: `文件包含 ${importSummary.decisions} 条决策、${importSummary.aiInsights} 条洞察；预计新增 ${importSummary.addedDecisions} 条决策，同 ID 合并 ${importSummary.mergedDecisions} 条。导入前会自动下载当前完整备份。`,
          confirmText: '确认导入',
          cancelText: '取消',
        })
        if (!confirmed) return

        downloadJSON(buildCurrentBackup(), `decision-diary-before-import-${Date.now()}.json`)
        const ok = storage.importAll(safePayload, 'merge')
        if (!ok) {
          toast.show('导入失败，请检查文件格式')
          return
        }
        reloadFromStorage()
        toast.show(
          repairResult.repaired
            ? `导入成功：新增 ${importSummary.addedDecisions} 条，合并 ${importSummary.mergedDecisions} 条；已修复 ${repairResult.changedCount} 条`
            : `导入成功：新增 ${importSummary.addedDecisions} 条，合并 ${importSummary.mergedDecisions} 条`
        )
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
      <div className={`health-card health-${dataHealth.status}`}>
        <div className="health-head">
          <span className="health-title">{healthLabel}</span>
          <span className="health-count">
            {dataHealth.summary.decisions} 条决策 · {dataHealth.summary.aiInsights} 条洞察
          </span>
        </div>
        {healthItems.length > 0 ? (
          <div className="health-list">
            {healthItems.map((item, idx) => (
              <span key={`${item.code}-${idx}`} className="health-item">
                {item.message}
              </span>
            ))}
          </div>
        ) : (
          <span className="health-desc">本地数据格式正常，可以安心导出备份。</span>
        )}
        <span className={`health-backup-note backup-${backupFreshness.status}`}>
          {backupFreshness.message}
        </span>
        <div className="health-actions">
          <button className="health-backup-btn" onClick={handleQuickBackup}>
            立即备份
          </button>
          {canRepair && (
            <button className="health-repair-btn" onClick={handleRepairData}>
              修复可自动处理的问题
            </button>
          )}
        </div>
      </div>

      <div className="cloud-backup-card">
        <div className="cloud-backup-head">
          <div>
            <span className="cloud-backup-kicker">V2.2 云备份</span>
            <span className="cloud-backup-title">跨设备保存一份完整副本</span>
          </div>
          <span className={`cloud-backup-status ${user ? 'signed-in' : ''}`}>
            {user ? '已登录' : '未登录'}
          </span>
        </div>
        {!user ? (
          <>
            <span className="cloud-backup-desc">登录后可以手动上传本地完整备份，并在其他设备恢复。</span>
            <button className="cloud-primary" onClick={() => navigate('/login')}>登录后使用</button>
          </>
        ) : (
          <>
            <span className="cloud-backup-desc">
              {cloudLoading
                ? '正在读取云端状态...'
                : cloudError
                  ? `云端连接失败：${cloudError}`
                : cloudBackup
                  ? `最近备份：${new Date(cloudBackup.created_at).toLocaleString('zh-CN')}`
                  : '云端还没有备份。第一次上传不会删除本地数据。'}
            </span>
            <div className="cloud-backup-actions">
              <button className="cloud-primary" onClick={handleCloudBackup} disabled={cloudLoading}>
                {cloudLoading ? '处理中...' : '上传当前完整备份'}
              </button>
              <button onClick={handleCloudRestore} disabled={cloudLoading || !cloudBackup?.payload}>
                从最近备份恢复
              </button>
            </div>
          </>
        )}
      </div>

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

        <div className="insight-save-card">
          <span className="insight-save-title">保存 AI 返回的成长洞察</span>
          <input
            className="insight-title-input"
            placeholder="标题，可不填"
            value={insightTitle}
            onChange={(e) => setInsightTitle(e.target.value)}
            maxLength={40}
          />
          <textarea
            className="insight-content-input"
            placeholder="从 DeepSeek 复制分析结果，粘贴到这里保存"
            value={insightContent}
            onChange={(e) => setInsightContent(e.target.value)}
            maxLength={4000}
          />
          <button className="insight-save-btn" onClick={handleSaveInsight}>
            保存洞察
          </button>
        </div>

        {aiInsights.length > 0 && (
          <div className="insight-list">
            <span className="insight-list-title">已保存的成长洞察</span>
            {aiInsights.slice(0, 3).map(item => (
              <div key={item.id} className="insight-item">
                <div className="insight-item-head">
                  <span className="insight-item-title">{item.title}</span>
                  <span className="insight-item-date">{(item.createdAt || '').slice(0, 10)}</span>
                </div>
                <span className="insight-item-content">{item.content}</span>
              </div>
            ))}
          </div>
        )}
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
            <span className="option-desc">支持完整本地备份或普通决策导出；会按 ID 合并</span>
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
