var api = require('../../utils/api')
var util = require('../../utils/util')

Page({
  data: {
    lives: []
  },
  onLoad () {
    api.get('lives/attended', null,  (data) => {
      data.forEach(live =>
        live.timeGap = util.timeGap(live.planTs)
      )
      this.setData({
        lives: data
      })
    })
  },
  liveItemViewTap (event) {
    var liveId = event.currentTarget.dataset.liveId
    wx.navigateTo({
      url: '../live/live?liveId=' + liveId
    })
  },
  onShareAppMessage() {
   return util.appShareData()
  }
})
