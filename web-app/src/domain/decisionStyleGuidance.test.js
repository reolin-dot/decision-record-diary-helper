import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getCoachRecommendation,
  getRecordStyleGuidance,
  getReviewStyleGuidance,
} from './decisionStyleGuidance.js'

test('returns no guidance before a style result exists', () => {
  assert.equal(getRecordStyleGuidance(null), null)
  assert.equal(getReviewStyleGuidance(null), null)
  assert.equal(getCoachRecommendation(null), null)
})

test('uses saved record and review suggestions from the style result', () => {
  const style = {
    type: '理性分析型',
    recordSuggestion: '先设一个停止分析时间。',
    reviewSuggestion: '复盘时先写事实。',
  }

  assert.deepEqual(getRecordStyleGuidance(style), {
    label: '理性分析型提示',
    text: '先设一个停止分析时间。',
  })
  assert.deepEqual(getReviewStyleGuidance(style), {
    label: '理性分析型复盘提示',
    text: '复盘时先写事实。',
  })
})

test('recommends emotion kit for pressure and regret-heavy styles', () => {
  const recommendation = getCoachRecommendation({
    type: '后悔敏感型',
    tags: ['压力反应'],
  })

  assert.equal(recommendation.kitId, 'emotion')
})

test('recommends information kit for information-heavy styles', () => {
  const recommendation = getCoachRecommendation({
    type: '信息处理型',
    tags: ['信息处理'],
  })

  assert.equal(recommendation.kitId, 'info')
})
