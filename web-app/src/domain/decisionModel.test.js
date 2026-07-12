import test from 'node:test'
import assert from 'node:assert/strict'
import { deleteDecision, getDeletedDecisions, purgeDecision, restoreDecision, saveDecision } from './decisionModel.js'

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

test('restores or permanently removes a soft-deleted decision', () => {
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map()
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) },
  })
  try {
    saveDecision({ id: 'd1', title: '可恢复' })
    assert.equal(deleteDecision('d1'), true)
    assert.equal(getDeletedDecisions().length, 1)
    assert.equal(restoreDecision('d1'), true)
    assert.equal(getDeletedDecisions().length, 0)
    deleteDecision('d1')
    assert.equal(purgeDecision('d1'), true)
    assert.equal(JSON.parse(values.get('decision_diary_decisions')).length, 0)
  } finally {
    if (originalLocalStorage) Object.defineProperty(globalThis, 'localStorage', originalLocalStorage)
    else delete globalThis.localStorage
  }
})
