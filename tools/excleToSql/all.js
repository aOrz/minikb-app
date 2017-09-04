#!/usr/bin/env node
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const argv = require('yargs')
.option('s', {
    alias : 'school',
    demand: true,
    default: 'yd',
    describe: 'school yd or wj',
    type: 'string'
  })
  .option('p', {
    alias : 'path',
    demand: true,
    default: 'ydall',
    describe: 'excle路径',
    type: 'string'
  })
  .example('all.js -s yd -p ydall')
  .help('h')
  .argv;;
console.time(1);
let sql = '';
const char = ['', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const rootPath = argv.p; 

function toSql(pathName, cName) {
    let arr = fs.readdirSync(pathName);
    for (var i = arr.length - 1; i >= 0; i--) {
        let childPath = path.resolve(pathName, arr[i]);
        let stats = fs.lstatSync(childPath);
        if (stats.isDirectory()) {
            toSql(childPath, arr[i]);
        } else {
            readCourse(childPath, cName);
        }
    }
}

function readCourse(filePath, cName) {
    if (filePath[filePath.length - 1] !== 's') {
        return;
    }
    let workbook = XLSX.readFile(filePath);
    // console.log();
    let sheet = workbook.Sheets.Sheet1;
    let teacherName = sheet['F1'].v.replace('教师:', '');
    let add = 1;
    let currentSql = 'insert into courseAll (course_name,course_teaacher,course_time,course_room,course_class,school,college) values ';

    for (let row = 1; row <= 6; row++) {
        if (row %2 === 1) {
            add++;
        }
        for (let col = 1; col <=7; col++) {
            let courseList = [];
            for (let i = 1; i <= 8; i++) {
                let num = ((row - 1) * 8 + i + add);
                if (num === 52) {
                    continue;
                }
                let str = char[col] + num;
                if (sheet[str] && sheet[str].v) {
                    // console.log(sheet[str].v);
                    courseList.push(sheet[str].v.replace('\\', ''));
                }
                if (courseList.length>3 && i % 4==0) {
                    currentSql += "('"+courseList[0] +"','"+ teacherName+"','"+courseList[2] + '周' + col +"','"+courseList[1]+"','"+courseList[3]+"',"+"'" + argv.s +"','"+cName+"')," + "\n";
                    courseList = [];
                }
            }
        }
    }
    currentSql = currentSql.replace(/\,\n$/g, ';') + '\n';
    // currentSql += ', "");\n';
    if (currentSql && /\;/.test(currentSql)) {
        sql += currentSql;
    }
}

toSql(rootPath);
sql = sql.replace(/\([0-9A-Z\-\n]*\)/g, '');
let sqlPath = `./sql/courseall-${argv.s}${moment().format()}.sql`;
fs.writeFile(sqlPath, sql, (err) => {
    if (err) throw err;
    console.log('The file has been saved!: ' + sqlPath);
    console.timeEnd(1);

});