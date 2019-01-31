const app = getApp()

Page({

  data: {

  },

  //页面初始化
  onLoad: function (options) {
    this.setData({
      currentTab: 'depth',
      results: []
    })
  },

  //点击选项卡
  tapTab: function (event) {
    this.clearInput()
    let target
    switch (event.currentTarget.dataset.tab) {
      case 'depth':
        target = '景深'
        break
      case 'length':
        target = '焦距'
        break
      case 'aperture':
        target = '光圈'
        break
      case 'distance':
        target = '距离'
        break
    }
    this.setData({
      target: target,
      currentTab: event.currentTarget.dataset.tab
    })
  },

  //清除输入
  clearInput: function () {
    this.setData({
      depth: '',
      length: '',
      aperture: '',
      distance: '',
      results: []
    })
  },

  //设置画幅
  setFrame: function (event) {
    let confusion = Math.sqrt(1872) / 1730
    switch (event.currentTarget.dataset.frame) {
      case 'fullFrame':
        break
      case 'apsC':
        confusion = confusion / 1.5
        break
      case 'apsCanonC':
        confusion = confusion / 1.6
        break
      case 'apsCanonH':
        confusion = confusion / 1.3
        break
      case 'mft':
        confusion = confusion / 2
        break
      case 'oneInch':
        confusion = confusion / 2.7
        break
    }
    this.clearInput()
    this.setData({
      confusion: confusion,
      frame: event.currentTarget.dataset.frame
    })
  },

  //设置景深模式
  setDepthMode: function (event) {
    this.clearInput()
    this.setData({
      depthMode: event.currentTarget.dataset.depthMode
    })
  },

  //聚焦
  focus: function (event) {
    this.setData({
      focus: event.currentTarget.dataset.input
    })
  },

  //失焦
  blur: function (event) {
    this.setData({
      focus: ''
    })
  },

  //输入
  input: function (event) {
    let inputedTarget = event.currentTarget.dataset.input
    if (isNaN(event.detail.value) || event.detail.value < 0) {
      wx.showModal({
        title: '输入错误',
        content: '您输入的值存在错误，请您重新输入。',
        showCancel: false
      })
      this.setData({
        [inputedTarget]: ''
      })
      return
    }
    let input = event.detail.value
    if (String(input).split(".").length > 1) {
      if (String(input).split(".")[1].length > 1) {
        input = parseFloat(parseFloat(input).toFixed(2))
      }
    }
    this.setData({
      [inputedTarget]: input
    })
  },

  //计算
  calculate: function () {
    let that = this
    let results = []
    if (!that.data.confusion) {
      wx.showModal({
        title: '请选择画幅',
        content: '您必须先选择画幅，否则无法进行计算。',
        showCancel: false
      })
      return
    }
    if (that.data.currentTab == 'depth') {
      if (!that.data.length || !that.data.aperture || !that.data.distance) {
        wx.showModal({
          title: '输入不完整',
          content: '您未输入完所有的项目，无法进行计算。',
          showCancel: false,
        })
        return
      }
      let aperture = that.data.aperture
      let confusion = that.data.confusion
      let length = that.data.length
      let distance = that.data.distance * 10
      let frontDepth = aperture * confusion * distance * distance / (length * length + aperture * distance * confusion)
      let backDepth = aperture * confusion * distance * distance / (length * length - aperture * distance * confusion)
      if (frontDepth < 0 || backDepth < 0 || isNaN(frontDepth) || isNaN(backDepth)) {
        that.clearInput()
        wx.showModal({
          title: '输入错误',
          content: '您输入的值存在错误，请您重新输入。',
          showCancel: false
        })
        return
      }
      frontDepth = {
        name: '前景深',
        value: parseFloat((frontDepth / 10).toFixed(2)),
        unit: 'cm'
      }
      backDepth = {
        name: '后景深',
        value: parseFloat((backDepth / 10).toFixed(2)),
        unit: 'cm'
      }
      results.push(frontDepth, backDepth)
      that.setData({
        results: results
      })
    }
    if (that.data.currentTab == 'length') {
      if (!that.data.depth || !that.data.aperture || !that.data.distance) {
        wx.showModal({
          title: '输入不完整',
          content: '您未输入完所有的项目，无法进行计算。',
          showCancel: false,
        })
        return
      }
      if (!that.data.depthMode) {
        wx.showModal({
          title: '请选择景深模式',
          content: '您必须选择景深模式，否则无法进行计算',
          showCancel: false,
        })
        return
      }
      let aperture = that.data.aperture
      let confusion = that.data.confusion
      let depth = that.data.depth * 10
      let distance = that.data.distance * 10
      if (that.data.depthMode == 'front') {
        let length = Math.sqrt(aperture * confusion * distance * distance / depth - aperture * confusion * distance)
        let backDepth = aperture * confusion * distance * distance / (length * length - aperture * distance * confusion)
        if (length < 0 || backDepth < 0 || isNaN(length) || isNaN(backDepth)) {
          that.clearInput()
          wx.showModal({
            title: '输入错误',
            content: '您输入的值存在错误，请您重新输入。',
            showCancel: false
          })
          return
        }
        length = {
          name: '焦距',
          value: parseFloat(length.toFixed(2)),
          unit: 'mm'
        }
        backDepth = {
          name: '后景深',
          value: parseFloat((backDepth / 10).toFixed(2)),
          unit: 'cm'
        }
        results.push(length, backDepth)
        that.setData({
          results: results
        })
      } else {
        let length = Math.sqrt(aperture * confusion * distance * distance / depth + aperture * confusion * distance)
        let frontDepth = aperture * confusion * distance * distance / (length * length + aperture * distance * confusion)
        if (length < 0 || frontDepth < 0 || isNaN(length) || isNaN(frontDepth)) {
          that.clearInput()
          wx.showModal({
            title: '输入错误',
            content: '您输入的值存在错误，请您重新输入。',
            showCancel: false
          })
          return
        }
        length = {
          name: '焦距',
          value: parseFloat(length.toFixed(2)),
          unit: 'mm'
        }
        frontDepth = {
          name: '前景深',
          value: parseFloat((frontDepth / 10).toFixed(2)),
          unit: 'cm'
        }
        results.push(length, frontDepth)
        that.setData({
          results: results
        })
      }
    }
    if (that.data.currentTab == 'aperture') {
      if (!that.data.depth || !that.data.length || !that.data.distance) {
        wx.showModal({
          title: '输入不完整',
          content: '您未输入完所有的项目，无法进行计算。',
          showCancel: false,
        })
        return
      }
      if (!that.data.depthMode) {
        wx.showModal({
          title: '请选择景深模式',
          content: '您必须选择景深模式，否则无法进行计算',
          showCancel: false,
        })
        return
      }
      let length = that.data.length
      let confusion = that.data.confusion
      let depth = that.data.depth * 10
      let distance = that.data.distance * 10
      if (that.data.depthMode == 'front') {
        let aperture = depth * length * length / (confusion * distance * (distance - depth))
        let backDepth = aperture * confusion * distance * distance / (length * length - aperture * distance * confusion)
        if (aperture < 0 || backDepth < 0 || isNaN(aperture) || isNaN(backDepth)) {
          that.clearInput()
          wx.showModal({
            title: '输入错误',
            content: '您输入的值存在错误，请您重新输入。',
            showCancel: false
          })
          return
        }
        aperture = {
          name: '光圈',
          value: parseFloat(aperture.toFixed(2)),
          unit: ''
        }
        backDepth = {
          name: '后景深',
          value: parseFloat((backDepth / 10).toFixed(2)),
          unit: 'cm'
        }
        results.push(aperture, backDepth)
        that.setData({
          results: results
        })
      } else {
        let aperture = depth * length * length / (confusion * distance * (distance + depth))
        let frontDepth = aperture * confusion * distance * distance / (length * length + aperture * distance * confusion)
        if (aperture < 0 || frontDepth < 0 || isNaN(aperture) || isNaN(frontDepth)) {
          that.clearInput()
          wx.showModal({
            title: '输入错误',
            content: '您输入的值存在错误，请您重新输入。',
            showCancel: false
          })
          return
        }
        aperture = {
          name: '光圈',
          value: parseFloat(aperture.toFixed(2)),
          unit: ''
        }
        frontDepth = {
          name: '前景深',
          value: parseFloat((frontDepth / 10).toFixed(2)),
          unit: 'cm'
        }
        results.push(aperture, frontDepth)
        that.setData({
          results: results
        })
      }
    }
    if (that.data.currentTab == 'distance') {
      if (!that.data.depth || !that.data.length || !that.data.aperture) {
        wx.showModal({
          title: '输入不完整',
          content: '您未输入完所有的项目，无法进行计算。',
          showCancel: false,
        })
        return
      }
      if (!that.data.depthMode) {
        wx.showModal({
          title: '请选择景深模式',
          content: '您必须选择景深模式，否则无法进行计算',
          showCancel: false,
        })
        return
      }
      let length = that.data.length
      let confusion = that.data.confusion
      let depth = that.data.depth * 10
      let aperture = that.data.aperture
      if (that.data.depthMode == 'front') {
        let distance = (depth * aperture * confusion + Math.sqrt((depth * aperture * confusion) * (depth * aperture * confusion + 4 * length * length))) / (2 * aperture * confusion)
        let backDepth = aperture * confusion * distance * distance / (length * length - aperture * distance * confusion)
        if (distance < 0 || backDepth < 0 || isNaN(distance) || isNaN(backDepth)) {
          that.clearInput()
          wx.showModal({
            title: '输入错误',
            content: '您输入的值存在错误，请您重新输入。',
            showCancel: false
          })
          return
        }
        distance = {
          name: '距离',
          value: parseFloat((distance / 10).toFixed(2)),
          unit: 'cm'
        }
        backDepth = {
          name: '后景深',
          value: parseFloat((backDepth / 10).toFixed(2)),
          unit: 'cm'
        }
        results.push(distance, backDepth)
        that.setData({
          results: results
        })
      } else {
        let distance = (Math.sqrt((depth * aperture * confusion) * (depth * aperture * confusion + 4 * length * length)) - depth * aperture * confusion) / (2 * aperture * confusion)
        let frontDepth = aperture * confusion * distance * distance / (length * length + aperture * distance * confusion)
        if (distance < 0 || frontDepth < 0 || isNaN(distance) || isNaN(frontDepth)) {
          that.clearInput()
          wx.showModal({
            title: '输入错误',
            content: '您输入的值存在错误，请您重新输入。',
            showCancel: false
          })
          return
        }
        distance = {
          name: '距离',
          value: parseFloat((distance / 10).toFixed(2)),
          unit: 'cm'
        }
        frontDepth = {
          name: '前景深',
          value: parseFloat((frontDepth / 10).toFixed(2)),
          unit: 'cm'
        }
        results.push(distance, frontDepth)
        that.setData({
          results: results
        })
      }
    }
  },

  //返回
  goBack: function () {
    wx.navigateBack({
      delta: 1
    })
  },

  //分享
  onShareAppMessage: function () {
    return {
      title: '景深范围计算工具 - 洋芋田摄影小助手',
      imageUrl: '/images/share/depth.jpg'
    }
  }
})