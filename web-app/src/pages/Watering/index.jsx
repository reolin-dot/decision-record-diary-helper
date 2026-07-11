import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { getStageMeta } from '../../domain/decisionStages.js'
import { getDecisionLifecycle } from '../../domain/decisionLifecycle.js'
import { dismissReminderToday, getReminders, groupReminders, snoozeReminder } from '../../domain/reminders.js'
import { formatDate } from '../../utils/util.js'
import './watering.css'

export default function Watering() {
  const navigate = useNavigate()
  const { decisions, saveDecision } = useApp()
  const toast = useToast()
  const today = formatDate(new Date())

  const reminders = getReminders(decisions, today)
  const grouped = groupReminders(reminders).filter(group => group.items.length > 0)

  const canWater = (d) => {
    return getDecisionLifecycle(d).canReview
  }

  const decorateDecision = (d) => {
    const watered = d.wateringHistory ? d.wateringHistory.length : 0
    const remaining = getDecisionLifecycle(d).remainingFollowUps
    const isDue = !!(d.reviewDate && d.reviewDate <= today)
    const meta = getStageMeta(d.stage)
    return {
      ...d,
      stageIcon: meta.icon,
      stageLabel: meta.label,
      wateredText: watered > 0 ? `已浇水 ${watered} 次` : '',
      remainingText: remaining > 0 ? `还剩 ${remaining} 次` : '',
      isDue,
      statusText: isDue ? '待浇水' : '主动浇水',
    }
  }

  const reminderIds = new Set(reminders.map(item => item.decisionId))
  const optionalWateringDecisions = decisions
    .filter(canWater)
    .filter(d => !reminderIds.has(d.id))
    .map(decorateDecision)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

  const handleSnooze = (decision) => {
    const ok = saveDecision(snoozeReminder(decision, today))
    if (ok) toast.show('已延后提醒，过几天再回来看看')
  }

  const handleDismissToday = (decision) => {
    const ok = saveDecision(dismissReminderToday(decision, today))
    if (ok) toast.show('今天先不提醒了')
  }

  return (
    <div className="watering-body">
      <div className="watering-hero">
        <span className="watering-hero-title">回来看看这些花</span>
        <span className="watering-subtitle">
          不需要立刻有答案。这里收集的是值得回头看一眼的决策、行动和结果。
        </span>
      </div>

      {grouped.length > 0 ? (
        <div className="reminder-groups">
          {grouped.map(group => (
            <div key={group.type} className="reminder-group">
              <div className="reminder-group-head">
                <span className="reminder-group-title">{group.title}</span>
                <span className="reminder-group-desc">{group.desc}</span>
              </div>
              <div className="review-list">
                {group.items.map(item => {
                  const d = decorateDecision(item.decision)
                  return (
                    <div key={item.id} className="review-item reminder-item">
                      <div className="review-item-body" onClick={() => navigate(`/review/${d.id}`)}>
                        <div className="reminder-item-kicker">
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        <span className="review-item-title">{d.title}</span>
                        <div className="review-item-meta">
                          <span>{d.stageIcon} {d.stageLabel}</span>
                          {d.reviewDate && <span>提醒日 {d.reviewDate}</span>}
                        </div>
                        <span className="reminder-tone">{item.tone}</span>
                      </div>
                      <div className="reminder-actions">
                        <button onClick={() => navigate(`/review/${d.id}`)}>去复盘</button>
                        <button onClick={() => handleSnooze(d)}>稍后提醒</button>
                        <button onClick={() => handleDismissToday(d)}>今天不提醒</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="watering-empty">
          <span className="watering-empty-icon">🌿</span>
          <span className="watering-empty-text">今天没有必须回看的花</span>
          <span className="watering-empty-sub">如果你愿意，也可以主动给正在生长的决策浇浇水。</span>
        </div>
      )}

      {optionalWateringDecisions.length > 0 && (
        <div className="optional-section">
          <span className="optional-title">主动浇水</span>
          <span className="optional-desc">还没到提醒时间，但也可以提前记录一点新信息。</span>
          <div className="review-list">
            {optionalWateringDecisions.map(d => (
              <div
                key={d.id}
                className="review-item"
                onClick={() => navigate(`/review/${d.id}`)}
              >
                <div className="review-item-body">
                  <span className="review-item-title">{d.title}</span>
                  <div className="review-item-meta">
                    <span>{d.createdAt} 记录</span>
                    {d.wateredText && <span>{d.wateredText}</span>}
                  </div>
                </div>
                <div className="review-item-status optional">
                  <span>{d.statusText}</span>
                  {d.remainingText && (
                    <span className="remaining-text">{d.remainingText}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
