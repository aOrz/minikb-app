const http = require('http');
let ydEtag = '';
let send = require('../sendMessage');
const schedule = require('node-schedule');
const downYd = require('./download');

function scheduleCronstyle() {
  schedule.scheduleJob('* * 1 * * *', function() {
    // YD
    http.get('http://jwc.ytu.edu.cn/xk/bjkb.rar', (res, err) => {
      if (res.headers.etag !== ydEtag && ydEtag != '') {
        ydEtag = res.headers.etag;
        send('检测到烟大课表更新啦!', '', 1);
        downYd();
      } else {
        ydEtag = res.headers.etag;
        send('检测到烟大课表未更新', ydEtag);
      }
    });

    http.get('http://jiaowu.wenjing.ytu.edu.cn/index.php/portal/article/index/id/2799', res => {
      var body = '';

      res.on('data', function(d) {
        body += d;
      });
      // WJ
      res.on('end', () => {
        if (
          body.indexOf('http://jiaowu.wenjing.ytu.edu.cn/data/upload/ueditor/20170809/598ac3c6108c0.rar') < 0 &&
          body.length > 500
        ) {
          send('文经课表更新啦', body, 1);
        } else {
          send('文经课表未更新', '', 0);
        }
      });
      // console.log(res.res)
    });
  });
}

scheduleCronstyle();
