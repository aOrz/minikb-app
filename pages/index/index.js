//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    school: ['烟大', '文经'],
    index: 0
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    });
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
    wx.request({
      url: 'https://kbs.fddcn.cn/controller/course_controller.php?c=GetCourseByClassName&schoolName=wj&collegeName=%E6%96%87%E5%85%AC&classNum=135-1', //仅为示例，并非真实的接口地址
      data: {
         x: '' ,
         y: ''
      },
      header: {
          'content-type': 'application/json'
      },
      success: function(res) {
        console.log(res.data)
      }
    })
  }
})
