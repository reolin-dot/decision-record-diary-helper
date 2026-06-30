// utils/util.js

function formatDate(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return formatDate(d)
}

function addMonths(dateStr, months) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return formatDate(d)
}

function getReviewDate(createdAt, period) {
  switch (period) {
    case '1w': return addDays(createdAt, 7)
    case '1m': return addMonths(createdAt, 1)
    case '3m': return addMonths(createdAt, 3)
    default: return createdAt
  }
}

const DECISION_STAGES = {
  SEED: 'seed',
  SPROUT: 'sprout',
  LEAF: 'leaf',
  FIRST_BLOOM: 'first_bloom',
  FULL_BLOOM: 'full_bloom'
}

function getStageMeta(stage) {
  const metaMap = {
    seed: {
      icon: '🌱',
      label: '种子',
      description: '问题已经被认真记录'
    },
    sprout: {
      icon: '🌿',
      label: '发芽',
      description: '已经做出当前选择'
    },
    leaf: {
      icon: '🍃',
      label: '长叶',
      description: '已经开始行动'
    },
    first_bloom: {
      icon: '🌼',
      label: '初开',
      description: '完成当下复盘'
    },
    full_bloom: {
      icon: '🌸',
      label: '盛开',
      description: '完成结果复盘'
    },
    bloom: {
      icon: '🌸',
      label: '盛开',
      description: '完成结果复盘'
    }
  }
  return metaMap[stage] || metaMap.seed
}

let _idCounter = 0
function generateId() {
  _idCounter = _idCounter >= 999999 ? 0 : _idCounter + 1
  const ts = Date.now().toString(36)
  const rnd = Math.random().toString(36).slice(2, 8)
  const cnt = _idCounter.toString(36).padStart(3, '0')
  return ts + '_' + rnd + '_' + cnt
}

function getRelativeTime(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return diffDays + ' 天前'
  if (diffDays < 30) return Math.floor(diffDays / 7) + ' 周前'
  if (diffDays < 365) return Math.floor(diffDays / 30) + ' 个月前'
  return Math.floor(diffDays / 365) + ' 年前'
}

// 安全存储（带错误处理）
function safeSetStorage(key, data) {
  try {
    wx.setStorageSync(key, data)
    return true
  } catch (e) {
    console.error('Storage error [' + key + ']:', e)
    return false
  }
}

// 安全读取存储（带错误处理）
function safeGetStorage(key, defaultValue) {
  try {
    const data = wx.getStorageSync(key)
    return data !== undefined && data !== null ? data : defaultValue
  } catch (e) {
    console.error('Storage read error [' + key + ']:', e)
    return defaultValue
  }
}

module.exports = {
  formatDate,
  addDays,
  addMonths,
  getReviewDate,
  DECISION_STAGES,
  getStageMeta,
  generateId,
  getRelativeTime,
  safeSetStorage,
  safeGetStorage
}
