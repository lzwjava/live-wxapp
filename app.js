var api = require('./utils/api')
var util = require('./utils/util')

//app.js
App({
  onLaunch () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  fetchCurrentUser(cb) {
    var currentUser = wx.getStorageSync('currentUser')
    this.globalData.currentUser = currentUser

    api.get('self', null, (user) => {
      this.updateUser(user)
      cb && cb(user)
    }, (status, error) => {
      if (status == 'not_in_session') {
        this.login(cb)
      } else {
        util.showError(error)
      }
    })
  },
  updateUser(user) {
    wx.setStorageSync('currentUser', user)
    this.globalData.currentUser = user
  },
  login(cb) {
    wx.login({
      success: (res) => {
        api.post('wechat/login', {
          code: res.code
        }, (data) => {
          wx.getUserInfo({
            success: (res) => {
              console.log('userInfo')
              console.log(res)
              var thirdSession = data.thirdSession
              console.log(thirdSession)
              api.post('wechat/registerbyApp', {
                'rawData': res.rawData,
                'signature': res.signature,
                'iv': res.iv,
                'encryptedData': res.encryptedData,
                'thirdSession': thirdSession
              }, (user) => {
                this.updateUser(user)
                cb && cb(user)
              })
            },
            fail: (error) => {
              util.showError('微信获取用户信息失败：' + error.errMsg)
            }
          })
       })
     },
     fail: () => {
       util.showError('微信登录失败')
     }
    })
  },
  onShow() {
    console.log('onShow')
  },
  onHide() {
    console.log('onHide')
  },
  onError() {
    console.log('onError')
  },
  globalData:{
    currentUser:null
  }
})
