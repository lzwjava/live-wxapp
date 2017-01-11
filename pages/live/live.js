var util = require('../../utils/util')
var api = require('../../utils/api')

Page({
  data: {
    liveId: 0,
    live: {}
  },
  onLoad: function (query) {
    this.setData({
     liveId: query.liveId
    })
  }
})
