import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { buildThemeInsight, buildThemeNextAction, buildThemeStats, getThemeDecisions, getThemeGrowthSnippets } from '../../domain/themeStats.js'
import './theme-garden.css'

export default function ThemeGarden() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { decisions } = useApp()
  const themes = buildThemeStats(decisions)
  const requestedTheme = searchParams.get('theme')
  const selectedTheme = themes.find(item => item.id === requestedTheme) || themes[0]
  const themeDecisions = selectedTheme ? getThemeDecisions(decisions, selectedTheme.id) : []
  const themeSnippets = selectedTheme ? getThemeGrowthSnippets(decisions, selectedTheme.id) : []
  const insight = buildThemeInsight(selectedTheme)
  const nextAction = selectedTheme ? buildThemeNextAction(decisions, selectedTheme.id) : null

  return (
    <div className="theme-page">
      <div className="theme-hero">
        <span>主题花园</span>
        <h1>{selectedTheme ? `${selectedTheme.title}正在长出自己的线索` : '还没有形成主题'}</h1>
        <p>按主题回看决策、收获和下一步，让长期选择慢慢有形。</p>
      </div>

      {themes.length > 0 ? (
        <>
          <div className="theme-tabs">
            {themes.map(item => (
              <button
                key={item.id}
                className={item.id === selectedTheme.id ? 'on' : ''}
                onClick={() => setSearchParams({ theme: item.id })}
              >
                <span>{item.icon}</span>
                {item.title}
              </button>
            ))}
          </div>

          <div className="theme-summary">
            <b>{selectedTheme.count}</b>
            <span>个决策集中在这里，占全部记录的 {selectedTheme.ratio}%</span>
          </div>

          <div className="theme-insight">
            <span>主题洞察</span>
            <b>{insight}</b>
          </div>

          {nextAction && (
            <div className="theme-next">
              <span>下一步建议</span>
              <b>{nextAction.text}</b>
              <button onClick={() => navigate(nextAction.path)}>{nextAction.label}</button>
            </div>
          )}

          <div className="theme-section-title">主题收获</div>
          {themeSnippets.length > 0 ? (
            <div className="theme-snippets">
              {themeSnippets.map(item => (
                <button key={item.id} onClick={() => navigate(`/decision/${item.decisionId}`)}>
                  <b>“{item.text}”</b>
                  <span>来自：{item.decisionTitle}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="theme-empty">完成这个主题下的一次复盘后，这里会出现可带走的收获。</div>
          )}

          <div className="theme-section-title">主题决策</div>
          <div className="theme-list">
            {themeDecisions.map(item => (
              <button key={item.id} onClick={() => navigate(`/decision/${item.id}`)}>
                <b>{item.title || '未命名决策'}</b>
                <span>{item.createdAt || '未记录日期'} · {item.status === 'reviewed' ? '已复盘' : '生长中'}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="theme-empty">记录第一个正式决策后，这里会出现主题花园。</div>
      )}
    </div>
  )
}
