function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function styleText(style) {
  return [
    style?.type,
    ...(style?.tags || []),
    style?.blindSpot,
    style?.reviewSuggestion,
  ].map(cleanText).filter(Boolean).join(' ')
}

function sourcePrompts(decision = {}, reviewType) {
  const kitId = decision.coachSource?.kitId
  const isResult = reviewType === 'result'

  if (kitId === 'emotion') {
    return {
      sourceLabel: '来自情绪降噪锦囊',
      statusOptions: isResult
        ? ['事实更清楚了', '情绪影响变小了', '仍然有波动', '和预期不同', '需要调整']
        : ['情绪降下来了', '事实更清楚了', '仍然很纠结', '需要暂停', '可以推进一点'],
      reflectionLabel: reviewType === 'result'
        ? '现在回看，哪些是事实，哪些是当时的情绪？'
        : '现在情绪和事实的关系变清楚了吗？',
      reflectionHint: '先分开写事实和感受，不急着评价自己。',
      reflectionPlaceholder: '例如：事实是... 当时的感受是...',
      lessonLabel: '下次情绪很强时，你想先做什么？',
      lessonHint: '写一个能帮你降噪的小动作。',
      lessonPlaceholder: '例如：先等一晚 / 找人复述事实 / 写下最坏情况...',
      followUpHint: isResult
        ? '如果情绪和事实都清楚了，可以完成；如果还在波动，就留一次跟进。'
        : '情绪还没降下来时，留一次跟进比急着下结论更稳。',
    }
  }

  if (kitId === 'action') {
    return {
      sourceLabel: '来自行动启动锦囊',
      statusOptions: isResult
        ? ['小行动带来结果', '方向基本正确', '还没看到结果', '阻力比预期大', '需要换做法']
        : ['最小行动已发生', '开始了一点', '还没开始', '遇到阻力', '需要再小一点'],
      reflectionLabel: '那个最小行动发生了吗？',
      reflectionHint: '发生了就写反馈，没发生就写真正卡住的地方。',
      reflectionPlaceholder: '例如：做了 5 分钟，发现... / 还没做，因为...',
      lessonLabel: '下一步还能再小一点吗？',
      lessonHint: '把下一步写到今天或明天能开始的程度。',
      lessonPlaceholder: '例如：只打开文档 / 只发一条消息 / 只查一个信息...',
      followUpHint: isResult
        ? '如果小行动已经带来结果，可以完成；如果只是刚启动，就继续跟一次。'
        : '只要最小行动还没稳定发生，就值得再跟进一次。',
    }
  }

  if (kitId === 'info') {
    return {
      sourceLabel: '来自信息验证锦囊',
      statusOptions: isResult
        ? ['关键未知项已验证', '信息支持原判断', '信息推翻原判断', '仍不确定', '需要继续验证']
        : ['已验证一个信息', '找到新线索', '仍缺关键信息', '信息太杂', '需要低成本试错'],
      reflectionLabel: '关键未知项现在更清楚了吗？',
      reflectionHint: '只写真正影响判断的信息。',
      reflectionPlaceholder: '例如：我确认了... 还有... 不确定',
      lessonLabel: '下次还需要验证什么？',
      lessonHint: '别列太多，优先写一个最关键问题。',
      lessonPlaceholder: '例如：先问清楚成本 / 先试一次 / 先看真实反馈...',
      followUpHint: isResult
        ? '如果关键未知项已经验证，可以完成；如果还有一个最影响判断的信息，就继续跟进。'
        : '信息还不够清楚时，只留一个最关键验证点继续跟。',
    }
  }

  if (kitId === 'choice') {
    return {
      sourceLabel: '来自纠结选择锦囊',
      statusOptions: isResult
        ? ['选择基本符合预期', '比预期更好', '代价比预期大', '还不确定', '下次要调标准']
        : ['更倾向原选择', '发现新标准', '选项差异变清楚', '仍然摇摆', '需要再观察'],
      reflectionLabel: '当时比较的选项，现在哪个事实更清楚了？',
      reflectionHint: '回看选项，而不是重新责备自己。',
      reflectionPlaceholder: '例如：A 的稳定性确实... B 的成长空间其实...',
      lessonLabel: '下次做类似选择，要保留或调整哪个判断标准？',
      lessonHint: '写一条能复用的选择标准。',
      lessonPlaceholder: '例如：我会更早确认... / 我不会只看...',
      followUpHint: isResult
        ? '如果选择的代价和收益都看清了，可以完成；如果仍在摇摆，就再观察一次。'
        : '选项差异还没清楚时，继续跟一次比重新纠结更有用。',
    }
  }

  if (kitId === 'review') {
    return {
      sourceLabel: '来自复盘提炼锦囊',
      statusOptions: isResult
        ? ['经验仍然成立', '经验需要修正', '发现新证据', '还不确定', '可以复用']
        : ['经验更清楚了', '需要补充事实', '发现新角度', '暂时不确定', '可以带走一句话'],
      reflectionLabel: '这次经验现在还成立吗？',
      reflectionHint: '看看当时提炼的经验有没有被新事实修正。',
      reflectionPlaceholder: '例如：这条经验仍然成立，因为...',
      lessonLabel: '这句话下次可以怎么用？',
      lessonHint: '把经验改写成一个具体提醒。',
      lessonPlaceholder: '例如：下次我会先...',
      followUpHint: '如果这条经验已经能指导下次行动，可以完成；如果还只是感受，就再沉淀一次。',
    }
  }

  return null
}

