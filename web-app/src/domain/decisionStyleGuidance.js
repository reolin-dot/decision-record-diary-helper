function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function styleText(style) {
  if (!style) return ''
  const parts = [
    style.type,
    ...(style.tags || []),
    ...(style.scores || []).map(item => item.name),
  ]
  return parts.map(cleanText).filter(Boolean).join(' ')
}

function hasAny(text, keywords) {
  return keywords.some(keyword => text.includes(keyword))
}

export function getRecordStyleGuidance(style) {
  if (!style) return null

  return {
    label: style.type ? `${style.type}提示` : '风格提示',
    text: cleanText(style.recordSuggestion) || '把此刻最真实的判断写下来，不用追求一次想完美。',
  }
}

export function getReviewStyleGuidance(style) {
  if (!style) return null

  return {
    label: style.type ? `${style.type}复盘提示` : '复盘提示',
    text: cleanText(style.reviewSuggestion) || '先写事实和经验，不急着评价当初选对还是选错。',
  }
}

export function getCoachRecommendation(style) {
  if (!style) return null

  const text = styleText(style)
  let kitId = 'choice'
  let reason = '先把选项和标准放清楚，减少脑内来回比较。'

  if (hasAny(text, ['情绪', '压力', '后悔', '焦虑'])) {
    kitId = 'emotion'
    reason = '先把情绪和事实分开，避免在内耗最强的时候做不可逆决定。'
  } else if (hasAny(text, ['行动', '拖延', '阻滞', '执行'])) {
    kitId = 'action'
    reason = '把决定拆成一个能开始的小动作，比继续思考更容易推进。'
  } else if (hasAny(text, ['信息', '验证', '调研'])) {
    kitId = 'info'
    reason = '先确认最关键的未知项，用低成本验证替代无限收集资料。'
  } else if (hasAny(text, ['复盘', '结果'])) {
    kitId = 'review'
    reason = '把事实、判断和经验分开看，更容易留下可复用的成长片段。'
  }

  return {
    kitId,
    label: style.type ? `根据你的${style.type}` : '根据你的决策风格',
    reason,
  }
}
