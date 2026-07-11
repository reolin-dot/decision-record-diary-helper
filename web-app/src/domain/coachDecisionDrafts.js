import { DECISION_STAGES } from './decisionStages.js'
import { normalizeDecision } from './decisionSchema.js'
import { formatDate, getReviewDate } from '../utils/util.js'

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function compactSteps(steps = []) {
  return steps
    .map(step => ({
      title: cleanText(step.title),
      value: cleanText(step.value),
    }))
    .filter(step => step.title || step.value)
}

function stepValue(steps, idx) {
  return cleanText(steps[idx]?.value)
}

function multiline(...parts) {
  return parts.map(cleanText).filter(Boolean).join('\n\n')
}

function buildCoachSource(analysis, steps) {
  return {
    kitId: analysis.kitId || '',
    kitTitle: analysis.kitTitle || '决策锦囊',
    framework: analysis.framework || '',
    tone: analysis.tone || '',
    resultTitle: analysis.resultTitle || '',
    summaryTitle: analysis.summaryTitle || '',
    nextActionTitle: analysis.nextActionTitle || '',
    nextAction: analysis.nextAction || '',
    steps,
  }
}

export function buildCoachDecisionDraft(analysis = {}) {
  const steps = compactSteps(analysis.steps || [])
  const getValue = idx => stepValue(steps, idx)
  const kitId = analysis.kitId || 'choice'
  const kitTitle = analysis.kitTitle || '决策锦囊'
  const nextAction = cleanText(analysis.nextAction)

  let draft = {
    kitId,
    title: `锦囊决策：${kitTitle}`,
    background: steps.map(step => `${step.title}\n${step.value}`).join('\n\n'),
    options: [nextAction || '先推进一个小行动', '暂时不行动，继续观察'],
    choice: 0,
    reason: nextAction || '来自锦囊分析后的下一步线索。',
    expectation: '希望把这次锦囊里的线索，沉淀成后续可以复盘的记录。',
    reviewPeriod: '1w',
    sourceLabel: `来自${kitTitle}`,
    coachSource: buildCoachSource(analysis, steps),
  }

  if (kitId === 'choice') {
    const optionA = getValue(0) || '选项 A'
    const optionB = getValue(2) || '选项 B'
    const scoreA = Number(analysis.scoreA) || 3
    const scoreB = Number(analysis.scoreB) || 3
    draft = {
      ...draft,
      title: `在「${optionA}」和「${optionB}」之间做选择`,
      background: multiline(
        getValue(4) && `最不想牺牲的是：${getValue(4)}`,
        steps.map(step => `${step.title}\n${step.value}`).join('\n\n')
      ),
      options: [optionA, optionB],
      choice: scoreB > scoreA ? 1 : 0,
      reason: nextAction || `此刻倾向分：${optionA} ${scoreA} / ${optionB} ${scoreB}`,
      expectation: '希望把这次比较变成一次可推进、可复盘的选择。',
    }
  }

  if (kitId === 'emotion') {
    const emotion = getValue(0)
    draft = {
      ...draft,
      title: emotion ? `在「${emotion}」里先稳住再决定` : '情绪降噪后的决策记录',
      background: multiline(
        emotion && `此刻最强烈的情绪：${emotion}`,
        getValue(1) && `情绪在提醒我：${getValue(1)}`,
        getValue(2) && `最坏情况与承受度：${getValue(2)}`,
        getValue(3) && `先不决定的代价：${getValue(3)}`
      ),
      options: ['先暂停并降噪，再做决定', '继续在情绪很强时推进'],
      choice: 0,
      reason: nextAction || '先把情绪和事实分开，再做不可逆决定。',
      expectation: '希望这次记录帮我看清情绪背后的真实需求。',
    }
  }

  if (kitId === 'action') {
    draft = {
      ...draft,
      title: getValue(0) ? `开始推进：${getValue(0)}` : '把决定变成一个能开始的动作',
      background: multiline(
        getValue(0) && `我已经倾向于：${getValue(0)}`,
        getValue(1) && `主要阻力：${getValue(1)}`,
        getValue(2) && `5 分钟第一步：${getValue(2)}`,
        getValue(3) && `计划时间：${getValue(3)}`
      ),
      options: ['开始这个小行动', '暂缓，先处理阻力'],
      choice: 0,
      reason: getValue(1) ? `真正卡住我的地方：${getValue(1)}` : nextAction,
      expectation: getValue(2) ? `先完成这个小动作：${getValue(2)}` : nextAction,
    }
  }

  if (kitId === 'info') {
    draft = {
      ...draft,
      title: getValue(1) ? `先验证：${getValue(1)}` : '把不确定变成验证任务',
      background: multiline(
        getValue(0) && `当前未知项：${getValue(0)}`,
        getValue(1) && `最影响决定的未知项：${getValue(1)}`,
        getValue(2) && `可以询问或查询：${getValue(2)}`,
        getValue(3) && `最低成本试错：${getValue(3)}`
      ),
      options: ['先验证关键未知项', '暂缓决定，继续收集信息'],
      choice: 0,
      reason: getValue(1) ? `这个未知项最影响决定：${getValue(1)}` : nextAction,
      expectation: getValue(3) ? `用低成本方式验证：${getValue(3)}` : nextAction,
    }
  }

  if (kitId === 'review') {
    draft = {
      ...draft,
      title: '复盘这次已经完成的决定',
      background: multiline(
        getValue(0) && `实际发生：${getValue(0)}`,
        getValue(1) && `被验证的判断：${getValue(1)}`,
        getValue(2) && `下次调整：${getValue(2)}`,
        getValue(3) && `最值得带走的一句话：${getValue(3)}`
      ),
      options: ['保留这次经验', '下次调整做法'],
      choice: 0,
      reason: getValue(1) || nextAction,
      expectation: getValue(3) || '希望把这次经历沉淀成下一次可以参考的经验。',
      reviewPeriod: 'done',
      initialReview: {
        rating: '已完成复盘',
        reflection: getValue(0),
        lesson: getValue(3) || getValue(2),
        summary: getValue(3)
          ? `这次复盘留下了一条经验：${getValue(3)}`
          : '这次经历已经被整理成一条可回看的经验。',
        type: 'result',
      },
    }
  }

  return draft
}

