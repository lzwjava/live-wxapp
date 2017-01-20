Page({
  data: {
    user: {}
  },
  onLoad() {
    var app = getApp()
    this.setData({
      user: app.globalData.currentUser
    })
  },
  goMyLives() {
    wx.navigateTo({
      url: '../attended/attended'
    })
  }
})
