import { DECISION_STAGES } from './decisionStages.js'
import { addDays, formatDate } from '../utils/util.js'

export function getDecisionLifecycle(decision) {
  if (!decision) {
    return {
      canStartAction: false,
      canReview: false,
      reviewType: 'current',
      remainingFollowUps: 0,
      hasRemainingFollowUps: false,
    }
  }

  const wateringCount = Array.isArray(decision.wateringHistory) ? decision.wateringHistory.length : 0
  const remainingFollowUps = Math.max((decision.maxWaterings || 1) - wateringCount, 0)
  const isPending = decision.status === 'pending' && !decision.isDraft
  const canReview = isPending && (
    decision.reviewStage !== 'current_done' ||
    (decision.stage === DECISION_STAGES.FIRST_BLOOM && !decision.resultReviewDone)
  )

  return {
    canStartAction: isPending && !decision.actionStarted &&
      [DECISION_STAGES.SEED, DECISION_STAGES.SPROUT].includes(decision.stage),
    canReview,
    reviewType: decision.firstReviewDone ? 'result' : 'current',
    remainingFollowUps,
    hasRemainingFollowUps: isPending && remainingFollowUps > 0,
  }
}

export function startDecisionAction(decision) {
  if (!getDecisionLifecycle(decision).canStartAction) return null
  return { ...decision, actionStarted: true, stage: DECISION_STAGES.LEAF }
}

export function completeDecisionReview(
  decision,
  review,
  extraFollowUps = 0,
  today = formatDate(new Date()),
) {
  const lifecycle = getDecisionLifecycle(decision)
  if (!review || !lifecycle.canReview) return null

  const reviewType = lifecycle.reviewType
  const wateringHistory = [
    ...(Array.isArray(decision.wateringHistory) ? decision.wateringHistory : []),
    { ...review, type: reviewType },
  ]
  const followUps = Math.max(Number.parseInt(extraFollowUps, 10) || 0, 0)
  const isDone = followUps === 0
  const isResultDone = isDone && reviewType === 'result'

  return {
    decision: {
      ...decision,
      status: isResultDone ? 'reviewed' : 'pending',
      reviewStage: isResultDone ? 'result_done' : 'current_done',
      stage: isResultDone ? DECISION_STAGES.FULL_BLOOM : DECISION_STAGES.FIRST_BLOOM,
      firstReviewDone: true,
      resultReviewDone: isResultDone,
      wateringHistory,
      maxWaterings: wateringHistory.length + followUps,
      lastWateredAt: today,
      reviewDate: isResultDone ? decision.reviewDate : addDays(today, 7),
    },
    isDone,
    reviewType,
    remainingFollowUps: followUps,
  }
}
