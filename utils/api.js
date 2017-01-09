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
      success: function(res){
        console.log(res.data)
        if (res.status == 'success') {
          successFn(res.data)
        } else {
          failFn(res.status, res.error)
        }
      },
      fail: function() {
        failFn('network_error', res.error)
      },
      complete: function() {
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
