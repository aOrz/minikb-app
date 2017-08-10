const http = require('http');
let ydEtag = '';

var schedule = require('node-schedule');

function scheduleCronstyle() {
	schedule.scheduleJob('* 1 * * * *', function() {
        // YD
		http.get('http://jwc.ytu.edu.cn/xk/bjkb.rar', (res, err) => {
			if (res.headers.etag !== ydEtag && ydEtag != '') {
				ydEtag = res.headers.etag;
				http.get('http://sc.ftqq.com/KEY.send?text=' + encodeURIComponent('烟大课表更新啦~'));
			}
        });
        
        http.get('http://jiaowu.wenjing.ytu.edu.cn/index.php/portal/article/index/id/2799', res => {
            var body = '';

            res.on('data', function(d) {
            body += d;
            });
            var str = body.substr(0, 50)
            // WJ
            res.on('end', () => {
                if (body.indexOf('http://jiaowu.wenjing.ytu.edu.cn/data/upload/ueditor/20170809/598ac3c6108c0.rar') <0) {
                        http.get('http://sc.ftqq.com/KEY.send?text=' + encodeURIComponent('文经课表更新啦~') + '&desp=' + encodeURIComponent(str));
                }
            })
            // console.log(res.res)
        })
	});
}

scheduleCronstyle();
