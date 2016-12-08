'use strict'

var getUUID = require('./lib/webwx.js').getUUID;
var checkAndParseUUID = require('./lib/webwx.js').checkAndParseUUID;
var showQRImage = require('./lib/webwx.js').showQRImage;
var checkLogin = require('./lib/webwx.js').checkLogin;
var parseRedirectUrl = require('./lib/webwx.js').parseRedirectUrl;
var login = require('./lib/webwx.js').login;
var getbaseRequest = require('./lib/webwx.js').getbaseRequest;
var webwxinit = require('./lib/webwx.js').webwxinit;
var messageQueue = require('./lib/reply/messageQueue.js').messageQueue;
var wechatLogger = require('./lib/logger/logger.js').wechatLogger;
var generateReply = require('./lib/reply/reply.js').generateReply;

var webwxgetcontact = require('./lib/webwx.js').webwxgetcontact;
var robot = require('./lib/robot.js').robot;

// display, which is a stream
var child_process = require('child_process');
var display = child_process.spawn('display');
var fs = require('fs');

var cachedWXSession = require('./config/wxSession.cache.json')

var serializeWXSession = function(wxSession) {
  return new Promise((resolve, reject)=>{
    fs.writeFile(__dirname+'/config/wxSession.cache.json', JSON.stringify(wxSession), (err)=>{
      if(err) return reject(err)
      resolve(wxSession)
    })
  })
}

if(cachedWXSession.BaseRequest){
  messageQueue(cachedWXSession).then(robot(
    [(wxSession)=>o=>true],
    [wechatLogger, generateReply]
    // [],
    // [wechatLogger]
  ))
  .catch((e)=>{
    console.error(e);
    fs.writeFileSync(__dirname+'/config/wxSession.cache.json', JSON.stringify({}))
    process.exit(1);
  });
}else{
  getUUID
    .then(checkAndParseUUID)
    .then(showQRImage(display))
    .then(checkLogin)
    .then(parseRedirectUrl)
    .then(login)
    .then(getbaseRequest)
    .then(webwxinit)
    .then(webwxgetcontact)
    .then(serializeWXSession)
    .then(messageQueue)
    .then(robot(
      [(wxSession)=>o=>true],
      [wechatLogger, generateReply]
      // [],
      // [wechatLogger]
    ))
    .catch((e)=>{
      console.error(e);
      fs.writeFile(__dirname+'/config/wxSession.cache.json', JSON.stringify({}))
      process.exit(1);
    });
}



