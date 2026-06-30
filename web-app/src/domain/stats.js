// Stats calculation - extracted from miniprogram app.js

import { formatDate } from '../utils/util.js'
import { isBloomStage } from './decisionStages.js'

export function buildStats(decisions) {
  const active = decisions.filter(d => !d.isDraft && !d._deleted)
  const total = active.length
  const bloomed = active.filter(d => isBloomStage(d.stage)).length
  const reviewed = active.filter(
    d => d.firstReviewDone || d.resultReviewDone || d.status === 'reviewed'
  ).length

  const currentMonth = formatDate(new Date()).slice(0, 7)
  const monthlyDecisions = active.filter(
    d => (d.createdAt || '').slice(0, 7) === currentMonth
  ).length

  const growthLoopRate = total
    ? Math.round((bloomed / total) * 100) + '%'
    : '0%'

  return {
    totalDecisions: total,
    reviewRate: total
      ? Math.round((reviewed / total) * 100) + '%'
      : '0%',
    growthLoopRate,
    streak: calculateStreak(active),
    monthlyDecisions,
    bloomedCount: bloomed,
  }
}

function calculateStreak(decisions) {
  const dateSet = new Set()
  decisions.forEach(d => {
    if (d.createdAt) dateSet.add(d.createdAt)
  })

  let streak = 0
  const cursor = new Date()
  while (dateSet.has(formatDate(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
