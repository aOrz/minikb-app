//app.js
var util = require('./utils/util.js')
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = util.readLogs(wx)
    logs.unshift(Date.now())
    try {
      wx.setStorageSync('logs', logs)
    } catch (error) {
      // Logging is optional when storage is full or unavailable.
    }
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null
  }
})