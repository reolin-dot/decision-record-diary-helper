// Decision data model - the single entry point for all decision read/write operations
// Pages MUST use this module (via AppContext) instead of accessing storage directly.

import storage from '../storage/LocalStorageAdapter.js'
import { STORAGE_KEYS } from '../storage/storageKeys.js'
import { generateId, generateUpdatedAt } from '../utils/util.js'
import { normalizeDecision } from './decisionSchema.js'

/**
 * Get all decisions from storage
 * @returns {Array}
 */
export function loadDecisions() {
  return storage.get(STORAGE_KEYS.DECISIONS, [])
}

/**
 * Get only active (non-deleted) decisions for display
 * @returns {Array}
 */
export function getActiveDecisions() {
  return loadDecisions().filter(d => !d._deleted)
}

/**
 * Save a single decision (create or update).
 * Always writes to storage. Auto-generates updatedAt for conflict resolution.
 * @param {Object} decision - Must include `id`
 * @returns {boolean} Whether the save succeeded
 */
export function saveDecision(decision) {
  if (!decision || !decision.id) {
    console.error('[decisionModel] saveDecision requires a decision with an id')
    return false
  }

  const normalized = normalizeDecision({ ...decision, updatedAt: generateUpdatedAt() })

  const decisions = loadDecisions()
  const idx = decisions.findIndex(d => d.id === normalized.id)

  if (idx >= 0) {
    decisions[idx] = normalized
  } else {
    decisions.unshift(normalized)
  }

  return storage.set(STORAGE_KEYS.DECISIONS, decisions)
}

/**
 * Create a new decision with a generated ID
 * @param {Object} payload - Decision fields (without id)
 * @returns {Object|null} The created decision, or null on failure
 */
export function createDecision(payload) {
  const decision = normalizeDecision({
    id: generateId(),
    ...payload,
    updatedAt: generateUpdatedAt(),
  })

  const decisions = loadDecisions()
  decisions.unshift(decision)
  const ok = storage.set(STORAGE_KEYS.DECISIONS, decisions)
  return ok ? decision : null
}

/**
 * Soft-delete a decision (marks _deleted = true)
 * @param {string} decisionId
 * @returns {boolean}
 */
export function deleteDecision(decisionId) {
  const decisions = loadDecisions()
  const idx = decisions.findIndex(d => d.id === decisionId)
  if (idx === -1) return false

  decisions[idx] = {
    ...decisions[idx],
    _deleted: true,
    updatedAt: generateUpdatedAt(),
  }

  return storage.set(STORAGE_KEYS.DECISIONS, decisions)
}

/**
 * Load decision style from storage
 * @returns {Object|null}
 */
export function loadDecisionStyle() {
  return storage.get(STORAGE_KEYS.DECISION_STYLE, null)
}

/**
 * Save decision style test result
 * @param {Object} style
 * @returns {boolean}
 */
export function saveDecisionStyle(style) {
  if (!style.completedAt) {
    style.completedAt = new Date().toISOString()
  }
  return storage.set(STORAGE_KEYS.DECISION_STYLE, style)
}

/**
 * Mark style test as skipped
 * @returns {boolean}
 */
export function skipStyleTest() {
  return storage.set(STORAGE_KEYS.STYLE_TEST_SKIPPED, true)
}
