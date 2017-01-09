//index.js
//获取应用实例
var api = require('../../utils/api')
var util = require('../../utils/util')

var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    lives: []
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    app.getUserInfo((userInfo) => {
      that.setData({
        userInfo:userInfo
      })
    })
    api.get('lives/on', (data) => {
      data.forEach(live =>
        live.timeGap = util.timeGap(live.planTs)
      )
      this.setData({
        lives: data
      })
    }, (status, error) => {

    })
  }
})
