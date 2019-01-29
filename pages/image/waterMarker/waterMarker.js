const app = getApp()

Page({

  data: {

  },

  //初始化界面
  onLoad: function (options) {
    let that = this
    let currentTab
    if (!options[currentTab]) {
      currentTab = 'single'
    } else {
      currentTab = options.currentTab
    }
    that.setData({
      currentTab: currentTab,
      mode: 'default',
    })
    let templates = []
    wx.getStorage({
      key: 'templates',
      success: function(res) {
        templates = res.data
      },
      complete: function() {
        that.setData({
          templates: templates
        })
      }
    })
  },

  //清空界面
  onHide: function () {
    let options = {
      currentTab: this.data.currentTab
    }
    this.onLoad(options)
  },

  //点击按钮切换
  tapTab: function (event) {
    this.setData({
      currentTab: event.currentTarget.id
    })
  },

  //上传单张图片
  singleUpload: function () {
    let that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        wx.showToast({
          title: '准备中',
          icon: 'loading',
          duration: 10000,
        })
        let image = res.tempFilePaths[0]
        wx.getImageInfo({
          src: image,
          success: function (res) {
            let width = res.width
            let height = res.height
            if (width > 6000 && height > 6000) {
              if (width > height) {
                height = height * 6000 / width
                width = 6000
              } else {
                width = width * 6000 / height
                height = 6000
              }
            }
            that.setData({
              originalImage: image,
              image: image,
              width: width,
              height: height,
              mode: 'image',
              preview: false,
              size: 1,
              alpha: 100,
            })
            wx.hideToast()
          }
        })
      }
    })
  },

  //选择创建水印模板
  createTemplate: function () {
    wx.showToast({
      title: '准备中',
      icon: 'loading',
      duration: 10000
    })
    let that = this
    that.setData({
      width: 600,
      height: 400
    }, function () {
      let context = wx.createCanvasContext('image')
      context.setFillStyle('#fbbc05')
      context.fillRect(0, 0, that.data.width, that.data.height)
      context.draw(false, setTimeout(function () {
        wx.canvasToTempFilePath({
          canvasId: 'image',
          success: function (res) {
            that.setData({
              originalImage: res.tempFilePath,
              image: res.tempFilePath,
              mode: 'template',
              preview: false,
              size: 1,
              alpha: 100,
            })
            wx.hideToast()
          }
        })
      }, 1000))
    })
  },

  //聚焦
  focus: function () {
    this.setData({
      focused: true
    })
  },

  //失焦
  blur: function () {
    this.setData({
      focused: false
    })
  },

  //输入内容
  setText: function (event) {
    this.setData({
      text: event.detail.value
    })
  },

  //设置字体大小
  setSize: function (event) {
    this.setData({
      size: event.detail.value
    })
  },

  //设置水印颜色模式
  setColorMode: function (event) {
    this.setData({
      colorMode: event.currentTarget.id
    })
  },

  //设置水印颜色
  setColor: function (event) {
    this.setData({
      color: event.currentTarget.id
    })
  },

  //输入水印颜色
  inputColor: function (event) {
    this.setData({
      color: event.detail.value
    })
  },

  //设置不透明度
  setAlpha: function (event) {
    this.setData({
      alpha: event.detail.value
    })
  },

  //设置相对位置
  setPosition: function (event) {
    this.setData({
      position: event.currentTarget.id,
      positionX: 0,
      positionY: 0,
    })
  },

  //设置水平边距
  setPositionX: function (event) {
    this.setData({
      positionX: event.detail.value
    })
  },

  //设置垂直边距
  setPositionY: function (event) {
    this.setData({
      positionY: event.detail.value
    })
  },

  //预览图片
  preview: function () {
    let that = this
    let regex = /^([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/
    if (!regex.test(that.data.color)) {
      wx.showModal({
        title: '颜色值错误',
        content: '您输入的颜色值不是十六进制颜色代码，请您重新输入。',
        showCancel: false,
      })
      that.setData({
        color: ''
      })
      return
    }
    let color = '#' + that.data.color
    if (!that.data.text || !that.data.size || !that.data.color || !that.data.position) {
      wx.showModal({
        title: '未完成设置',
        content: '您未设置完所有参数，请将所有设置项完成后预览。',
        showCancel: false,
      })
    }
    wx.showToast({
      title: '正在处理',
      icon: 'loading',
      duration: 100000
    })
    let context = wx.createCanvasContext('image')
    context.drawImage(that.data.originalImage, 0, 0, that.data.width, that.data.height)
    //新版本API代码，部分客户端暂时不兼容
    //let fontStyle = String(that.data.size / 100 * that.data.width) + 'px sans-serif'
    //context.font = fontStyle
    context.setFontSize(that.data.size / 100 * that.data.width)
    context.setFillStyle(color)
    context.setGlobalAlpha(that.data.alpha / 100)
    let x, y
    let wpx = that.data.width / 100
    let hpx = that.data.height / 100
    switch(that.data.position) {
      case 'center':
        x = that.data.width / 2
        y = that.data.height / 2
        context.setTextAlign('center')
        context.setTextBaseline('middle')
        break
      case 'bottom':
        x = that.data.width / 2
        y = that.data.height - that.data.positionY * hpx
        context.setTextAlign('center')
        context.setTextBaseline('bottom')
        break
      case 'top':
        x = that.data.width / 2
        y = that.data.positionY * hpx
        context.setTextAlign('center')
        context.setTextBaseline('top')
        break
      case 'bottom-left':
        x = that.data.positionX * wpx
        y = that.data.height - that.data.positionY * hpx
        context.setTextAlign('left')
        context.setTextBaseline('bottom')
        break
      case 'bottom-right':
        x = that.data.width - that.data.positionX * wpx
        y = that.data.height - that.data.positionY * hpx
        context.setTextAlign('right')
        context.setTextBaseline('bottom')
        break
      case 'top-left':
        x = that.data.positionX * wpx
        y = that.data.positionY * hpx
        context.setTextAlign('left')
        context.setTextBaseline('top')
        break
      case 'top-right':
        x = that.data.width - that.data.positionX
        y = that.data.positionY
        context.setTextAlign('right')
        context.setTextBaseline('top')
        break
    }
    context.fillText(that.data.text, x, y)
    context.draw(true, setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'image',
        success: function(res) {
          that.setData({
            image: res.tempFilePath,
            preview: true
          })
          wx.hideToast()
        }
      })
    }, 500))
  },

  //保存单张图片
  saveImage: function () {
    if (this.data.preview == false) {
      wx.showModal({
        title: '未生成预览',
        content: '请您先生成预览后再进行保存',
        showCancel: false
      })
      return
    }
    wx.saveImageToPhotosAlbum({
      filePath: this.data.image,
    })
  },

  //保存模板
  saveTemplate: function () {
    let that = this
    if (that.data.preview == false) {
      wx.showModal({
        title: '未生成预览',
        content: '请您先生成预览后再进行保存',
        showCancel: false
      })
      return
    }
    let template = {
      index: that.data.templates.length,
      text: that.data.text,
      size: that.data.size,
      colorMode: that.data.colorMode,
      color: that.data.color,
      alpha: that.data.alpha,
      position: that.data.position,
      positionX: that.data.positionX,
      positionY: that.data.positionY,
    }
    let templates = that.data.templates
    templates.push(template)
    that.setData({
      templates: templates
    })
    wx.setStorage({
      key: 'templates',
      data: templates,
      success: function () {
        wx.showModal({
          title: '保存成功',
          content: '水印模板已保存成功。',
          showCancel: false
        })
      },
      fail: function () {
        wx.showModal({
          title: '保存失败',
          content: '保存失败，请重试。',
          showCancel: false
        })
      }
    })
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
      title: '图片自定义加水印工具-洋芋田摄影小助手',
      imageUrl: '/images/share/watermarker.jpg'
    }
  }
})