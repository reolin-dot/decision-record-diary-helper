import { DECISION_TEMPLATES } from './decisionTemplates.js'
import { getGrowthSnippets } from './growthSnippets.js'
import { formatDate } from '../utils/util.js'

const CATEGORY_LABELS = Object.fromEntries(
  DECISION_TEMPLATES.map(item => [item.id, item.title])
)

function activeDecisions(decisions = []) {
  return decisions.filter(d => d && !d._deleted && !d.isDraft)
}

function topItem(values) {
  const counts = new Map()
  values.filter(Boolean).forEach(value => counts.set(value, (counts.get(value) || 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || ['', 0]
}

function categoryLabel(decision) {
  if (decision.coachSource?.kitTitle) return decision.coachSource.kitTitle
  if (decision.category?.startsWith('coach-')) return '决策锦囊'
  return CATEGORY_LABELS[decision.category] || '自由记录'
}

export function buildAvailableReportMonths(decisions = [], today = formatDate(new Date())) {
  const months = new Set([today.slice(0, 7)])

  activeDecisions(decisions).forEach(decision => {
    if (decision.createdAt) months.add(decision.createdAt.slice(0, 7))
    ;(Array.isArray(decision.wateringHistory) ? decision.wateringHistory : [])
      .forEach(item => {
        if (item.date) months.add(item.date.slice(0, 7))
      })
  })

  return [...months].filter(Boolean).sort((a, b) => b.localeCompare(a))
}

export function buildMonthlyReport(decisions = [], { today = formatDate(new Date()), month = today.slice(0, 7) } = {}) {
  const active = activeDecisions(decisions)
  const monthDecisions = active.filter(d => (d.createdAt || '').slice(0, 7) === month)
  const monthReviews = active.flatMap(d =>
    (Array.isArray(d.wateringHistory) ? d.wateringHistory : [])
      .filter(item => (item.date || '').slice(0, 7) === month)
      .map(item => ({ ...item, decisionTitle: d.title, decisionId: d.id }))
  )
  const snippets = getGrowthSnippets(active).filter(item => (item.date || '').slice(0, 7) === month)
  const [topCategory, topCategoryCount] = topItem(monthDecisions.map(categoryLabel))
  const pendingReviews = active.filter(d => d.status === 'pending' && d.reviewDate && d.reviewDate <= today)
  const notStarted = active.filter(d => d.status === 'pending' && !d.actionStarted)

  const nextFocus = pendingReviews.length > 0
    ? `先回看 ${pendingReviews.length} 个到期决策`
    : notStarted.length > 0
      ? `先推进 ${notStarted.length} 个还没开始行动的决策`
      : '继续保持记录、行动、复盘的闭环'

  return {
    month,
    decisionCount: monthDecisions.length,
    reviewCount: monthReviews.length,
    snippetCount: snippets.length,
    topCategory,
    topCategoryCount,
    topSnippets: snippets.slice(0, 3),
    nextFocus,
    summary: monthDecisions.length === 0
      ? '这个月还没有新的决策记录，可以先从一个正在犹豫的问题开始。'
      : `这个月记录了 ${monthDecisions.length} 个决策，完成 ${monthReviews.length} 次复盘。`,
  }
}
