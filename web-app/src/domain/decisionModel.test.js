import test from 'node:test'
import assert from 'node:assert/strict'
import { saveDecision } from './decisionModel.js'

test('normalizes saved decisions without mutating the caller', () => {
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  })

  try {
    const input = { id: 'd1', title: '保存测试', options: 'bad' }
    assert.equal(saveDecision(input), true)
    assert.equal(input.updatedAt, undefined)

    const saved = JSON.parse(values.get('decision_diary_decisions'))[0]
    assert.deepEqual(saved.options, [])
    assert.deepEqual(saved.wateringHistory, [])
    assert.equal(saved.choice, -1)
    assert.match(saved.updatedAt, /^\d{4}-\d{2}-\d{2}T/)
  } finally {
    if (originalLocalStorage) Object.defineProperty(globalThis, 'localStorage', originalLocalStorage)
    else delete globalThis.localStorage
  }
})
