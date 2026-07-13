import { getDecisionLifecycle } from './decisionLifecycle.js'

export function buildHomeNextAction(decisions, reminder) {
  if (reminder) return {
    label: '今天最值得回看', title: reminder.decision.title, text: reminder.tone,
    action: '去复盘', path: `/review/${reminder.decisionId}`,
  }

  const latest = [...decisions]
    .sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''))
    .find(item => item.isDraft || getDecisionLifecycle(item).canStartAction)

  if (latest?.isDraft) return {
    label: '今天的下一步', title: latest.title, text: '把这份草稿补完整，让它进入决策流程。',
    action: '继续完善', path: `/record?draftId=${latest.id}&step=1`,
  }
  if (latest) return {
    label: '今天的下一步', title: latest.title,
    text: latest.smallestAction || latest.expectation || '确认一个今天就能开始的小行动。',
    action: '查看并行动', path: `/decision/${latest.id}`,
  }
  return {
    label: '今天的下一步', title: '记录一个新问题', text: '写下正在纠结的事，先不急着得到完美答案。',
    action: '开始记录', path: '/record?step=1',
  }
}
