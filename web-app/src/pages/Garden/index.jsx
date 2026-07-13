import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { isBloomStage, isGrowingStage } from '../../domain/decisionStages.js'
import { getReminders } from '../../domain/reminders.js'
import { getLatestGrowthSnippets } from '../../domain/growthSnippets.js'
import { buildDecisionPatterns } from '../../domain/decisionPatterns.js'
import { buildHomeNextAction } from '../../domain/homeNextAction.js'
import { formatDate } from '../../utils/util.js'
import './garden.css'

const STAGE_LABELS = {
  seed: '待整理',
  sprout: '已选择',
  leaf: '行动中',
  first_bloom: '已复盘',
  full_bloom: '已闭环',
  bloom: '已闭环',
}

function ArchiveMark() {
  return (
    <svg className="empty-plant" viewBox="0 0 160 150" fill="none" aria-hidden="true">
      <rect x="30" y="18" width="100" height="114" stroke="currentColor" strokeWidth="2" />
      <path d="M48 46h64M48 68h64M48 90h45M48 112h28" stroke="currentColor" strokeWidth="2" />
      <path d="M112 88v26M99 101h26" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export default function Garden() {
  const navigate = useNavigate()
  const { decisions, stats, isNewUser, hasStyleTest, decisionStyle, aiInsights } = useApp()

  const today = formatDate(new Date())
  const dayMarker = String(new Date().getDate()).padStart(2, '0')
  const dateLabel = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(new Date())

  const decorated = decisions
    .filter(d => !d._deleted)
    .map(d => ({ ...d, stageLabel: STAGE_LABELS[d.stage] || '待整理' }))

  const sorted = [...decorated].sort(
    (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')
  )

  const reminders = getReminders(decorated, today)
  const reminderCount = reminders.length
  const topReminder = reminders[0] || null
  const homeNextAction = buildHomeNextAction(decorated, topReminder)
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
          <button className="garden-avatar" type="button" onClick={() => navigate('/profile')} aria-label="打开我的页面">
            <span>D</span>
          </button>
          <div className="garden-streak">
            {!isEmpty ? (
              <span>连续 <span className="streak-num">{stats.streak}</span> 天记录</span>
            ) : (
              <span>欢迎来到决策档案</span>
            )}
          </div>
        </div>
        {!isEmpty && <button className="garden-search-btn" onClick={() => navigate('/decision-list?focus=1')} aria-label="搜索全部决策">⌕</button>}
      </div>

      {!isEmpty && (
        <section className="garden-masthead">
          <div className="garden-masthead-copy">
            <span className="garden-masthead-kicker">Decision Conservatory · Daily</span>
            <h1>今天，先理清<br /><em>一件事。</em></h1>
            <p>把问题放到桌面上，称量选择，留下行动证据。答案不必一次完美。</p>
            <button type="button" onClick={handlePlantFlower}>
              <span>开始一次决策</span><i>↗</i>
            </button>
          </div>
          <div className="garden-masthead-index" aria-hidden="true">
            <span>{dayMarker}</span>
            <small>{dateLabel} · 今日观察</small>
          </div>
        </section>
      )}

      {isNewUser && isEmpty && (
        <div className="garden-scene">
          <div className="empty-garden empty-garden-onboarding">
            <div className="empty-illustration">
              <ArchiveMark />
            </div>
            <div className="empty-text-group">
              <div className="empty-eyebrow">你的第一份决策档案</div>
              <h1 className="empty-title">今天，想理清哪件事？</h1>
              <p className="empty-desc">把问题写下来，看清选项，选一个能验证的行动。答案不必一次完美，它会在复盘里慢慢长出来。</p>
            </div>
            <div className="empty-steps">
              <div className="empty-step">
                <span className="step-num">1</span>
                <span className="step-text"><b>写下问题</b><small>把脑海里的纠结放到纸面上</small></span>
              </div>
              <div className="empty-step">
                <span className="step-num">2</span>
                <span className="step-text"><b>选一个行动</b><small>用真实反馈代替反复空想</small></span>
              </div>
              <div className="empty-step">
                <span className="step-num">3</span>
                <span className="step-text"><b>回来复盘</b><small>把这次选择变成下次的经验</small></span>
              </div>
            </div>
            <button className="empty-cta" onClick={handlePlantFlower}>
              开始一次决策
            </button>
            <div className="onboarding-choices">
              <button onClick={() => navigate('/compass')}>还没有头绪？先做 30 秒罗盘</button>
              <button onClick={() => navigate('/data-export')}>从备份恢复旧记录</button>
            </div>
          </div>
        </div>
      )}

      {!isNewUser && isEmpty && (
        <div className="garden-scene">
          <div className="empty-garden empty-garden-compact">
            <div className="empty-illustration">
              <ArchiveMark />
            </div>
            <div className="empty-text-group">
              <div className="empty-eyebrow">新的选择，从这里开始</div>
              <h1 className="empty-title">今天，想理清哪件事？</h1>
              <p className="empty-desc">写下一个真实问题，给未来的自己留下一条可以回看的决策路径。</p>
            </div>
            <button className="empty-cta" onClick={handlePlantFlower}>
              开始一次决策
            </button>
          </div>
        </div>
      )}

      {!isEmpty && (
        <div className="garden-scene">
          <div className="garden-stats">
            <div className="garden-stat-item">
              <span className="stat-num">{growingCount}</span>
              <span className="stat-label">正在推进</span>
            </div>
            <div className="garden-stat-divider"></div>
            <div className="garden-stat-item">
              <span className="stat-num">{reminderCount}</span>
              <span className="stat-label">待回看</span>
            </div>
            <div className="garden-stat-divider"></div>
            <div className="garden-stat-item">
              <span className="stat-num">{bloomedCount}</span>
              <span className="stat-label">已经闭环</span>
            </div>
          </div>

          <div className="garden-actions-inline">
            <button type="button" className="action-btn" onClick={handlePlantFlower}>
              <span className="action-btn-index">01</span>
              <span className="action-btn-text">记录新决策<small>从一个真实问题开始</small></span>
            </button>
            <button type="button" className="action-btn" onClick={() => navigate('/watering')}>
              <div className="action-badge-wrap">
                <span className="action-btn-index">02</span>
                {reminderCount > 0 && <div className="action-badge-dot"></div>}
              </div>
              <span className="action-btn-text">查看待复盘<small>{reminderCount > 0 ? `${reminderCount} 件等待回看` : '暂时没有新提醒'}</small></span>
            </button>
            <button type="button" className="action-btn" onClick={() => navigate('/coach')}>
              <span className="action-btn-index">03</span>
              <span className="action-btn-text">进入决策圆桌<small>换一个视角追问</small></span>
            </button>
            <button type="button" className="action-btn" onClick={() => navigate('/growth-snippets')}>
              <span className="action-btn-index">04</span>
              <span className="action-btn-text">浏览成长片段<small>收藏已验证的经验</small></span>
            </button>
          </div>

          <button className="garden-capture-strip" onClick={() => navigate('/quick-capture')}>
            <span>NOTE<br />10S</span>
            <span><b>有个念头怕忘记？</b><small>10 秒收进档案，之后再慢慢想</small></span>
            <i>↗</i>
          </button>

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

          {homeNextAction && (
            <div
              className={`garden-review-focus focus-${topReminder?.type || 'action'}`}
              onClick={() => navigate(homeNextAction.path)}
            >
              <div className="review-focus-head">
                <span className="review-focus-icon">DUE</span>
                <div className="review-focus-title-wrap">
                  <span className="review-focus-kicker">{homeNextAction.label}</span>
                  <span className="review-focus-title">{homeNextAction.title}</span>
                </div>
                {reminderCount > 0 && <span className="review-focus-count">{reminderCount} 个</span>}
              </div>
              <span className="review-focus-tone">{homeNextAction.text}</span>
              <div className="review-focus-actions">
                <button type="button" onClick={(e) => { e.stopPropagation(); navigate(homeNextAction.path) }}>
                  {homeNextAction.action}
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
            {sorted.map((d, index) => (
              <div
                key={d.id}
                className="flower-card"
                onClick={() => navigate(`/decision/${d.id}`)}
              >
                <div className={`flower-visual stage-${d.stage}`}>
                  <span className="flower-serial">NO. {String(index + 1).padStart(2, '0')}</span>
                  <span className="flower-watermark">DECISION</span>
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
              本月记录 {stats.monthlyDecisions} 个决策
            </div>
          )}
        </div>
      )}

    </div>
  )
}
