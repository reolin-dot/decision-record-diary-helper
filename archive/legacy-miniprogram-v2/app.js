// app.js
const dataService = require('./utils/data-service')
const util = require('./utils/util')

function buildStats(decisions) {
  const total = decisions.length
  const bloomed = decisions.filter(d => d.stage === 'full_bloom' || d.stage === 'bloom').length
  const reviewed = decisions.filter(d => d.firstReviewDone || d.resultReviewDone || d.status === 'reviewed').length
  return {
    totalDecisions: total,
    reviewRate: total ? Math.round((reviewed / total) * 100) + '%' : '0%',
    accuracyRate: '0%',
    growthLoopRate: total ? Math.round((bloomed / total) * 100) + '%' : '0%',
    streak: total ? 1 : 0,
    monthlyDecisions: total,
    bloomedCount: bloomed
  }
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
      if (styleResult) {
        this.globalData.decisionStyle = styleResult
        this.globalData.hasStyleTest = true
      } else {
        this.globalData.decisionStyle = dataService.getDefaultDecisionStyle()
        this.globalData.hasStyleTest = false
      }

      // 决策列表：优先读缓存，无缓存则用 mock 数据（开发阶段）
      const storedDecisions = util.safeGetStorage('decisions', null)
      if (storedDecisions && storedDecisions.length > 0) {
        this.globalData.decisions = storedDecisions
      } else {
        this.globalData.decisions = dataService.getDecisions()
      }

      this.globalData.stats = buildStats(this.globalData.decisions)
    }
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
