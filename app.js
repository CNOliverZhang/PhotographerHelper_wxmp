App({
  globalData: {
    userInfo: null
  },
  showDevelopingToast: function() {
    wx.showModal({
      title: '功能开发中',
      content: '该功能正在开发中，开发完成后将第一时间上线，敬请期待！',
      showCancel: false
    })
  }
})