Page({
  
  data: {

  },

  //显示面板
  showPanel: function (event) {
    this.setData({
      show: event.currentTarget.id
    })
  },

  //关闭面板
  hidePanel: function (event) {
    this.setData({
      show: ''
    })
  },

  //前往页面
  gotoPage: function (event) {
    let page = event.currentTarget.id
    let parent = event.currentTarget.dataset.parent
    let target = '/pages/' + parent + '/' + page + '/' + page
    wx.navigateTo({
      url: target,
    })
  },

  //返回
  goBack: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})