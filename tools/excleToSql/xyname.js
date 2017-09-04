const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.time(1);

let sql = '';
const char = ['', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

var map = {}
function getName(pathName) {
    let arr = fs.readdirSync(pathName);
    for (var i = arr.length - 1; i >= 0; i--) {
        let childPath = path.resolve(pathName, arr[i]);
        let stats = fs.lstatSync(childPath, function (err, stats) {
            
        });
        if (stats.isDirectory()) {
            getName(childPath)
        } else {
            readCourse(childPath);
        }
    }
}

function readCourse(filePath) {
    var arr = filePath.split('/')
    var fileName = arr[arr.length - 1];
    if (fileName.indexOf('xls') > -1) {
        var xy = fileName.replace(/\d+\-*\d*\.xls/, '')
        map[xy] = xy
    }
}


module.exports = function (rootPath) {
    getName(rootPath);
    console.log(Object.keys(map));
    console.log();
    // Object.keys(map).map(v => {
    //     console.log(`<option value="${v}">${v}</option>`)
    // })
}