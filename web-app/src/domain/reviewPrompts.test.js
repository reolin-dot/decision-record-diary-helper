import test from 'node:test'
import assert from 'node:assert/strict'
import { buildReviewPrompts } from './reviewPrompts.js'

test('builds emotion-specific review prompts from coach source', () => {
  const prompts = buildReviewPrompts({
    decision: {
      actionStarted: true,
      coachSource: { kitId: 'emotion' },
    },
    reviewType: 'current',
  })

  assert.equal(prompts.sourceLabel, '来自情绪降噪锦囊')
  assert.match(prompts.reflectionLabel, /情绪和事实/)
  assert.match(prompts.lessonLabel, /情绪很强/)
})

test('prioritizes action prompts for action coach decisions', () => {
  const prompts = buildReviewPrompts({
    decision: {
      actionStarted: false,
      coachSource: { kitId: 'action' },
    },
  })

  assert.match(prompts.intro, /第一步/)
  assert.match(prompts.reflectionLabel, /最小行动/)
})

test('adds style reminder without changing the prompt shape', () => {
  const prompts = buildReviewPrompts({
    decision: {},
    decisionStyle: {
      type: '信息收集型',
      reviewSuggestion: '先看哪个信息真的影响了判断。',
    },
    reviewType: 'result',
  })

  assert.equal(prompts.title, '结果复盘')
  assert.match(prompts.styleReminder, /真正改变判断/)
  assert.match(prompts.statusLabel, /最终结果/)
})
