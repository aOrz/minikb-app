const http = require('http');
// var Unrar = require('unrar');
const fs = require('fs');
const Unrar = require('node-unrar');
const rimraf = require('rimraf');
const tosql = require('./tosql');
const send = require('../sendMessage');

module.exports = function() {
  http.get('http://jwc.ytu.edu.cn/xk/bjkb.rar', (res, err) => {
    let file = fs.createWriteStream('bjkb.rar');
    res.pipe(file);
    file.on('finish', function() {
      file.close(() => {
        var rar = new Unrar('./bjkb.rar');

        /// Create '/path/to/dest/' before rar.extract()
        rimraf.sync('./ydxl/');
        rar.extract('./ydxl/', null, function(err) {
          send('解压成功', err, 1);
          tosql();
          //file extracted successfully.
        });
      }); // close() is async, call cb after close completes.
    });
    file.on('error', function(err) {
      // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      send('下载失败', err.message, 1);
    });
  });
};
