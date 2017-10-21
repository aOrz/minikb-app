const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const config = require('../config');
let send = require('../sendMessage');

console.time(1);

let sql = '';
const char = ['', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const rootPath = './ydxl/';

function getTep() {
  let studentCourseTemp = 'insert into course (class_name,';
  for (var i = 1; i <= 42; i++) {
    studentCourseTemp = studentCourseTemp + ('s' + i) + ',';
  }
  studentCourseTemp = studentCourseTemp + 's43) values ';

  sql = studentCourseTemp;
}
function toSql(pathName) {
  let arr = fs.readdirSync(pathName);
  for (var i = arr.length - 1; i >= 0; i--) {
    let childPath = path.resolve(pathName, arr[i]);
    let stats = fs.lstatSync(childPath, function(err, stats) {});
    if (stats.isDirectory()) {
      toSql(childPath);
    } else {
      readCourse(childPath);
    }
  }
}

function readCourse(filePath) {
  if (filePath[filePath.length - 1] !== 's') {
    return;
  }
  let workbook = XLSX.readFile(filePath);
  // console.log();
  let sheet = workbook.Sheets.Sheet1;
  let className = sheet['F1'].v.replace('班名:', '');
  let add = 1;
  let currentSql = '("' + className + '"';

  for (let row = 1; row <= 6; row++) {
    if (row % 2 === 1) {
      add++;
    }
    for (let col = 1; col <= 7; col++) {
      let courseSrt = '';
      for (let i = 1; i <= 8; i++) {
        let num = (row - 1) * 8 + i + add;
        if (num === 52) {
          continue;
        }
        let str = char[col] + num;
        if (sheet[str] && sheet[str].v) {
          // console.log(sheet[str].v);
          courseSrt += sheet[str].v.replace(/\([0-9A-Z\-]*\)/g, '');
        }
      }
      currentSql = currentSql + ',"' + courseSrt + '"';
    }
  }

  currentSql += ', ""),\n';
  sql += currentSql;
}

module.exports = function getSql(data) {
  getTep();
  toSql(rootPath);
  sql = sql.replace('911111111111111110000000', '').replace(/\,\n$/g, ';');

  var connection = mysql.createConnection(config.mysql);

  connection.connect();
  connection.query('delete from course where 1', function(error, results, fields) {
    if (error) throw error;
    send('删除行数' + results.affectedRows, '', 1);
    console.log('The solution is: ', results.affectedRows);
  });
  connection.query(sql, function(error, results, fields) {
    if (error) throw error;
    send('插入行数' + results.affectedRows, '', 1);

    console.log('The solution is: ', results.affectedRows);
  });

  connection.end();
  fs.writeFile(`./sql/course${new Date().toLocaleString().replace(/\//g, '-')}.sql`, sql, err => {
    if (err) throw err;
    console.log('The file has been saved!');
    console.timeEnd(1);
  });
};
