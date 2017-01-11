var util = require('../../utils/util')
var api = require('../../utils/api')
var wemark = require('../../lib/wemark/wemark')

Page({
  data: {
    liveId: 0,
    live: {},
    attendedUsers: [],
    btnTitle: '',
    wemark: {},
    wemarkDetail: {}
  },
  onLoad: function (query) {
    this.setData({
     liveId:query.liveId
    })

    this.loadLive()

    api.get('lives/' + this.data.liveId + '/users', {
      limit: 7
    }, (data) => {
      this.setData({
        attendedUsers: data
      })
    })
  },
  loadLive() {
    util.loading()
    api.get('lives/' + this.data.liveId, null,
       (data) => {
         util.loaded()

         this.setData({
           live: data,
           btnTitle: this.btnTitle(data)
         })

         wemark.parse(data.speakerIntro, this, {
           imageWidth: wx.getSystemInfoSync().windowWidth - 40,
           name: 'wemark'
         })

         wemark.parse(data.detail, this, {
           imageWidth: wx.getSystemInfoSync().windowWidth - 40,
           name: 'wemarkDetail'
         })
      })
  },
  onReady() {
  },
  attendLive() {
    this.payOrCreateAttend()
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
  },
  goLive() {
    wx.navigateTo({
      url: '../live/live?liveId=' + this.data.liveId
    })
  },
  payOrCreateAttend() {
    if (this.data.live.needPay) {
      this.pay()
    } else {
      this.createAttend()
    }
  },
  pay() {
    util.loading()
    return api.post('attendances/create', {
      liveId: this.data.liveId,
      channel: 'wechat'
    }, (data) => {
      util.loaded()

      wx.requestPayment({
        timestamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        paySign: data.paySign,
        signType: data.signType,
        success: (res) => {
          util.toast('支付成功')
        },
        fail: (res) => {
          util.toast('支付失败')
          console.log(res)
        }
      })

    })
  },
  createAttend() {
    util.loading()
    api.post('attendances/create', {
      liveId: this.liveId
    }, (data) => {
      util.loaded()
      util.show('报名成功')
      this.goLive()
    })
  }
})
