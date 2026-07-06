import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { getStageMeta, isBloomStage, isGrowingStage } from '../../domain/decisionStages.js'
import { getReminders } from '../../domain/reminders.js'
import { getLatestGrowthSnippets } from '../../domain/growthSnippets.js'
import { buildDecisionPatterns } from '../../domain/decisionPatterns.js'
import { formatDate } from '../../utils/util.js'
import './garden.css'

export default function Garden() {
  const navigate = useNavigate()
  const { decisions, stats, isNewUser, hasStyleTest, decisionStyle, aiInsights } = useApp()

  const today = formatDate(new Date())

  const decorated = decisions
    .filter(d => !d._deleted)
    .map(d => {
      const meta = getStageMeta(d.stage)
      return { ...d, stageIcon: meta.icon, stageLabel: meta.label, stageDesc: meta.description }
    })

  const sorted = [...decorated].sort(
    (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')
  )

  const reminders = getReminders(decorated, today)
  const reminderCount = reminders.length
  const topReminder = reminders[0] || null
  const bloomedCount = decorated.filter(d => isBloomStage(d.stage)).length
  const growingCount = decorated.filter(d => isGrowingStage(d.stage)).length
  const latestSnippets = getLatestGrowthSnippets(decorated, 3)
  const latestAiInsight = aiInsights?.[0] || null
  const decisionPatterns = buildDecisionPatterns({
    decisions: decorated,
    decisionStyle,
    aiInsights,
    today,
  })

  const isEmpty = decisions.length === 0
  const recentDecisions = sorted.slice(0, 5)

  const handlePlantFlower = () => {
    if (!hasStyleTest) {
      navigate('/style-test')
    } else {
      navigate('/record?step=1')
    }
  }

  return (
    <div className="garden-page">
      <div className="garden-top-bar">
        <div className="garden-user-info">
          <div className="garden-avatar" onClick={() => navigate('/profile')}>
            <span>👤</span>
          </div>
          <div className="garden-streak">
            {!isEmpty ? (
              <span>🔥 连续 <span className="streak-num">{stats.streak}</span> 天记录</span>
            ) : (
              <span>欢迎来到决策花园</span>
            )}
          </div>
        </div>
      </div>

      {isNewUser && isEmpty && (
        <div className="garden-scene">
          <div className="empty-garden">
            <div className="empty-illustration">
              <span className="empty-icon-large">🌱</span>
              <div className="empty-ground"></div>
            </div>
            <div className="empty-text-group">
              <div className="empty-title">欢迎来到你的决策花园</div>
              <div className="empty-desc">每一个重要决策，都是一颗种子。</div>
              <div className="empty-desc">记录下来，开始行动，再慢慢复盘，</div>
              <div className="empty-desc">它会陪你从种子长到盛开。</div>
            </div>
            <div className="empty-steps">
              <div className="empty-step">
                <span className="step-num">1</span>
                <span className="step-text">种花：看清问题并做选择</span>
              </div>
              <div className="empty-step">
                <span className="step-num">2</span>
                <span className="step-text">长叶：开始推进真实行动</span>
              </div>
              <div className="empty-step">
                <span className="step-num">3</span>
                <span className="step-text">开花：当下复盘和结果复盘</span>
              </div>
            </div>
            <button className="empty-cta" onClick={handlePlantFlower}>
              种下第一颗种子
            </button>
          </div>
        </div>
      )}

      {!isNewUser && isEmpty && (
        <div className="garden-scene">
          <div className="empty-garden">
            <div className="empty-illustration">
              <span className="empty-icon-large">🌱</span>
              <div className="empty-ground"></div>
            </div>
            <div className="empty-text-group">
              <div className="empty-title">花园还是空的</div>
              <div className="empty-desc">记录一个决策，种下第一颗种子吧。</div>
            </div>
            <button className="empty-cta" onClick={handlePlantFlower}>
              种下第一颗种子
            </button>
          </div>
        </div>
      )}

      {!isEmpty && (
        <div className="garden-scene">
          <div className="garden-stats">
            <div className="garden-stat-item">
              <span className="stat-num">{growingCount}</span>
              <span className="stat-label">正在生长</span>
            </div>
            <div className="garden-stat-divider"></div>
            <div className="garden-stat-item">
              <span className="stat-num">{reminderCount}</span>
              <span className="stat-label">待回看</span>
            </div>
            <div className="garden-stat-divider"></div>
            <div className="garden-stat-item">
              <span className="stat-num">{bloomedCount}</span>
              <span className="stat-label">已经盛开</span>
            </div>
          </div>

          <div className="garden-actions-inline">
            <div className="action-btn" onClick={handlePlantFlower}>
              <span className="action-btn-icon">🌱</span>
              <span className="action-btn-text">种花</span>
            </div>
            <div className="action-btn" onClick={() => navigate('/watering')}>
              <div className="action-badge-wrap">
                <span className="action-btn-icon">💧</span>
                {reminderCount > 0 && <div className="action-badge-dot"></div>}
              </div>
              <span className="action-btn-text">提醒</span>
            </div>
            <div className="action-btn" onClick={() => navigate('/coach')}>
              <span className="action-btn-icon">🧭</span>
              <span className="action-btn-text">锦囊</span>
            </div>
            <div className="action-btn" onClick={() => navigate('/growth-snippets')}>
              <span className="action-btn-icon">💡</span>
              <span className="action-btn-text">片段</span>
            </div>
          </div>

          {decisionPatterns.patternCards.length > 0 && (
            <div className="pattern-panel">
              <div className="pattern-head">
                <span className="pattern-kicker">{decisionPatterns.heading || '决策模式'}</span>
                <span className="pattern-summary">{decisionPatterns.overview}</span>
              </div>
              <div className="pattern-card-list">
                {decisionPatterns.patternCards.map(card => (
                  <div
                    key={card.id}
                    className={`pattern-card pattern-${card.id}`}
                    onClick={() => card.actionPath && navigate(card.actionPath)}
                  >
                    <span className="pattern-label">{card.label}</span>
                    <span className="pattern-title">{card.title}</span>
                    <span className="pattern-body">{card.body}</span>
                    {card.evidence && <span className="pattern-evidence">{card.evidence}</span>}
                    {card.actionLabel && <span className="pattern-action">{card.actionLabel} ›</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {topReminder && (
            <div
              className={`garden-review-focus focus-${topReminder.type}`}
              onClick={() => navigate(`/review/${topReminder.decisionId}`)}
            >
              <div className="review-focus-head">
                <span className="review-focus-icon">{topReminder.icon}</span>
                <div className="review-focus-title-wrap">
                  <span className="review-focus-kicker">今天最值得回看</span>
                  <span className="review-focus-title">{topReminder.decision.title}</span>
                </div>
                <span className="review-focus-count">{reminderCount} 个</span>
              </div>
              <span className="review-focus-tone">{topReminder.tone}</span>
              <div className="review-focus-actions">
                <button type="button" onClick={(e) => { e.stopPropagation(); navigate(`/review/${topReminder.decisionId}`) }}>
                  去复盘
                </button>
                {reminderCount > 1 && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); navigate('/watering') }}>
                    查看全部
                  </button>
                )}
              </div>
            </div>
          )}

          {latestAiInsight && (
            <div className="garden-ai-insight" onClick={() => navigate('/data-export')}>
              <div className="ai-insight-head">
                <span className="ai-insight-label">最近成长洞察</span>
                <span className="ai-insight-date">{(latestAiInsight.createdAt || '').slice(0, 10)}</span>
              </div>
              <span className="ai-insight-title">{latestAiInsight.title}</span>
              <span className="ai-insight-text">{latestAiInsight.content}</span>
              <span className="ai-insight-link">查看已保存洞察 ›</span>
            </div>
          )}

          {latestSnippets.length > 0 && (
            <div className="garden-growth-snippet" onClick={() => navigate('/growth-snippets')}>
              <span className="snippet-label">最近成长片段</span>
              {latestSnippets.map(snippet => (
                <span key={snippet.id} className="snippet-text">“{snippet.text}”</span>
              ))}
            </div>
          )}

          <div className="flower-grid">
            {sorted.map(d => (
              <div
                key={d.id}
                className="flower-card"
                onClick={() => navigate(`/decision/${d.id}`)}
              >
                <div className={`flower-visual stage-${d.stage}`}>
                  <span className="flower-emoji">{d.stageIcon}</span>
                </div>
                <div className="flower-info">
                  <span className="flower-stage-label">{d.stageLabel}</span>
                  <span className="flower-title">{d.title}</span>
                </div>
              </div>
            ))}
          </div>

          {stats.monthlyDecisions > 0 && (
            <div className="garden-monthly">
              本月种下 {stats.monthlyDecisions} 个决策
            </div>
          )}
        </div>
      )}

      {recentDecisions.length > 0 && (
        <div className="recent-section">
          <span className="recent-title">最近决策</span>
          <div className="recent-list">
            {recentDecisions.map(d => (
              <div
                key={d.id}
                className="recent-item"
                onClick={() => navigate(`/decision/${d.id}`)}
              >
                <span className="recent-stage-icon">{d.stageIcon}</span>
                <div className="recent-item-body">
                  <span className="recent-item-title">{d.title}</span>
                  <span className="recent-item-date">{d.stageLabel} · {d.stageDesc}</span>
                </div>
                <span className="recent-item-arrow">›</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
