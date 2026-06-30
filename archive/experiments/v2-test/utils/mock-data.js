/**
 * ====================================
 * 🔧 测试数据（Mock Data）— V2.0
 * ====================================
 *
 * 新增：
 *   - 决策分类 (category) 字段：career / learn / finance / relationship / life / time
 *   - 更多决策样本，跨 4-6 月，覆盖五种阶段
 *   - 复盘历史 wateringHistory 含 lesson / newInfo / statusUpdate
 *   - 月度统计所需的足够样本量
 */

// ============ 决策分类定义 ============
const DECISION_CATEGORIES = {
  career:       { label: '职业选择', icon: '💼', color: '#5B8DEF' },
  learn:        { label: '学习成长', icon: '📚', color: '#7BC67E' },
  finance:      { label: '消费决策', icon: '💰', color: '#F0B429' },
  relationship: { label: '关系沟通', icon: '🤝', color: '#E57373' },
  life:         { label: '生活改变', icon: '🏠', color: '#9575CD' },
  time:         { label: '时间安排', icon: '⏰', color: '#4DB6AC' }
}

// ============ 用户信息 ============
const mockUserInfo = {
  name: '决策者小明',
  avatar: ''
}

// ============ 统计数据 ============
const mockStats = {
  totalDecisions: 18,
  reviewRate: '72%',
  accuracyRate: '0%',
  growthLoopRate: '38%',
  streak: 12,
  monthlyDecisions: 6,
  bloomedCount: 5
}

