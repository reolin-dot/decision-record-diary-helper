import test from 'node:test'
import assert from 'node:assert/strict'
import {
  REMINDER_TYPES,
  dismissReminderToday,
  getDecisionReminder,
  getReminders,
  snoozeReminder,
} from './reminders.js'

function decision(overrides = {}) {
  return {
    id: 'd1',
    title: '测试决策',
    status: 'pending',
    stage: 'sprout',
    createdAt: '2026-07-01',
    reviewDate: '2026-07-20',
    choice: 0,
    options: ['A', 'B'],
    wateringHistory: [],
    ...overrides,
  }
}

test('prioritizes due review, result follow-up, then action reminders', () => {
  const reminders = getReminders([
    decision({ id: 'action', createdAt: '2026-07-01' }),
    decision({
      id: 'result',
      stage: 'first_bloom',
      actionStarted: true,
      firstReviewDone: true,
      reviewStage: 'current_done',
      lastWateredAt: '2026-07-01',
    }),
    decision({ id: 'due', reviewDate: '2026-07-10' }),
  ], '2026-07-11')

  assert.deepEqual(reminders.map(item => item.type), [
    REMINDER_TYPES.DUE_REVIEW,
    REMINDER_TYPES.RESULT_FOLLOWUP,
    REMINDER_TYPES.ACTION,
  ])
})

test('supports snoozing and dismissing a reminder for today', () => {
  const original = decision({ reviewDate: '2026-07-10' })
  const snoozed = snoozeReminder(original, '2026-07-11')
  const dismissed = dismissReminderToday(original, '2026-07-11')

  assert.equal(getDecisionReminder(snoozed, '2026-07-13'), null)
  assert.equal(getDecisionReminder(snoozed, '2026-07-14')?.type, REMINDER_TYPES.DUE_REVIEW)
  assert.equal(getDecisionReminder(dismissed, '2026-07-11'), null)
  assert.equal(getDecisionReminder(dismissed, '2026-07-12')?.type, REMINDER_TYPES.DUE_REVIEW)
})
