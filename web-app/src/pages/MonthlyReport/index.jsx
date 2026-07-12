import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { buildAvailableReportMonths, buildMonthlyReport } from '../../domain/monthlyReport.js'
import { createPrivacyShareCard } from '../../domain/privacyShareCard.js'
import { useToast } from '../../components/Toast.jsx'
import './monthly-report.css'

export default function MonthlyReport() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { decisions } = useApp()
  const toast = useToast()
  const months = useMemo(() => buildAvailableReportMonths(decisions), [decisions])
  const requestedMonth = searchParams.get('month')
  const month = months.includes(requestedMonth) ? requestedMonth : months[0]
  const monthIndex = months.indexOf(month)
  const report = buildMonthlyReport(decisions, { month })
  const setMonth = nextMonth => setSearchParams(nextMonth === months[0] ? {} : { month: nextMonth })

  const handleShare = () => {
    const canvas = createPrivacyShareCard(report)
    canvas.toBlob(async blob => {
      if (!blob) return toast.show('分享卡生成失败，请稍后重试')
      const file = new File([blob], `决策成长-${report.month}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: '我的决策成长' })
          return
        } catch (error) {
          if (error?.name === 'AbortError') return
        }
      }
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = file.name
      link.click()
      URL.revokeObjectURL(link.href)
      toast.show('隐私分享卡已保存', { type: 'success' })
    }, 'image/png')
  }

  return (
    <div className="monthly-page">
      <div className="monthly-hero">
        <span className="monthly-kicker">{report.month} 月度成长报告</span>
        <h1>{report.summary}</h1>
        <p>这里看的是本月有没有完成“记录、行动、复盘”的闭环，不评价选择对错。</p>
      </div>

      <div className="monthly-switcher">
        <button disabled={monthIndex >= months.length - 1} onClick={() => setMonth(months[monthIndex + 1])}>
          上个月
        </button>
        <span>{month}</span>
        <button disabled={monthIndex <= 0} onClick={() => setMonth(months[monthIndex - 1])}>
          下个月
        </button>
        <button disabled={monthIndex === 0} onClick={() => setMonth(months[0])}>
          回到本月
        </button>
      </div>

      <div className="monthly-stats">
        <div><b>{report.decisionCount}</b><span>本月决策</span></div>
        <div><b>{report.reviewCount}</b><span>复盘次数</span></div>
        <div><b>{report.snippetCount}</b><span>成长片段</span></div>
      </div>

      <div className="privacy-share-card">
        <div>
          <b>生成隐私分享卡</b>
          <span>只分享成长次数，不包含决策标题、选项、理由和复盘原文。</span>
        </div>
        <button onClick={handleShare}>生成并分享</button>
      </div>

      <div className="monthly-section">
        <span className="monthly-section-title">本月主题</span>
        <div className="monthly-card">
          <span className="monthly-card-main">
            {report.topCategory ? `${report.topCategory} · ${report.topCategoryCount} 次` : '还没有足够记录形成主题'}
          </span>
          <span className="monthly-card-sub">主题花园会继续沉淀这些高频主题。</span>
        </div>
      </div>

      <div className="monthly-section">
        <span className="monthly-section-title">最值得带走的片段</span>
        {report.topSnippets.length > 0 ? (
          <div className="monthly-snippets">
            {report.topSnippets.map(item => (
              <div key={item.id} className="monthly-snippet" onClick={() => navigate(`/decision/${item.decisionId}`)}>
                <span>“{item.text}”</span>
                <small>来自：{item.decisionTitle}</small>
              </div>
            ))}
          </div>
        ) : (
          <div className="monthly-card">
            <span className="monthly-card-main">还没有成长片段</span>
            <span className="monthly-card-sub">完成一次复盘后，这里会出现可回看的经验。</span>
          </div>
        )}
      </div>

      <div className="monthly-section">
        <span className="monthly-section-title">下月先做</span>
        <div className="monthly-card focus">
          <span className="monthly-card-main">{report.nextFocus}</span>
          <button onClick={() => navigate('/watering')}>去提醒中心</button>
        </div>
      </div>
    </div>
  )
}
