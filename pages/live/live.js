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
    toView: ''
  },
  isLoading: false,
  messageIterator:{},
  client: {},
  conv: {},
  cachedUsers: {},
  isSending: false,
  onLoad (query) {
    this.setData({
     liveId: query.liveId
    })
    var app = getApp()
    this.setData({
      curUser: app.globalData.currentUser
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
  loadLive(cb) {
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
                this.openClient()
                cb && cb()
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
    this.loadLive(() => {
      this.canPlayClick()
    })
  },
  addSystemMsg(msg) {
    var textMsg = new TextMessage(msg)
    textMsg.setAttributes({username:'系统'})
    textMsg.from = '0'
    this.addMsg(textMsg)
  },
  convertMsg(lcMsg) {
    var msg = {}
    msg.id = lcMsg.id
    msg.type = lcMsg.type
    msg.attributes = {}
    msg.attributes.username = lcMsg.attributes.username
    msg.text = lcMsg.text
    return msg
  },
  addMsg(msg) {
    var msgs = []
    msgs.push(msg)
    this.addMsgs(msgs)
  },
  addMsgs(msgs, insertBefore, cb) {
    var userIds = []
    msgs.forEach((msg) => {
      userIds.push(msg.from)
    })

    this.cacheUsers(userIds, () => {
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
      this.setData({
        msgs: newMsgs
      })
    })
  },
  openClient() {
    this.addSystemMsg('正在连接聊天服务器...')
    realtime.createIMClient(this.data.curUser.userId + '')
      .then((client) => {

        this.client = client

        this.addSystemMsg('聊天服务器连接成功')
        // this.registerEvent()
        this.fetchConv()
      }).catch(this.handleError)
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
      this.addMsgs(result.value)

      this.scrollToBottom()

    }).catch(this.handleError)
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
      util.loaded()
      if (result.done) {
        util.toast('没有更多消息了')
      }
      var firstMsgId
      if (this.data.msgs.length > 0) {
        firstMsgId = this.data.msgs[0].id
      }

      this.addMsgs(result.value, true)

      setTimeout(() => {
        if (firstMsgId) {
          this.setData({
            toView: firstMsgId
          })
        }
      }, 100)
    }, (error) => {
      this.isLoading = false
      util.loaded()
      this.handleError(error)
    })
  },
  lower(e) {
    // console.log(e)
  },
  scroll(e) {
    // console.log(e)
  },
  sendMsg(e) {
    if(!this.data.inputMsg) {
      utils.toast('请输入点什么~')
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
    this.setData({
      inputMsg: e.detail.value
    })
  },
  showRewardForm() {
  },
  cacheUsers(userIds, cb) {
    var i
    var nonCacheIds = []
    userIds.forEach((userId) => {
      if (this.cachedUsers[userId] == null) {
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
  }
})
