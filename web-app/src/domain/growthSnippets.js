export function getGrowthSnippets(decisions) {
  return decisions
    .filter(decision => !decision._deleted)
    .flatMap(decision => {
      const history = Array.isArray(decision.wateringHistory) ? decision.wateringHistory : []
      return history
        .filter(item => item.lesson || item.summary)
        .map((item, index) => ({
          id: `${decision.id}:${index}`,
          decisionId: decision.id,
          decisionTitle: decision.title,
          text: item.lesson || item.summary,
          summary: item.summary || '',
          date: item.date || decision.updatedAt || decision.createdAt || '',
          type: item.type || 'current',
          rating: item.rating || '',
        }))
    })
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
}

export function getLatestGrowthSnippets(decisions, limit = 3) {
  return getGrowthSnippets(decisions).slice(0, limit)
}
