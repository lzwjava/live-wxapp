var api = require('../../utils/api')
var util = require('../../utils/util')

Page({
  data: {
    lives: []
  },
  bindViewTap () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  findLive(liveId) {
    var lives = this.data.lives
    for(var i = 0; i < lives.length; i++) {
      if (lives[i].liveId == liveId) {
        return lives[i]
      }
    }
  },
  liveItemViewTap (event) {
    var liveId = event.currentTarget.dataset.liveId
    var live = this.findLive(liveId)
    if (live.canJoin) {
      wx.navigateTo({
        url: '../live/live?liveId=' + liveId
      })
    } else {
      wx.navigateTo({
        url: '../intro/intro?liveId=' + liveId
      })
    }
  },
  onLoad () {

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
  },
  onShareAppMessage() {
   return util.appShareData()
  }
})
