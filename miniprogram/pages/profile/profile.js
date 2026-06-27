const app = getApp()
const dataService = require('../../utils/data-service')

Page({
  data: {
    stats: {},
    decisionStyle: {},
    userInfo: {},
    badges: [],
    settings: [
      { icon: '🔔', label: '复盘提醒设置', disabled: true },
      { icon: '📝', label: '重新测试决策风格', action: 'styleTest' },
      { icon: '📊', label: '决策数据统计', disabled: true },
      { icon: '⚙️', label: '通用设置', disabled: true }
    ]
  },

  onShow() {
    this.setData({
      stats: app.globalData.stats,
      decisionStyle: app.globalData.decisionStyle,
      userInfo: app.globalData.userInfo,
      badges: dataService.getBadges()
    })
  },

  onTapSetting(e) {
    if (e.currentTarget.dataset.action === 'styleTest') {
      wx.navigateTo({ url: '/pages/style-test/style-test' })
    }
  }
})
