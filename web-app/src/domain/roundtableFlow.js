function cleanOption(value) {
  return value
    .trim()
    .replace(/[？?。！!，,]$/u, '')
    .replace(/^(?:我是|我该|要|是要|选择|选)/u, '')
    .trim()
}

export function inferDecisionOptions(question = '') {
  const parts = question.split(/[，,]?(?:还是|或者|或是|\s+vs\.?\s+)/iu)
  if (parts.length < 2) return []

  const first = cleanOption(parts[0].split(/[？?。！!]/u).at(-1))
  const rest = parts.slice(1).map(cleanOption)
  return [...new Set([first, ...rest].filter(Boolean))].slice(0, 4)
}

export function buildPendingInformation(steps = []) {
  const missing = steps
    .filter(step => !String(step.value || '').trim())
    .map(step => String(step.title || '').trim())
    .filter(Boolean)

  return missing.length > 0
    ? `还需要确认：${missing.join('、')}`
    : '再补充一个能区分选项的事实或低成本验证。'
}
