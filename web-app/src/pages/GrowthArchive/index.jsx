import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { buildMonthlyReport } from '../../domain/monthlyReport.js'
import { getLatestGrowthSnippets } from '../../domain/growthSnippets.js'
import './growth-archive.css'

export default function GrowthArchive() {
  const navigate = useNavigate()
  const { decisions, aiInsights } = useApp()
  const report = buildMonthlyReport(decisions)
  const snippets = getLatestGrowthSnippets(decisions, 2)
  const latestInsight = aiInsights?.[0]

  return (
    <div className="archive-page">
      <div className="archive-hero">
        <span>长期成长档案</span>
        <h1>把每次选择留下的证据收在一起</h1>
        <p>月报、成长片段、AI 洞察和决策记录会先从这里汇总，主题花园后续再展开。</p>
      </div>

      <div className="archive-grid">
        <div className="archive-card primary" onClick={() => navigate('/monthly-report')}>
          <span className="archive-icon">🗓️</span>
          <b>月度成长报告</b>
          <small>{report.month} · {report.decisionCount} 个决策 · {report.reviewCount} 次复盘</small>
        </div>
        <div className="archive-card" onClick={() => navigate('/growth-snippets')}>
          <span className="archive-icon">💡</span>
          <b>成长片段</b>
          <small>{snippets[0]?.text || '复盘后会自动沉淀经验'}</small>
        </div>
        <div className="archive-card" onClick={() => navigate('/data-export')}>
          <span className="archive-icon">🤖</span>
          <b>AI 成长洞察</b>
          <small>{latestInsight?.title || '保存 DeepSeek 分析结果后会出现在这里'}</small>
        </div>
        <div className="archive-card" onClick={() => navigate('/decision-list')}>
          <span className="archive-icon">📊</span>
          <b>决策记录</b>
          <small>回看所有选择、阶段和浇水历史</small>
        </div>
      </div>
    </div>
  )
}
