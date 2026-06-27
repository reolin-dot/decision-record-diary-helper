Page({
  data: {
    steps: [
      { num: 1, title: '选项 A 的好处', placeholder: '列出选择 A 的所有好处，尽量写 3 条以上。', hint: '每条好处可以单独一行。', value: '' },
      { num: 2, title: '选项 A 的坏处', placeholder: '列出选择 A 的所有坏处。', hint: '不要忽略那些让你犹豫的点。', value: '' },
      { num: 3, title: '选项 B 的好处', placeholder: '列出选择 B 的所有好处。', hint: '', value: '' },
      { num: 4, title: '选项 B 的坏处', placeholder: '列出选择 B 的所有坏处。', hint: '', value: '' }
    ],
    scoreA: 3,
    scoreB: 4,
    scores: [1, 2, 3, 4, 5]
  },

  onStepInput(e) {
    const idx = e.currentTarget.dataset.index
    const key = 'steps[' + idx + '].value'
    this.setData({ [key]: e.detail.value })
  },

  onSelectScore(e) {
    const target = e.currentTarget.dataset.target
    const value = Number(e.currentTarget.dataset.value)
    this.setData({ ['score' + target]: value })
  },

  onGenerateResult() {
    wx.navigateTo({
      url: `/pages/coach-result/coach-result?scoreA=${this.data.scoreA}&scoreB=${this.data.scoreB}`
    })
  }
})
