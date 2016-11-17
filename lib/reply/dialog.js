'use strict'
var request = require('request')
var siteConfig = require('../../config/annocom.js')
var Crawler = require('crawler')
var linkify = require('linkifyjs')
var async = require('async')
var Ent = require('ent')

var theCrawler = new Crawler({
  timeout: 30 * 1000,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
  referer: 'http://weixin.sogou.com/'
})

var SITE_SELF = siteConfig.siteURL + '/bookmark/bridge'

function bookmarker (content) {
  return new Promise((resolve, reject) => {
    var links = linkify.find(content)
    if (links.length > 0) {
      async.map(links, function (link, cb) {
        if (link.type === 'url') {
          var href = Ent.decode(link.href)
          theCrawler.queue({
            uri: href,
            callback: function (error, result, $) {
              if (error) {
                return cb(error)
              }

              if (!$) {
                return cb('content not supported.')
              }

              var msg = {
                title: $('title').text(),
                description: $('meta[name=description]').attr('content'),
                url: SITE_SELF + '?url=' + encodeURIComponent(href)
              }
              if ($('img').length > 0) {
                msg.picurl = $('img')[$('img').length - 1].src
              }

              var wechatArticleDesc = result.body.split('var msg_desc = ')[1]
              if (wechatArticleDesc) {
                wechatArticleDesc = wechatArticleDesc.split(';')[0].replace(/"/g, '')
                msg.description = wechatArticleDesc
              }

              var wechatArticleImage = result.body.split('var msg_cdn_url = ')[1]
              if (wechatArticleImage) {
                wechatArticleImage = wechatArticleImage.split(';')[0].replace(/"/g, '')
                msg.picurl = wechatArticleImage
              }
              requestShortURL(msg.url, function (err, tinyurl) {
                if (err) return cb(err)
                msg.tinyurl = tinyurl
                cb(null, msg)
              })
            }
          })
        }
      }, function (err, results) {
        if (err) {
          reject(err)
        } else {
          var msg = ''
          results.forEach(function (item) {
            // msg+="<a href='"+item.url+"'>"+item.title+"</a> "
            msg += '想详细讨论 ' + item.title + ' ？到这里：' + (item.tinyurl || item.url) + '\n'
          })
          resolve(msg)
        }
      })
    }
  })
}

function requestShortURL (longURL, callback) {
  var options = {
    method: 'GET',
    url: 'http://api.t.sina.com.cn/short_url/shorten.json',
    qs: {
      source: '3213676317',
      url_long: longURL
    }
  }
  request(options, function (error, response, body) {
    if (error) callback(error)
    var result = JSON.parse(body)
    console.log('tinyurl', body, result[0].url_short)
    callback(null, result[0].url_short)
  })
}
module.exports.bookmarker = bookmarker
