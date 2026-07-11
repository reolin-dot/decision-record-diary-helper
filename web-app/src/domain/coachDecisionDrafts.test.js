import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildCoachDecisionDraft,
  buildDecisionFromCoachDraft,
} from './coachDecisionDrafts.js'

test('builds a choice draft with inferred option and coach source', () => {
  const draft = buildCoachDecisionDraft({
    kitId: 'choice',
    kitTitle: '纠结选择型',
    scoreA: 2,
    scoreB: 5,
    nextAction: '先问清楚岗位空间。',
    steps: [
      { title: '选项 A 是什么？', value: '留下' },
      { title: '选项 A 的好处', value: '稳定' },
      { title: '选项 B 是什么？', value: '跳槽' },
      { title: '选项 B 的好处', value: '成长更快' },
      { title: '你最不想牺牲什么？', value: '成长' },
    ],
  })

  assert.deepEqual(draft.options, ['留下', '跳槽'])
  assert.equal(draft.choice, 1)
  assert.equal(draft.coachSource.kitId, 'choice')
})

test('uses the roundtable question and options as the decision card', () => {
  const draft = buildCoachDecisionDraft({
    kitId: 'info',
    question: '现在换工作合适吗？',
    options: ['接受 offer', '继续留下'],
    steps: [],
  })

  assert.equal(draft.title, '现在换工作合适吗？')
  assert.deepEqual(draft.options, ['接受 offer', '继续留下'])
  assert.equal(draft.coachSource.question, '现在换工作合适吗？')
})

test('plants an unresolved decision as a seed with a smallest action', () => {
  const draft = buildCoachDecisionDraft({
    kitId: 'info',
    question: '现在换工作合适吗？',
    options: ['接受 offer', '继续留下'],
    steps: [],
  })
  const decision = buildDecisionFromCoachDraft(draft, {
    choice: -1,
    pendingInformation: '确认团队未来半年的业务方向',
    smallestAction: '明天约主管聊 20 分钟',
    reviewPeriod: '1m',
    createdAt: '2026-07-11',
  })

  assert.equal(decision.choice, -1)
  assert.equal(decision.stage, 'seed')
  assert.equal(decision.pendingInformation, '确认团队未来半年的业务方向')
  assert.equal(decision.smallestAction, '明天约主管聊 20 分钟')
  assert.equal(decision.reviewDate, '2026-08-11')
})

test('builds an action draft around a small first step', () => {
  const draft = buildCoachDecisionDraft({
    kitId: 'action',
    kitTitle: '行动启动型',
    steps: [
      { title: '你其实已经倾向于做什么？', value: '开始投简历' },
      { title: '你迟迟没动的主要阻力是什么？', value: '怕失败' },
      { title: '如果只做 5 分钟，第一步是什么？', value: '打开简历文件' },
      { title: '什么时候做？', value: '今晚 8 点' },
    ],
  })

  assert.equal(draft.title, '开始推进：开始投简历')
  assert.equal(draft.options[0], '开始这个小行动')
  assert.match(draft.expectation, /打开简历文件/)
})

test('builds a reviewed decision for the review kit', () => {
  const draft = buildCoachDecisionDraft({
    kitId: 'review',
    kitTitle: '复盘提炼型',
    steps: [
      { title: '实际发生了什么？', value: '完成了沟通' },
      { title: '当初哪些判断被验证了？', value: '提前准备有帮助' },
      { title: '如果重来一次，你会调整什么？', value: '更早约时间' },
      { title: '这次最值得带走的一句话', value: '先说事实，再说感受' },
    ],
  })
  const decision = buildDecisionFromCoachDraft(draft, { createdAt: '2026-07-02' })

  assert.equal(decision.status, 'reviewed')
  assert.equal(decision.resultReviewDone, true)
  assert.equal(decision.wateringHistory[0].lesson, '先说事实，再说感受')
})
