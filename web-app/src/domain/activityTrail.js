import { addDays, formatDate } from '../utils/util.js'

export function buildActivityTrail(decisions = [], today = formatDate(new Date()), days = 84) {
  const counts = new Map()
  decisions.filter(item => !item._deleted).forEach(item => {
    if (item.createdAt) counts.set(item.createdAt.slice(0, 10), (counts.get(item.createdAt.slice(0, 10)) || 0) + 1)
    ;(item.wateringHistory || []).forEach(review => {
      if (review.date) counts.set(review.date.slice(0, 10), (counts.get(review.date.slice(0, 10)) || 0) + 1)
    })
  })

  return Array.from({ length: days }, (_, index) => {
    const date = addDays(today, index - days + 1)
    return { date, count: counts.get(date) || 0 }
  })
}
