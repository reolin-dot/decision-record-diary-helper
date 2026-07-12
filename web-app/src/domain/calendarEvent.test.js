import test from 'node:test'
import assert from 'node:assert/strict'
import { buildReviewCalendarEvent } from './calendarEvent.js'

test('builds a private all-day calendar event and escapes the title', () => {
  const event = buildReviewCalendarEvent({ id: 'd1', title: '工作,还是学习', reviewDate: '2026-07-20' })
  assert.match(event, /DTSTART;VALUE=DATE:20260720/)
  assert.match(event, /DTEND;VALUE=DATE:20260721/)
  assert.match(event, /SUMMARY:回看：工作\\,还是学习/)
})
