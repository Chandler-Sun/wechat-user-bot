var SITE_SELF = require('./dialog.js').SITE_SELF;
var requestShortURL = require('./dialog.js').requestShortURL;
var siteConfig = require('../../config/annocom.js');
var webwxsendmsg = require('../webwx.js').webwxsendmsg;
var util = require('util')
var Queue = require('bull')

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
      if(job.data.source=='wechat' && job.data.groupID){
        var longURL = SITE_SELF + '?url=' + encodeURIComponent(job.data.msg.resource.url) + '&group_id=' + encodeURIComponent(job.data.groupID) + '&source=wechat&annotation_id=' + encodeURIComponent(job.data.msg.comment.annotation)
        requestShortURL(longURL, function(err, tinyurl){
          if (err) return done(err)

          var msg = util.format('%s 在《%s》里评论了%s个字，详情：%s\n %s', 
          job.data.sender, 
          job.data.msg.resource.title, 
          job.data.msg.comment.content.length, 
          tinyurl,
          job.data.recipients.join(' '))
          webwxsendmsg(msg, job.data.groupID, wxSession);
          done();
        })
      }else{
        done(null, {msg:'not wechat group, ignored'})
      }
    })
  })
}



module.exports.messageQueue = messageQueue