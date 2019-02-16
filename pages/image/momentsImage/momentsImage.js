const app = getApp()

const maxLength = 4524

Page({

  data: {

  },

  //打开页面重置图片列表
  onLoad: function () {
    this.setData({
      images: [],
      width: 100,
      height: 100
    })
  },

  //获取图片信息
  getInfo: function (that, images, paths, i) {
    wx.getImageInfo({
      src: paths[i],
      success: function (res) {
        let width = res.width
        let height = res.height
        let image = {
          i: i,
          path: paths[i],
          width: width,
          height: height,
          handled: false
        }
        images.push(image)
        if (i == paths.length - 1) {
          that.setData({
            images: images
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
                  that.handle(0, that, images)
                } else {
                  that.onLoad({})
                }
              }
            })
          })
        } else {
          that.getInfo(that, images, paths, i + 1)
        }
      }
    })
  },

  //上传图片
  upload: function () {
    let that = this
    wx.chooseImage({
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        let images = []
        let paths = res.tempFilePaths
        wx.showToast({
          title: '正在读取',
          icon: 'loading',
          duration: 10000
        })
        that.getInfo(that, images, paths, 0)
      },
      fail: function(res) {
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
    let width = images[i].width
    let height = images[i].height
    let canvasWidth = width
    let canvasHeight
    if (width >= 2 * height || height >= 2 * width) {
      canvasHeight = height
    } else {
      canvasHeight = 2 * width
    }
    if (canvasHeight >= maxLength) {
      let ratio = maxLength / canvasHeight
      canvasHeight = maxLength
      canvasWidth = canvasWidth * ratio
      width = width * ratio
      height = height * ratio
    }
    that.setData({
      width: canvasWidth,
      height: canvasHeight
    }, function () {
      let context = wx.createCanvasContext('image')
      let yPosition = (canvasHeight - height) / 2
      context.drawImage(images[i].path, 0, yPosition, width, height)
      context.draw(false, setTimeout(function () {
        wx.canvasToTempFilePath({
          destWidth: canvasWidth,
          destHeight: canvasHeight,
          canvasId: 'image',
          success(res) {
            let image = {
              i: i,
              path: res.tempFilePath,
              originalWidth: images[i].width,
              originalHeight: images[i].height,
              handled: true,
              width: canvasWidth,
              height: canvasHeight
            }
            images[i]= image
            i += 1
            if (i < images.length) {
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
    })
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
      title: '朋友圈高清图片生成器 - 洋芋田摄影小助手',
      imageUrl: '/images/share/moments.jpg'
    }
  }
})