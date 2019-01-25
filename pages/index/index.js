const app = getApp()

Page({

  data: {
    
  },

  //前往页面
  gotoPage: function (event) {
    let page = event.currentTarget.id
    wx.navigateTo({
      url: './' + page + '/' + page,
    })
  },

  //分享
  onShareAppMessage: function () {
    return {
      title: '洋芋田摄影小助手',
      path: '/pages/index/index',
      imageUrl: '/images/share/main.jpg'
    }
  }
})
