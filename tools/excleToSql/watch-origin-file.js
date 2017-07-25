const http = require('http');
let ydEtag = '';

var schedule = require('node-schedule');

function scheduleCronstyle() {
	schedule.scheduleJob('* 1 * * * *', function() {
        // YD
		http.get('http://jwc.ytu.edu.cn/xk/bjkb.rar', (res, err) => {
			if (res.headers.etag !== etag && ydEtag != '') {
				ydEtag = res.headers.etag;
				http.get('http://sc.ftqq.com/KEY.send?text=' + encodeURIComponent('烟大课表更新啦~'));
			}
        });
        
        http.get('http://jiaowu.wenjing.ytu.edu.cn/index.php/portal/article/index/id/2799', res => {
            var body = '';

            res.on('data', function(d) {
            body += d;
            });
            // WJ
            res.on('end', () => {
                if (body.indexOf('http://jiaowu.wenjing.ytu.edu.cn/data/upload/ueditor/20170120/5881b0266f9bb.rar') <0) {
                        http.get('http://sc.ftqq.com/KEY.send?text=' + encodeURIComponent('文经课表更新啦~') + '&desp=' + encodeURIComponent(body));
                }
            })
            // console.log(res.res)
        })
	});
}

scheduleCronstyle();
