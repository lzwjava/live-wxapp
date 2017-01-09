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

module.exports = {
  formatTime: formatTime,
  timeGap: timeGap
}
