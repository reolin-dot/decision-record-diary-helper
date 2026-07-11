// Core utilities - migrated from miniprogram utils/util.js
// All wx.* calls replaced with standard Web APIs.

export function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return formatDate(d)
}

export function addMonths(dateStr, months) {
  const d = new Date(dateStr)
  const day = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + months)
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(day, lastDay))
  return formatDate(d)
}

export function daysBetween(startDate, endDate = formatDate(new Date())) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end - start
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export function getReviewDate(createdAt, period) {
  switch (period) {
    case '1w': return addDays(createdAt, 7)
    case '1m': return addMonths(createdAt, 1)
    case '3m': return addMonths(createdAt, 3)
    default: return createdAt
  }
}

let _idCounter = 0
export function generateId() {
  _idCounter = _idCounter >= 999999 ? 0 : _idCounter + 1
  const ts = Date.now().toString(36)
  const rnd = Math.random().toString(36).slice(2, 8)
  const cnt = _idCounter.toString(36).padStart(3, '0')
  return ts + '_' + rnd + '_' + cnt
}

export function generateUpdatedAt() {
  return new Date().toISOString()
}

export function getRelativeTime(dateStr) {
  const diffDays = daysBetween(dateStr)

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return diffDays + ' 天前'
  if (diffDays < 30) return Math.floor(diffDays / 7) + ' 周前'
  if (diffDays < 365) return Math.floor(diffDays / 30) + ' 个月前'
  return Math.floor(diffDays / 365) + ' 年前'
}
