function request(path, method, params, successFn, failFn) {
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

function get(path, successFn, failFn) {
  request(path, 'GET', null, successFn, failFn)
}

function post(path, params, successFn, failFn) {
  request(path, 'POST', params, successFn, failFn)
}

module.exports = {
    get: get,
    post: post
}
