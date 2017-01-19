var api = require('./utils/api')
var util = require('./utils/util')

//app.js
App({
  onLaunch () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    setTimeout(() => {
      this.fetchCurrentUser()
    }, 0)
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
  onError(e) {
    console.log('onError')
    console.log(e)
  },
  globalData:{
    currentUser:null,
    shareLive: null
  },
  onShareAppMessage() {
    if (this.globalData.shareLive) {
      var live = this.globalData.shareLive
      return {
       title: live.owner.username + '在趣直播：' + live.subject,
       desc: '来自趣直播-知识直播平台',
       path: '/intro/intro?liveId=' + live.liveId
     }
   } else {
     return {
       title: '趣直播-知识直播平台',
       desc: '邀请了大咖来分享知识或经历',
       path: '/index/index'
     }
   }
  }
})
