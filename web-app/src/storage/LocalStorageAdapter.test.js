import test from 'node:test'
import assert from 'node:assert/strict'
import storage from './LocalStorageAdapter.js'

test('reports a failed backup import', () => {
  const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const originalError = console.error
  const originalWarn = console.warn
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => { throw Object.assign(new Error('full'), { name: 'QuotaExceededError' }) },
    },
  })
  console.error = () => {}
  console.warn = () => {}

  try {
    assert.equal(storage.importAll({ decisions: [] }), false)
  } finally {
    console.error = originalError
    console.warn = originalWarn
    if (originalLocalStorage) Object.defineProperty(globalThis, 'localStorage', originalLocalStorage)
    else delete globalThis.localStorage
  }
})
