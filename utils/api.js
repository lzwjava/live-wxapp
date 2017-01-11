function apiErrorFn(status, error) {
  wx.hideToast()
  wx.showModal({
    title: '出错了',
    content: error,
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
    wx.request({
      url: baseUrl + path,
      data: data,
      method: method,
      success: (res) => {
        var resp = res.data
        if (resp.status == 'success') {
          successFn(resp.result)
        } else {
          failFn(resp.status, resp.error)
        }
      },
      fail: () => {
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
