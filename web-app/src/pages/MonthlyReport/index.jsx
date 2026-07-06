import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { buildMonthlyReport } from '../../domain/monthlyReport.js'
import './monthly-report.css'

export default function MonthlyReport() {
  const navigate = useNavigate()
  const { decisions } = useApp()
  const report = buildMonthlyReport(decisions)

  return (
    <div className="monthly-page">
      <div className="monthly-hero">
        <span className="monthly-kicker">{report.month} 月度成长报告</span>
        <h1>{report.summary}</h1>
        <p>这里看的是本月有没有完成“记录、行动、复盘”的闭环，不评价选择对错。</p>
      </div>

      <div className="monthly-stats">
        <div><b>{report.decisionCount}</b><span>本月决策</span></div>
        <div><b>{report.reviewCount}</b><span>复盘次数</span></div>
        <div><b>{report.snippetCount}</b><span>成长片段</span></div>
      </div>

      <div className="monthly-section">
        <span className="monthly-section-title">本月主题</span>
        <div className="monthly-card">
          <span className="monthly-card-main">
            {report.topCategory ? `${report.topCategory} · ${report.topCategoryCount} 次` : '还没有足够记录形成主题'}
          </span>
          <span className="monthly-card-sub">后续主题花园会基于这里继续展开。</span>
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
