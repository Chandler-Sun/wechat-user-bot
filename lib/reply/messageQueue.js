const SITE_SELF = require('./dialog.js').SITE_SELF;
const requestShortURL = require('./dialog.js').requestShortURL;
const siteConfig = require('../../config/annocom.js');
const webwxsendmsg = require('../webwx.js').webwxsendmsg;
const util = require('util')
const Queue = require('bull')
const apn = require('apn')
const path = require('path');

const options = {
  pfx: path.resolve(__dirname,'../../config/AnnoPush.p12'),
  production: false,
};

let apnProvider = new apn.Provider(options);

function sendMessageToWeChat(job, tinyurl, wxSession){
  if(job.data.source=='wechat' && job.data.groupID){
    let uniqUsernames = job.data.recipients.map(r=>'@'+r.fullname.toLowerCase())
    uniqUsernames = Array.from(new Set(uniqUsernames))
    var msg = util.format('%s 在《%s》里评论了%s个字，详情：%s%s%s', 
    job.data.sender, 
    job.data.msg.resource.title, 
    job.data.msg.comment.content.length, 
    tinyurl,
    uniqUsernames.length==0?'':'\n',
    uniqUsernames.join(' '))
    webwxsendmsg(msg, job.data.groupID, wxSession);
  }
}

function sendAPNs(job, tinyurl, wxSession){
  let uniqUserTokens = job.data.recipients.map(r=>r.deviceToken)
  uniqUserTokens = Array.from(new Set(uniqUserTokens)).filter((item)=>!!item)
  if(uniqUserTokens.length){
    var msg = util.format('%s 在《%s》里评论了%s个字', 
    job.data.sender, 
    job.data.msg.resource.title, 
    job.data.msg.comment.content.length)
    var apnMsg = new apn.Notification();
    apnMsg.expiry = Math.floor(Date.now() / 1000) + 3600 // Expires 1 hour from now.
    apnMsg.badge = 1
    apnMsg.sound = "ping.aiff"
    apnMsg.alert = msg
    apnMsg.payload = {'url': tinyurl, 'article_key':job.data.msg.resource.key}
    // note.topic = "<your-app-bundle-id>"
    apnProvider.send(apnMsg, uniqUserTokens).then(result=>{
      console.log('sent apn message:',result)
    }).catch(e=>console.log(e))
  }else{
    console.log('no device token found, apn skipped.')
  }
}

function messageQueue(wxSession) {
  console.log("初始化消息队列...")
  return new Promise((resolve, reject)=> {

    var messageQueueWeChat = Queue('notification_of_comments', siteConfig.redis.port, siteConfig.redis.host)
    messageQueueWeChat.on('ready', function() {
      console.log("开始监听消息队列...")
      resolve(wxSession)
    })

    messageQueueWeChat.on('error', function(err) {
      reject(err)
    })

    messageQueueWeChat.process(function(job, done) {
      if(job.data.source){
        var longURL = util.format('%s?url=%s&group_id=%s&source=%s&annotation_id=%s',
          SITE_SELF,
          encodeURIComponent(job.data.msg.resource.url),
          encodeURIComponent(job.data.groupID),
          encodeURIComponent(job.data.source),
          encodeURIComponent(job.data.msg.comment.annotation)
        )
        requestShortURL(longURL, function(err, tinyurl){
          if (err) return done(err)
          sendMessageToWeChat(job, tinyurl, wxSession)
          sendAPNs(job, tinyurl, wxSession)
          done();
        })
      }else{
        done(null, {msg:'not wechat group, ignored'})
      }
    })
  })
}



module.exports.messageQueue = messageQueue