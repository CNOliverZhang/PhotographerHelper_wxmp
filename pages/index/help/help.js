Page({
  
  data: {
    history: 'panel-holder panel-hidden',
    momentsImage: 'panel-holder panel-hidden',
    imageClipper: 'panel-holder panel-hidden',
    waterMarker: 'panel-holder panel-hidden',
    depth: 'panel-holder panel-hidden',
    field: 'panel-holder panel-hidden',
  },

  //显示面板
  showPanel: function (event) {
    let target = event.currentTarget.id
    this.setData({
      [target]: 'panel-holder'
    })
  },

  //关闭面板
  hidePanel: function (event) {
    let target = event.currentTarget.id
    this.setData({
      [target]: 'panel-holder panel-hidden'
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