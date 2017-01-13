function apiErrorFn(status, error) {
  wx.hideToast()
  var content = error
  if (!content) {
    content = status
  }
  if (!content) {
    content = '未知错误'
  }
  wx.showModal({
    title: '出错了',
    content: content,
    success: function(res) {
      if (res.confirm) {
        console.log('用户点击确定')
      }
    }
  })
}

function request(path, method, params, successFn, failFn) {
    if (!failFn) {
       failFn = apiErrorFn
    }
    var baseUrl = 'https://api.quzhiboapp.com/'
    var data = {}
    if (params) {
      data = params
    }
    var header = {}

    var app = getApp()
    if (app.globalData.currentUser) {
      header['X-Session'] = app.globalData.currentUser.sessionToken
    }

    console.log(path)

    wx.request({
      url: baseUrl + path,
      data: data,
      header: header,
      method: method,
      success: (res) => {
        var resp = res.data
        console.log(resp)
        if (resp.status == 'success') {
          successFn(resp.result)
        } else {
          console.log('status error')
          failFn(resp.status, resp.error)
        }
      },
      fail: () => {
        console.log('request fail')
        failFn('network_error', res.error)
      },
      complete: () => {

      }
    })
}

function get(path, params, successFn, failFn) {
  request(path, 'GET', params, successFn, failFn)
}

function post(path, params, successFn, failFn) {
  request(path, 'POST', params, successFn, failFn)
}

module.exports = {
    get: get,
    post: post
}
