import { addDays } from '../utils/util.js'

function escapeText(value = '') {
  return String(value).replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n')
}

export function buildReviewCalendarEvent(decision) {
  const start = decision.reviewDate.replaceAll('-', '')
  const end = addDays(decision.reviewDate, 1).replaceAll('-', '')
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Decidiary//Review//ZH-CN', 'BEGIN:VEVENT',
    `UID:${escapeText(decision.id)}@decidiary.icu`,
    `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`,
    `SUMMARY:${escapeText(`回看：${decision.title}`)}`,
    'DESCRIPTION:回来看看当时的信息和判断，不急着评价对错。',
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n')
}
