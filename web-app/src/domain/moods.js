const MOOD_SEPARATOR = '、'
const CUSTOM_PREFIX = '其他：'

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function toggleMood(selectedMoods = [], mood) {
  if (selectedMoods.includes(mood)) {
    return selectedMoods.filter(item => item !== mood)
  }
  return [...selectedMoods, mood]
}

export function buildMoodValue(selectedMoods = [], customMood = '') {
  const cleanedMoods = selectedMoods.filter(Boolean)
  const custom = cleanText(customMood)

  if (!cleanedMoods.includes('其他')) {
    return cleanedMoods.join(MOOD_SEPARATOR)
  }

  const visibleMoods = cleanedMoods.filter(item => item !== '其他')
  const otherText = custom ? `${CUSTOM_PREFIX}${custom}` : '其他'
  return [...visibleMoods, otherText].join(MOOD_SEPARATOR)
}

export function parseMoodValue(value = '') {
  const text = cleanText(value)
  if (!text) return { selectedMoods: [], customMood: '' }

  const parts = text.split(MOOD_SEPARATOR).map(cleanText).filter(Boolean)
  const customPart = parts.find(item => item.startsWith(CUSTOM_PREFIX))
  const selectedMoods = parts
    .filter(item => !item.startsWith(CUSTOM_PREFIX))
    .map(item => item === '其他' ? '其他' : item)

  if (customPart && !selectedMoods.includes('其他')) {
    selectedMoods.push('其他')
  }

  return {
    selectedMoods,
    customMood: customPart ? customPart.slice(CUSTOM_PREFIX.length).trim() : '',
  }
}
