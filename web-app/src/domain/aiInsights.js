function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function createId(createdAt) {
  return `ai_${new Date(createdAt).getTime()}_${Math.random().toString(36).slice(2, 8)}`
}

export function normalizeAiInsightInput(input = {}) {
  return {
    title: cleanText(input.title),
    content: cleanText(input.content),
  }
}

export function buildAiInsight(input = {}) {
  const normalized = normalizeAiInsightInput(input)
  const createdAt = input.createdAt || new Date().toISOString()

  return {
    id: input.id || createId(createdAt),
    title: normalized.title || 'DeepSeek 成长洞察',
    content: normalized.content,
    source: input.source || 'deepseek',
    createdAt,
    updatedAt: createdAt,
    _deleted: false,
  }
}

export function getLatestAiInsights(insights = [], limit) {
  const sorted = insights
    .filter(item => item && !item._deleted)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))

  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted
}
