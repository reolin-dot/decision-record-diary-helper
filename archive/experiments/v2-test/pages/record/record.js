const app = getApp()
const util = require('../../utils/util')
const dataService = require('../../utils/data-service')
const STAGES = util.DECISION_STAGES

function getTodayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + day
}

Page({
  data: {
    step: 1,
    totalSteps: 4,
    title: '',
    background: '',
    selectedMood: '',
    moods: ['焦虑', '纠结', '冲动', '平静', '其他'],
    categories: [],
    selectedCategory: '',
    options: ['', ''],
    selectedOption: -1,
    choiceReason: '',
    expectation: '',
    reviewPeriod: '1w',
    timeOptions: [
      { key: '1w', value: '1 周', label: '后复盘' },
      { key: '1m', value: '1 个月', label: '后复盘' },
      { key: '3m', value: '3 个月', label: '后复盘' }
    ],
    customDate: '',
    today: '',
    saving: false
  },

  onLoad(options) {
    const cats = dataService.getCategories()
    const catList = Object.keys(cats).map(function(key) {
      return { key: key, label: cats[key].label, icon: cats[key].icon }
    })
    this.setData({ today: getTodayStr(), categories: catList })
    if (options.step) {
      this.setData({ step: parseInt(options.step, 10) || 1 })
    }
  },

  onBack() {
    if (this.data.step > 1) {
      const hasInput = this.data.title.trim() || this.data.options.some(o => o.trim())
      if (hasInput) {
        wx.showModal({
          title: '确认退出',
          content: '当前记录尚未保存，退出后已填内容将丢失。',
          confirmText: '放弃',
          cancelText: '继续编辑',
          success: (res) => {
            if (res.confirm) {
              wx.navigateBack()
            }
          }
        })
        return
      }
      this.setData({ step: this.data.step - 1 })
    } else {
      wx.navigateBack()
    }
  },

  onNext() {
    if (!this.validateCurrentStep()) return
    if (this.data.step < 4) {
      this.setData({ step: this.data.step + 1 })
    }
  },

  validateCurrentStep() {
    if (this.data.step === 1 && !this.data.title.trim()) {
      wx.showToast({ title: '先写一个决策标题', icon: 'none' })
      return false
    }

    if (this.data.step === 2) {
      const validOptions = this.data.options.filter(item => item.trim())
      if (validOptions.length < 2) {
        wx.showToast({ title: '至少写下 2 个选项', icon: 'none' })
        return false
      }
    }

    if (this.data.step === 3 && this.data.selectedOption < 0) {
      wx.showToast({ title: '请选择最终方案', icon: 'none' })
      return false
    }

    return true
  },

  onComplete() {
    if (!this.validateCurrentStep()) return
    if (this.data.saving) return

    this.setData({ saving: true })
    wx.showLoading({ title: '保存中...' })

    this.saveDecision()

    // 增加短暂延迟，确保用户能看到 loading 状态
    setTimeout(() => {
      wx.hideLoading()
      this.setData({ saving: false })
      wx.navigateTo({ url: '/pages/record-success/record-success' })
    }, 500)
  },

  saveDecision() {
    const now = new Date()
    const createdAt = util.formatDate(now)
    const options = this.data.options.filter(item => item.trim())
    const reviewPeriod = this.data.reviewPeriod
    const customDate = this.data.customDate

    let reviewDate
    if (reviewPeriod === 'custom' && customDate) {
      reviewDate = customDate
    } else {
      reviewDate = util.getReviewDate(createdAt, reviewPeriod)
    }

    const decision = {
      id: util.generateId(),
      title: this.data.title.trim(),
      category: this.data.selectedCategory || '',
      background: this.data.background.trim(),
      options,
      choice: this.data.selectedOption,
      reason: this.data.choiceReason.trim(),
      expectation: this.data.expectation.trim(),
      mood: this.data.selectedMood,
      createdAt,
      reviewDate,
      status: 'pending',
      stage: STAGES.SPROUT,
      actionStarted: false,
      firstReviewDone: false,
      resultReviewDone: false,
      wateringHistory: [],
      maxWaterings: 1
    }

    app.globalData.decisions.unshift(decision)
    app.globalData.stats.totalDecisions += 1
    app.globalData.stats.monthlyDecisions += 1
    const saved = util.safeSetStorage('decisions', app.globalData.decisions)
    if (!saved) {
      wx.showToast({ title: '存储失败，请清理微信存储空间', icon: 'none' })
    }
  },

  onTitleInput(e) { this.setData({ title: e.detail.value }) },
  onBgInput(e) { this.setData({ background: e.detail.value }) },
  onSelectMood(e) { this.setData({ selectedMood: e.currentTarget.dataset.mood }) },
  onSelectCategory(e) { this.setData({ selectedCategory: e.currentTarget.dataset.key }) },

  onOptionInput(e) {
    const idx = e.currentTarget.dataset.index
    const options = this.data.options.slice()
    options[idx] = e.detail.value
    this.setData({ options })
  },

  onAddOption() {
    if (this.data.options.length < 6) {
      this.setData({ options: this.data.options.concat('') })
    }
  },

  onSelectChoice(e) {
    this.setData({ selectedOption: e.currentTarget.dataset.index })
  },

  onReasonInput(e) { this.setData({ choiceReason: e.detail.value }) },
  onExpectInput(e) { this.setData({ expectation: e.detail.value }) },

  onSelectTime(e) {
    this.setData({ reviewPeriod: e.currentTarget.dataset.key })
  },

  onDatePicker(e) {
    const selectedDate = e.detail.value
    if (selectedDate < this.data.today) {
      wx.showToast({ title: '不能选择过去的日期', icon: 'none' })
      return
    }
    this.setData({ customDate: selectedDate, reviewPeriod: 'custom' })
  },

  onSkipReview() {
    wx.showModal({
      title: '确认跳过',
      content: '跳过后将保存当前已填内容，未填部分将留空。确认跳过吗？',
      confirmText: '确认跳过',
      cancelText: '继续填写',
      success: (res) => {
        if (res.confirm) {
          this.setData({ saving: true })
          wx.showLoading({ title: '保存中...' })
          this.saveDecision()

          // 增加短暂延迟，确保用户能看到 loading 状态
          setTimeout(() => {
            wx.hideLoading()
            this.setData({ saving: false })
            wx.navigateTo({ url: '/pages/record-success/record-success' })
          }, 500)
        }
      }
    })
  }
})
