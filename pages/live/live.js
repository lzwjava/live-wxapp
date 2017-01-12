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
    videos: []
  },
  onLoad: function (query) {
    this.setData({
     liveId: query.liveId
    })
    this.loadLive()
  },
  onReady () {
  },
  videoSrc() {
    var live = this.data.live;
    if (live.status == 20) {
      return live.hlsUrl
    } else if (live.status == 30) {
      return this.videos[this.data.videoSelected].url
    }
    return live.hlsUrl
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
                  videoSrc: this.videoSrc()
                })

         })
         
      })
  }
})
