//index.js

//获取应用实例
var app = getApp()
Page({
  data: {
    course: [],
    options: {}
  },
  onReady() {
    let options = this.options;
    wx.setNavigationBarTitle({
      title: '迷你课表-' + options.academe + options.class
    });
  },
  onLoad: function (options) {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        options
      })
    });
    wx.request({
      url: `https://kbs.fddcn.cn/controller/course_controller.php?c=GetCourseByClassName&schoolName=${options.schoolName}&collegeName=${options.academe}&classNum=${options.class}`,
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        let courseObj = res.data[0];
        let course = [['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']];
        for (let i = 0; i < 6; i++) {
          course[i + 1] = [];
          let week = ['第' + (i + 1) + '大节'];
          for (let j = 0; j < 7; j++) {
            week.push(courseObj['s' + (i * 7 + j + 1)]);
          }
          course[(i + 1)] = week;
        }
        that.setData({
          course: course
        });
      }
    })
  }
})
