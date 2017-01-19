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
    wemarkDetail: {},
    statusText: ''
  },
  onLoad (query) {

    console.log('onLoad liveId: ' + query.liveId)
    this.setData({
     liveId: query.liveId
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
  onReady (){
  },
  loadLive(cb) {
    util.loading()
    api.get('lives/' + this.data.liveId, null,
       (data) => {
         util.loaded()

        wx.setNavigationBarTitle({
          title: data.owner.username + '的直播'
        })

         wemark.parse(data.speakerIntro, this, {
           imageWidth: wx.getSystemInfoSync().windowWidth - 40,
           name: 'wemark'
         })

         wemark.parse(data.detail, this, {
           imageWidth: wx.getSystemInfoSync().windowWidth - 40,
           name: 'wemarkDetail'
         })

         this.setData({
           live: data
         })

         this.setData({
            btnTitle: this.btnTitle(data),
            statusText: this.statusText()
         })

         cb && cb()

      }
    )
  },
  attendLive() {
    if (this.data.live.canJoin) {
      wx.navigateTo({
        url: '../live/live?liveId=' + this.data.liveId
      })
    } else {
      this.payOrCreateAttend()
    }
  },
  statusText()  {
    return util.statusText(this.data.live.status)
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
      channel: 'wechat_app'
    }, (data) => {
      util.loaded()

      console.log('pay data')
      console.log(data)

      wx.requestPayment({
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        paySign: data.paySign,
        signType: data.signType,
        success: (res) => {
          util.toast('报名成功')
          this.loadLive(() => {
            this.goLive()
          })
        },
        fail: (res) => {
          console.log(res)
          if (res.err_desc) {
            util.showError('支付失败: ' + res.err_desc)
          } else {
            util.showError('支付失败')
          }
        }
      })

    })
  },
  createAttend() {
    util.loading()
    api.post('attendances/create', {
      liveId: this.data.liveId
    }, (data) => {
      util.loaded()
      util.show('报名成功')
      this.goLive()
    })
  }
})
