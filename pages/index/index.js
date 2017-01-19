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

    wx.setNavigationBarTitle({
      title: '趣直播'
    })

    var app = getApp()
    app.globalData.shareLive = null;

    api.get('lives/on', null,  (data) => {
      data.forEach(live =>
        live.timeGap = util.timeGap(live.planTs)
      )
      this.setData({
        lives: data
      })
    })
  },
  onReady() {
  }
})
