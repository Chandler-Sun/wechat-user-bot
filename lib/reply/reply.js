'use strict'

var MSGTYPE_TEXT = require('../global.js').MSGTYPE_TEXT;
var MSGTYPE_APP = require('../global.js').MSGTYPE_APP;
var robotReply = require('./dialog.js').bookmarker;
var webwxsendmsg = require('../webwx.js').webwxsendmsg;
var webwxbatchgetcontact = require('../webwx.js').webwxbatchgetcontact;
var convertEmoji = require('../util.js').convertEmoji;
var URL = require('url');
var Crawler = require("crawler");
var linkify = require('linkifyjs');
var siteConfig = require('../../config/annocom.js')

function generateReply(wxSession) {
  return o=>{
    var reply;
    switch (o.MsgType) {
        case MSGTYPE_TEXT:
            reply = generateTextMessage(o, wxSession);
            break;
        case MSGTYPE_APP:
            console.log(JSON.stringify(o));
            o.Content = o.FileName + " " + o.Url;
            reply = generateTextMessage(o, wxSession);
            break;
        default:
            generateNotImplementMsg(o, wxSession, "generateReply");
    }
    return reply;
  }
}

function generateTextMessage(o, wxSession) {

  function _sendContent(o) {
    // 回复
    var username = o.FromUserName;  // 闭包,防止串号，血泪教训
    var replyPromise = robotReply(o.Content, o.FromUserName, wxSession);
    // add then
    replyPromise.then((text)=>{
      console.log('[Robot]'+text)
      webwxsendmsg(text, username, wxSession);
    }).catch((e) => {
      console.log(e)
    })
  }
  
  _sendContent(o);

  return o; // transducer if you like, however I won't
}

function generateNotImplementMsg(o, wxSession, context) {
  console.error("[" + context + "]未实现回复生成类型: " + o.MsgType + " " + JSON.stringify(o));
}

module.exports.generateReply = generateReply;
