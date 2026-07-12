function dayNumber(date) {
  return [...date].reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

export function getDailyMemory(decisions = [], today = formatDate(new Date())) {
  const candidates = decisions
    .filter(item => !item._deleted && !item.isDraft && (item.wateringHistory || []).length > 0)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)))
  if (candidates.length === 0) return null

  const decision = candidates[dayNumber(today) % candidates.length]
  const review = decision.wateringHistory[decision.wateringHistory.length - 1]
  return {
    decision,
    review,
    lesson: review.lesson || review.summary || review.reflection || '那时的你已经认真走过了一段路。',
  }
}
import { formatDate } from '../utils/util.js'
