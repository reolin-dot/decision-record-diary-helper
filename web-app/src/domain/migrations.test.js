import test from 'node:test'
import assert from 'node:assert/strict'
import { runMigrations } from './migrations.js'

test('does not advance the schema version when migration storage fails', () => {
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const originalError = console.error
  const originalWarn = console.warn
  const values = new Map([
    ['decision_diary_schemaVersion', '0'],
    ['decision_diary_decisions', JSON.stringify([{ id: 'd1', options: 'bad' }])],
  ])
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => {
        if (key === 'decision_diary_decisions') {
          throw Object.assign(new Error('full'), { name: 'QuotaExceededError' })
        }
        values.set(key, value)
      },
    },
  })
  console.error = () => {}
  console.warn = () => {}

  try {
    assert.equal(runMigrations(), false)
    assert.equal(values.get('decision_diary_schemaVersion'), '0')
  } finally {
    console.error = originalError
    console.warn = originalWarn
    if (originalLocalStorage) Object.defineProperty(globalThis, 'localStorage', originalLocalStorage)
    else delete globalThis.localStorage
  }
})
