const app = getApp()

Page({

  data: {

  },

  onLoad: function (options) {

  },

  //水印
  waterMarker: function () {
    wx.navigateTo({
      url: '/pages/image/waterMarker/waterMarker?target=templates',
    })
  },

  //返回
  goBack: function () {
    wx.switchTab({
      url: '/pages/index/index',
    })
  }
})