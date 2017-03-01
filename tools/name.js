var glob = require('glob');
var fs = require('fs');
var path = './ydxls'
var s = new Set();

fs.readdir(path, function(err, files){
  //err 为错误 , files 文件名列表包含文件夹与文件
  if(err){
    console.log('error:\n' + err);
    return;
  }

  var arr = files.map(function(file){
    var arr = file.match(/(\D*)(?=\d)/g);
    var str = arr ? arr[0] : undefined;
    if (str) {
      s.add(str);
    }
    
  });

  console.log(Array.from(s));

});