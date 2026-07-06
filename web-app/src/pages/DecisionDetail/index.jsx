import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import { useToast } from '../../components/Toast.jsx'
import { getStageMeta } from '../../domain/decisionStages.js'
import { DECISION_STAGES } from '../../domain/decisionStages.js'
import './detail.css'

export default function DecisionDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { decisions, saveDecision, refreshStats } = useApp()
  const toast = useToast()

  const [decision, setDecision] = useState(null)

  useEffect(() => {
    const found = decisions.find(d => d.id === id)
    if (!found) {
      setDecision(null)
      return
    }

    const stageMeta = getStageMeta(found.stage)
    const chosenOption =
      found.options && found.choice !== undefined
        ? found.options[found.choice]
        : ''

    const canStartAction =
      !found.actionStarted &&
      !found.isDraft &&
      (found.stage === DECISION_STAGES.SEED || found.stage === DECISION_STAGES.SPROUT)

    const canReview =
      !found.isDraft &&
      ((found.status === 'pending' && found.reviewStage !== 'current_done') ||
        (found.stage === DECISION_STAGES.FIRST_BLOOM && !found.resultReviewDone))

    const reviewType = found.firstReviewDone ? 'result' : 'current'

    setDecision({
      ...found,
      stageMeta,
      chosenOption,
      canStartAction,
      canReview,
      reviewType,
    })
  }, [id, decisions])

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
      toast.show('已长出新叶', { type: 'success' })
      setDecision({
        ...updated,
        stageMeta: getStageMeta(updated.stage),
        chosenOption: decision.chosenOption,
        canStartAction: false,
        canReview: decision.canReview,
        reviewType: decision.reviewType,
      })
    }
  }

  const handleGoReview = () => {
    navigate(`/review/${id}`)
  }

  const handleContinueRecord = () => {
    navigate(`/record?draftId=${id}&step=1`)
  }

  const getNextStep = () => {
    if (decision.isDraft) {
      return {
        title: '这还是一颗草稿种子',
        text: '先把关键选项和复盘时间补上，它才会进入成长流程。',
        action: '继续完善',
        onClick: handleContinueRecord,
      }
    }
    if (decision.canStartAction) {
      return {
        title: '下一步：让它长叶',
        text: '如果已经迈出第一步，可以标记开始行动；还没开始也没关系，先找一个很小的动作。',
        action: '我开始行动了',
        onClick: handleMarkActionStarted,
      }
    }
    if (decision.canReview) {
      return {
        title: decision.reviewType === 'result' ? '下一步：结果复盘' : '下一步：当下复盘',
        text: decision.reviewType === 'result'
          ? '结果更明朗时，把这次经验收回来。'
          : '回来记录一点新信息，不急着判断对错。',
        action: decision.reviewType === 'result' ? '去结果复盘' : '去当下复盘',
        onClick: handleGoReview,
      }
    }
    if ((decision.wateringHistory || []).length > 0) {
      return {
        title: '这朵花已经留下经验',
        text: '复盘内容已经沉淀成成长片段，可以回头看看它带给你的提醒。',
        action: '查看成长片段',
        onClick: () => navigate('/growth-snippets'),
      }
    }
    return null
  }

  // Not found
  if (!decision) {
    return (
      <div className="page-container">
        <div className="not-found">
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

  const nextStep = getNextStep()

  return (
    <div className="detail-body">
      {/* Hero */}
      <div className="detail-hero">
        <div className={`hero-flower stage-${decision.stage}`}>
          <span className="hero-emoji">{decision.stageMeta.icon}</span>
        </div>
        <span className="hero-stage-label">{decision.stageMeta.label}</span>
        <span className="hero-stage-desc">{decision.stageMeta.description}</span>
        <span className="hero-title">{decision.title}</span>
        <span className="hero-date">{decision.createdAt}</span>
      </div>

      {nextStep && (
        <div className="detail-section next-step-card">
          <span className="next-step-label">下一步</span>
          <span className="next-step-title">{nextStep.title}</span>
          <span className="next-step-text">{nextStep.text}</span>
          <button className="next-step-btn" onClick={nextStep.onClick}>
            {nextStep.action}
          </button>
        </div>
      )}

      {decision.coachSource && (
        <div className="detail-section coach-source-section">
          <span className="section-label">锦囊来源</span>
          <div className="coach-source-card">
            <span className="coach-source-title">{decision.coachSource.kitTitle || '决策锦囊'}</span>
            {(decision.coachSource.framework || decision.coachSource.tone) && (
              <span className="coach-source-meta">
                {[decision.coachSource.framework, decision.coachSource.tone].filter(Boolean).join(' · ')}
              </span>
            )}
            {decision.coachSource.nextAction && (
              <span className="coach-source-next">{decision.coachSource.nextAction}</span>
            )}
            <button
              className="coach-source-btn"
              onClick={() => navigate(`/coach-analyze?kit=${decision.coachSource.kitId}`)}
            >
              再打开这个锦囊
            </button>
          </div>
        </div>
      )}

      {/* Background */}
      {decision.background && (
        <div className="detail-section">
          <span className="section-label">当时背景</span>
          <span className="section-text">{decision.background}</span>
        </div>
      )}

      {/* Mood */}
      {decision.mood && (
        <div className="detail-section">
          <span className="section-label">当时心情</span>
          <span className="section-text">{decision.mood}</span>
        </div>
      )}

      {/* Options */}
      {decision.options && decision.options.length > 0 && (
        <div className="detail-section">
          <span className="section-label">当时的选项</span>
          <div className="detail-options-list">
            {decision.options.map((opt, idx) => (
              <div
                key={idx}
                className={`detail-option-item ${idx === decision.choice ? 'option-chosen' : ''}`}
              >
                <span className="detail-option-text">{opt}</span>
                {idx === decision.choice && (
                  <span className="detail-option-chosen-tag">最终选择</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reason */}
      {decision.reason && (
        <div className="detail-section">
          <span className="section-label">选择理由</span>
          <span className="section-text">{decision.reason}</span>
        </div>
      )}

      {/* Expectation */}
      {decision.expectation && (
        <div className="detail-section">
          <span className="section-label">预期结果</span>
          <span className="section-text">{decision.expectation}</span>
        </div>
      )}

      {/* Action status */}
      <div className="detail-section">
        <span className="section-label">行动状态</span>
        <div className="action-status">
          <div className={`status-dot ${decision.actionStarted ? 'status-active' : ''}`} />
          <span className="status-text">
            {decision.actionStarted ? '已经开始行动' : '还未开始行动'}
          </span>
        </div>
      </div>

      {/* Review history */}
      {decision.wateringHistory && decision.wateringHistory.length > 0 && (
        <div className="detail-section">
          <span className="section-label">浇水记录</span>
          <div className="review-history">
            {decision.wateringHistory.map((item, idx) => (
              <div key={idx} className="history-item">
                <div className="history-header">
                  <span className="history-round">第 {idx + 1} 次浇水</span>
                  <span className="history-date">{item.date}</span>
                </div>
                <span className="history-type-tag">
                  {item.type === 'result' ? '结果复盘' : '当下复盘'} · {item.rating}
                </span>
                {item.reflection && (
                  <div className="history-field">
                    <span className="history-field-label">实际变化</span>
                    <span className="history-field-text">{item.reflection}</span>
                  </div>
                )}
                {item.lesson && (
                  <div className="history-field">
                    <span className="history-field-label">收获经验</span>
                    <span className="history-field-text">{item.lesson}</span>
                  </div>
                )}
                {item.summary && (
                  <div className="history-summary-card">
                    {item.summary}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="detail-actions">
        {decision.canStartAction && (
          <button className="btn-action btn-secondary" onClick={handleMarkActionStarted}>
            我开始行动了
          </button>
        )}
        {decision.isDraft && (
          <button className="btn-action btn-primary" onClick={handleContinueRecord}>
            继续完善这颗种子
          </button>
        )}
        {decision.canReview && (
          <button className="btn-action btn-primary" onClick={handleGoReview}>
            {decision.reviewType === 'result' ? '浇水：结果复盘' : '浇水：当下复盘'}
          </button>
        )}
        <div className="btn-back" onClick={() => navigate('/')}>
          返回花园
        </div>
      </div>
    </div>
  )
}
