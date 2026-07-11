import { buildStats } from './stats.js'

const DEEPSEEK_ANALYSIS_VERSION = 'decision-diary-deepseek-v1'

function toText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function compactHistory(history = []) {
  return history.map(item => ({
    date: item.date || '',
    type: item.type || '',
    summary: toText(item.summary),
    lesson: toText(item.lesson),
    result: toText(item.result),
    feeling: toText(item.feeling),
  }))
}

function compactDecision(decision) {
  return {
    id: decision.id,
    title: toText(decision.title),
    category: decision.category || '',
    background: toText(decision.background),
    options: Array.isArray(decision.options) ? decision.options.filter(Boolean) : [],
    choice: Number.isInteger(decision.choice) ? decision.choice : toText(decision.choice),
    reason: toText(decision.reason),
    expectation: toText(decision.expectation),
    mood: decision.mood || '',
    createdAt: decision.createdAt || '',
    reviewDate: decision.reviewDate || '',
    stage: decision.stage || '',
    actionStarted: !!decision.actionStarted,
    firstReviewDone: !!decision.firstReviewDone,
    resultReviewDone: !!decision.resultReviewDone,
    wateringHistory: compactHistory(decision.wateringHistory || []),
  }
}

function buildDecisionStyle(style) {
  if (!style) {
    return {
      status: 'not_completed',
      note: '用户尚未完成决策性格测试，请主要根据本地决策和复盘数据推断。',
    }
  }

  return {
    status: 'completed',
    type: style.type || '',
    tags: style.tags || [],
    tip: style.tip || '',
    strength: style.strength || '',
    blindSpot: style.blindSpot || '',
    recordSuggestion: style.recordSuggestion || '',
    reviewSuggestion: style.reviewSuggestion || '',
    testId: style.testId || '',
    testTitle: style.testTitle || '',
    completedAt: style.completedAt || '',
    scores: style.scores || [],
  }
}

export function buildDeepSeekPayload({ decisions, decisionStyle }) {
  const activeDecisions = decisions.filter(d => !d.isDraft && !d._deleted)

  return {
    schema: DEEPSEEK_ANALYSIS_VERSION,
    exportedAt: new Date().toISOString(),
    source: {
      app: '决策成长日记 Web',
      dataScope: '用户主动复制的本地浏览器数据',
    },
    analysisRequest: {
      role: '请作为“决策成长教练”和“产品化复盘助手”阅读这些数据。',
      goals: [
        '识别我的决策性格、常见优势和容易卡住的地方',
        '结合真实决策与复盘，找出可重复的决策模式',
        '给出 3 条具体、温和、可执行的改进建议',
        '帮我设计下一次做重要决策时可以使用的检查清单',
      ],
      outputFormat: [
        '先用 5 句话以内总结整体画像',
        '再分为：优势、风险点、证据、建议、下一次行动清单',
        '请引用数据中的具体决策标题或复盘片段作为依据',
        '不要做医学诊断，也不要把一次选择简单归因为性格缺陷',
      ],
    },
    decisionStyle: buildDecisionStyle(decisionStyle),
    stats: buildStats(activeDecisions),
    decisions: activeDecisions.map(compactDecision),
  }
}

export function buildDeepSeekPrompt(payload) {
  return [
    '我正在使用「决策成长日记」记录自己的选择和复盘。下面是我主动导出的本地数据，请你按其中的 analysisRequest 来分析。',
    '',
    '请把它当作结构化 JSON 读取，不要只看表面情绪。若数据不足，请明确说明哪些结论只是初步假设。',
    '',
    '```json',
    JSON.stringify(payload, null, 2),
    '```',
  ].join('\n')
}
