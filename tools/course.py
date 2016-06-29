#
#	邵英帅 6.14
#	wz  6.29修改
#
import xlrd
import io 
import re
import sys
import os
import pymysql
import codecs
#怎么挑选课程？？？
#1：2、3、4、5   2：10，11，12，13   3：19，20，21，22   4：27，28，29，30	5：36，37，38，39		6：44，45，46，47
grades = [[2,3,4,5,6,7,8,9],[10,11,12,13,14,15,16],[19,20,21,22,23,24,25,26],[27,28,29,30,31,32,33,34],[36,37,38,39,40,41,42,43],[44,45,46,47,48,49,50,51]]
sys.stdout = io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')




def getData(file):
	data = xlrd.open_workbook(file)#'./xls/中131-3.xls')
	table = data.sheets()[0];

	classes = []
	for i in range(2,table.ncols - 1):
		#print("星期" + str(i-1))
		for j in grades:
			#print("------------------")
			_str = ""
			for l in j:
				#去掉课程号 原理：grep sub 如果是第一行的话
				_str += table.col_values(i)[l] 
				if l == j[0]:
					#print(_str)
					_str = re.sub(r"\(.*?\)","",_str)
				#if _str != "":
			#print(_str)
			#if l == j[-1]:
			classes.append(_str)
			#print("------------------\n")
	return classes
def trans(lst):
	tmp = []
	for i in range(0,6):
		for j in range(0,7):
			tmp.append(lst[j*6 + i])
	return tmp
# 1,7,13,19,25,31,36  2,8,14,20,26,32,37
def makeSql(courseList = [],c_name = ""):
	sql = "insert into course (class_name,"
	for i in range(1,43):
		sql += "s" + str(i) + ","
	sql += "s43) values ('" + c_name + "',"
	for i in courseList:
		sql += "'" + i + "',"
	sql += "'');" + "\n"
	#print(sql)
	return sql
print(os.listdir('./xls/'))




file_object = codecs.open('course.sql', 'w', 'utf-8')


for i in os.listdir('./xls/'):
	#print(getData('./xls/中131-3.xls'))
	print(i + "完成")
	try:
		# print(makeSql(trans(getData('./xls/' + i))))
		file_object.write(makeSql(trans(getData('./xls/' + i))))

		# cur.execute(makeSql(trans(getData('./xls/' + i)),i))
		# conn.commit()
		print(i + "完成")
	except:
		#pass
		print(i + "错误")
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