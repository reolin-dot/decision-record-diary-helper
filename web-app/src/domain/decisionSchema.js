export function normalizeDecision(decision) {
  if (!decision || typeof decision !== 'object') return decision

  return {
    ...decision,
    options: Array.isArray(decision.options) ? decision.options : [],
    wateringHistory: Array.isArray(decision.wateringHistory)
      ? decision.wateringHistory.map(item => (
          item && typeof item === 'object'
            ? { ...item, summary: item.summary || '' }
            : item
        ))
      : [],
    maxWaterings: typeof decision.maxWaterings === 'number' ? decision.maxWaterings : 1,
    choice: typeof decision.choice === 'number' ? decision.choice : -1,
    actionStarted: !!decision.actionStarted,
    firstReviewDone: !!decision.firstReviewDone,
    resultReviewDone: !!decision.resultReviewDone,
    isDraft: !!decision.isDraft,
    _deleted: !!decision._deleted,
  }
}
