const http = require('http');
let ydEtag = '';

var schedule = require('node-schedule');

function scheduleCronstyle() {
	schedule.scheduleJob('* 1 * * * *', function() {
		console.log('scheduleCronstyle:' + new Date());
		http.get('http://jwc.ytu.edu.cn/xk/bjkb.rar', (res, err) => {
			if (res.headers.etag !== etag && ydEtag != '') {
				ydEtag = res.headers.etag;
				http.get('http://sc.ftqq.com/SCU5965T351aefdf9da33c3debc59213a432ed5e58a464b74b733.send?text=' + encodeURIComponent('烟大课表更新啦~'));
			}
		});
	});
}

// scheduleCronstyle();
http.get('http://jiaowu.wenjing.ytu.edu.cn/index.php/portal/article/index/id/2799', res => {
    var body = '';

    res.on('data', function(d) {
      body += d;
    });

    res.on('end', () => {
        if (body.indexOf('http://jiaowu.wenjing.ytu.edu.cn/data/upload/ueditor/20170120/5881b0266f9bb.rar') <0) {
				http.get('http://sc.ftqq.com/SCU5965T351aefdf9da33c3debc59213a432ed5e58a464b74b733.send?text=' + encodeURIComponent('文经课表更新啦~'));
        }
    })
    // console.log(res.res)
})
