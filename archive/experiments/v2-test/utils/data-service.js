/**
 * ====================================
 * 🔌 数据访问层（Data Service）
 * ====================================
 *
 * 所有页面通过本文件获取后端数据。
 * 当前使用 mock 数据（USE_MOCK = true）。
 *
 * 后端功能就绪后：
 *   1. 将 USE_MOCK 改为 false
 *   2. 将各方法体替换为 wx.request 真实 API 调用（需改为异步）
 *   3. 删除 utils/mock-data.js
 *   各页面代码无需任何修改
 */

const mock = require('./mock-data')

const USE_MOCK = true

// ============ 统计数据 ============
// 花园页 + 个人中心共用
function getStats() {
  if (USE_MOCK) return mock.mockStats
  // TODO: 后端就绪后改为异步 API 调用
  // return new Promise((resolve, reject) => {
  //   wx.request({
  //     url: 'https://your-api.com/api/stats',
  //     success: res => resolve(res.data),
  //     fail: reject
  //   })
  // })
}

// ============ 用户信息 ============
// 用户名、头像等
function getUserInfo() {
  if (USE_MOCK) return mock.mockUserInfo
  // TODO: 后端就绪后改为异步 API 调用
  // return new Promise((resolve, reject) => {
  //   wx.request({
  //     url: 'https://your-api.com/api/user/info',
  //     success: res => resolve(res.data),
  //     fail: reject
  //   })
  // })
}

// ============ 决策记录列表 ============
// 初始决策数据
function getDecisions() {
  if (USE_MOCK) return mock.mockDecisions
  // TODO: 后端就绪后改为异步 API 调用
  // return new Promise((resolve, reject) => {
  //   wx.request({
  //     url: 'https://your-api.com/api/decisions',
  //     success: res => resolve(res.data),
  //     fail: reject
  //   })
  // })
}

// ============ 默认决策风格 ============
// 用户未做风格测试时的默认值
function getDefaultDecisionStyle() {
  if (USE_MOCK) return mock.mockDecisionStyle
  // TODO: 后端就绪后改为异步 API 调用
  // return new Promise((resolve, reject) => {
  //   wx.request({
  //     url: 'https://your-api.com/api/user/default-style',
  //     success: res => resolve(res.data),
  //     fail: reject
  //   })
  // })
}

// ============ 成就徽章 ============
function getBadges() {
  if (USE_MOCK) return mock.mockBadges
}

// ============ 决策分类 ============
function getCategories() {
  if (USE_MOCK) return mock.DECISION_CATEGORIES
}

module.exports = {
  getStats,
  getUserInfo,
  getDecisions,
  getDefaultDecisionStyle,
  getBadges,
  getCategories
}
