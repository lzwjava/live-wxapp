var util = require('../../utils/util')
var api = require('../../utils/api')
var wemark = require('wemark')

Page({
  data: {
    liveId: 0,
    live: {},
    attendedUsers: [],
    btnTitle: ''
  },
  onLoad: function (query) {
    this.setData({
     liveId:query.liveId
    })
    api.get('lives/' + query.liveId, null,
       (data) => {
         this.setData({
           live: data,
           btnTitle: this.btnTitle(data)
         })
       })
    api.get('lives/' + this.data.liveId + '/users', {
      limit: 7
    }, (data) => {
      console.log('users')
      this.setData({
        attendedUsers: data
      })
    })
  },
  thankWord() {
  },
  btnTitle(live) {
    var statusWord;
    if (live.status <= 20) {
      statusWord = '参与直播'
    } else {
      statusWord = '收看回播'
    }
    var thankWord
    if (live.amount <= 100) {
      thankWord =  '免费'
    } else {
      thankWord = '感恩1元'
    }
    if (live.canJoin) {
      return '已报名，进入' + statusWord
    } else {
      if (live.needPay) {
        var amountWord;
        if (live.realAmount != live.amount) {
          amountWord = '¥' + (live.realAmount / 100.0)  +
          ' 原价 ¥' + (live.amount / 100.0)
        } else {
          amountWord = '¥' + (live.amount / 100.0)  + '（分享朋友圈' + thankWord + ' ）'
        }
        return '赞助并' + statusWord + amountWord
      } else {
        return '报名' + statusWord
      }
    }
  }
})
