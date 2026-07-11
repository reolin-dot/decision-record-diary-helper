import test from 'node:test'
import assert from 'node:assert/strict'
import { buildLocalBackup, prepareBackupImport } from './backupRecovery.js'

test('builds a portable backup without device sync metadata', () => {
  const backup = buildLocalBackup({
    schemaVersion: 1,
    decisions: [{ id: 'd1' }],
    decisionStyle: { type: '行动型' },
    syncConfig: { userId: 'other-user' },
    syncQueue: [{ id: 'operation-1' }],
    lastSyncTime: '2026-07-10',
    lastBackupAt: '2026-07-10',
  }, { exportedAt: '2026-07-11T00:00:00.000Z' })

  assert.deepEqual(backup.decisions, [{ id: 'd1' }])
  assert.equal(backup.exportedAt, '2026-07-11T00:00:00.000Z')
  assert.equal(backup.exportType, 'local_backup')
  assert.equal(backup.syncConfig, undefined)
  assert.equal(backup.syncQueue, undefined)
  assert.equal(backup.lastSyncTime, undefined)
  assert.equal(backup.lastBackupAt, undefined)
  assert.deepEqual(buildLocalBackup({}).decisions, [])
})

test('prepares and repairs a safe import payload', () => {
  const prepared = prepareBackupImport({
    schemaVersion: 1,
    decisions: [
      { id: 'd1', title: '导入', options: 'bad' },
      { id: 'old', title: '同 ID 合并', options: [] },
    ],
    aiInsights: [{ id: 'ai1', content: '洞察' }],
    syncQueue: [{ id: 'must-not-import' }],
  }, [{ id: 'old' }])

  assert.equal(prepared.ok, true)
  assert.deepEqual(prepared.payload.decisions[0].options, [])
  assert.equal(prepared.payload.syncQueue, undefined)
  assert.equal(prepared.summary.addedDecisions, 1)
  assert.equal(prepared.summary.mergedDecisions, 1)
  assert.equal(prepared.repair.changedCount, 2)

  const newer = prepareBackupImport({ schemaVersion: 2, decisions: [] })
  assert.equal(newer.ok, false)
})
