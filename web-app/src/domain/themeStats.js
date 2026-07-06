import { DECISION_TEMPLATES } from './decisionTemplates.js'

const TEMPLATE_MAP = Object.fromEntries(
  DECISION_TEMPLATES.map(item => [item.id, item])
)

function themeForDecision(decision) {
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
    const theme = themeForDecision(decision)
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
