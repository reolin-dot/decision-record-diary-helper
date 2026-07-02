import { DECISION_TEMPLATES } from './decisionTemplates.js'
import { formatDate } from '../utils/util.js'

const CATEGORY_LABELS = Object.fromEntries(
  DECISION_TEMPLATES.map(template => [template.id, template.title])
)

function activeDecisions(decisions = []) {
  return decisions.filter(decision => decision && !decision._deleted && !decision.isDraft)
}

function topCount(items) {
  const counts = new Map()
  items.filter(Boolean).forEach(item => counts.set(item, (counts.get(item) || 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || ['', 0]
}

function decisionLabel(decision) {
  if (decision.coachSource?.kitTitle) return decision.coachSource.kitTitle
  if (decision.category?.startsWith('coach-')) return '决策锦囊'
  return CATEGORY_LABELS[decision.category] || '自由记录'
}

function styleChecklist(decisionStyle) {
  const text = [
    decisionStyle?.recordSuggestion,
    decisionStyle?.reviewSuggestion,
    decisionStyle?.blindSpot,
  ].find(Boolean)

  return text || '先写下事实、选择和最小下一步，再决定要不要继续投入。'
}

function buildRiskCard(decisions, today) {
  const dueReviews = decisions.filter(d => d.status === 'pending' && d.reviewDate && d.reviewDate <= today)
  const notStarted = decisions.filter(d => d.status === 'pending' && !d.actionStarted)
  const notReviewed = decisions.filter(d => !d.firstReviewDone && !d.resultReviewDone && d.status !== 'reviewed')

  if (dueReviews.length > 0) {
    return {
      id: 'risk',
      label: '容易卡住',
      title: `${dueReviews.length} 个决策等复盘`,
      body: '先回看已经到期的选择，成长感会比继续新增记录更快出现。',
      evidence: dueReviews[0].title,
      actionLabel: '去复盘',
      actionPath: '/watering',
    }
  }

  if (notStarted.length > 0) {
    return {
      id: 'risk',
      label: '容易卡住',
      title: `${notStarted.length} 个决策还没行动`,
      body: '下一次记录时，直接写一个 5 分钟动作，别让选择停在脑子里。',
      evidence: notStarted[0].title,
      actionLabel: '去推进',
      actionPath: `/decision/${notStarted[0].id}`,
    }
  }

  return {
    id: 'risk',
    label: '容易卡住',
    title: notReviewed.length > 0 ? '复盘证据还偏少' : '闭环状态不错',
    body: notReviewed.length > 0
      ? '做完决定后补一句结果或经验，后面才看得出自己的模式。'
      : '最近的记录已经形成记录、行动、复盘的闭环。',
    evidence: notReviewed[0]?.title || decisions[0]?.title || '',
    actionLabel: notReviewed.length > 0 ? '补复盘' : '看记录',
    actionPath: notReviewed[0]?.id ? `/decision/${notReviewed[0].id}` : '/decision-list',
  }
}

export function buildDecisionPatterns({
  decisions = [],
  decisionStyle = null,
  aiInsights = [],
  today = formatDate(new Date()),
} = {}) {
  const active = activeDecisions(decisions)
  const recent = [...active].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 8)

  if (active.length === 0) {
    return {
      heading: '决策模式',
      overview: '还没有足够记录形成模式',
      patternCards: [],
      riskSignals: [],
      nextChecklist: [styleChecklist(decisionStyle)],
      evidence: [],
    }
  }

  const [topLabel, topLabelCount] = topCount(recent.map(decisionLabel))
  const latestInsight = aiInsights.find(item => item && !item._deleted)
  const focusDecision = recent.find(decision => decisionLabel(decision) === topLabel)
  const isEarlySignal = active.length < 3

  const patternCards = [
    {
      id: 'focus',
      label: '最近常出现',
      title: topLabel,
      body: isEarlySignal
        ? '记录还不多，先把这类选择当作一个观察线索。'
        : `最近 ${recent.length} 条里有 ${topLabelCount} 条和它有关，先观察这类选择的共同触发点。`,
      evidence: focusDecision?.title || '',
      actionLabel: '看证据',
      actionPath: focusDecision?.id ? `/decision/${focusDecision.id}` : '/decision-list',
    },
    buildRiskCard(active, today),
    {
      id: 'next',
      label: '下次检查',
      title: decisionStyle?.type || '通用检查清单',
      body: styleChecklist(decisionStyle),
      evidence: latestInsight?.title || recent[0]?.title || '',
      actionLabel: '开始记录',
      actionPath: '/record?step=1',
    },
  ]

  return {
    heading: isEarlySignal ? '初步观察' : '决策模式',
    overview: isEarlySignal
      ? `先从 ${active.length} 条决策里看一点线索`
      : `已从 ${active.length} 条决策里整理出 ${patternCards.length} 个观察点`,
    patternCards,
    riskSignals: [patternCards[1]],
    nextChecklist: [patternCards[2].body],
    evidence: patternCards.map(card => card.evidence).filter(Boolean),
  }
}
