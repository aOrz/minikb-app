const http = require('http');
let ydEtag = '';
let key = require('./config.js').key
var schedule = require('node-schedule');

function scheduleCronstyle() {
	schedule.scheduleJob('* 1 * * * *', function() {
        // YD
		http.get('http://jwc.ytu.edu.cn/xk/bjkb.rar', (res, err) => {
			if (res.headers.etag !== ydEtag && ydEtag != '') {
				ydEtag = res.headers.etag;
				http.get('http://pushbear.ftqq.com/sub?sendkey=' + key +'&text=' + encodeURIComponent('烟大课表更新啦~'));
			}
        });
        
        http.get('http://jiaowu.wenjing.ytu.edu.cn/index.php/portal/article/index/id/2799', res => {
            var body = '';

            res.on('data', function(d) {
            body += d;
            });
            // WJ
            res.on('end', () => {
                if (body.indexOf('http://jiaowu.wenjing.ytu.edu.cn/data/upload/ueditor/20170809/598ac3c6108c0.rar') <0 && body.length > 500) {
                        var str = body.substr(0, 70)
                        http.get('http://pushbear.ftqq.com/sub?sendkey=' + key +'&text=' + encodeURIComponent('文经课表更新啦~') + '&desp=' + encodeURIComponent(str));
                }
            })
            // console.log(res.res)
        })
	});
}

scheduleCronstyle();
