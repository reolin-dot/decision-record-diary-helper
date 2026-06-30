Page({
  data: {
    dilemmaTypes: [
      { icon: '🔀', title: '二选一困难', desc: '两个选项各有利弊，无法取舍' },
      { icon: '💼', title: '职业选择', desc: '跳槽、转行、晋升等职业决策' },
      { icon: '👥', title: '人际关系', desc: '表白、分手、朋友矛盾等' },
      { icon: '💰', title: '财务决策', desc: '购买、投资、消费等选择' },
      { icon: '🎯', title: '长期规划', desc: '人生方向、目标设定等' }
    ]
  },

  onSelectDilemma(e) {
    const idx = e.currentTarget.dataset.index
    wx.navigateTo({ url: '/pages/coach-analyze/coach-analyze?type=' + idx })
  }
})
