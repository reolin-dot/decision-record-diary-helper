import { DECISION_TEMPLATES } from './decisionTemplates.js'
import { getGrowthSnippets } from './growthSnippets.js'
import { formatDate } from '../utils/util.js'

const TEMPLATE_MAP = Object.fromEntries(
  DECISION_TEMPLATES.map(item => [item.id, item])
)

export function getDecisionTheme(decision) {
  if (decision.coachSource?.kitTitle) {
    return { id: `coach:${decision.coachSource.kitTitle}`, title: decision.coachSource.kitTitle, icon: '🧭' }
  }
  if (decision.category?.startsWith('coach-')) {
    return { id: 'coach', title: '决策锦囊', icon: '🧭' }
  }

  const template = TEMPLATE_MAP[decision.category]
  if (template) return { id: template.id, title: template.title, icon: template.icon }
  return { id: 'free', title: '自由记录', icon: '🌿' }
}

export function buildThemeStats(decisions = []) {
  const active = decisions.filter(item => item && !item._deleted && !item.isDraft)
  const counts = new Map()

  active.forEach(decision => {
    const theme = getDecisionTheme(decision)
    const existing = counts.get(theme.id) || { ...theme, count: 0 }
    counts.set(theme.id, { ...existing, count: existing.count + 1 })
  })

  const total = active.length
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
    .map(item => ({
      ...item,
      ratio: total ? Math.round((item.count / total) * 100) : 0,
    }))
}

export function getThemeDecisions(decisions = [], themeId = '') {
  return decisions
    .filter(item => item && !item._deleted && !item.isDraft)
    .filter(item => getDecisionTheme(item).id === themeId)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}

export function buildThemeInsight(theme) {
  if (!theme) return '先记录几个正式决策，主题线索会慢慢浮出来。'
  if (theme.count === 1) return `${theme.title}刚出现一条记录，可以先观察它会不会成为反复出现的主题。`
  if (theme.ratio >= 50) return `你最近有一半以上的决策集中在${theme.title}，这可能是当前最值得回看的生活主题。`
  return `${theme.title}已经积累了 ${theme.count} 个决策，可以开始看看这些选择背后有没有相似模式。`
}

export function getThemeGrowthSnippets(decisions = [], themeId = '', limit = 2) {
  const decisionIds = new Set(getThemeDecisions(decisions, themeId).map(item => item.id))
  return getGrowthSnippets(decisions)
    .filter(item => decisionIds.has(item.decisionId))
    .slice(0, limit)
}

export function buildThemeNextAction(decisions = [], themeId = '', today = formatDate(new Date())) {
  const themeDecisions = getThemeDecisions(decisions, themeId)
  if (themeDecisions.length === 0) {
    return { text: '先记录一个正式决策，让这个主题有第一条线索。', label: '去记录', path: '/record' }
  }

  const dueCount = themeDecisions.filter(item => item.status === 'pending' && item.reviewDate && item.reviewDate <= today).length
  if (dueCount > 0) {
    return { text: `这个主题下有 ${dueCount} 个决策到期了，可以先回来看一眼。`, label: '去提醒中心', path: '/watering' }
  }

  if (getThemeGrowthSnippets(decisions, themeId, 1).length === 0) {
    return { text: '这个主题还没有沉淀出收获，下一次可以先完成一条复盘。', label: '去提醒中心', path: '/watering' }
  }

  return { text: '这个主题已经有记录和收获了，可以继续补一条新的相关决策。', label: '继续记录', path: '/record' }
}
