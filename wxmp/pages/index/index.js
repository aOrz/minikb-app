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
// Normalize dependent columns before reading a school's shorter department list.
function pickerIndices(value) {
  value = value || [];
  function indexAt(index, length) {
    index = Number(index);
    return index >= 0 && index < length && index % 1 === 0 ? index : 0;
  }
  const school = indexAt(value[0], arr.length);
  const academe = indexAt(value[1], arr[school].children.length);
  const grade = indexAt(value[2], arr[school].children[academe].children.length);
  return [school, academe, grade];
}

Page({
  data: {
    classList: [],
    classId: 0,
    loading: false,
    error: '',
    schools: arr,
    academe: arr[0].children,
    grade: arr[0].children[7].children,
    selectValue: { school: arr[0], academe: arr[0].children[7], grade: arr[0].children[7].children[2] },
    pickerValue: [0, 7, 2],
    isShowPicker: false
  },
  onReady() {
    wx.setNavigationBarTitle({ title: '迷你课表' });
  },
  showPicker() {
    this.setData({ isShowPicker: !this.data.isShowPicker });
  },
  selectChange(e) {
    let value = e.detail.value.slice();
    if (value[0] !== this.data.pickerValue[0]) value[1] = 0;
    const val = pickerIndices(value);
    this.setData({
      pickerValue: val,
      academe: arr[val[0]].children,
      grade: arr[val[0]].children[val[1]].children
    });
  },
  pickerSelected() {
    const val = pickerIndices(this.data.pickerValue);
    this.setData({
      pickerValue: val,
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
  getClassName() {
    const requestId = this._requestId = (this._requestId || 0) + 1;
    if (this._request && this._request.abort) this._request.abort();
    const { school, academe, grade } = this.data.selectValue;
    this.setData({ loading: true, error: '', classList: [], classId: 0 });
    this._request = wx.request({
      url: 'https://kbs.fddcn.cn/controller/course_controller.php',
      data: { c: 'Getclass', schoolName: school.value, school_info: academe.value + grade.value },
      header: { 'content-type': 'application/json' },
      success: (res) => {
        if (requestId !== this._requestId) return;
        if (!(res.statusCode >= 200 && res.statusCode < 300) || !Array.isArray(res.data) ||
            !res.data.every(item => typeof item === 'string' && item.trim())) {
          this.setData({ error: '班级数据异常，请重试' });
          return;
        }
        this.setData({
          classList: res.data,
          error: res.data.length ? '' : '没有找到对应的班级，请换个年级学院试试'
        });
      },
      fail: () => {
        if (requestId === this._requestId) this.setData({ error: '请求失败，请检查网络后重试' });
      },
      complete: () => {
        if (requestId === this._requestId) this.setData({ loading: false });
      }
    });
  },
  search() {
    const { school, academe } = this.data.selectValue;
    const { classList, classId, loading } = this.data;
    if (loading) return;
    const selected = classList[classId];
    const match = typeof selected === 'string' && selected.match(/\d.*/);
    if (!match) {
      this.setData({ error: '请选择有效班级后再查询' });
      return;
    }
    wx.navigateTo({
      url: '../course/index?schoolName=' + encodeURIComponent(school.value) +
        '&academe=' + encodeURIComponent(academe.value) + '&class=' + encodeURIComponent(match[0])
    });
  },
  pickerClassChange(e) {
    this.setData({ classId: e.detail.value });
  },
  onLoad() {
    // Public course lookup does not require access to a user's profile.
    this.getClassName();
  },
  onUnload() {
    this._requestId = (this._requestId || 0) + 1;
    if (this._request && this._request.abort) this._request.abort();
  }
});
