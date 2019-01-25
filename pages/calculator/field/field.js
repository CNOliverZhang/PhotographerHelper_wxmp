const app = getApp()

Page({

  data: {

  },

  //初始化选项
  onShow: function () {
    let modeButton = {
      equivalent: 'side-button',
      real: 'side-button'
    }
    let frameButton = {
      fullFrame: 'side-button',
      apsC: 'side-button',
      apsCanonC: 'side-button',
      apsCanonH: 'side-button',
      mft: 'side-button',
      oneInch: 'side-button'
    }
    let inputs = {
      length: 'input-blurred',
      horizontal: 'input-blurred',
      vertical: 'input-blurred',
      diagonal: 'input-blurred'
    }
    this.setData({
      modeButton: modeButton,
      frameButton: frameButton,
      inputs: inputs,
    })
    this.clearInput()
  },

  //设置焦距模式
  setMode: function (event) {
    let modeButton = this.data.modeButton
    for (let i in modeButton) {
      modeButton[i] = 'side-button'
    }
    modeButton[event.currentTarget.id] = 'main-button'
    this.setData({
      modeButton: modeButton,
      mode: event.currentTarget.id
    })
    if (event.currentTarget.id == 'equivalent') {
      this.setData({
        ratio: 1
      })
    }
    this.clearInput()
  },

  //设置画幅
  setFrame: function (event) {
    let frameButton = this.data.frameButton
    for (let i in frameButton) {
      frameButton[i] = 'side-button'
    }
    frameButton[event.currentTarget.id] = 'main-button'
    this.setData({
      frameButton: frameButton,
      frame: event.currentTarget.id
    })
    let ratio
    switch(event.currentTarget.id) {
      case 'fullFrame':
        ratio = 1
        break
      case 'apsC':
        ratio = 1.5
        break
      case 'apsCanonC':
        ratio = 1.6
        break
      case 'apsCanonH':
        ratio = 1.3
        break
      case 'mft':
        ratio = 2
        break
      case 'oneInch':
        ratio = 2.7
        break
    }
    this.setData({
      ratio: ratio,
    })
    this.clearInput()
  },

  //聚焦
  focus: function (event) {6
    let inputs = this.data.inputs
    inputs[event.currentTarget.id] = 'input-focused'
    this.setData({
      inputs: inputs
    })
  },

  //失焦
  blur: function (event) {
    let inputs = this.data.inputs
    inputs[event.currentTarget.id] = 'input-blurred'
    this.setData({
      inputs: inputs
    })
  },

  //清空输入
  clearInput: function () {
    this.setData({
      length: '',
      horizontal: '',
      vertical: '',
      diagonal: '',
    })
  },

  //校验输入
  checkInput: function (length, vertical, horizontal, diagonal) {
    if (length == NaN || length == 'NaN' || length < 1) {
      return false
    }
    if (horizontal == NaN || horizontal == 'NaN' || horizontal < 0 || horizontal > 180) {
      return false
    }
    if (vertical == NaN || vertical == 'NaN' || vertical < 0 || vertical > 180) {
      return false
    }
    if (diagonal == NaN || diagonal == 'NaN' || diagonal < 0 || diagonal > 180) {
      return false
    }
    return true
  },

  //输入内容
  input: function (event) {
    let length, horizontal, vertical, diagonal
    //检测是否已选择模式
    let inputedTarget = event.currentTarget.id
    if (!this.data.mode) {
      this.setData({
        [inputedTarget]: ''
      })
      wx.showModal({
        title: '请选择焦距模式',
        content: '您必须先选择焦距模式，否则无法进行计算。',
        showCancel: false
      })
      return
    } 
    if (this.data.mode == 'real' && !this.data.frame) {
      this.setData({
        [inputedTarget]: ''
      })
      wx.showModal({
        title: '请选择画幅',
        content: '您必须先选择画幅，否则无法进行计算。',
        showCancel: false
      })
      return
    }
    if (event.detail.value == '') {
      this.clearInput()
      return
    }
    //校验大于两位的小数
    let inputedData = event.detail.value
    if (String(inputedData).split(".").length > 1) {
      if (String(inputedData).split(".")[1].length > 1) {
        inputedData = parseFloat(parseFloat(inputedData).toFixed(2))
        this.setData({
          [inputedTarget]: inputedData
        })
      }
    }
    //输入的是焦距
    if (inputedTarget == 'length') {
      length = inputedData * this.data.ratio
      horizontal = (Math.atan(18 / length) * (360 / Math.PI)).toFixed(2)
      vertical = (Math.atan(12 / length) * (360 / Math.PI)).toFixed(2)
      diagonal = (Math.atan(Math.sqrt(468) / length) * (360 / Math.PI)).toFixed(2)
      if (!this.checkInput(length, horizontal, vertical, diagonal)) {
        this.clearInput()
        wx.showModal({
          title: '输入错误',
          content: '您输入的值存在错误，请您重新输入。',
        })
        return
      }
      this.setData({
        horizontal: horizontal,
        vertical: vertical,
        diagonal: diagonal
      })
      return
    }
    //输入的是水平视角
    if (inputedTarget == 'horizontal') {
      horizontal = inputedData
      length = (18 / (Math.tan(horizontal * Math.PI / 360) / this.data.ratio)).toFixed(2)
      vertical = (Math.atan(12 / (length * this.data.ratio)) * (360 / Math.PI)).toFixed(2)
      diagonal = (Math.atan(Math.sqrt(468) / (length * this.data.ratio)) * (360 / Math.PI)).toFixed(2)
      if (!this.checkInput(length, horizontal, vertical, diagonal)) {
        this.clearInput()
        wx.showModal({
          title: '输入错误',
          content: '您输入的值存在错误，请您重新输入。',
        })
        return
      }
      this.setData({
        length: length,
        vertical: vertical,
        diagonal: diagonal
      })
      return
    }
    //输入的是垂直视角
    if (inputedTarget == 'vertical') {
      vertical = inputedData
      length = (18 / (Math.tan(vertical * Math.PI / 360) / this.data.ratio)).toFixed(2)
      horizontal = (Math.atan(18 / (length * this.data.ratio)) * (360 / Math.PI)).toFixed(2)
      diagonal = (Math.atan(Math.sqrt(468) / (length * this.data.ratio)) * (360 / Math.PI)).toFixed(2)
      if (!this.checkInput(length, horizontal, vertical, diagonal)) {
        this.clearInput()
        wx.showModal({
          title: '输入错误',
          content: '您输入的值存在错误，请您重新输入。',
        })
        return
      }
      this.setData({
        length: length,
        horizontal: horizontal,
        diagonal: diagonal
      })
      return
    }
    //输入的是对角线视角
    if (inputedTarget == 'diagonal') {
      diagonal = inputedData
      length = (Math.sqrt(468) / (Math.tan(horizontal * Math.PI / 360) / this.data.ratio)).toFixed(2)
      horizontal = (Math.atan(18 / (length * this.data.ratio)) * (360 / Math.PI)).toFixed(2)
      vertical = (Math.atan(12 / (length * this.data.ratio)) * (360 / Math.PI)).toFixed(2)
      if (!this.checkInput(length, horizontal, vertical, diagonal)) {
        this.clearInput()
        wx.showModal({
          title: '输入错误',
          content: '您输入的值存在错误，请您重新输入。',
        })
        return
      }
      this.setData({
        length: length,
        horizontal: horizontal,
        vertical: vertical,
      })
      return
    }
  },

  //分享
  onShareAppMessage: function () {

  }
})