import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { buildAvailableReportMonths, buildMonthlyReport } from '../../domain/monthlyReport.js'
import { getLatestGrowthSnippets } from '../../domain/growthSnippets.js'
import { buildThemeStats } from '../../domain/themeStats.js'
import './growth-archive.css'

export default function GrowthArchive() {
  const navigate = useNavigate()
  const { decisions, aiInsights } = useApp()
  const report = buildMonthlyReport(decisions)
  const months = buildAvailableReportMonths(decisions)
  const recentReports = months.slice(0, 4).map(month => buildMonthlyReport(decisions, { month }))
  const snippets = getLatestGrowthSnippets(decisions, 2)
  const themes = buildThemeStats(decisions).slice(0, 3)
  const latestInsight = aiInsights?.[0]

  return (
    <div className="archive-page">
      <div className="archive-hero">
        <span>长期成长档案</span>
        <h1>把每次选择留下的证据收在一起</h1>
        <p>月报、成长片段、AI 洞察、主题花园和决策记录会在这里汇总。</p>
      </div>

      <div className="archive-grid">
        <div className="archive-card memory" onClick={() => navigate('/daily-memory')}>
          <span className="archive-icon">🕯️</span>
          <b>今日拾光</b>
          <small>每天和过去的一次判断重新见面</small>
        </div>
        <div className="archive-card trail" onClick={() => navigate('/activity-trail')}>
          <span className="archive-icon">•••</span>
          <b>成长足迹</b>
          <small>看看最近十二周留下的记录与复盘</small>
        </div>
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

      <div className="archive-section">
        <span className="archive-section-title">2.0 Beta 准备度</span>
        <div className="archive-progress-list">
          <div><b>月度报告</b><span>已支持本月总结和历史月份回看</span></div>
          <div><b>成长档案</b><span>已聚合月报、片段、AI 洞察和决策记录</span></div>
          <div><b>主题花园</b><span>已支持主题统计、主题决策和主题收获</span></div>
          <div><b>发布前收口</b><span>Beta 阶段只做体验检查、文案修正和小问题修复</span></div>
        </div>
      </div>

      <div className="archive-section">
        <span className="archive-section-title">主题统计</span>
        {themes.length > 0 ? (
          <div className="archive-theme-list">
            {themes.map(item => (
              <button
                key={item.id}
                className="archive-theme-row"
                onClick={() => navigate(`/theme-garden?theme=${encodeURIComponent(item.id)}`)}
              >
                <span className="archive-theme-icon">{item.icon}</span>
                <div>
                  <b>{item.title}</b>
                  <small>{item.count} 个决策 · {item.ratio}%</small>
                  <i style={{ width: `${item.ratio}%` }} />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="archive-empty">记录第一个决策后，这里会出现你的主题分布。</div>
        )}
      </div>

      <div className="archive-section">
        <span className="archive-section-title">历史月报</span>
        <div className="archive-report-list">
          {recentReports.map(item => (
            <button
              key={item.month}
              className="archive-report-row"
              onClick={() => navigate(item.month === months[0] ? '/monthly-report' : `/monthly-report?month=${item.month}`)}
            >
              <b>{item.month}</b>
              <span>{item.decisionCount} 个决策 · {item.reviewCount} 次复盘 · {item.snippetCount} 条片段</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
