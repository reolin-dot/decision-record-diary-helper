// Data migration system
// Runs on app startup to ensure stored data conforms to the current schema.

import storage from '../storage/LocalStorageAdapter.js'
import { STORAGE_KEYS, CURRENT_SCHEMA_VERSION } from '../storage/storageKeys.js'

/**
 * Run all necessary migrations on stored data.
 * Called once during AppContext initialization.
 */
export function runMigrations() {
  const version = storage.get(STORAGE_KEYS.SCHEMA_VERSION, 0)

  if (version < 1) {
    migrateV0toV1()
  }

  // Always ensure schema version is current
  storage.set(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION)
}

/**
 * Migrate from no schema (v0) to v1:
 * - Ensure decisions have required fields
 * - Ensure wateringHistory exists
 * - Ensure maxWaterings exists
 */
function migrateV0toV1() {
  const decisions = storage.get(STORAGE_KEYS.DECISIONS, [])

  if (!Array.isArray(decisions) || decisions.length === 0) return

  const migrated = decisions.map(d => ({
    ...d,
    // Ensure arrays exist
    options: Array.isArray(d.options) ? d.options : [],
    wateringHistory: Array.isArray(d.wateringHistory)
      ? d.wateringHistory.map(item => ({
          ...item,
          summary: item.summary || '',
        }))
      : [],
    // Ensure numeric fields
    maxWaterings: typeof d.maxWaterings === 'number' ? d.maxWaterings : 1,
    choice: typeof d.choice === 'number' ? d.choice : -1,
    // Ensure boolean fields
    actionStarted: !!d.actionStarted,
    firstReviewDone: !!d.firstReviewDone,
    resultReviewDone: !!d.resultReviewDone,
    isDraft: !!d.isDraft,
    _deleted: !!d._deleted,
    // Ensure string fields
    status: d.status || (d.isDraft ? 'draft' : 'pending'),
    reviewStage: d.reviewStage || 'none',
    stage: d.stage || 'seed',
    reminderDismissedUntil: d.reminderDismissedUntil || '',
    reminderSnoozedUntil: d.reminderSnoozedUntil || '',
    // Add updatedAt if missing (use createdAt as fallback)
    updatedAt: d.updatedAt || (d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString()),
  }))

  storage.set(STORAGE_KEYS.DECISIONS, migrated)
}
