import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeDecision } from './decisionSchema.js'

test('normalizes decision structure without losing domain fields', () => {
  const input = {
    id: 'd1',
    title: '旧记录',
    options: 'bad',
    wateringHistory: [{ lesson: '先验证' }],
    maxWaterings: '2',
    choice: '1',
    actionStarted: 1,
    firstReviewDone: 0,
    customField: 'keep',
  }

  const normalized = normalizeDecision(input)

  assert.deepEqual(normalized.options, [])
  assert.deepEqual(normalized.wateringHistory, [{ lesson: '先验证', summary: '' }])
  assert.equal(normalized.maxWaterings, 1)
  assert.equal(normalized.choice, -1)
  assert.equal(normalized.actionStarted, true)
  assert.equal(normalized.firstReviewDone, false)
  assert.equal(normalized.resultReviewDone, false)
  assert.equal(normalized.isDraft, false)
  assert.equal(normalized._deleted, false)
  assert.equal(normalized.customField, 'keep')
  assert.equal(input.resultReviewDone, undefined)
})
