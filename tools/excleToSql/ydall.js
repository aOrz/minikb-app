const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.time(1);

let sql = '';
const char = ['', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const rootPath = './ydall/'; 

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
    let currentSql = '';

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
            }
            if (courseList.length) {
                currentSql = "insert into courseAll (course_name,course_teaacher,course_time,course_room,course_class,school,college) values ('"+courseList[0] +"','"+ teacherName+"','"+courseList[2]+"','"+courseList[1]+"','"+courseList[3]+"',"+"'" + rootPath.replace('./', '').replace('all/', '') +"','"+cName+"');" + "\n";
            }
        }
    }

    // currentSql += ', "");\n';
    if (currentSql) {
        sql += currentSql;
    }
}

toSql(rootPath);
sql = sql.replace(/\([0-9A-Z\-]*\)/g, '');

fs.writeFile(`./sql/courseall${new Date().getTime()}.sql`, sql, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
    console.timeEnd(1);

});