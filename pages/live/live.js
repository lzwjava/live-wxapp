var util = require('../../utils/util')
var api = require('../../utils/api')
var wemark = require('../../lib/wemark/wemark')
var lcChat = require('../../lib/realtime.weapp.min.js')
var inherit = require('../../lib/inherit')

var Realtime = lcChat.Realtime
var TextMessage = lcChat.TextMessage
var messageType = lcChat.messageType
var TypedMessage = lcChat.TypedMessage

const WxAudioMessage = inherit(TypedMessage)
var WxAudioType = 1
messageType(WxAudioType)(WxAudioMessage)

const SystemMessage = inherit(TypedMessage)
var SystemMessageType = 2
messageType(SystemMessageType)(SystemMessage)

const RewardMessage = inherit(TypedMessage)
var RewardMessageType = 3
messageType(RewardMessageType)(RewardMessage)

var prodAppId = 's83aTX5nigX1KYu9fjaBTxIa-gzGzoHsz'

var realtime = new Realtime({
  appId: prodAppId,
  region: 'cn',
  noBinary: true
})

realtime.register(WxAudioMessage)
realtime.register(SystemMessage)
realtime.register(RewardMessage)

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
    currentTab: 0,
    msgs: [],
    inputMsg: '',
    curUser: {},
    toView: '',
    canSend: false,
    unreadCount: 0,
    onlineNum: 0,
    noticeContent: '',
    animation: {}
  },
  isLoading: false,
  messageIterator:{},
  client: {},
  conv: {},
  cachedUsers: {},
  isSending: false,
  scrollHeight: 0,
  scrollTop: 0,
  offsetHeight: 1000,
  fetchIntervalId: 0,
  liveViewId: 0,
  endIntervalId: 0,
  onLoad (query) {
    this.setData({
     liveId: query.liveId
    })
    var app = getApp()
    this.setData({
      curUser: app.globalData.currentUser
    })

    this.cacheUsers([0])

    this.loadLive()
  },
  onReady () {
    this.videoContext =  wx.createVideoContext('myVideo')
  },
  onShow() {

  },
  onHide() {
    console.log('onHide')
  },
  onUnload() {
    console.log('onUnload')
    if (this.fetchIntervalId) {
      clearInterval(this.fetchIntervalId)
      this.fetchIntervalId = 0
    }
    this.endLiveView()
    this.endInterval()
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
  defaultNotice() {
      return '\n可长按二维码加微信进用户群和主播聊聊：\n\n' +
      ' ![wechat_lzw_short.png](http://i.quzhiboapp.com/qrcode_me_small.jpg)'
  },
  reloadLive(cb) {
    util.loading()
    api.get('lives/' + this.data.liveId, null,
       (live) => {
         util.loaded()
         this.setData({
           live: live
         })
         cb && cb()
      })
  },
  loadLive(cb) {
    util.loading()
    api.get('lives/' + this.data.liveId, null,
       (live) => {
         api.get('lives/' + this.data.liveId + '/videos',
              null, (videos) => {
                util.loaded()

                wx.setNavigationBarTitle({
                  title: live.owner.username + '的直播'
                })

                wemark.parse(live.notice + this.defaultNotice(), this, {
                  imageWidth: wx.getSystemInfoSync().windowWidth / 2,
                  name: 'noticeContent'
                })

                this.setData({
                  live: live,
                  videos: videos
                })

                this.setData({
                  videoSrc: this.videoSrc(),
                  changeTitle: this.changeTitle()
                })

                this.startLiveView(live)
                this.endInterval()

                this.endIntervalId = setInterval(() => {
                  this.endLiveView()
                }, 1000 * 30)

                this.openClient()
                cb && cb()
         })
      })
  },
  canPlayClick() {
    this.animation = wx.createAnimation({
      duration: 500
    })
    this.animation.opacity(1).rotate(360).step()
    var data = this.animation.export()

    this.setData({
      animation: data
    })

    this.setData({
      playStatus: 1
    })
    setTimeout(() => {
      this.videoContext.play()
    }, 0)
    setTimeout(() => {
      this.setData({
        playStatus: 2
      })
    }, 500)
  },
  showChatTab() {
    this.setData({
      currentTab: 0
    })
  },
  showIntroTab() {
    var pages = getCurrentPages()
    var lastPage = pages[pages.length - 2]

    if (lastPage.__route__ == 'pages/intro/intro') {
      wx.navigateBack()
    } else {
      wx.navigateTo({
        url: '../intro/intro?liveId=' + this.data.liveId
      })
    }
  },
  showNoticeTab() {
    this.setData({
      currentTab: 1
    })
  },
  changeLiveUrl() {
    this.reloadLive(() => {
      this.canPlayClick()
    })
  },
  addSystemMsg(msg) {
    var textMsg = new TextMessage(msg)
    textMsg.setAttributes({username:'系统'})
    textMsg.from = '0'
    this.addMsg(textMsg)
  },
  convertId(msgId) {
    return msgId.replace(/\+/g, '')
  },
  convertMsg(lcMsg) {
    var msg = {}
    msg.id = this.convertId(lcMsg.id)
    msg.type = lcMsg.type
    msg.attributes = {}
    if (!lcMsg.attributes) {
      lcMsg.attributes = {}
    }
    msg.attributes.username = lcMsg.attributes.username
    msg.text = lcMsg.text
    return msg
  },
  addMsg(msg) {
    var msgs = []
    msgs.push(msg)
    this.cacheAndAndMsgs(msgs)
  },
  cacheAndAndMsgs(msgs, insertBefore, cb) {
    this.cacheMsgs(msgs, () => {
      this.addMsgs(msgs, insertBefore, cb)
    })
  },
  addMsgs(msgs, insertBefore, cb) {
    var cMsgs = []
    msgs.forEach((msg) => {
      var cMsg = this.convertMsg(msg)
      cMsg.from = this.cachedUsers[msg.from]
      cMsgs.push(cMsg)
    })
    var newMsgs
    if (insertBefore) {
      newMsgs = cMsgs.concat(this.data.msgs)
    } else {
      newMsgs = this.data.msgs.concat(cMsgs)
    }
    var toView
    if (insertBefore) {
      // 加载的旧消息的最后一条
      if (cMsgs.length > 0 ) {
        var lastMsg = cMsgs[cMsgs.length - 1]
        toView = lastMsg.id
      }
    } else {
      // 所有消息的最后一条
      if (newMsgs.length > 0) {
        var lastMsg = newMsgs[newMsgs.length - 1]
        toView = lastMsg.id
      }
    }

    var toScroll
    if (insertBefore || (this.offsetHeight == 1000) ||
        (this.scrollHeight < this.scrollTop + this.offsetHeight + 100)) {
      toScroll = true
    } else {
      toScroll = false
    }

    if (!insertBefore) {
      if (!toScroll) {
        this.setData({
          unreadCount: (this.data.unreadCount + 1)
        })
      }
    }

    this.setData({
      msgs: newMsgs
    })
    if (toView && toScroll) {
      setTimeout(() => {
        this.setData({
          toView: toView
        })
      }, 0)
    }
    cb && cb()
  },
  openClient() {
    this.addSystemMsg('正在连接聊天服务器...')
    realtime.createIMClient(this.data.curUser.userId + '')
      .then((client) => {

        this.client = client

        this.addSystemMsg('聊天服务器连接成功')
        this.registerEvent()
        this.fetchConv()
      }).catch(this.handleError)
  },
  registerEvent() {
    this.client.on('message', (message, conversation) => {
      if (message.type == TextMessage.TYPE) {
        this.addMsg(message)
      } else if (message.type == SystemMessageType){
        this.addMsg(message)
      } else if (message.type == RewardMessageType) {
        this.addMsg(message)
      } else {
        this.addSystemMsg('此消息暂不支持显示')
      }
    })
  },
  fetchConv() {
    this.client.getConversation(this.data.live.conversationId)
    .then((conv) => {
      if (conv == null) {
        this.handleError('获取对话失败');
        return
      }
      this.conv = conv
      return this.conv.join()
    }).then(() => {
      this.addSystemMsg('正在加载聊天记录...')
      var messageIterator = this.conv.createMessagesIterator({ limit: 100 })
      this.messageIterator =  messageIterator
      return this.messageIterator.next()
    }).then((result)=> {
      if (result.done) {
      }
      this.cacheAndAndMsgs(result.value, false, () => {

      })

      this.fetchCount()
      this.fetchIntervalId = setInterval(() => {
        this.fetchCount()
      }, 5 * 1000)

    }).catch(this.handleError)
  },
  fetchCount() {
    this.conv.count()
     .then((cnt) => {
       this.setData({
         onlineNum: cnt
       })
     })
  },
  scrollToBottom() {
    if (this.data.msgs.length > 0) {
      var lastMsgId = this.data.msgs[this.data.msgs.length - 1].id
      this.setData({
        toView: lastMsgId
      })
    }
  },
  handleError(error) {
    if (typeof error != 'string') {
        error = JSON.stringify(error)
    }
    util.showError(error)
  },
  upper(e) {
    if (this.isLoading) {
      return
    }
    this.isLoading = true
    util.loading()
    this.messageIterator.next().then((result) => {
      this.isLoading = false

      if (result.done) {
        util.loaded()
        util.toast('没有更多消息了')
        return
      }
      var firstMsgId
      if (this.data.msgs.length > 0) {
        firstMsgId = this.data.msgs[0].id
      }

      this.cacheMsgs(result.value, () => {
        util.loaded()
        this.addMsgs(result.value, true, () => {

        })
      })
    }, (error) => {
      this.isLoading = false
      util.loaded()
      this.handleError(error)
    })
  },
  lower(e) {
    console.log(e)
    this.setData({
      unreadCount: 0
    })
  },
  scroll(e) {
    this.scrollHeight = e.detail.scrollHeight
    this.scrollTop = e.detail.scrollTop
    if (this.scrollHeight - this.scrollTop < this.offsetHeight) {
      this.offsetHeight = this.scrollHeight - this.scrollTop
    }
  },
  sendMsg(e) {
    if(!this.data.inputMsg) {
      util.toast('请输入点什么~')
      return
    }
    var textMsg = new TextMessage(this.data.inputMsg)
    textMsg.setAttributes({username:this.data.curUser.username})
    this.commonSendMsg(textMsg, (msg) => {
       this.scrollToBottom()
       this.setData({
         inputMsg: ''
       })
     })
  },
  commonSendMsg(msg, cb) {
    if (this.isSending) {
      util.toast('请等待上一条消息发送完成');
      return
    }
    this.isSending = true
    this.conv.send(msg)
     .then((message) => {
        this.isSending = false
        this.addMsg(message)
        cb && cb(message)
      }, (error) => {
        this.isSending = false
        this.handleError(error)
      })
  },
  msgInput(e) {
    var inputMsg = e.detail.value
    var canSend
    if (inputMsg.trim().length > 0) {
      canSend = true
    } else {
      canSend = false
    }
    this.setData({
      inputMsg: inputMsg,
      canSend: canSend
    })
  },
  showRewardForm() {
  },
  cacheUsers(userIds, cb) {
    var i
    var nonCacheIds = []
    userIds.forEach((userId) => {
      if (this.cachedUsers[userId] == null &&
          nonCacheIds.indexOf(userId) == -1) {
            nonCacheIds.push(userId)
      }
    })
    this.findUsers(nonCacheIds, (users) => {
      users.forEach((user) => {
        this.cachedUsers[user.userId] = user
      })
      cb && cb()
    })
  },
  cacheMsgs(msgs, cb) {
    var userIds = []
    msgs.forEach((msg) => {
      userIds.push(msg.from)
    })
    this.cacheUsers(userIds, () => {
      cb && cb()
    })
  },
  findUsers(userIds, cb) {
    if (userIds.length == 0) {
      cb && cb([])
      return
    }
    api.post('users/list', {
      'userIds': JSON.stringify(userIds)
    }, (users) => {
      cb && cb(users)
    })
  },
  showNewMsgs() {
    this.scrollToBottom()
    this.setData({
      unreadCount: 0
    })
  },
  startLiveView(live) {
    api.post('liveViews', {
      liveId: live.liveId,
      platform: 'wechat_app',
      liveStatus: live.status
    }, (data) => {
      this.liveViewId = data.liveViewId
    })
  },
  endLiveView() {
    if (this.liveViewId != 0) {
      api.get('liveViews/' + this.liveViewId + '/end', null,
        (resp) => {

        }, (status, error) => {

        })
    }
  },
  endInterval() {
    if (this.endIntervalId != 0) {
      clearInterval(this.endIntervalId)
      this.endIntervalId =0
    }
  },
})
