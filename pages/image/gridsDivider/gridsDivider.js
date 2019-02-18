const app = getApp()

Page({

  data: {
    grids: [
      {
        x: 0,
        y: 0,
        position: '左上角'
      },
      {
        x: - 1,
        y: 0,
        position: '上方'
      },
      {
        x: - 2,
        y: 0,
        position: '右上角'
      },
      {
        x: 0,
        y: - 1,
        position: '左边'
      },
      {
        x: - 1,
        y: - 1,
        position: '中央'
      },
      {
        x: - 2,
        y: - 1,
        position: '右边'
      },
      {
        x: 0,
        y: - 2,
        position: '左下角'
      },
      {
        x: - 1,
        y: - 2,
        position: '下方'
      },
      {
        x: - 2,
        y: - 2,
        position: '右下角'
      },
    ]
  },

  //打开页面重置图片列表
  onLoad: function () {
    this.setData({
      images: [],
      gridLength: 100,
      maxLength: 1000,
      position: 50,
    })
  },

  //清除数据
  clearData: function () {
    this.setData({
      images: [],
      originalImage: '',
      gridLength: 100,
      width: '',
      height: '',
      xPosition: '',
      yPosition: '',
      gridLength: ''
    })
  },

  //开启压缩
  setCompress: function (event) {
    this.setData({
      compress: event.detail.value,
      maxLength: 2000,
    })
  },

  //设置压缩分辨率
  setResolution: function (event) {
    this.setData({
      maxLength: event.detail.value,
    })
  },

  //开启自定义位置
  setPositionMode: function (event) {
    this.setData({
      customPosition: event.detail.value,
      position: 50,
    })
  },

  //设置截取位置
  setPosition: function (event) {
    this.setData({
      position: event.detail.value,
    })
  },

  //上传图片
  upload: function () {
    let that = this
    wx.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showToast({
          title: '正在读取',
          icon: 'loading',
          duration: 10000
        })
        let images = []
        let image = res.tempFilePaths[0]
        wx.getImageInfo({
          src: image,
          success: function (res) {
            let width = res.width
            let height = res.height
            let xPosition
            let yPosition
            let gridLength
            if (that.data.compress && ((width / 3) > that.data.maxLength || (height / 3) > that.data.maxLength)) {
              if (width > height) {
                height = parseInt(height * that.data.maxLength * 3 / width)
                width = that.data.maxLength * 3
              } else {
                width = parseInt(width * that.data.maxLength * 3 / height)
                height = that.data.maxLength * 3
              }
            }
            if (width > height) {
              yPosition = 0
              xPosition = parseInt((height - width) * that.data.position / 100)
              gridLength = parseInt(height / 3)
            } else {
              xPosition = 0
              yPosition = parseInt((width - height) * that.data.position / 100)
              gridLength = parseInt(width / 3)
            }
            that.setData({
              width: width,
              height: height,
              xPosition: xPosition,
              yPosition: yPosition,
              gridLength: gridLength,
              originalImage: image
            }, function () {
              wx.hideToast()
              wx.showModal({
                title: '图片读取成功',
                content: '点击“确定”开始处理图片，或点击“取消”返回重新选择图片。',
                success: function (res) {
                  if (res.confirm) {
                    wx.showToast({
                      title: '处理中',
                      icon: 'loading',
                      mask: true,
                      duration: 900000
                    })
                    let images = []
                    that.handle(0, that, images)
                  } else {
                    that.clearData()
                  }
                }
              })
            })
          }
        })
      },
      fail: function (res) {
        that.onLoad()
        wx.showToast({
          title: '读取失败',
          icon: 'none'
        })
      }
    })
  },

  //递归处理图片
  handle: function (i, that, images) {
    let context = wx.createCanvasContext('image')
    let width = that.data.width
    let height = that.data.height
    let xPosition = that.data.xPosition + (that.data.grids[i].x) * that.data.gridLength
    let yPosition = that.data.yPosition + (that.data.grids[i].y) * that.data.gridLength
    context.drawImage(that.data.originalImage, xPosition, yPosition, width, height)
    context.draw(false, setTimeout(function () {
      wx.canvasToTempFilePath({
        destWidth: that.data.gridLength,
        destHeight: that.data.gridLength,
        canvasId: 'image',
        success(res) {
          let image = {
            i: i,
            path: res.tempFilePath,
            position: that.data.grids[i].position
          }
          images.push(image)
          i += 1
          if (i < that.data.grids.length) {
            that.handle(i, that, images)
          } else {
            that.setData({
              images: images
            }, function () {
              wx.hideToast()
              wx.showModal({
                title: '处理完成',
                content: '全部图片已处理完成，请点击“确定”进行下一步。',
                showCancel: false
              })
            })
          }
        },
      })
    }, 1000))
  },

  //保存图片
  save: function (event) {
    let index = event.currentTarget.id
    wx.saveImageToPhotosAlbum({
      filePath: this.data.images[index].path,
      success: function (res) {
        wx.showToast({
          title: '保存成功',
        })
      },
      fail: function () {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    })
  },

  //全部保存
  saveAll: function () {
    let that = this
    let successCount = 0
    let failCount = 0
    for (let i = 0; i < that.data.images.length; i++) {
      wx.saveImageToPhotosAlbum({
        filePath: this.data.images[i].path,
        success: function (res) {
          successCount += 1
        },
        fail: function (res) {
          failCount += 1
        },
        complete: function () {
          if (i == that.data.images.length - 1) {
            if (failCount == 0) {
              wx.showModal({
                title: '保存成功',
                content: '共有' + successCount + '张图片，全部保存成功。',
              })
            } else {
              wx.showModal({
                title: '完成',
                content: '共有' + that.data.images.length + '张图片，其中' + successCount + '张保存成功，' + failCount + '张保存失败。',
              })
            }
          }
        }
      })
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
      title: '九宫格图片分割工具 - 洋芋田摄影小助手',
      imageUrl: '/images/share/grids.jpg'
    }
  }
})