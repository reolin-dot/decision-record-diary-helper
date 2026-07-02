export const DECISION_TEMPLATES = [
  {
    id: 'career',
    icon: '💼',
    title: '职业选择',
    desc: 'offer、转岗、换方向',
    titlePlaceholder: '例如：要不要接受这个 offer',
    backgroundPlaceholder: '现在的机会、顾虑、时间压力分别是什么？',
    optionPlaceholder: '例如：接受 offer / 继续观望',
    starterOptions: ['接受/推进这个机会', '暂缓/继续留在现状'],
  },
  {
    id: 'learning',
    icon: '📚',
    title: '学习成长',
    desc: '课程、计划、长期投入',
    titlePlaceholder: '例如：要不要报名这个课程',
    backgroundPlaceholder: '这个学习投入想解决什么问题？成本和收益分别是什么？',
    optionPlaceholder: '例如：现在报名 / 先自学两周',
    starterOptions: ['现在投入学习', '先用低成本方式试试'],
  },
  {
    id: 'spending',
    icon: '🧾',
    title: '消费决策',
    desc: '大件、订阅、预算取舍',
    titlePlaceholder: '例如：要不要买这台电脑',
    backgroundPlaceholder: '这是必要需求、效率提升，还是情绪性消费？',
    optionPlaceholder: '例如：购买 / 再等一个月',
    starterOptions: ['现在购买', '延后再决定'],
  },
  {
    id: 'relationship',
    icon: '🤝',
    title: '关系沟通',
    desc: '表达、边界、推进关系',
    titlePlaceholder: '例如：要不要和 TA 说清楚这件事',
    backgroundPlaceholder: '你真正想表达什么？最担心对方如何反应？',
    optionPlaceholder: '例如：主动沟通 / 先观察',
    starterOptions: ['主动沟通', '先整理感受再说'],
  },
  {
    id: 'time',
    icon: '⏳',
    title: '时间分配',
    desc: '任务、邀约、新承诺',
    titlePlaceholder: '例如：要不要接下这个新任务',
    backgroundPlaceholder: '它会占用什么时间？会挤掉哪件更重要的事？',
    optionPlaceholder: '例如：接受 / 拒绝 / 延后',
    starterOptions: ['接下并安排时间', '拒绝或延后'],
  },
]

export function getDecisionTemplate(id) {
  return DECISION_TEMPLATES.find(template => template.id === id) || null
}

export function shouldApplyStarterOptions(options = []) {
  return options.every(option => !String(option || '').trim())
}
