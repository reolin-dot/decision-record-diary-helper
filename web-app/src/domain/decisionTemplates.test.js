import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DECISION_TEMPLATES,
  getDecisionTemplate,
  shouldApplyStarterOptions,
} from './decisionTemplates.js'

test('provides five lightweight decision templates', () => {
  assert.equal(DECISION_TEMPLATES.length, 5)
  assert.deepEqual(
    DECISION_TEMPLATES.map(template => template.id),
    ['career', 'learning', 'spending', 'relationship', 'time']
  )
})

test('finds a template by id', () => {
  const template = getDecisionTemplate('career')

  assert.equal(template.title, '职业选择')
  assert.ok(template.starterOptions.length >= 2)
})

test('applies starter options only when existing options are empty', () => {
  assert.equal(shouldApplyStarterOptions(['', '   ']), true)
  assert.equal(shouldApplyStarterOptions(['已有选项', '']), false)
})
