var util = require('../../utils/util')
var api = require('../../utils/api')
var wemark = require('../../lib/wemark/wemark')

Page({
  data: {
    liveId: 0,
    live: {},
    playStatus: 0,
    videoSelected: 0,
    videoSrc: '',
    videos: [],
    videoContext: {},
    changeTitle: '',
    currentTab: 0
  },
  onLoad: function (query) {
    this.setData({
     liveId: query.liveId
    })
    this.loadLive()
  },
  onReady () {
    this.videoContext =  wx.createVideoContext('myVideo')
  },
  videoSrc() {
    var live = this.data.live
    var videos = this.data.videos
    if (live.status == 20) {
      return live.hlsUrl
    } else if (live.status == 30) {
      return videos[this.data.videoSelected].url
    }
    return live.hlsUrl
  },
  changeTitle() {
    var live = this.data.live
    if (live.status < 30) {
      return '切换直播线路'
    } else {
      return '切换视频线路'
    }
  },
  loadLive() {
    util.loading()
    api.get('lives/' + this.data.liveId, null,
       (live) => {
         api.get('lives/' + this.data.liveId + '/videos',
              null, (videos) => {
                util.loaded()
                this.setData({
                  live: live,
                  videos: videos
                })
                this.setData({
                  videoSrc: this.videoSrc(),
                  changeTitle: this.changeTitle()
                })
         })
      })
  },
  canPlayClick() {
    this.setData({
      playStatus: 1
    })
    this.videoContext.play()
    setTimeout(() => {
      this.setData({
        playStatus: 2
      })
    }, 1000)
  },
  showChatTab() {
    this.setData({
      currentTab: 0
    })
  },
  showNoticeTab() {
    this.setData({
      currentTab: 1
    })
  },
  changeLiveUrl() {
    this.loadLive()
  }
})
