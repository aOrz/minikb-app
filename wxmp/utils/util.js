function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// Storage can be unavailable or contain stale/non-array values.
function readLogs(storage) {
  try {
    var logs = storage.getStorageSync('logs')
    return Array.isArray(logs) ? logs : []
  } catch (error) {
    return []
  }
}

module.exports = {
  readLogs: readLogs,
  formatTime: formatTime
}
