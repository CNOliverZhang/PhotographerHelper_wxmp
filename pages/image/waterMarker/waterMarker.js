const app = getApp()

Page({

  data: {

  },

  //初始化界面
  onLoad: function (options) {
    let that = this
    let target = 'single'
    if (options.target ) {
      target = options.target
    }
    that.setData({
      currentTab: target,
      mode: 'default',
      size: 1,
      alpha: 100,
      compress: false,
      maxLength: 3000
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

  //清除数据
  clearData: function () {
    this.setData({
      mode: 'default',
      width: 600,
      height: 400,
      originalImage: '',
      image: '',
      preview: false,
      size: 1,
      alpha: 100,
      focused: '',
      text: '',
      colorMode: '',
      color: '',
      position: '',
      positionX: '',
      positionY: '',
      panel: '',
      templateName: '',
      multipleStatus: 'default',
      images: [],
      compress: false,
      maxLength: 3000,
    })
  },

  //点击按钮切换
  tapTab: function (event) {
    this.clearData()
    this.setData({
      currentTab: event.currentTarget.id
    })
  },

  //聚焦
  focus: function (event) {
    this.setData({
      focused: event.currentTarget.id
    })
  },

  //失焦
  blur: function (event) {
    this.setData({
      focused: ''
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
          title: '正在读取',
          icon: 'loading',
          duration: 10000,
        })
        let image = res.tempFilePaths[0]
        wx.getImageInfo({
          src: image,
          success: function (res) {
            let width = res.width
            let height = res.height
            that.setData({
              originalImage: image,
              image: image,
              width: width,
              height: height,
              mode: 'image',
              preview: false,
            })
            wx.hideToast()
          }
        })
      }
    })
  },

  //选择创建水印模板
  createTemplate: function () {
    this.createTemplateCanvas()
    this.setData({
      mode: 'template',
      preview: false,
    })
  },

  //创建模板底图
  createTemplateCanvas: function () {
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
            })
            wx.hideToast()
          }
        })
      }, 1000))
    })
  },

  //输入内容
  setText: function (event) {
    this.setData({
      text: event.detail.value,
      preview: 0
    })
  },

  //设置字体大小
  setSize: function (event) {
    this.setData({
      size: event.detail.value,
      preview: 0
    })
  },

  //设置水印颜色模式
  setColorMode: function (event) {
    this.setData({
      colorMode: event.currentTarget.id,
      color: ''
    })
  },

  //设置水印颜色
  setColor: function (event) {
    this.setData({
      color: event.currentTarget.id,
      preview: 0
    })
  },

  //输入水印颜色
  inputColor: function (event) {
    this.setData({
      color: event.detail.value,
      preview: 0
    })
  },

  //设置不透明度
  setAlpha: function (event) {
    this.setData({
      alpha: event.detail.value,
      preview: 0
    })
  },

  //设置相对位置
  setPosition: function (event) {
    this.setData({
      position: event.currentTarget.id,
      positionX: 0,
      positionY: 0,
      preview: 0
    })
  },

  //设置水平边距
  setPositionX: function (event) {
    this.setData({
      positionX: event.detail.value,
      preview: 0
    })
  },

  //设置垂直边距
  setPositionY: function (event) {
    this.setData({
      positionY: event.detail.value,
      preview: 0
    })
  },

  //开启压缩
  setCompress: function (event) {
    this.setData({
      compress: event.detail.value,
      maxLength: 3000,
      preview: false
    })
  },

  //设置压缩分辨率
  setResolution: function (event) {
    this.setData({
      maxLength: event.detail.value,
      preview: false
    })
  },

  //预览图片
  preview: function () {
    let that = this
    if (!that.data.color) {
      wx.showModal({
        title: '未完成设置',
        content: '您未设置完所有参数，请将所有设置项完成后预览。',
        showCancel: false,
      })
      return
    }
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
    let width = that.data.width
    let height = that.data.height
    if (that.data.compress && (width > that.data.maxLength || height > that.data.maxLength)) {
      if (width > height) {
        height = parseInt(height * that.data.maxLength / width)
        width = that.data.maxLength
      } else {
        width = parseInt(width * that.data.maxLength / height)
        height = that.data.maxLength
      }
    }
    that.setData({
      width: width,
      height: height
    }, function () {
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
      switch (that.data.position) {
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
      context.draw(false, setTimeout(function () {
        wx.canvasToTempFilePath({
          destWidth: that.data.width,
          destHeight: that.data.height,
          canvasId: 'image',
          success: function (res) {
            that.setData({
              image: res.tempFilePath,
              preview: true
            })
            wx.showToast({
              title: '已生成预览',
            })
          }
        })
      }, 500))
    })
    
  },

  //设置面板状态
  setPanelStatus: function (event) {
    if (this.data.preview == false) {
      wx.showModal({
        title: '未生成预览',
        content: '请您先生成预览后再进行保存。',
        showCancel: false
      })
      return
    }
    this.setData({
      panel: event.currentTarget.dataset.status,
      templateName: ''
    })
  },

  //设置模板名称
  setTemplateName: function (event) {
    this.setData({
      templateName: event.detail.value
    })
  },

  //单张模式保存图片
  saveImage: function () {
    if (this.data.preview == false) {
      wx.showModal({
        title: '未生成预览',
        content: '请您先生成预览后再进行保存。',
        showCancel: false
      })
      return
    }
    wx.saveImageToPhotosAlbum({
      filePath: this.data.image,
      success: function () {
        wx.showToast({
          title: '保存成功',
        })
      }
    })
  },

  //保存模板
  saveTemplate: function () {
    let that = this
    let templateName = '新建模板'
    if (that.data.templateName != '') {
      templateName = that.data.templateName
    }
    let template = {
      index: that.data.templates.length,
      name: templateName,
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
        wx.showToast({
          title: '保存成功',
        })
      },
      fail: function () {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      },
      complete: function () {
        that.setData({
          panel: ''
        })
      }
    })
  },

  //上传多张图片
  multipleUpload: function () {
    let that = this
    if (that.data.templates.length == 0) {
      wx.showModal({
        title: '没有可用模板',
        content: '批量添加水印需要使用模板，请您先创建水印模板再使用。',
        showCancel: false,
        complete: function () {
          that.createTemplateCanvas()
          that.setData({
            currentTab: 'single',
            mode: 'template'
          })
        }
      })
      return
    }
    wx.chooseImage({
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        let images = []
        let paths = res.tempFilePaths
        wx.showToast({
          title: '正在读取',
          icon: 'loading',
          duration: 10000
        })
        that.getInfo(that, images, paths, 0)
      },
      fail: function (res) {
        that.clearData()
        wx.showToast({
          title: '读取失败',
          icon: 'none'
        })
      }
    })
  },

  //获取图片信息
  getInfo: function (that, images, paths, i) {
    wx.getImageInfo({
      src: paths[i],
      success: function (res) {
        let width = res.width
        let height = res.height
        let originalWidth = width
        let originalHeight = height
        if (that.data.compress && (width > that.data.maxLength || height > that.data.maxLength)) {
          if (width > height) {
            height = parseInt(height * that.data.maxLength / width)
            width = that.data.maxLength
          } else {
            width = parseInt(width * that.data.maxLength / height)
            height = that.data.maxLength
          }
        }
        let image = {
          i: i,
          path: paths[i],
          originalWidth: originalWidth,
          originalHeight: originalHeight,
          width: width,
          height: height,
        }
        images.push(image)
        if (i == paths.length - 1) {
          that.setData({
            images: images
          }, function () {
            wx.hideToast()
            wx.showModal({
              title: '图片读取成功',
              content: '点击“确定”选择模板开始添加水印，或点击“取消”返回重新选择图片。',
              success: function (res) {
                if (res.confirm) {
                  that.setData({
                    multipleStatus: 'uploaded',
                  })
                } else {
                  that.setData({
                    multipleStatus: 'default',
                    images: []
                  })
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

  //选择模板
  selectTemplate: function (event) {
    wx.showToast({
      title: '正在处理',
      icon: 'loading',
      duration: 100000
    })
    let that = this
    let template = that.data.templates[event.currentTarget.dataset.templateIndex]
    that.setData({
      text: template.text,
      size: template.size,
      color: template.color,
      alpha: template.alpha,
      position: template.position,
      positionX: template.positionX,
      positionY: template.positionY
    })
    that.handle(0, that, that.data.images)
  },

  //递归处理图片
  handle: function (i, that, images) {
    let color = '#' + that.data.color
    that.setData({
      width: images[i].width,
      height: images[i].height
    }, function () {
      let context = wx.createCanvasContext('image')
      context.drawImage(images[i].path, 0, 0, that.data.width, that.data.height)
      //新版本API代码，部分客户端暂时不兼容
      //let fontStyle = String(that.data.size / 100 * that.data.width) + 'px sans-serif'
      //context.font = fontStyle
      context.setFontSize(that.data.size / 100 * that.data.width)
      context.setFillStyle(color)
      context.setGlobalAlpha(that.data.alpha / 100)
      let x, y
      let wpx = that.data.width / 100
      let hpx = that.data.height / 100
      switch (that.data.position) {
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
      context.draw(false, setTimeout(function () {
        wx.canvasToTempFilePath({
          destWidth: that.data.width,
          destHeight: that.data.height,
          canvasId: 'image',
          success: function (res) {
            let image = images[i]
            image['path'] = res.tempFilePath
            images[i] = image
            i += 1
            if (i < images.length) {
              that.handle(i, that, images)
            } else {
              wx.hideToast()
              that.setData({
                images: images,
                multipleStatus: 'done'
              })
              wx.showModal({
                title: '处理完成',
                content: '全部图片已处理完成，请点击“确定”进行下一步。',
                showCancel: false
              })
            }
          }
        })
      }, 500))
    })
  },

  //保存单张图片
  saveSingleImage: function (event) {
    let that = this
    let index = event.currentTarget.dataset.imageIndex
    wx.saveImageToPhotosAlbum({
      filePath: that.data.images[index].path,
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
  saveMultipleImages: function () {
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
                content: '共有' + this.data.images.length + '张图片，其中' + successCount + '张保存成功，' + failCount + '张保存失败。',
              })
            }
          }
        }
      })
    }
  },

  //使用模板
  useTemplate: function (event) {
    let that = this
    index = event.currentTarget.dataset.templateIndex
    template = that.data.templates[index]
    wx.showModal({
      title: '已应用模板',
      content: '已应用模板参数，请选择模式进入下一步。',
      showCancel: false
    })
    that.setData({
      currentTab: 'single',
      mode: 'default',
      size: template.size,
      alpha: template.alpha,
      text: template.text,
      colorMode: template.colorMode,
      color: template.color,
      position: template.position,
      positionX: template.positionX,
      positionY: template.positionY,
    })
  },

  //删除模板
  deleteTemplate: function (event) {
    let that = this
    let templates = that.data.templates
    let index = event.currentTarget.dataset.templateIndex
    wx.showModal({
      title: '删除确认',
      content: '您是否要删除名称为“' + templates[index].name + "”的水印模板？",
      success: function (res) {
        if (res.confirm) {
          templates.splice(index, 1)
          wx.setStorage({
            key: 'templates',
            data: templates,
            success: function () {
              wx.showToast({
                title: '删除成功',
              })
            },
            fail: function () {
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            },
            complete: function () {
              that.setData({
                templates: templates
              })
            }
          })
        }
      }
    })
  },

  //删除全部模板
  deleteAllTemplates: function () {
    let that = this
    wx.showModal({
      title: '删除确认',
      content: '您是否要删除全部水印模板？',
      success: function (res) {
        if (res.confirm) {
          wx.setStorage({
            key: 'templates',
            data: [],
            success: function () {
              that.setData({
                templates: []
              })
            }
          })
        }
      }
    })
  },

  //没有可用模板
  noTemplate: function () {
    this.createTemplateCanvas()
    this.setData({
      currentTab: 'single',
      mode: 'template'
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
      title: '图片自定义加水印工具 - 洋芋田摄影小助手',
      imageUrl: '/images/share/watermarker.jpg'
    }
  }
})