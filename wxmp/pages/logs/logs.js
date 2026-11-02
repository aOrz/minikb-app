//logs.js
var util = require('../../utils/util.js')
Page({
  data: {
    logs: []
  },
  onLoad: function () {
    this.setData({
      logs: util.readLogs(wx).map(function (log) {
        return util.formatTime(new Date(log))
      })
    })
  }
})