export function buildDecisionFromCoachDraft(draft, overrides = {}) {
  const createdAt = overrides.createdAt || formatDate(new Date())
  const reviewDate = draft.reviewPeriod === 'done' ? createdAt : getReviewDate(createdAt, draft.reviewPeriod || '1w')
  const isReviewed = draft.reviewPeriod === 'done'

  return normalizeDecision({
    title: cleanText(overrides.title) || draft.title,
    category: `coach-${draft.kitId}`,
    background: cleanText(overrides.background) || draft.background,
    options: (overrides.options || draft.options).map(cleanText).filter(Boolean),
    choice: typeof overrides.choice === 'number' ? overrides.choice : draft.choice,
    reason: cleanText(overrides.reason) || draft.reason,
    expectation: cleanText(overrides.expectation) || draft.expectation,
    mood: '',
    createdAt,
    reviewDate,
    status: isReviewed ? 'reviewed' : 'pending',
    reviewStage: isReviewed ? 'result_done' : 'none',
    stage: isReviewed ? DECISION_STAGES.FULL_BLOOM : DECISION_STAGES.SPROUT,
    actionStarted: isReviewed,
    firstReviewDone: isReviewed,
    resultReviewDone: isReviewed,
    wateringHistory: isReviewed && draft.initialReview
      ? [{ ...draft.initialReview, date: createdAt }]
      : [],
    source: 'coach',
    coachSource: draft.coachSource,
  })
}
