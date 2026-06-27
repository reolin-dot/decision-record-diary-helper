/**
 * ====================================
 * 🔧 测试数据（Mock Data）
 * ====================================
 *
 * 这个文件集中存放所有前端假数据。
 * 后端功能就绪后：
 *   1. 删除本文件
 *   2. 修改 utils/data-service.js 改用真实 API
 *
 * 包含以下后端应提供的数据：
 *   - 用户信息（用户名、头像等）
 *   - 统计数据（连续天数、决策总数、复盘率等）
 *   - 决策记录列表
 *   - 决策风格测试结果
 *   - 成就徽章及解锁状态
 */

// ============ 用户信息 ============
const mockUserInfo = {
  name: '决策者小明',
  avatar: '' // 头像 URL，后端返回
}

// ============ 统计数据 ============
// 花园页和个人中心共用
const mockStats = {
  totalDecisions: 12,     // 总决策数
  reviewRate: '75%',      // 复盘完成率
  accuracyRate: '0%',     // 旧字段，后续由 growthLoopRate 替代
  growthLoopRate: '25%',  // 成长闭环率
  streak: 7,              // 连续记录天数
  monthlyDecisions: 5,    // 本月决策数
  bloomedCount: 3         // 开花数量
}

// ============ 决策记录列表 ============
const mockDecisions = [
  {
    id: '1',
    title: '要不要接受 A 公司的 offer',
    background: '收到 A 公司 offer，月薪涨 30%，但需要搬家到新城市。',
    options: ['接受 A 公司 offer', '留在现在的公司'],
    choice: 0,
    reason: '薪资涨幅大，平台更好。',
    expectation: '希望在新城市站稳脚跟，获得更多成长机会。',
    mood: '焦虑',
    createdAt: '2026-06-14',
    reviewDate: '2026-06-21',
    status: 'pending',
    stage: 'sprout',
    actionStarted: false,
    firstReviewDone: false,
    resultReviewDone: false,
    wateringHistory: [],
    maxWaterings: 1
  },
  {
    id: '2',
    title: '是否报名 MBA 课程',
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
  { icon: '🌳', name: '决策大树', unlocked: false },
  { icon: '📦', name: '锦囊达人', unlocked: false },
  { icon: '👑', name: '月度复盘王', unlocked: false }
]

module.exports = {
  mockUserInfo,
  mockStats,
  mockDecisions,
  mockDecisionStyle,
  mockBadges
}