// ============ 决策记录列表 ============
const mockDecisions = [
  // ====== 6月 ======
  {
    id: '1',
    title: '要不要接受 A 公司的 offer',
    category: 'career',
    background: '收到 A 公司 offer，月薪涨 30%，但需要搬家到新城市。',
    options: ['接受 A 公司 offer', '留在现在的公司'],
    choice: 0,
    reason: '薪资涨幅大，平台更好。',
    expectation: '希望在新城市站稳脚跟，获得更多成长机会。',
    mood: '焦虑',
    createdAt: '2026-06-14',
    reviewDate: '2026-07-14',
    status: 'pending',
    stage: 'leaf',
    actionStarted: true,
    firstReviewDone: false,
    resultReviewDone: false,
    wateringHistory: [],
    maxWaterings: 1
  },
  {
    id: '2',
    title: '要不要报名线下英语集训',
    category: 'learn',
    background: '同事推荐了一个三个月的线下英语集训，费用 1.5 万。',
    options: ['报名线下集训', '用线上课程替代', '暂时不学'],
    choice: 1,
    reason: '线上更灵活，价格也合理。',
    expectation: '三个月后口语能有明显进步。',
    mood: '平静',
    createdAt: '2026-06-08',
    reviewDate: '2026-06-22',
    status: 'pending',
    stage: 'first_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: false,
    wateringHistory: [
      {
        date: '2026-06-22',
        type: 'current',
        statusUpdate: '每天跟练 20 分钟，比预期轻松',
        newInfo: '发现线上社群练习比课程内容更有用',
        lesson: '学习方法不一定要最贵的，适合自己的节奏更重要。'
      }
    ],
    maxWaterings: 1
  },
  {
    id: '3',
    title: '换一台新笔记本',
    category: 'finance',
    background: '现在的电脑用了四年，电池不太行了，但还能凑合。',
    options: ['买新的 MacBook', '买 ThinkPad', '再撑半年'],
    choice: 2,
    reason: '手头项目结束前不想多花钱。',
    expectation: '撑到年底再换，到时可能有更好的型号。',
    mood: '纠结',
    createdAt: '2026-06-02',
    reviewDate: '2026-06-16',
    status: 'pending',
    stage: 'sprout',
    actionStarted: false,
    firstReviewDone: false,
    resultReviewDone: false,
    wateringHistory: [],
    maxWaterings: 1
  },
  // ====== 5月 ======
  {
    id: '4',
    title: '是否报名 MBA 课程',
    category: 'learn',
    background: '想提升管理能力，但学费不低，时间投入也比较大。',
    options: ['报名 MBA', '自学管理书籍', '先不学'],
    choice: 0,
    reason: '系统学习更有价值。',
    expectation: '拓展人脉，提升管理技能。',
    mood: '纠结',
    createdAt: '2026-05-22',
    reviewDate: '2026-06-21',
    status: 'pending',
    stage: 'leaf',
    actionStarted: true,
    firstReviewDone: false,
    resultReviewDone: false,
    wateringHistory: [],
    maxWaterings: 1
  },
  {
    id: '5',
    title: '和合租室友谈分租方式',
    category: 'relationship',
    background: '室友经常很晚回来，噪音影响睡眠，但不想闹僵。',
    options: ['直接谈', '写纸条', '忍着'],
    choice: 0,
    reason: '直接沟通最不容易产生误解。',
    expectation: '能达成一个双方接受的作息约定。',
    mood: '紧张',
    createdAt: '2026-05-15',
    reviewDate: '2026-05-29',
    status: 'pending',
    stage: 'full_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: true,
    wateringHistory: [
      {
        date: '2026-05-29',
        type: 'current',
        statusUpdate: '谈了，室友态度不错，约定了 11 点后安静',
        newInfo: '室友其实也在考虑搬走',
        lesson: '很多紧张是自己脑补的，直接谈反而比想象中简单。'
      },
      {
        date: '2026-06-15',
        type: 'result',
        statusUpdate: '约定执行了两周，效果还行',
        newInfo: '室友确实在找房，下个月可能搬走',
        lesson: '沟通的时机比沟通的技巧更重要。'
      }
    ],
    maxWaterings: 1
  },
  {
    id: '6',
    title: '周末要不要去跑半马',
    category: 'time',
    background: '朋友约了一起跑半马，但最近加班比较多。',
    options: ['去跑', '改为短跑', '不去'],
    choice: 1,
    reason: '身体需要休息，但也不想完全放弃运动。',
    expectation: '跑 5 公里保持运动习惯，不影响工作状态。',
    mood: '平静',
    createdAt: '2026-05-10',
    reviewDate: '2026-05-17',
    status: 'pending',
    stage: 'full_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: true,
    wateringHistory: [
      {
        date: '2026-05-17',
        type: 'current',
        statusUpdate: '跑了 5 公里，感觉很好',
        newInfo: '发现晨跑比夜跑更适合自己',
        lesson: '不用追求极限，适度坚持反而更持久。'
      },
      {
        date: '2026-06-01',
        type: 'result',
        statusUpdate: '坚持了三周晨跑',
        newInfo: '精力比之前好了很多',
        lesson: '小决定的复利效应比大计划更可靠。'
      }
    ],
    maxWaterings: 1
  },
  {
    id: '7',
    title: '要不要买年度健身卡',
    category: 'finance',
    background: '健身房推销年卡，打折后 2400 元。',
    options: ['买年卡', '月付', '不办卡在家练'],
    choice: 0,
    reason: '单价最低，而且自己确实想养成运动习惯。',
    expectation: '每周去两次，一年下来单价很划算。',
    mood: '兴奋',
    createdAt: '2026-05-05',
    reviewDate: '2026-06-05',
    status: 'pending',
    stage: 'first_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: false,
    wateringHistory: [
      {
        date: '2026-06-05',
        type: 'current',
        statusUpdate: '第一个月去了 6 次，比预期少',
        newInfo: '下班后去比早上去更容易坚持',
        lesson: '对自己的执行力不要过于乐观，留余量比满计划更现实。'
      }
    ],
    maxWaterings: 1
  },
  // ====== 4月 ======
  {
    id: '8',
    title: '是否接受朋友的创业邀请',
    category: 'career',
    background: '大学同学在做 AI 创业项目，邀请我兼职做产品顾问。',
    options: ['接受兼职', '只做顾问', '婉拒'],
    choice: 1,
    reason: '不想投入太多时间，但想保持关系和学习机会。',
    expectation: '每月花 10 小时，能接触到 AI 前沿。',
    mood: '兴奋',
    createdAt: '2026-04-18',
    reviewDate: '2026-05-18',
    status: 'pending',
    stage: 'full_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: true,
    wateringHistory: [
      {
        date: '2026-05-18',
        type: 'current',
        statusUpdate: '参与了两次产品讨论，学到不少',
        newInfo: '创业团队的节奏比想象中快很多',
        lesson: '保持好奇心是有回报的，即使投入不多也能学到东西。'
      },
      {
        date: '2026-06-10',
        type: 'result',
        statusUpdate: '继续做顾问，每月大概花 8 小时',
        newInfo: '项目拿到了天使轮融资',
        lesson: '有些机会不需要 all in，保持轻度参与也能获得意想不到的收获。'
      }
    ],
    maxWaterings: 1
  },
  {
    id: '9',
    title: '搬不搬到离公司更近的地方',
    category: 'life',
    background: '现在通勤单程 50 分钟，公司附近房租贵 1500。',
    options: ['搬到公司附近', '保持现状', '找中间位置'],
    choice: 0,
    reason: '每天省 1.5 小时通勤，可以用来学习或运动。',
    expectation: '生活质量提高，有更多时间做自己的事。',
    mood: '焦虑',
    createdAt: '2026-04-10',
    reviewDate: '2026-05-10',
    status: 'pending',
    stage: 'first_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: false,
    wateringHistory: [
      {
        date: '2026-05-10',
        type: 'current',
        statusUpdate: '搬了，通勤缩短到 15 分钟',
        newInfo: '但新小区附近吃饭选择很少',
        lesson: '每个选择都有隐藏成本，搬到近处省了时间但多了生活不便。'
      }
    ],
    maxWaterings: 1
  },
  {
    id: '10',
    title: '要不要给爸妈买体检套餐',
    category: 'relationship',
    background: '爸妈一直说身体没事，但两年没做过体检了。',
    options: ['买全面体检', '买基础套餐', '算了他们自己会安排'],
    choice: 0,
    reason: '全面检查更放心。',
    expectation: '确认父母健康状况，也让自己安心。',
    mood: '担心',
    createdAt: '2026-04-05',
    reviewDate: '2026-04-19',
    status: 'pending',
    stage: 'full_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: true,
    wateringHistory: [
      {
        date: '2026-04-19',
        type: 'current',
        statusUpdate: '爸妈去做了体检，整体还好',
        newInfo: '爸爸血压偏高，需要定期监测',
        lesson: '对家人的健康主动一点，比事后后悔好太多。'
      },
      {
        date: '2026-05-20',
        type: 'result',
        statusUpdate: '爸爸开始吃降压药，妈妈催他定期去',
        newInfo: '养成健康监测习惯后全家都更注意生活方式了',
        lesson: '一个主动的选择可以带动整个家庭的变化。'
      }
    ],
    maxWaterings: 1
  },
  // ====== 3月 ======
  {
    id: '11',
    title: '要不要开始写技术博客',
    category: 'learn',
    background: '一直在看别人的博客学习，自己也想试试输出。',
    options: ['开公众号写', '在掘金/知乎写', '只写私人笔记'],
    choice: 1,
    reason: '平台有流量反馈，能激励自己持续写。',
    expectation: '每月写两篇，半年后有一定读者量。',
    mood: '期待',
    createdAt: '2026-03-20',
    reviewDate: '2026-04-20',
    status: 'pending',
    stage: 'full_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: true,
    wateringHistory: [
      {
        date: '2026-04-20',
        type: 'current',
        statusUpdate: '写了两篇，阅读量不高但有评论',
        newInfo: '写东西比想象中花时间多',
        lesson: '输出是最好的学习方式，即使没人看也值得写。'
      },
      {
        date: '2026-05-20',
        type: 'result',
        statusUpdate: '两个月写了 5 篇，有一篇小热门',
        newInfo: '有猎头通过文章联系我',
        lesson: '持续输出会创造意想不到的机会，但需要耐心。'
      }
    ],
    maxWaterings: 1
  },
  {
    id: '12',
    title: '是否投资朋友的咖啡店',
    category: 'finance',
    background: '朋友开咖啡店差 5 万，承诺一年内回本。',
    options: ['投 5 万', '投 2 万意思一下', '不投'],
    choice: 2,
    reason: '不太了解餐饮行业，风险太高。',
    expectation: '保住本金，朋友关系不受影响。',
    mood: '纠结',
    createdAt: '2026-03-12',
    reviewDate: '2026-04-12',
    status: 'pending',
    stage: 'first_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: false,
    wateringHistory: [
      {
        date: '2026-04-12',
        type: 'current',
        statusUpdate: '朋友找到了另一个投资人',
        newInfo: '咖啡店开业了，位置不错',
        lesson: '拒绝不代表不支持，清楚自己的能力边界是一种成熟。'
      }
    ],
    maxWaterings: 1
  },
  {
    id: '13',
    title: '要不要学做饭',
    category: 'life',
    background: '总是吃外卖，既不健康也花钱。',
    options: ['学简单料理', '买预制菜', '继续外卖'],
    choice: 0,
    reason: '长期来看健康和花费都更合理。',
    expectation: '每周做三次，逐步替代外卖。',
    mood: '期待',
    createdAt: '2026-03-05',
    reviewDate: '2026-03-19',
    status: 'pending',
    stage: 'leaf',
    actionStarted: true,
    firstReviewDone: false,
    resultReviewDone: false,
    wateringHistory: [],
    maxWaterings: 1
  },
  // ====== 2月 ======
  {
    id: '14',
    title: '年终绩效面谈怎么应对',
    category: 'career',
    background: '绩效一般，领导可能会提改进要求。',
    options: ['主动提自己的规划', '等领导说完再回应', '低调应对'],
    choice: 0,
    reason: '主动展示改进意愿比被动接受好。',
    expectation: '让领导看到我的主动性。',
    mood: '紧张',
    createdAt: '2026-02-20',
    reviewDate: '2026-03-06',
    status: 'pending',
    stage: 'full_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: true,
    wateringHistory: [
      {
        date: '2026-03-06',
        type: 'current',
        statusUpdate: '面谈顺利，领导认可主动性',
        newInfo: '领导其实更看重态度而非结果',
        lesson: '在紧张的场景里，主动比完美更重要。'
      },
      {
        date: '2026-04-06',
        type: 'result',
        statusUpdate: '后续工作节奏变好了',
        newInfo: '因为主动沟通，获得了更多项目机会',
        lesson: '主动创造对话空间，往往比埋头做事更有效。'
      }
    ],
    maxWaterings: 1
  },
  {
    id: '15',
    title: '春节要不要回家',
    category: 'relationship',
    background: '工作忙，回家来回要两天在路上。',
    options: ['回家过年', '留在这边', '接爸妈过来'],
    choice: 0,
    reason: '一年没见父母了。',
    expectation: '好好陪家人，充电后回来继续。',
    mood: '温暖',
    createdAt: '2026-02-05',
    reviewDate: '2026-02-19',
    status: 'pending',
    stage: 'full_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: true,
    wateringHistory: [
      {
        date: '2026-02-19',
        type: 'current',
        statusUpdate: '回家过了一个温暖的年',
        newInfo: '父母其实很在意我回不回来',
        lesson: '有些选择的价值不在于效率，而在于对人的意义。'
      },
      {
        date: '2026-03-15',
        type: 'result',
        statusUpdate: '回来后状态很好',
        newInfo: '和父母的关系比之前更近了',
        lesson: '陪伴不是浪费时间，是给自己充电。'
      }
    ],
    maxWaterings: 1
  },
  // ====== 1月 ======
  {
    id: '16',
    title: '新年要不要立 flag',
    category: 'time',
    background: '每年立的 flag 基本都没完成，今年还要不要立？',
    options: ['立详细计划', '只定一个大方向', '不立了'],
    choice: 1,
    reason: '有方向感但不限制太死。',
    expectation: '轻松一点，不被计划绑架。',
    mood: '平静',
    createdAt: '2026-01-05',
    reviewDate: '2026-02-05',
    status: 'pending',
    stage: 'full_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: true,
    wateringHistory: [
      {
        date: '2026-02-05',
        type: 'current',
        statusUpdate: '大方向是"更健康"，确实在运动',
        newInfo: '不立详细 flag 反而更轻松',
        lesson: '模糊的目标比精确的计划更适合长期习惯。'
      },
      {
        date: '2026-03-05',
        type: 'result',
        statusUpdate: '坚持了运动和写作两个方向',
        newInfo: '没有具体指标反而少了焦虑',
        lesson: '给自己留弹性的选择，比严格规划更适合不确定时期。'
      }
    ],
    maxWaterings: 1
  },
  {
    id: '17',
    title: '要不要换手机',
    category: 'finance',
    background: '手机用了三年，电池健康度 78%。',
    options: ['换新机', '换电池继续用', '买二手'],
    choice: 1,
    reason: '换电池最经济，手机其他功能都正常。',
    expectation: '花 200 块再撑一年。',
    mood: '平静',
    createdAt: '2026-01-15',
    reviewDate: '2026-02-15',
    status: 'pending',
    stage: 'leaf',
    actionStarted: true,
    firstReviewDone: false,
    resultReviewDone: false,
    wateringHistory: [],
    maxWaterings: 1
  },
  {
    id: '18',
    title: '要不要开始冥想',
    category: 'life',
    background: '好几个朋友推荐冥想，说能缓解焦虑。',
    options: ['用 app 跟练', '自己静坐', '先不试'],
    choice: 0,
    reason: '有引导更容易入门。',
    expectation: '每天 10 分钟，一个月后看看效果。',
    mood: '好奇',
    createdAt: '2026-01-10',
    reviewDate: '2026-02-10',
    status: 'pending',
    stage: 'first_bloom',
    actionStarted: true,
    firstReviewDone: true,
    resultReviewDone: false,
    wateringHistory: [
      {
        date: '2026-02-10',
        type: 'current',
        statusUpdate: '坚持了三周，后来断了',
        newInfo: '早上冥想比晚上效果好',
        lesson: '新习惯不需要完美，断了再续也是一种坚持。'
      }
    ],
    maxWaterings: 1
  }
]

// ============ 决策风格测试结果 ============
const mockDecisionStyle = {
  type: '理性分析型',
  tags: ['数据驱动', '逻辑优先', '善于规划'],
  tip: '你的理性是优势，但有时也可以信任直觉。记录决策时，试着写下当时的情绪和直觉感受，复盘时你会发现有价值的规律。'
}

// ============ 成就徽章 ============
const mockBadges = [
  { icon: '🌱', name: '首次记录', unlocked: true },
  { icon: '🔥', name: '连续 7 天', unlocked: true },
  { icon: '🌸', name: '首次开花', unlocked: true },
  { icon: '🌳', name: '决策大树', unlocked: true },
  { icon: '📦', name: '锦囊达人', unlocked: false },
  { icon: '👑', name: '月度复盘王', unlocked: false }
]

module.exports = {
  DECISION_CATEGORIES,
  mockUserInfo,
  mockStats,
  mockDecisions,
  mockDecisionStyle,
  mockBadges
}
