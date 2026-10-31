Page({
  data: {
    course: [],
    options: {},
    loading: false,
    error: ''
  },
  onReady() {
    const options = this.data.options;
    wx.setNavigationBarTitle({
      title: options.academe && options.class ? '迷你课表-' + options.academe + options.class : '迷你课表'
    });
  },
  onLoad(options) {
    // Route state must not depend on the optional profile permission callback.
    this.setData({ options: options || {} });
    this.loadCourse();
  },
  loadCourse() {
    const requestId = this._requestId = (this._requestId || 0) + 1;
    if (this._request && this._request.abort) this._request.abort();
    const options = this.data.options;
    this.setData({ course: [], error: '', loading: false });
    if (!['schoolName', 'academe', 'class'].every(key => typeof options[key] === 'string' && options[key].trim())) {
      this.setData({ error: '班级信息不完整，请返回重新选择' });
      return;
    }
    this.setData({ loading: true });
    this._request = wx.request({
      url: 'https://kbs.fddcn.cn/controller/course_controller.php',
      data: { c: 'GetCourseByClassName', schoolName: options.schoolName, collegeName: options.academe, classNum: options.class },
      header: { 'content-type': 'application/json' },
      success: (res) => {
        if (requestId !== this._requestId) return;
        if (!(res.statusCode >= 200 && res.statusCode < 300) || !Array.isArray(res.data)) {
          this.setData({ error: '课表数据异常，请重试' });
          return;
        }
        const courseObj = res.data[0];
        if (!courseObj || typeof courseObj !== 'object' || Array.isArray(courseObj) ||
            !Object.keys(courseObj).some(key => /^s([1-9]|[1-3][0-9]|4[0-2])$/.test(key))) {
          this.setData({ error: res.data.length ? '课表数据异常，请重试' : '没有找到对应的课表' });
          return;
        }
        const course = [['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']];
        for (let i = 0; i < 6; i++) {
          const week = ['第' + (i + 1) + '大节'];
          for (let j = 0; j < 7; j++) {
            const cell = courseObj['s' + (i * 7 + j + 1)];
            week.push(typeof cell === 'string' || typeof cell === 'number' ? String(cell) : '');
          }
          course.push(week);
        }
        this.setData({ course });
      },
      fail: () => {
        if (requestId === this._requestId) this.setData({ error: '请求失败，请检查网络后重试' });
      },
      complete: () => {
        if (requestId === this._requestId) this.setData({ loading: false });
      }
    });
  },
  onUnload() {
    this._requestId = (this._requestId || 0) + 1;
    if (this._request && this._request.abort) this._request.abort();
  }
});
