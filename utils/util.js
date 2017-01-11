var moment =  require('../lib/moment-timezone')
moment.locale('zh-cn')

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function timeGap(ts) {
  var text = moment.tz(ts, "YYYY-MM-DD hh:mm::ss", 'Asia/Shanghai').fromNow()
  if (text) {
    text = text.replace(/[\u5185]/g, '后')
    text = text.replace(' ', '')
  }
  return text
}

function loading() {
  wx.showToast({
    title: '加载中',
    icon: 'loading',
    duration: 0
  })
}

function loaded() {
   wx.hideToast()
}

function toast(content) {
  wx.showToast({
    title: content,
    icon: 'success',
  })
  setTimeout(function(){
    wx.hideToast()
  }, 2000)
}

function showError(content) {
  if (!content) {
    content = '未知错误'
  }
  wx.showModal({
    title: '出错啦~',
    content: content,
    success: function(res) {
      if (res.confirm) {
        console.log('用户点击确定')
      }
    }
  })
}

module.exports = {
  formatTime: formatTime,
  timeGap: timeGap,
  loading: loading,
  loaded: loaded,
  toast: toast,
  showError: showError
}
