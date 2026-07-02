import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { getStageMeta, DECISION_STAGES } from '../../domain/decisionStages.js'
import { getReviewStyleGuidance } from '../../domain/decisionStyleGuidance.js'
import { formatDate, addDays } from '../../utils/util.js'
import './review.css'

const CURRENT_OPTIONS = ['刚开始推进', '有了新信息', '遇到阻力', '方向需要微调', '暂时暂停']
const RESULT_OPTIONS = ['比预期更好', '基本符合预期', '还不确定', '和预期不同', '需要调整']

const FOLLOW_UP_OPTIONS = [
  { key: 'done', label: '完成了，不再提醒' },
  { key: '1', label: '再进行 1 次跟进复盘' },
  { key: '2', label: '再进行 2 次跟进复盘' },
  { key: '3', label: '再进行 3 次跟进复盘' },
  { key: 'custom', label: '自定义次数…' },
]

export default function Review() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { decisions, decisionStyle, saveDecision, refreshStats } = useApp()
  const toast = useToast()

  const [decision, setDecision] = useState(null)
  const [stageMeta, setStageMeta] = useState({})
  const [reviewType, setReviewType] = useState('current')
  const [canReview, setCanReview] = useState(false)

  const [resultRating, setResultRating] = useState('')
  const [reflection, setReflection] = useState('')
  const [lesson, setLesson] = useState('')

  // Follow-up modal state
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customFollowUpCount, setCustomFollowUpCount] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Ref to hold pending result between form submit and follow-up choice
  const pendingResultRef = useRef(null)
  // Ref to prevent re-showing form after a successful review (before navigate)
  const justReviewedRef = useRef(false)

  function getReviewOptions() {
    return reviewType === 'result' ? RESULT_OPTIONS : CURRENT_OPTIONS
  }

  function buildReviewSummary(type, rating, lessonText) {
    if (type === 'result') {
      if (lessonText) return `这次结果复盘留下了一条经验：${lessonText}`
      return '这次结果已经更清楚了，它会成为下一次选择的参考。'
    }
    if (lessonText) return `这次当下复盘带来了一点新信息：${lessonText}`
    return '这次当下复盘记录了新的状态，先不用急着给它下结论。'
  }

  // Load decision
  useEffect(() => {
    // Skip re-evaluation if we just completed a review
    if (justReviewedRef.current) return

    const found = decisions.find(d => d.id === id)
    if (!found) {
      setDecision(null)
      return
    }

    const meta = getStageMeta(found.stage)
    const type = found.firstReviewDone ? 'result' : 'current'
    const canDoReview = canShowReviewForm(found)

    setDecision(found)
    setStageMeta(meta)
    setReviewType(type)
    setCanReview(canDoReview)
  }, [id, decisions])

  function canShowReviewForm(d) {
    if (!d) return false
    if (d.status === 'pending' && d.reviewStage !== 'current_done') return true
    return d.stage === DECISION_STAGES.FIRST_BLOOM && !d.resultReviewDone
  }

  function decorateDecision(d) {
    if (!d) return d
    const wateringHistory = d.wateringHistory || []
    const maxWaterings = d.maxWaterings || 1
    const remainingWaterings = Math.max(maxWaterings - wateringHistory.length, 0)
    return {
      ...d,
      remainingWaterings,
      hasRemainingFollowUps: d.status === 'pending' && remainingWaterings > 0,
    }
  }

  // Mark action started
  const handleMarkActionStarted = () => {
    if (!decision) return
    const updated = {
      ...decision,
      actionStarted: true,
      stage: DECISION_STAGES.LEAF,
    }
    const ok = saveDecision(updated)
    if (ok) {
      refreshStats()
      setDecision(decorateDecision(updated))
      setStageMeta(getStageMeta(updated.stage))
      setCanReview(canShowReviewForm(updated))
      toast.show('已长出新叶', { type: 'success' })
    }
  }

  // Complete review → show follow-up modal
  const handleCompleteReview = () => {
    if (!resultRating) {
      toast.show('先选择当前状态')
      return
    }
    if (submitting) return

    pendingResultRef.current = {
      date: formatDate(new Date()),
      rating: resultRating,
      reflection,
      lesson,
      summary: buildReviewSummary(decision.firstReviewDone ? 'result' : 'current', resultRating, lesson),
      type: decision.firstReviewDone ? 'result' : 'current',
    }

    setShowFollowUp(true)
    setCustomFollowUpCount('')
    setShowCustomInput(false)
  }

  // Cancel follow-up → save with 0 extra
  const handleCancelFollowUp = () => {
    saveReviewResult(0)
  }

  // Choose follow-up option
  const handleChooseFollowUp = (key) => {
    if (key === 'custom') {
      setShowCustomInput(true)
      return
    }
    if (key === 'done') {
      saveReviewResult(0)
      return
    }
    saveReviewResult(parseInt(key, 10))
  }

  // Confirm custom count
  const handleConfirmCustomFollowUp = () => {
    const n = parseInt(customFollowUpCount, 10)
    if (!n || n < 1 || n > 20) {
      toast.show('请输入 1~20 之间的数字')
      return
    }
    saveReviewResult(n)
  }

  // Core save logic
  function saveReviewResult(extraChoice) {
    if (submitting) return
    setSubmitting(true)

    const today = formatDate(new Date())
    const pendingResult = pendingResultRef.current
    if (!pendingResult || !decision) return

    const wateringHistory = [...(decision.wateringHistory || []), pendingResult]
    const wateringCount = wateringHistory.length

    let maxWaterings
    if (extraChoice === 0) {
      maxWaterings = wateringCount
    } else {
      maxWaterings = wateringCount + extraChoice
    }

    const isDone = wateringCount >= maxWaterings
    const rType = pendingResult.type
    let updatedDecision

    if (isDone) {
      updatedDecision = {
        ...decision,
        status: rType === 'result' ? 'reviewed' : 'pending',
        reviewStage: rType === 'result' ? 'result_done' : 'current_done',
        stage: rType === 'result' ? DECISION_STAGES.FULL_BLOOM : DECISION_STAGES.FIRST_BLOOM,
        firstReviewDone: true,
        resultReviewDone: rType === 'result',
        wateringHistory,
        maxWaterings,
        lastWateredAt: today,
        reviewDate: rType === 'result' ? decision.reviewDate : addDays(today, 7),
      }
    } else {
      updatedDecision = {
        ...decision,
        status: 'pending',
        reviewStage: 'current_done',
        stage: DECISION_STAGES.FIRST_BLOOM,
        firstReviewDone: true,
        wateringHistory,
        maxWaterings,
        lastWateredAt: today,
        reviewDate: addDays(today, 7),
      }
    }

    // Mark as just reviewed to prevent form from re-appearing before navigate
    justReviewedRef.current = true
    setCanReview(false)

    const ok = saveDecision(updatedDecision)
    if (!ok) {
      justReviewedRef.current = false
      setSubmitting(false)
      setShowFollowUp(false)
      toast.show('存储失败，请重试')
      return
    }

    refreshStats()
    setDecision(decorateDecision(updatedDecision))
    setStageMeta(getStageMeta(updatedDecision.stage))
    setCanReview(canShowReviewForm(updatedDecision))
    setShowFollowUp(false)
    setShowCustomInput(false)
    setCustomFollowUpCount('')
    setSubmitting(false)

    const msg = isDone
      ? (rType === 'result' ? '已完成结果浇水' : '已完成当下浇水')
      : `已浇水，还剩 ${maxWaterings - wateringCount} 次跟进复盘`
    toast.show(msg, { type: 'success' })

    setTimeout(() => {
      navigate('/')
    }, 800)
  }

  // Not found view
  if (!decision) {
    return (
      <div className="page-container">
        <div className="review-not-found">
          <span className="not-found-icon">🔍</span>
          <div className="not-found-title">决策未找到</div>
          <div className="not-found-desc">这条决策可能已被删除或链接无效</div>
          <button className="not-found-btn" onClick={() => navigate('/')}>
            返回花园
          </button>
        </div>
      </div>
    )
  }

  const decorated = decorateDecision(decision)
  const showMarkAction =
    !decision.actionStarted &&
    (decision.stage === 'sprout' || decision.stage === 'seed')

  const reviewTypeName = reviewType === 'result' ? '结果复盘' : '当下复盘'
  const styleGuidance = getReviewStyleGuidance(decisionStyle)

  return (
    <div className="page-container">
      <div className="review-body">
        {/* Decision summary */}
        <div className="decision-summary">
          <div className="summary-header">
            <span className="summary-stage-icon">{stageMeta.icon}</span>
            <div className="summary-title-wrap">
              <span className="summary-title">{decision.title}</span>
              <span className="summary-meta">{stageMeta.label} · {stageMeta.description}</span>
            </div>
          </div>
        </div>

        {/* Mark action started */}
        {showMarkAction && (
          <div className="review-question">
            <span className="review-q-label">开始行动了吗？</span>
            <span className="review-q-hint">
              标记后，这朵花会从发芽进入长叶。成长从迈出第一步开始。
            </span>
            <button className="btn-secondary" onClick={handleMarkActionStarted}>
              我开始行动了
            </button>
          </div>
        )}

        {/* Review history (read-only) */}
        {decision.wateringHistory && decision.wateringHistory.length > 0 && (
          <div className="review-history">
            <span className="history-title">浇水记录</span>
            {decision.wateringHistory.map((item, idx) => (
              <div key={idx} className="history-item">
                <div className="history-header">
                  <span className="history-round">第 {idx + 1} 次浇水</span>
                  <span className="history-date">{item.date}</span>
                </div>
                <span className="history-rating result-good">
                  {item.type === 'result' ? '结果复盘' : '当下复盘'} · {item.rating}
                </span>
                {item.reflection && (
                  <div className="history-section">
                    <span className="history-label">实际结果与期望的差异</span>
                    <span className="history-text">{item.reflection}</span>
                  </div>
                )}
                {item.lesson && (
                  <div className="history-section">
                    <span className="history-label">收获与下次做法</span>
                    <span className="history-text">{item.lesson}</span>
                  </div>
                )}
                {item.summary && (
                  <div className="history-summary">
                    {item.summary}
                  </div>
                )}
              </div>
            ))}
            {decorated.hasRemainingFollowUps && (
              <div className="history-followup">
                还剩 {decorated.remainingWaterings} 次跟进复盘，下次提醒日期：{decision.reviewDate}
              </div>
            )}
          </div>
        )}

        {/* Review type indicator */}
        {canReview && (
          <div className="review-type-indicator">
            <span className="review-type-tag">{reviewTypeName}</span>
            {reviewType === 'current' ? (
              <span className="review-type-hint">记录当下看到的信息，为后续复盘积累素材</span>
            ) : (
              <span className="review-type-hint">结果逐渐明朗了，沉淀这次的经验</span>
            )}
          </div>
        )}

        {canReview && styleGuidance && (
          <div className="review-style-guidance">
            <span className="review-style-label">{styleGuidance.label}</span>
            <span className="review-style-text">{styleGuidance.text}</span>
          </div>
        )}

        {/* Q1: Status / Result */}
        {canReview && (
          <div className="review-question">
            <span className="review-q-label">
              1. {reviewType === 'result' ? '最终结果现在更接近哪种状态？' : '现在这件事推进到哪里了？'}
              <span className="required"> *必答</span>
            </span>
            <div className="review-options">
              {getReviewOptions().map((item) => (
                <div
                  key={item}
                  className={`review-option ${resultRating === item ? 'selected' : ''}`}
                  onClick={() => setResultRating(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Q2 */}
        {canReview && (
          <div className="review-question">
            <span className="review-q-label">
              2. {reviewType === 'current' ? '你现在看见了什么新信息或阻力？' : '实际发生的事实是什么？'}
            </span>
            <span className="review-q-hint">
              {reviewType === 'current'
                ? '可以写事实，也可以写感受，不需要判定好坏。'
                : '先写事实，不急着评价自己。'}
            </span>
            <textarea
              className="form-input form-textarea"
              placeholder={
                reviewType === 'current'
                  ? '写下目前看到的变化...'
                  : '写下实际发生了什么...'
              }
              maxLength={200}
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
            />
          </div>
        )}

        {/* Q3 */}
        {canReview && (
          <div className="review-question">
            <span className="review-q-label">
              3. {reviewType === 'current' ? '下一步可以做一个什么小动作？' : '当初的判断哪些被验证了？下次会保留或调整什么？'}
            </span>
            <span className="review-q-hint">
              {reviewType === 'current'
                ? '小到今天或明天可以开始就好。'
                : '这次经验可以带走什么？'}
            </span>
            <textarea
              className="form-input form-textarea"
              placeholder={
                reviewType === 'current'
                  ? '写下可以带走的一点新信息...'
                  : '写下可以保留或调整的做法...'
              }
              maxLength={200}
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      {canReview && (
        <div className="bottom-bar">
          <button className="btn-primary" onClick={handleCompleteReview}>
            完成浇水
          </button>
        </div>
      )}

      {/* Follow-up modal */}
      {showFollowUp && (
        <div className="followup-mask" onClick={handleCancelFollowUp}>
          <div className="followup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="followup-header">
              <span className="followup-title">浇水已记录</span>
              <span className="followup-sub">
                结果还没完全明朗的话，可以继续跟进；已经清楚了，就让它盛开。
              </span>
            </div>
            <div className="followup-options">
              {FOLLOW_UP_OPTIONS.map((item) => (
                <div
                  key={item.key}
                  className="followup-option"
                  onClick={() => handleChooseFollowUp(item.key)}
                >
                  {item.label}
                </div>
              ))}
            </div>
            {showCustomInput && (
              <div className="followup-custom">
                <input
                  className="followup-input"
                  type="number"
                  placeholder="输入次数（1~20）"
                  value={customFollowUpCount}
                  onChange={(e) => setCustomFollowUpCount(e.target.value)}
                />
                <button className="followup-custom-btn" onClick={handleConfirmCustomFollowUp}>
                  确认
                </button>
              </div>
            )}
            <div className="followup-cancel" onClick={handleCancelFollowUp}>
              取消（直接完成）
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
