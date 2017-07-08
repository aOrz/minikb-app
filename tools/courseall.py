#
#  邵英帅 6.14
#  wz  6.29修改
#  excle文件夹在teacher目录，不同学校需要修改sql中school
#
import xlrd
import io 
import re
import sys
import os
import pymysql
import codecs
#怎么挑选课程？？？
#1：2、3、4、5   2：10，11，12，13   3：19，20，21，22   4：27，28，29，30  5：36，37，38，39    6：44，45，46，47
grades = [[2,3,4,5],[6,7,8,9],[10,11,12,13],[14,15,16,17],[19,20,21,22],[23,24,25,26],[27,28,29,30],[31,32,33,34],[36,37,38,39],[40,41,42,43],[44,45,46,47],[48,49,50]]
sys.stdout = io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')




def getData(file,t_name = "",c_name = ''):
  data = xlrd.open_workbook(file)#'./xls/中131-3.xls')
  table = data.sheets()[0]
  t_name = re.sub(r"\(.*?\)","",t_name[:-4])
  for i in range(2,table.ncols - 1):
    #print("星期" + str(i-1))
    for j in grades:
      #print("------------------")
      _str = []
      for l in j:
        #去掉课程号 原理：grep sub 如果是第一行的话
        _str.append(table.col_values(i)[l]) 
        if l == j[0]:
          #print(_str)
          _str[0] = re.sub(r"\(.*?\)","",_str[0])
        #if _str != "":
      makeSql(_str,t_name,c_name)
      #if l == j[-1]:
      #print("------------------\n")
def trans(lst):
  tmp = []
  for i in range(0,6):
    for j in range(0,7):
      tmp.append(lst[j*6 + i])
  return tmp
# 1,7,13,19,25,31,36  2,8,14,20,26,32,37
def makeSql(courseList = [],t_name = "",c_name = ''):
  if len(courseList) < 4:
    courseList.append('')
  if courseList[0]!='':
    sql = "insert into courseAll (course_name,course_teaacher,course_time,course_room,course_class,school,college) values ('"+courseList[0] +"','"+ t_name+"','"+courseList[2]+"','"+courseList[1]+"','"+courseList[3]+"',"+"'yd','"+c_name+"');" + "\n"
    file_object.write(sql)
print(os.listdir('./teacher/'))




file_object = codecs.open('courseALL.sql', 'w', 'utf-8')

for j in os.listdir('./teacher/'):
  for i in os.listdir('./teacher/'+j+'/'):
    
    try:
      # print(makeSql(trans(getData('./xls/' + i))))
      # file_object.write(makeSql(trans(getData('./teacher/'+j+'/' + i))))
      getData('./teacher/'+j+'/' + i,i,j)
      # cur.execute(makeSql(trans(getData('./xls/' + i)),i))
      # conn.commit()
    except:
      #pass
      print(i + "错误")
print("完成");
file_object.close( )
#print(cur.execute(makeSql(trans(getData('./xls/中131-3.xls')),i)))
#print(len(trans(getData('./xls/中131-3.xls'))))

  #print()"""
#ls = [x for x in range(0,47)]
#print(trans(ls))
#读取所有文件（测试先读取一个）  ok！！！
#不要第一行
#3456 11 12 13 14 21 22 23 24 ok


#构建sql语句：
#将课程填入一个列表共
#insert table_name(a,s,d,f,g...) values (...)


#加try！！！！！！