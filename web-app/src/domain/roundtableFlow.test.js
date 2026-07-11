import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPendingInformation, inferDecisionOptions } from './roundtableFlow.js'

test('infers two options from a common Chinese decision question', () => {
  assert.deepEqual(
    inferDecisionOptions('我是留在现在的公司，还是接受新 offer？'),
    ['留在现在的公司', '接受新 offer'],
  )
})

test('turns unanswered roundtable questions into pending information', () => {
  assert.equal(buildPendingInformation([
    { title: '最重要的代价是什么？', value: '' },
    { title: '哪个选项更可逆？', value: 'A' },
  ]), '还需要确认：最重要的代价是什么？')
})
