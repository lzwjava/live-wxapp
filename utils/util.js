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

function statusText (status) {
  switch (status) {
    case 1:
      return '编辑中';
    case 5:
      return '审核中';
    case 10:
      return '报名中';
    case 20:
      return '直播中';
    case 25:
      return '转码中';
    case 30:
      return '已结束';
    case 35:
      return '已结束';
  }
  return '未知';
}

function shareData(live) {
  return {
   title: live.owner.username + '在趣直播：' + live.subject,
   desc: '来自趣直播-知识直播平台',
   path: '/pages/intro/intro?liveId=' + live.liveId
 }
}

function shareDataAtLive(live) {
  return {
   title: live.owner.username + '在趣直播：' + live.subject,
   desc: '来自趣直播-知识直播平台',
   path: '/pages/live/live?liveId=' + live.liveId
 }
}

function appShareData() {
  return {
    title: '趣直播-知识直播平台',
    desc: '邀请了大咖来分享知识或经历',
    path: '/pages/index/index'
  }
}

module.exports = {
  formatTime: formatTime,
  timeGap: timeGap,
  loading: loading,
  loaded: loaded,
  toast: toast,
  showError: showError,
  statusText: statusText,
  shareData: shareData,
  appShareData: appShareData,
  shareDataAtLive: shareDataAtLive
}
