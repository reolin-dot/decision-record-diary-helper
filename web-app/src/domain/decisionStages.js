// Decision stage constants and metadata.

export const DECISION_STAGES = {
  SEED: 'seed',
  SPROUT: 'sprout',
  LEAF: 'leaf',
  FIRST_BLOOM: 'first_bloom',
  FULL_BLOOM: 'full_bloom',
}

const stageMetaMap = {
  seed: {
    icon: '🌱',
    label: '种子',
    description: '问题已经被认真记录',
  },
  sprout: {
    icon: '🌿',
    label: '发芽',
    description: '已经做出当前选择',
  },
  leaf: {
    icon: '🍃',
    label: '长叶',
    description: '已经开始行动',
  },
  first_bloom: {
    icon: '🌷',
    label: '初开',
    description: '完成当下复盘',
  },
  full_bloom: {
    icon: '🌸',
    label: '盛开',
    description: '完成结果复盘',
  },
  // Legacy alias.
  bloom: {
    icon: '🌸',
    label: '盛开',
    description: '完成结果复盘',
  },
}

export function getStageMeta(stage) {
  return stageMetaMap[stage] || stageMetaMap.seed
}

export function isBloomStage(stage) {
  return stage === 'full_bloom' || stage === 'bloom'
}

export function isGrowingStage(stage) {
  return ['sprout', 'leaf', 'first_bloom'].includes(stage)
}
