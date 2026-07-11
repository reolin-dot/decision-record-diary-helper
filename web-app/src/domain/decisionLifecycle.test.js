import test from 'node:test'
import assert from 'node:assert/strict'
import {
  completeDecisionReview,
  getDecisionLifecycle,
  startDecisionAction,
} from './decisionLifecycle.js'

test('runs a decision through action, current review, and result review', () => {
  const sprout = {
    id: 'd1',
    status: 'pending',
    reviewStage: 'none',
    stage: 'sprout',
    actionStarted: false,
    firstReviewDone: false,
    resultReviewDone: false,
    wateringHistory: [],
    maxWaterings: 1,
  }

  assert.deepEqual(getDecisionLifecycle(sprout), {
    canStartAction: true,
    canReview: true,
    reviewType: 'current',
    remainingFollowUps: 1,
    hasRemainingFollowUps: true,
  })

  const leaf = startDecisionAction(sprout)
  assert.equal(leaf.stage, 'leaf')
  assert.equal(leaf.actionStarted, true)
  assert.equal(sprout.actionStarted, false)

  const current = completeDecisionReview(
    leaf,
    { rating: '推进中', lesson: '先做再调整' },
    2,
    '2026-07-10',
  )
  assert.equal(current.decision.stage, 'first_bloom')
  assert.equal(current.decision.reviewStage, 'current_done')
  assert.equal(current.decision.firstReviewDone, true)
  assert.equal(current.decision.reviewDate, '2026-07-17')
  assert.equal(current.remainingFollowUps, 2)
  assert.equal(current.reviewType, 'current')
  assert.equal(getDecisionLifecycle(current.decision).canReview, true)
  assert.equal(getDecisionLifecycle(current.decision).reviewType, 'result')

  const result = completeDecisionReview(
    current.decision,
    { rating: '已明确', lesson: '保留小步验证' },
    0,
    '2026-07-17',
  )
  assert.equal(result.decision.stage, 'full_bloom')
  assert.equal(result.decision.status, 'reviewed')
  assert.equal(result.decision.reviewStage, 'result_done')
  assert.equal(result.decision.resultReviewDone, true)
  assert.equal(result.remainingFollowUps, 0)
  assert.equal(result.reviewType, 'result')
  assert.equal(getDecisionLifecycle(result.decision).canReview, false)
  assert.equal(completeDecisionReview(result.decision, { rating: '重复' }), null)
})
