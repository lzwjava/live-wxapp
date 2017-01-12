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
  getUserInfo (cb) {
    // if(this.globalData.userInfo != null){
    //   typeof cb == "function" && cb(this.globalData.userInfo)
    // }else{
    //   //调用登录接口
    //   this.login(cb)
    // }
    this.login(cb)
  },
  fetchCurrentUser() {
    wx.checkSession({
      success: function(){
        console.log('登录态未过期')
      fail: function(){
        console.log('登录态已过期')
      }
    })

    api.get('self', null, (user) => {
      this.globalData.currentUser = user
    }, (status, error) => {
      if (status == 'not_in_session') {
        this.loginBySession()
      } else {
        util.showError(error)
      }
    })
  },
  loginBySession() {
    var thirdSession =  wx.getStorageSync('thirdSession') || ''
    console.log('thirdSession: ' + thirdSession)
    if (thirdSession != '') {
      api.post('wechat/loginBySession', {
        'thirdSession': thirdSession
      }, (user) => {
        this.globalData.currentUser = user
      }, (status, error) => {
        if (status == 'wx_session_expire') {
          util.toast('登录已过期，请重新登录')
          this.login()
        } else {
          util.showError(error)
        }
      })
    } else {
      this.login()
    }
  },
  login(cb) {
    console.log ('wxlogin')
    wx.login({
      success: (res) => {
        api.post('wechat/login', {
          code: res.code
        }, (data) => {
          wx.getUserInfo({
            success: (res) => {
              var thirdSession = data.thirdSession

              api.post('wechat/registerbyApp', {
                'rawData': res.rawData,
                'signature': res.signature,
                'iv': res.iv,
                'encryptedData': res.encryptedData,
                'thirdSession': thirdSession
              }, (user) => {

                wx.setStorageSync('thirdSession', thirdSession)

                console.log('currentUser')
                console.log(data)
                this.globalData.currentUser = user
              })
            },
            fail: (error) => {
              util.showError('微信获取用户信息失败：' + error.errMsg)
            }
          })
       })
     },
     fail: () => {
       util.showError('微信登录')
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
