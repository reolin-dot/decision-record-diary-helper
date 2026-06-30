// pages/record-success/record-success.js
Page({
  onBackToGarden() {
    wx.switchTab({ url: '/pages/garden/garden' })
  },

  onRecordAgain() {
    wx.redirectTo({ url: '/pages/record/record' })
  }
})
