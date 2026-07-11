// Data migration system
// Runs on app startup to ensure stored data conforms to the current schema.

import storage from '../storage/LocalStorageAdapter.js'
import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from '../storage/storageKeys.js'
import { normalizeDecision } from './decisionSchema.js'

/**
 * Run all necessary migrations on stored data.
 * Called once during AppContext initialization.
 */
export function runMigrations() {
  const version = storage.get(STORAGE_KEYS.SCHEMA_VERSION, 0)
  if (version > CURRENT_SCHEMA_VERSION) return false

  if (version < 1 && !migrateV0toV1()) return false

  return storage.set(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION)
}

/**
 * Migrate from no schema (v0) to v1:
 * - Ensure decisions have required fields
 * - Ensure wateringHistory exists
 * - Ensure maxWaterings exists
 */
function migrateV0toV1() {
  const decisions = storage.get(STORAGE_KEYS.DECISIONS, [])

  if (!Array.isArray(decisions) || decisions.length === 0) return true

  const migrated = decisions.map(d => normalizeDecision({
    ...d,
    // Ensure string fields
    status: d.status || (d.isDraft ? 'draft' : 'pending'),
    reviewStage: d.reviewStage || 'none',
    stage: d.stage || 'seed',
    reminderDismissedUntil: d.reminderDismissedUntil || '',
    reminderSnoozedUntil: d.reminderSnoozedUntil || '',
    // Add updatedAt if missing (use createdAt as fallback)
    updatedAt: d.updatedAt || (d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString()),
  }))

  return storage.set(STORAGE_KEYS.DECISIONS, migrated)
}