function styleReminder(style) {
  const text = styleText(style)
  if (!text) return ''
  if (text.includes('情绪') || text.includes('压力') || text.includes('焦虑')) {
    return '先写事实，再写感受。情绪是线索，不是判决。'
  }
  if (text.includes('信息') || text.includes('验证') || text.includes('调研')) {
    return '只记录真正改变判断的信息，避免把复盘变成继续收集资料。'
  }
  if (text.includes('行动') || text.includes('拖延') || text.includes('执行')) {
    return '重点看行动有没有发生，不用把原因分析得太完整。'
  }
  return cleanText(style?.reviewSuggestion)
}

function defaultStatusOptions(reviewType) {
  return reviewType === 'result'
    ? ['比预期更好', '基本符合预期', '还不确定', '和预期不同', '需要调整']
    : ['刚开始推进', '有了新信息', '遇到阻力', '方向需要微调', '暂时暂停']
}

export function buildReviewPrompts({ decision = {}, decisionStyle = null, reviewType = 'current' } = {}) {
  const source = sourcePrompts(decision, reviewType) || {}
  const isResult = reviewType === 'result'
  const notStarted = !decision.actionStarted
  const reminder = styleReminder(decisionStyle)

  return {
    title: isResult ? '结果复盘' : '当下复盘',
    intro: notStarted
      ? '先看第一步为什么还没发生。'
      : (isResult ? '结果更明朗了，把经验收回来。' : '记录现在看到的新事实。'),
    sourceLabel: source.sourceLabel || '',
    styleReminder: reminder,
    followUpHint: source.followUpHint || (isResult
      ? '结果还没完全明朗的话，可以继续跟进；已经清楚了，就让它盛开。'
      : '如果还需要观察，就留一次跟进；如果已经看清下一步，可以直接完成。'),
    statusLabel: isResult ? '最终结果现在更接近哪种状态？' : '现在这件事推进到哪里了？',
    statusOptions: source.statusOptions || defaultStatusOptions(reviewType),
    reflectionLabel: source.reflectionLabel || (isResult ? '实际发生的事实是什么？' : '你现在看见了什么新信息或阻力？'),
    reflectionHint: source.reflectionHint || (isResult ? '先写事实，不急着评价自己。' : '可以写事实，也可以写感受，不需要判定好坏。'),
    reflectionPlaceholder: source.reflectionPlaceholder || (isResult ? '写下实际发生了什么...' : '写下目前看到的变化...'),
    lessonLabel: source.lessonLabel || (isResult ? '当初的判断哪些被验证了？下次会保留或调整什么？' : '下一步可以做一个什么小动作？'),
    lessonHint: source.lessonHint || (isResult ? '这次经验可以带走什么？' : '小到今天或明天可以开始就好。'),
    lessonPlaceholder: source.lessonPlaceholder || (isResult ? '写下可以保留或调整的做法...' : '写下可以带走的一点新信息...'),
  }
}
