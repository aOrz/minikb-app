//index.js
let date = new Date();
let year = date.getFullYear();
let grade = [];
for (let i = 0; i < 5; i++) {
  grade.push({
    value: year % 2000,
    label: year + '级'
  });
  year--;
}
let arr = [{
  label: '烟台大学',
  value: 'yd',
  children: []
}, {
  label: '文经学院',
  value: 'wj',
  children: []
}];
let yd = ['EIE',
  '专国',
  '中',
  '体',
  '光',
  '化',
  '土',
  '外',
  '应',
  '建',
  '数',
  '新',
  '机',
  '材',
  '汉教',
  '法',
  '海',
  '环',
  '生',
  '经',
  '药',
  '计',
  '音',
  '食'
];
let wj = ['中',
  '会',
  '信',
  '外',
  '建',
  '文专中',
  '文专会',
  '文专商',
  '文专土',
  '文专市',
  '文专房',
  '文专机',
  '文专英',
  '文专财',
  '文专贸',
  '文中',
  '文会',
  '文公',
  '文商',
  '文土',
  '文市',
  '文投',
  '文新',
  '文日',
  '文朝',
  '文机',
  '文法',
  '文环',
  '文生',
  '文电',
  '文自',
  '文英',
  '文视',
  '文计',
  '文财',
  '文贸',
  '文车',
  '文通',
  '文金',
  '文食',
  '机',
  '管',
  '经',
  '食'
];
for (let i = 0; i < yd.length; i++) {
  arr[0].children.push({
    label: yd[i],
    value: yd[i],
    children: grade
  });
}
for (let i = wj.length - 1; i >= 0; i--) {
  arr[1].children.push({
    label: wj[i],
    value: wj[i],
    children: grade
  });
}
//获取应用实例
var app = getApp()
Page({
  data: {
    classList: [],
    classId: 0,
    schools: arr,
    academe: arr[0].children,
    grade: arr[0].children[7].children,
    selectValue: { school: arr[0], academe: arr[0].children[7], grade: arr[0].children[7].children[2] },
    pickerValue: [0, 7, 2],
    isShowPicker: false
  },
  onReady() {
    let options = this.options;
    wx.setNavigationBarTitle({
      title: '迷你课表'
    });
  },
  showPicker() {
    this.setData({
      isShowPicker: !this.data.isShowPicker
    });
  },
  selectChange: function (e) {
    let val = e.detail.value;
    this.setData({
      pickerValue: val,
      academe: arr[val[0]].children,
      grade: arr[val[0]].children[val[1]].children,

    });
    // console.log(this.data.selectValue)
  },
  pickerSelected() {
    const val = this.data.pickerValue;
    this.setData({
      academe: arr[val[0]].children,
      grade: arr[val[0]].children[val[1]].children,
      selectValue: {
        school: arr[val[0]],
        academe: arr[val[0]].children[val[1]],
        grade: arr[val[0]].children[val[1]].children[val[2]]
      },
      classId: 0,
      isShowPicker: false
    });
    this.getClassName();
  },
  getClassName: function () {
    let that = this;
    let { school, academe, grade } = this.data.selectValue;
    if (wx.canIUse('showLoading')) {
      wx.showLoading({
        title: '狂奔中~',
        mask: true
      })
    }
    wx.request({
      url: `https://kbs.fddcn.cn/controller/course_controller.php?c=Getclass&schoolName=${school.value}&school_info=${academe.value}${grade.value}`,
      header: {
        'content-type': 'application/json'
      },
      complete: function () {
        if (wx.canIUse('hideLoading')) {
          wx.hideLoading();
        }
      },
      success: function (res) {
        that.setData({
          classList: res.data
        });
        if (!res.data[0]) {
          wx.showModal({
            title: '换个年级学院试试？',
            content: '没有找到对应的班级',
            success: function (res) { }
          })
        }
      },
      fail() {
        wx.showModal({
          title: '请求失败',
          content: '请检查网络后重试',
          success: function (res) { }
        })
      }
    })
  },
  search: function () {
    let { school, academe, grade } = this.data.selectValue;
    let { classList, classId } = this.data;
    wx.navigateTo({
      url: `../course/index?schoolName=${school.value}&academe=${academe.value}&class=${classList[classId].match(/\d.*/)}`
    })
  },
  pickerClassChange(e) {
    this.setData({
      classId: e.detail.value
    })
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    });
    this.getClassName();
  }
})
