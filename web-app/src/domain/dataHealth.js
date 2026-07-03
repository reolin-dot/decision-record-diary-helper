const VALID_STATUSES = new Set(['pending', 'reviewed', 'draft'])
const VALID_REVIEW_STAGES = new Set(['none', 'current_done', 'result_done'])
const VALID_STAGES = new Set(['seed', 'sprout', 'leaf', 'first_bloom', 'full_bloom', 'bloom'])

function isDateLike(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)
}

function issue(severity, code, message, decisionId = '') {
  return { severity, code, message, decisionId }
}

function checkDecision(decision, index) {
  const id = decision?.id || `第 ${index + 1} 条`
  const issues = []
  const warnings = []

  if (!decision || typeof decision !== 'object') {
    issues.push(issue('error', 'invalid_decision', `${id} 不是有效的决策记录`))
    return { issues, warnings }
  }

  if (!decision.id) issues.push(issue('error', 'missing_id', '有一条决策缺少 ID', id))
  if (!decision.title) warnings.push(issue('warning', 'missing_title', '有一条决策缺少标题', id))
  if (!isDateLike(decision.createdAt)) warnings.push(issue('warning', 'missing_created_at', '决策缺少有效创建日期', id))
  if (!Array.isArray(decision.options)) warnings.push(issue('warning', 'invalid_options', '决策选项格式异常', id))
  if (decision.status && !VALID_STATUSES.has(decision.status)) {
    warnings.push(issue('warning', 'invalid_status', `决策状态异常：${decision.status}`, id))
  }
  if (decision.reviewStage && !VALID_REVIEW_STAGES.has(decision.reviewStage)) {
    warnings.push(issue('warning', 'invalid_review_stage', `复盘阶段异常：${decision.reviewStage}`, id))
  }
  if (decision.stage && !VALID_STAGES.has(decision.stage)) {
    warnings.push(issue('warning', 'invalid_stage', `花朵阶段异常：${decision.stage}`, id))
  }
  if (decision.wateringHistory && !Array.isArray(decision.wateringHistory)) {
    warnings.push(issue('warning', 'invalid_watering_history', '浇水记录格式异常', id))
  }

  return { issues, warnings }
}

export function checkDataHealth({ decisions = [], aiInsights = [], decisionStyle = null } = {}) {
  const issues = []
  const warnings = []

  if (!Array.isArray(decisions)) {
    issues.push(issue('error', 'invalid_decisions', '决策数据不是数组'))
  } else {
    const seen = new Set()
    decisions.forEach((decision, index) => {
      if (decision?.id) {
        if (seen.has(decision.id)) {
          issues.push(issue('error', 'duplicate_id', `发现重复决策 ID：${decision.id}`, decision.id))
        }
        seen.add(decision.id)
      }

      const result = checkDecision(decision, index)
      issues.push(...result.issues)
      warnings.push(...result.warnings)
    })
  }

  if (!Array.isArray(aiInsights)) {
    warnings.push(issue('warning', 'invalid_ai_insights', 'AI 洞察数据格式异常'))
  } else {
    aiInsights.forEach(item => {
      if (item && !item.content) {
        warnings.push(issue('warning', 'empty_ai_insight', '有一条 AI 洞察缺少正文', item.id || ''))
      }
    })
  }

  if (decisionStyle && typeof decisionStyle !== 'object') {
    warnings.push(issue('warning', 'invalid_decision_style', '决策风格数据格式异常'))
  }

  const status = issues.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'healthy'

  return {
    status,
    issues,
    warnings,
    summary: {
      decisions: Array.isArray(decisions) ? decisions.length : 0,
      aiInsights: Array.isArray(aiInsights) ? aiInsights.length : 0,
      issueCount: issues.length,
      warningCount: warnings.length,
    },
  }
}

function repairDecision(decision) {
  if (!decision || typeof decision !== 'object' || !decision.id) {
    return { decision, changed: false }
  }

  const repaired = {
    ...decision,
    options: Array.isArray(decision.options) ? decision.options : [],
    wateringHistory: Array.isArray(decision.wateringHistory) ? decision.wateringHistory : [],
    maxWaterings: typeof decision.maxWaterings === 'number' ? decision.maxWaterings : 1,
    choice: typeof decision.choice === 'number' ? decision.choice : -1,
    actionStarted: !!decision.actionStarted,
    firstReviewDone: !!decision.firstReviewDone,
    resultReviewDone: !!decision.resultReviewDone,
    isDraft: !!decision.isDraft,
    _deleted: !!decision._deleted,
    status: VALID_STATUSES.has(decision.status) ? decision.status : (decision.isDraft ? 'draft' : 'pending'),
    reviewStage: VALID_REVIEW_STAGES.has(decision.reviewStage) ? decision.reviewStage : 'none',
    stage: VALID_STAGES.has(decision.stage) ? decision.stage : 'seed',
  }

  return {
    decision: repaired,
    changed: JSON.stringify(repaired) !== JSON.stringify(decision),
  }
}

export function repairDataHealth({ decisions = [] } = {}) {
  if (!Array.isArray(decisions)) {
    return { decisions, changedCount: 0, repaired: false }
  }

  let changedCount = 0
  const repairedDecisions = decisions.map(decision => {
    const result = repairDecision(decision)
    if (result.changed) changedCount += 1
    return result.decision
  })

  return {
    decisions: repairedDecisions,
    changedCount,
    repaired: changedCount > 0,
  }
}

export function summarizeImport(payload, existingDecisions = []) {
  const decisions = Array.isArray(payload?.decisions) ? payload.decisions : []
  const existingIds = new Set(existingDecisions.map(item => item?.id).filter(Boolean))
  const summary = {
    decisions: decisions.length,
    aiInsights: Array.isArray(payload?.aiInsights) ? payload.aiInsights.length : 0,
    addedDecisions: 0,
    mergedDecisions: 0,
  }

  decisions.forEach(item => {
    if (existingIds.has(item?.id)) {
      summary.mergedDecisions += 1
    } else {
      summary.addedDecisions += 1
    }
  })

  return summary
}

export function describeBackupFreshness(lastBackupAt, now = new Date()) {
  if (!lastBackupAt) {
    return { status: 'missing', message: '还没有完整备份记录' }
  }

  const backupTime = new Date(lastBackupAt).getTime()
  const nowTime = now.getTime()
  if (!Number.isFinite(backupTime) || backupTime > nowTime) {
    return { status: 'missing', message: '还没有有效的完整备份记录' }
  }

  const days = Math.floor((nowTime - backupTime) / 86400000)
  if (days === 0) {
    return { status: 'fresh', message: '今天已做过完整备份' }
  }
  if (days <= 7) {
    return { status: 'fresh', message: `${days} 天前做过完整备份` }
  }

  return { status: 'stale', message: `${days} 天没做完整备份了` }
}
