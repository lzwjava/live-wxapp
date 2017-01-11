var util = require('./util')
var api = require('./api')

function wxPay()  {

}

function attendLiveAndPay(liveId) {
  util.loading()
  return api.post('attendances/create', {
    liveId: liveId,
    channel: 'wechat'
  }, (data) => {
    util.loaded()
    return wxPay(data)
  })
}

exports.attendLiveAndPay = attendLiveAndPay
