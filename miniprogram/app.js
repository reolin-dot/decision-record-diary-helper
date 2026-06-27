// app.js
const dataService = require('./utils/data-service')
const util = require('./utils/util')

function buildStats(decisions) {
  const activeDecisions = decisions.filter(d => !d.isDraft)
  const total = activeDecisions.length
  const bloomed = activeDecisions.filter(d => d.stage === 'full_bloom' || d.stage === 'bloom').length
  const reviewed = activeDecisions.filter(d => d.firstReviewDone || d.resultReviewDone || d.status === 'reviewed').length
  const currentMonth = util.formatDate(new Date()).slice(0, 7)
  const monthlyDecisions = activeDecisions.filter(d => (d.createdAt || '').slice(0, 7) === currentMonth).length
  const growthLoopRate = total ? Math.round((bloomed / total) * 100) + '%' : '0%'

  return {
    totalDecisions: total,
    reviewRate: total ? Math.round((reviewed / total) * 100) + '%' : '0%',
    accuracyRate: growthLoopRate,
    growthLoopRate,
    streak: calculateRecordStreak(activeDecisions),
    monthlyDecisions,
    bloomedCount: bloomed
  }
}

function calculateRecordStreak(decisions) {
  const dateSet = {}
  decisions.forEach(d => {
    if (d.createdAt) {
      dateSet[d.createdAt] = true
    }
  })

  let streak = 0
  let cursor = new Date()
  while (dateSet[util.formatDate(cursor)]) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

App({
  onLaunch() {
    // 检测是否首次启动
    const hasLaunched = util.safeGetStorage('hasLaunched', false)

    if (!hasLaunched) {
      // ===== 首次启动：不加载假数据，展示真实空态 =====
      this.globalData.isNewUser = true
      this.globalData.userInfo = dataService.getUserInfo()
      this.globalData.decisions = []
      this.globalData.stats = {
        totalDecisions: 0,
        reviewRate: '0%',
        accuracyRate: '0%',
        growthLoopRate: '0%',
        streak: 0,
        monthlyDecisions: 0,
        bloomedCount: 0
      }
      // 决策风格默认值
      this.globalData.decisionStyle = dataService.getDefaultDecisionStyle()
      this.globalData.hasStyleTest = false
      // 标记已启动
      util.safeSetStorage('hasLaunched', true)
    } else {
      // ===== 非首次启动：正常加载 =====
      this.globalData.userInfo = dataService.getUserInfo()

      // 决策风格：优先读缓存（用户做过测试），否则用默认值
      const styleResult = util.safeGetStorage('decisionStyle', null)
      const styleSkipped = util.safeGetStorage('styleTestSkipped', false)
      if (styleResult) {
        this.globalData.decisionStyle = styleResult
        this.globalData.hasStyleTest = true
      } else {
        this.globalData.decisionStyle = dataService.getDefaultDecisionStyle()
        this.globalData.hasStyleTest = !!styleSkipped
      }

      // 决策列表：只读缓存，无缓存则用空数组（不回退 mock 数据）
      const storedDecisions = util.safeGetStorage('decisions', null)
      if (storedDecisions && storedDecisions.length > 0) {
        this.globalData.decisions = storedDecisions
      } else {
        this.globalData.decisions = []
      }

      this.globalData.stats = buildStats(this.globalData.decisions)
    }
  },

  refreshStats() {
    this.globalData.stats = buildStats(this.globalData.decisions || [])
    return this.globalData.stats
  },

  globalData: {
    hasStyleTest: false,
    isNewUser: false,
    userInfo: null,
    decisions: [],
    decisionStyle: {},
    stats: {
      totalDecisions: 0,
      reviewRate: '0%',
      accuracyRate: '0%',
      growthLoopRate: '0%',
      streak: 0,
      monthlyDecisions: 0,
      bloomedCount: 0
    }
  }
})
