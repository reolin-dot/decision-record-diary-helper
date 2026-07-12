// LocalStorageAdapter - implements the storage adapter interface using localStorage
// All access goes through this adapter, making it easy to swap for a cloud adapter later.

import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from './storageKeys.js'

const STORAGE_PREFIX = 'decision_diary_'

class LocalStorageAdapter {
  /**
   * Get a value from storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default if key doesn't exist
   * @returns {*}
   */
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key)
      if (raw === null) return defaultValue
      return JSON.parse(raw)
    } catch (e) {
      console.error('[Storage] read error:', key, e)
      return defaultValue
    }
  }

  /**
   * Set a value in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be JSON-serialized)
   * @returns {boolean} Whether the write succeeded
   */
  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
      return true
    } catch (e) {
      console.error('[Storage] write error:', key, e)
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        this._onQuotaExceeded()
      }
      return false
    }
  }

  /**
   * Remove a key from storage
   * @param {string} key
   * @returns {boolean}
   */
  remove(key) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key)
      return true
    } catch (e) {
      console.error('[Storage] remove error:', key, e)
      return false
    }
  }

  clearAll() {
    return Object.values(STORAGE_KEYS).every(key => this.remove(key))
  }

  /**
   * Export all app data as a plain object (for backup)
   * @returns {Object}
   */
  exportAll() {
    const data = { schemaVersion: CURRENT_SCHEMA_VERSION, exportedAt: new Date().toISOString() }
    Object.values(STORAGE_KEYS).forEach(key => {
      const value = this.get(key)
      if (value !== null && value !== undefined) {
        data[key] = value
      }
    })
    return data
  }

  /**
   * Import data from a backup payload
   * @param {Object} payload - The exported data object
   * @param {'overwrite'|'merge'} mode - How to handle conflicts
   * @returns {boolean}
   */
  importAll(payload, mode = 'overwrite') {
    if (!payload || typeof payload !== 'object') return false

    try {
      for (const key of Object.values(STORAGE_KEYS)) {
        if (payload[key] !== undefined) {
          let ok
          if (mode === 'merge' && Array.isArray(payload[key])) {
            const existing = this.get(key, [])
            const merged = this._mergeArrays(existing, payload[key])
            ok = this.set(key, merged)
          } else {
            ok = this.set(key, payload[key])
          }
          // ponytail: localStorage has no transactions; the caller downloads a recovery backup first.
          if (!ok) return false
        }
      }
      return true
    } catch (e) {
      console.error('[Storage] import error:', e)
      return false
    }
  }

  /**
   * Merge two arrays of objects by their `id` field
   */
  _mergeArrays(existing, incoming) {
    const map = new Map()
    existing.forEach(item => {
      if (item && item.id) map.set(item.id, item)
    })
    incoming.forEach(item => {
      if (item && item.id) {
        const prev = map.get(item.id)
        if (!prev) {
          map.set(item.id, item)
        } else {
          // Last-Write-Wins by updatedAt
          const prevTime = prev.updatedAt ? new Date(prev.updatedAt).getTime() : 0
          const nextTime = item.updatedAt ? new Date(item.updatedAt).getTime() : 0
          map.set(item.id, nextTime >= prevTime ? item : prev)
        }
      }
    })
    return Array.from(map.values())
  }

  /**
   * Handle localStorage quota exceeded
   */
  _onQuotaExceeded() {
    console.warn('[Storage] localStorage quota exceeded')
    // The UI layer should catch this and show a user-friendly message
  }
}

// Singleton instance
const storage = new LocalStorageAdapter()
export default storage
