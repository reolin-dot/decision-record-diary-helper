import { CURRENT_SCHEMA_VERSION, STORAGE_KEYS } from '../storage/storageKeys.js'
import { checkDataHealth, repairDataHealth } from './dataHealth.js'

const PORTABLE_KEYS = [
  STORAGE_KEYS.SCHEMA_VERSION,
  STORAGE_KEYS.HAS_LAUNCHED,
  STORAGE_KEYS.DECISIONS,
  STORAGE_KEYS.DECISION_STYLE,
  STORAGE_KEYS.AI_INSIGHTS,
  STORAGE_KEYS.STYLE_TEST_SKIPPED,
  STORAGE_KEYS.USER_PROFILE,
]

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function summarizeImport(payload, existingDecisions) {
  const existingIds = new Set(existingDecisions.map(item => item?.id).filter(Boolean))
  const summary = {
    decisions: payload.decisions.length,
    aiInsights: payload.aiInsights?.length || 0,
    addedDecisions: 0,
    mergedDecisions: 0,
  }

  payload.decisions.forEach(item => {
    summary[existingIds.has(item?.id) ? 'mergedDecisions' : 'addedDecisions'] += 1
  })
  return summary
}

export function buildLocalBackup(snapshot = {}, { dataHealth, exportedAt } = {}) {
  const backup = {
    schemaVersion: snapshot.schemaVersion ?? CURRENT_SCHEMA_VERSION,
    exportedAt: exportedAt || snapshot.exportedAt || new Date().toISOString(),
    exportType: 'local_backup',
  }

  PORTABLE_KEYS.forEach(key => {
    if (snapshot[key] !== undefined && snapshot[key] !== null) backup[key] = snapshot[key]
  })
  if (!Array.isArray(backup.decisions)) backup.decisions = []
  if (dataHealth !== undefined) backup.dataHealth = dataHealth
  return backup
}

export function prepareBackupImport(payload, existingDecisions = []) {
  if (!isPlainObject(payload)) return { ok: false, error: '备份文件格式无效' }

  const schemaVersion = Number(payload.schemaVersion ?? 0)
  if (!Number.isFinite(schemaVersion) || schemaVersion > CURRENT_SCHEMA_VERSION) {
    return { ok: false, error: '备份来自更高版本，请先升级应用' }
  }
  if (!Array.isArray(payload.decisions)) {
    return { ok: false, error: '备份文件缺少决策数据' }
  }

  const health = checkDataHealth({
    decisions: payload.decisions,
    aiInsights: Array.isArray(payload.aiInsights) ? payload.aiInsights : [],
    decisionStyle: isPlainObject(payload.decisionStyle) ? payload.decisionStyle : null,
  })
  if (health.status === 'error') {
    return { ok: false, error: health.issues[0]?.message || '备份数据有严重格式问题' }
  }

  const repair = repairDataHealth({ decisions: payload.decisions })
  const safePayload = {
    schemaVersion,
    decisions: repair.decisions,
  }
  if (Array.isArray(payload.aiInsights)) safePayload.aiInsights = payload.aiInsights
  if (isPlainObject(payload.decisionStyle)) safePayload.decisionStyle = payload.decisionStyle
  if (typeof payload.hasLaunched === 'boolean') safePayload.hasLaunched = payload.hasLaunched
  if (typeof payload.styleTestSkipped === 'boolean') safePayload.styleTestSkipped = payload.styleTestSkipped
  if (isPlainObject(payload.userProfile)) safePayload.userProfile = payload.userProfile

  return {
    ok: true,
    payload: safePayload,
    health,
    repair,
    summary: summarizeImport(safePayload, existingDecisions),
  }
}
