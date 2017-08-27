const key = require('./config').key;
const http = require('http');

module.exports = function (title, desp) {
    desp = desp ? desp : new Date().toLocaleString();
    http.get('http://pushbear.ftqq.com/sub?sendkey=' + key +'&text=' + encodeURIComponent(title.substr(0, 170)) + '&desp=' + encodeURIComponent(desp.substr(0, 170)));
}