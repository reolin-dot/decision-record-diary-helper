import { getDecisionLifecycle } from './decisionLifecycle.js'
import { addDays, daysBetween, formatDate } from '../utils/util.js'

export const REMINDER_TYPES = {
  DUE_REVIEW: 'due_review',
  ACTION: 'action',
  RESULT_FOLLOWUP: 'result_followup',
}

export const REMINDER_META = {
  [REMINDER_TYPES.DUE_REVIEW]: {
    label: '到期复盘',
    icon: '💧',
    tone: '这朵花到了约定回看的时间。',
  },
  [REMINDER_TYPES.ACTION]: {
    label: '行动提醒',
    icon: '🍃',
    tone: '这颗种子已经发芽，可以看看第一步有没有开始。',
  },
  [REMINDER_TYPES.RESULT_FOLLOWUP]: {
    label: '结果跟进',
    icon: '🌷',
    tone: '这朵花已经初开，可以温柔地回头看看结果是否更明朗。',
  },
}

function isHiddenByUser(decision, today) {
  if (decision.reminderDismissedUntil && decision.reminderDismissedUntil >= today) return true
  if (decision.reminderSnoozedUntil && decision.reminderSnoozedUntil > today) return true
  return false
}

function buildReminder(decision, type, today) {
  const meta = REMINDER_META[type]
  const isDue = !!(decision.reviewDate && decision.reviewDate <= today)
  return {
    id: `${type}:${decision.id}`,
    type,
    decisionId: decision.id,
    decision,
    label: meta.label,
    icon: meta.icon,
    tone: meta.tone,
    isDue,
  }
}

export function getDecisionReminder(decision, today = formatDate(new Date())) {
  if (!decision || decision._deleted || decision.isDraft) return null
  if (isHiddenByUser(decision, today)) return null
  const lifecycle = getDecisionLifecycle(decision)

  if (lifecycle.canReview && decision.reviewDate && decision.reviewDate <= today) {
    return buildReminder(decision, REMINDER_TYPES.DUE_REVIEW, today)
  }

  const daysSinceCreated = decision.createdAt ? daysBetween(decision.createdAt, today) : 0
  if (
    lifecycle.canStartAction &&
    daysSinceCreated >= 3
  ) {
    return buildReminder(decision, REMINDER_TYPES.ACTION, today)
  }

  const lastWatered = decision.lastWateredAt || decision.reviewDate || decision.createdAt
  const daysSinceFirstBloom = lastWatered ? daysBetween(lastWatered, today) : 0
  if (
    lifecycle.canReview &&
    lifecycle.reviewType === 'result' &&
    daysSinceFirstBloom >= 7
  ) {
    return buildReminder(decision, REMINDER_TYPES.RESULT_FOLLOWUP, today)
  }

  return null
}

export function getReminders(decisions, today = formatDate(new Date())) {
  return decisions
    .map(decision => getDecisionReminder(decision, today))
    .filter(Boolean)
    .sort((a, b) => {
      const order = {
        [REMINDER_TYPES.DUE_REVIEW]: 0,
        [REMINDER_TYPES.RESULT_FOLLOWUP]: 1,
        [REMINDER_TYPES.ACTION]: 2,
      }
      if (order[a.type] !== order[b.type]) return order[a.type] - order[b.type]
      return (b.decision.createdAt || '').localeCompare(a.decision.createdAt || '')
    })
}

export function groupReminders(reminders) {
  return [
    {
      type: REMINDER_TYPES.DUE_REVIEW,
      title: '到期复盘',
      desc: '到了约定回看的时间，回来浇一点水就好。',
      items: reminders.filter(item => item.type === REMINDER_TYPES.DUE_REVIEW),
    },
    {
      type: REMINDER_TYPES.ACTION,
      title: '行动提醒',
      desc: '如果还没开始行动，可以先迈一个很小的步子。',
      items: reminders.filter(item => item.type === REMINDER_TYPES.ACTION),
    },
    {
      type: REMINDER_TYPES.RESULT_FOLLOWUP,
      title: '结果跟进',
      desc: '结果更明朗时，把经验轻轻收回来。',
      items: reminders.filter(item => item.type === REMINDER_TYPES.RESULT_FOLLOWUP),
    },
  ]
}

export function snoozeReminder(decision, today = formatDate(new Date())) {
  return {
    ...decision,
    reminderSnoozedUntil: addDays(today, 3),
    reminderDismissedUntil: '',
  }
}

export function dismissReminderToday(decision, today = formatDate(new Date())) {
  return {
    ...decision,
    reminderDismissedUntil: today,
  }
}
