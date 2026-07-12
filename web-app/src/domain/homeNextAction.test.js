import test from 'node:test'
import assert from 'node:assert/strict'
import { buildHomeNextAction } from './homeNextAction.js'

test('prioritizes a due reminder as today next action', () => {
  const reminder = { decisionId: 'd1', tone: '回来看看', decision: { title: '换工作吗' } }
  assert.equal(buildHomeNextAction([], reminder).path, '/review/d1')
})

test('continues a draft before suggesting a new decision', () => {
  assert.equal(buildHomeNextAction([{ id: 'd2', title: '草稿', isDraft: true, updatedAt: '2026-07-12' }]).path, '/record?draftId=d2&step=1')
})

test('offers one clear action when no decisions need attention', () => {
  assert.equal(buildHomeNextAction([]).action, '开始记录')
})
