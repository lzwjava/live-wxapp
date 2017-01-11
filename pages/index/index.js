var api = require('../../utils/api')
var util = require('../../utils/util')

var app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    lives: []
  },
  bindViewTap () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  liveItemViewTap (event) {
    var liveId = event.currentTarget.dataset.liveId
    wx.navigateTo({
      url: '../intro/intro?liveId=' + liveId
    })
  },
  onLoad () {
    var that = this
    app.getUserInfo((userInfo) => {
      that.setData({
        userInfo:userInfo
      })
    })
    api.get('lives/on', null,  (data) => {
      data.forEach(live =>
        live.timeGap = util.timeGap(live.planTs)
      )
      this.setData({
        lives: data
      })
    })
  }
})
