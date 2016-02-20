//在登陆页面点击注册账号跳转页面函数
function RegisterLink() {
	var regButton = document.getElementById('reg');
	mui.openWindow({
		url: 'reg.html',
		id: 'reg',
		show: {
			aniShow: 'pop-in'
		},
		styles: {
			popGesture: 'hide'
		},
		waiting: {
			autoShow: false
		}
	});
}
//打开个人信息链接

function OpenUserIntroLink() {
	mui.openWindow({
		url: 'usermessage.html',
		id: 'forget_password',
		show: {
			aniShow: 'pop-in'
		},
		styles: {
			popGesture: 'hide'
		},
		waiting: {
			autoShow: false
		}
	});
}

//打开链接窗口
function OpenWindows(id) {
	var url = id + ".html";
	mui.openWindow({
		url: url,
		id: id,
		show: {
			aniShow: 'pop-in'
		},
		styles: {
			popGesture: 'hide'
		},
		waiting: {
			autoShow: false
		}
	});
}

//在登陆界面点击忘记密码跳转页面函数
function ForgetPasswordLink() {
	var forgetButton = document.getElementById('forgetPassword');
	mui.openWindow({
		url: 'response.html',
		id: 'response',
		show: {
			aniShow: 'pop-in'
		},
		styles: {
			popGesture: 'hide'
		},
		waiting: {
			autoShow: false
		}
	});
}

//生成临时密码
function GetLsPwd() {
	var pwd = "";
	for (var i = 0; i < 10; i++) {
		pwd += Math.floor(Math.random() * 10);
	}
	return pwd;
}

//点击登陆验证登陆函数
function CheckLogin() {
	var userId = document.getElementById('account').value;
	var userPwd = document.getElementById('password').value;

	if ((!userId) || (!userPwd)) {
		//plus.nativeUI.closeWaiting();
		plus.nativeUI.toast("请把信息输入完整");
	} else {
		//plus.nativeUI.closeWaiting();
		var idExists = CheckIdExists(userId);
		var dateTime = new Date();
		var Num = GetLsPwd();

		plus.storage.setItem("lsPwd", Num);
		if (idExists == 0) { //邮箱不存在
			plus.nativeUI.toast("用户未注册");
		} else {
			loginData = {
				c: 'Login',
				userId: userId,
				userPwd: userPwd,
				isLogin: Num
			};
			mui.ajax('http://2.minikb.sinaapp.com/controller/user_controller.php', {
				async: false,
				data: loginData,
				dataType: 'json', //服务器返回json格式数据
				type: 'get', //HTTP请求类型
				success: function(data) {
					if (data == 0) {
						plus.nativeUI.toast("用户名或密码错误");
					} else if (data != null) {
						for (var i = 1; i <= 44; i++) {
							var ind = 's' + i;
							plus.storage.setItem('"' + i + '"', data[ind]);
						}

						plus.storage.setItem("ex", '1');
						plus.storage.setItem('nc', data['nick_name']);
						plus.storage.setItem('xx', data['school']);
						plus.storage.setItem('class', data['class']);
						plus.storage.setItem('id', userId);

						plus.nativeUI.toast("登陆成功");
						detailPage = plus.webview.getWebviewById('list.html');
						mui.fire(detailPage, 'customEvent', {});
						mui.back();
					} else {
						plus.nativeUI.toast("网络错误");
					}
				},
				error: function(xhr, type, errorThrown) {
					plus.nativeUI.toast("网络错误");
				}
			});
		}
	}
}


//验证用户邮箱是否存在函数
function CheckIdExists(userId) {
	var result;
	mui.ajax('http://2.minikb.sinaapp.com/controller/user_controller.php', {
		async: false,
		data: {
			c: 'IdExists',
			userId: userId
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		success: function(data) {
			if (data == '0') {
				result = 0;
			} else {
				result = 1;
			}
		},
		error: function(xhr, type, errorThrown) {
			console.log(errorThrown);
			plus.nativeUI.toast("网络错误");
		}
	});
	return result;
}

//正则表达式验证邮箱格式
function IsEmail(yx) {
	var reyx = /^([.a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
	var result = reyx.test(yx);
	return result;
}

//验证用户注册函数
function CheckReg() {
	//邮箱
	var userId = document.getElementById('email').value;
	if (userId == "") {
		plus.nativeUI.toast("请输入邮箱");
		document.getElementById('email').focus();
		return;
	} else if (!IsEmail(userId)) {
		plus.nativeUI.toast("邮箱格式不正确");
		document.getElementById('email').focus();
		return;
	} else {
		var idExists = CheckIdExists(userId);
		if (idExists == 1) {
			plus.nativeUI.toast("邮箱已注册");
			document.getElementById('email').focus();
			return;
		}
	}

	//昵称
	var userName = document.getElementById('account').value;
	if (userName == "") {
		plus.nativeUI.toast("请输入昵称");
		document.getElementById('account').focus();
		return;
	} else if (userName.length > 10) {
		plus.nativeUI.toast("昵称太长");
		document.getElementById('account').focus();
		return;
	}

	//第一次密码
	var psd1 = document.getElementById('password').value;
	if (psd1 == "") {
		plus.nativeUI.toast("请输入密码");
		document.getElementById('password').focus();
		return;
	} else if (psd1.length < 6) {
		plus.nativeUI.toast("密码长度不能小于六");
		document.getElementById('password').focus();
		return;
	}

	//第二次密码
	var psd2 = document.getElementById('password_confirm').value;
	if (psd2 == "") {
		plus.nativeUI.toast("请输入确认密码");
		document.getElementById('password').focus();
		return;
	} else if (psd1 != psd2) {
		plus.nativeUI.toast("两次密码不一致，请重新输入");
		document.getElementById('password').focus();
		return;
	}

	//学校
	var school = document.getElementById('school').value;
	if (school == "") {
		plus.nativeUI.toast("请选择学校");
		document.getElementById('school');
		return;
	}

	//学院
	var major = document.getElementById('major').value;
	if (major == "") {
		plus.nativeUI.toast("请选择学院");
		document.getElementById('major');
		return;
	}

	//班级
	var className = document.getElementById('class').value;
	var classExists = ClassExists(school, major, className);
	if (classExists == 0) {
		plus.nativeUI.toast("请输入正确的班级");
		document.getElementById('class').focus();
		return;
	}

	//注册时间
	var dateTime = new Date();
	dateTime = dateTime.getFullYear() + "-" + (dateTime.getMonth() + 1) + "-" + dateTime.getDate() + "   " + dateTime.getHours() + ":" + dateTime.getMinutes() + ":" + dateTime.getSeconds();


	if (userId && userName && psd1 && psd2 && school && major && className) {
		mui.ajax('http://2.minikb.sinaapp.com/controller/user_controller.php', {
			async: false,
			data: {
				c: 'CreateUser',
				userId: userId,
				userPwd: psd1,
				classNum: className,
				schoolName: school,
				collegeName: major,
				nickName: userName,
				isLogin: '1'
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			success: function(data) {
				if (data == 0) {
					plus.nativeUI.toast("邮箱已注册");
				} else if (data == -1) {
					plus.nativeUI.toast("班级不存在");
				} else {
					data = data[0];
					plus.nativeUI.toast('注册成功');
					for (var i = 1; i <= 44; i++) {
						var ind = 's' + i;
						plus.storage.setItem('"' + i + '"', data[ind]);
					}

					plus.storage.setItem("ex", '1');

					plus.storage.setItem('nc', data['nick_name']);
					plus.storage.setItem('xx', data['school']);
					plus.storage.setItem('class', data['class']);
					plus.storage.setItem('id', userId);
					mui.back();
				}
			},
			error: function(xhr, type, errorThrown) {
				plus.nativeUI.toast('网络错误');
			}
		});
	}
}

//验证班级是否存在
function ClassExists(school, major, className) {
	var result;
	mui.ajax('http://2.minikb.sinaapp.com/controller/course_controller.php', {
		async: false,
		data: {
			c: 'ClassExists',
			schoolName: school,
			collegeName: major,
			classNum: className
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		success: function(data) {
			if (data == '0') {
				result = 0;
			} else {
				result = 1;
			}
		},
		error: function(xhr, type, errorThrown) {
			console.log(errorThrown);
			plus.nativeUI.toast("网络错误");
		}
	});
	return result;
}

//获得学校名称
function GetSchoolName() {
	var school = document.getElementById("school");
	var schoolName = localStorage.getItem('schoolName');
	if (schoolName) {
		data = JSON.parse(schoolName)
		for (var i in data) {
			var insertHtml = '<option value="' + i + '">' + data[i] + '</option>';
			school.innerHTML += insertHtml;
		}
		var insertHtml = '<option value="yd1">' + '其他学校' + '</option>';
		school.innerHTML += insertHtml;
		var show_n = 0
	} else {
		var show_n = 1;
	}
	mui.ajax('http://2.minikb.sinaapp.com/public/json/config.php', {
		async: false,
		data: {
			c: 'schoolName'
		},
		beforeSend: function() {
			if (show_n)
				plus.nativeUI.showWaiting();
		},
		complete: function() {
			if (show_n)
				plus.nativeUI.closeWaiting();
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否请求成功；
			if (data) {
				localStorage.setItem('schoolName', JSON.stringify(data));
			}
			if (show_n) {
				school.innerHTML = '';
				for (var i in data) {
					var insertHtml = '<option value="' + i + '">' + data[i] + '</option>';
					school.innerHTML += insertHtml;
				}
				var insertHtml = '<option value="yd1">' + '其他学校' + '</option>';
				school.innerHTML += insertHtml;
			}

		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			plus.nativeUI.toast("网络错误");
		}
	});
}

//根据学校名获得学院
function GetCollegeNameBySchool(school) {
	var school = document.getElementById("school").value;
	var major = document.getElementById("major");
	document.getElementById('class').style.display = "inline";
	major.innerHTML = '';
	if (!school) {
		school = 'yd';
	} else if (school == 'yd1') {
		major.innerHTML = '<option value="未知">未知</option>';
		document.getElementById('class').value = 1;
		document.getElementById('class').style.display = "none";
	}
	var CollegeName = localStorage.getItem(school + 'CollegeName');
	if (CollegeName) {
		data = JSON.parse(CollegeName)
		for (var i in data) {
			var insertHtml = '<option value="' + data[i] + '">' + data[i] + '</option>';
			major.innerHTML = major.innerHTML + insertHtml;
		}
		var show_n = 0
	} else {
		var show_n = 1;
	}

	mui.ajax('http://2.minikb.sinaapp.com/public/json/config.php?c=collegeName', {
		async: false,
		data: {
			c: 'collegeName',
			schoolName: school
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		beforeSend: function() {
			if (show_n)
				plus.nativeUI.showWaiting();
		},
		complete: function() {
			if (show_n)
				plus.nativeUI.closeWaiting();
		},
		success: function(data) {
			localStorage.setItem(school + 'CollegeName', JSON.stringify(data));
			//服务器返回响应，根据响应结果，分析是否请求成功；
			if (show_n) {
				for (var i in data) {
					var insertHtml = '<option value="' + data[i] + '">' + data[i] + '</option>';
					major.innerHTML = major.innerHTML + insertHtml;
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			plus.nativeUI.toast("网络错误");
		}
	});
}

//得到今日课表
function GetTodayClass() {
	var html = document.getElementById("course_list");
	html.innerHTML = '';
	var dx = {
		1: '一',
		2: '二',
		3: '三',
		4: '四',
		5: '五',
		6: '六',
		7: '日'
	};
	var dataTime = {
		1: '8:00~9.40',
		2: '10:00~11.40',
		3: '14.00~15.40',
		4: '16.00~17.40',
		5: "19.00~20.40"
	};
	var color = {
		0: 'changcolor1',
		1: 'changcolor',
		2: 'changcolor2',
		3: 'changcolor3',
		4: 'changcolor4'
	};
	var colorNumber = 0;
	var dateTime = new Date();
	var date1 = dateTime.getDate(); //今天的日期
	var times = new Array(9, 11, 15, 17, 20); //课程结束时间
	var day = new Array(7, 1, 2, 3, 4, 5, 6)[dateTime.getDay()];
	var currentTime = day; //今天星期几
	var _arr = [];
	var isture = 0;

	for (var i = 0; i < 5; i++) {
		n1 = (i + 1);
		var num = parseInt(i * 7) + parseInt(currentTime);
		var tdatac = plus.storage.getItem('"' + num + '"');


		if (tdatac) {
			var myData = new Date();
			if ((times[i] > myData.getHours()) || (times[i]) == myData.getHours() && myData.getMinutes() > 40) {
				colorNumber++;
				isture = 1;
				var n1 = parseInt(i) + parseInt(1);
				//var html = document.getElementById("course_list");
				var insertHtml = '<li class="cell ' + color[colorNumber % 5] + '"><div class="mui-table"><div class="mui-table-cell"><h4 class="mui-ellipsis">' + '周' + dx[currentTime] + '第' + n1 + '大节</h4>' + '<p>' +
					tdatac + '</p><p class="mui-h6 mui-ellipsis">' + dataTime[n1] + '</p></div></div></li>';
				html.innerHTML = html.innerHTML + insertHtml;
			}
		}
	}

	//提示今天没有课了
	if (!isture) {
		colorNumber++;
		//var html = document.getElementById("course_list");
		var insertHtml = '<li class="cell ' + color[colorNumber % 5] + '"><div class="mui-table"><div class="mui-table-cell"><h4 class="mui-ellipsis"></h4><p>' + '今天没课了哦！准备明天的课吧！' + '</p><p class="mui-h6 mui-ellipsis"></p></div></div></li>';
		html.innerHTML = html.innerHTML + insertHtml;
	}
	isture = 0;
	if (currentTime == 7) {
		currentTime = 1;
	} else {
		currentTime++;
	}

	//var html = document.getElementById("course_list");
	var insertHtml = '<hr style="border:1px dashed  #cccccc;width: 90%" />';
	html.innerHTML = html.innerHTML + insertHtml;

	//明天的课
	for (var i = 0; i < 5; i++) {
		n1 = (i + 1);
		var num = parseInt(i * 7) + parseInt(currentTime);
		var tdatac = plus.storage.getItem('"' + num + '"');
		if (tdatac) {
			colorNumber++;
			isture = 1;
			var n1 = parseInt(i) + parseInt(1);
			//var html = document.getElementById("course_list");
			var insertHtml = '<li class="cell ' + color[colorNumber % 5] + '"><div class="mui-table"><div class="mui-table-cell"><h4 class="mui-ellipsis">' + '周' + dx[currentTime] + '第' + n1 + '大节</h4>' + '<p>' + tdatac + '</p><p class="mui-h6 mui-ellipsis">' + dataTime[n1] + '</p></div></div></li>';
			html.innerHTML = html.innerHTML + insertHtml;
		}
	}

	//提示明天没有课了
	if (!isture) {
		colorNumber++;
		//var html = document.getElementById("course_list");
		var insertHtml = '<li class="cell ' + color[colorNumber % 5] + '"><div class="mui-table"><div class="mui-table-cell"><h4 class="mui-ellipsis"></h4><p>' + '明天没课了哦！计划怎么去玩吧！' + '</p><p class="mui-h6 mui-ellipsis"></p></div></div></li>';
		html.innerHTML = html.innerHTML + insertHtml;
	}
}

//得到全部课表
function GetAllClass() {
	var setColor = {
		0: 'bg-primary',
		1: 'bg-success',
		2: 'bg-ss ',
		3: 'bg-warning',
		4: 'bg-danger ',
		5: 'bg-lan',
		6: 'bg-info',
		7: 'bg-sa'
	}
	var kcName = {
		1: '<th>第<br> 1<br>节<br></th>',
		2: '<th>第<br> 2<br>节<br></th>',
		3: '<th>第<br> 3<br>节<br></th>',
		4: '<th>第<br> 4<br>节<br></th>',
		5: '<th>第<br> 5<br>节<br></th>',
		6: '<th>设<br>计<br>实<br>习</th>',
		7: '<th>备<br>注</th>'
	}

	var colorCs = 0;
	for (var j = 1; j <= 7; j++) {
		var b = '';
		b = kcName[j];
		for (var i = 1; i < 8; i++) {
			if (colorCs > 7) colorCs = 0;
			var num = parseInt(i) + parseInt((j - 1) * 7);
			if (plus.storage.getItem('"' + num + '"') && j != 7) {
				b += '<td data-num="' + num + '" data-no="' + j + '" data-noi="' + i + '" onclick=tanchu(this); class=' + setColor[colorCs] + ' ">' + plus.storage.getItem('"' + num + '"') + '</td>';
				colorCs++;
			} else {
				if (j != 7)
					b += '<td data-num="' + num + '"></td>';
			}

			if (j == 7 && plus.storage.getItem('"' + num + '"')) {
				if (plus.storage.getItem('"' + num + '"')) {
					b += '<td data-num="' + num + '" data-no="' + j + '" data-noi="' + i + '"  onclick=tanchu(this); colspan="7" class="' + setColor[2] + ' ">' + plus.storage.getItem('"' + num + '"') + '</td>';
				} else {
					b += '<td colspan="7" data-num="' + num + '"></td>';
				}
				break;
			}
		}
		var trs = '';
		trs = 'tr' + j;
		if (b != kcName[j])
			document.getElementById(trs).innerHTML = b;
	}
}

//点击弹出窗口
var clicks = 0; //避免快速重复点击
function tanchu(td) {
	if (clicks == 1) {
		return;
	}
	clicks = 1;
	var j = td.getAttribute("data-no");
	var i = td.getAttribute("data-noi");
	if (j == 7) {
		i = '备注';
	} else if (j == 6) {
		i = '设计实习';
	} else {
		i = '周' + i + '第' + j + '节';
	}
	mui.alert(td.innerText, i);
	clicks = 0;
}

//根据用户ID获得用户所有信息
function GetUserInfoByUserId() {
	var userId = plus.storage.getItem("id");
	mui.ajax('http://2.minikb.sinaapp.com/controller/user_controller.php', {
		data: {
			c: 'GetUserInfoByUserId',
			userId: userId
		},
		beforeSend: function() {
			plus.nativeUI.showWaiting();
		},
		complete: function() {
			plus.nativeUI.closeWaiting();
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		success: function(data) {
			console.log(JSON.stringify(data))
			//服务器返回响应，根据响应结果，分析是否登录成功；
			document.getElementById("account").value = data.nick_name;
			GetSchoolName();
			document.getElementById("school").value = data.school;
			GetCollegeNameBySchool();
			document.getElementById("major").value = (data.class)[0];
			var className = data.class;
			className = className.substr(1, className.length - 1);
			document.getElementById("class").value = className;
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			plus.nativeUI.toast("网络错误");
			console.log(type);
		}
	});
}
//更新用户信息

function UPdataUserInfoByUserId() {
	var userId = plus.storage.getItem("id");
	mui.ajax('http://2.minikb.sinaapp.com/controller/user_controller.php', {
		data: {
			c: 'GetUserInfoByUserId',
			userId: userId
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否登录成功；
			//			document.getElementById("account").value=data.nick_name;
			//			GetSchoolName();
			//			document.getElementById("school").value=data.school;
			//			GetCollegeNameBySchool();
			//			document.getElementById("major").value=(data.class)[0];
			//			var className=data.class;
			//			className=className.substr(1,className.length-1);
			//			document.getElementById("class").value=className;
			plus.storage.setItem("ex", '1');
			plus.storage.setItem('nc', data['nick_name']);
			plus.storage.setItem('xx', data['school']);
			plus.storage.setItem('class', data['class']);
			plus.storage.setItem('id', userId);
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			plus.nativeUI.toast("网络错误");
			console.log(type);
		}
	});
}
//修改用户信息

function AlertUserInfo() {
	var userName = document.getElementById("account").value;
	var school = document.getElementById("school").value;
	var major = document.getElementById("major").value;
	var className = document.getElementById("class").value;
	var classExists = ClassExists(school, major, className);
	if (classExists == 0) {
		plus.nativeUI.toast("班级不存在");
		document.getElementById("class").focus();
		return;
	}
	var userId = plus.storage.getItem("id");
	var isLogin = plus.storage.getItem("lsPwd");
	mui.ajax('http://2.minikb.sinaapp.com/controller/user_controller.php', {
		data: {
			c: 'AlertUserInfo',
			userId: userId,
			classNum: className,
			schoolName: school,
			collegeName: major,
			nickName: userName,
			isLogin: isLogin
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		//		timeout:10000,//超时时间设置为10秒；
		success: function(data) {
			if (data == -1) {
				plus.nativeUI.toast("修改失败");
			} else if (data == -2) {
				plus.nativeUI.toast("登录过期，请重新登陆后再修改");
			} else if (data == 1) {
				plus.storage.setItem('nc', userName);
				plus.storage.setItem('xx', school);
				plus.storage.setItem('class', major + className);
				plus.nativeUI.toast("修改成功");
			} else {
				for (var i = 1; i <= 44; i++) {
					var ind = 's' + i;
					plus.storage.setItem('"' + i + '"', data[0][ind]);
				}
				plus.storage.setItem('nc', userName);
				plus.storage.setItem('xx', school);
				plus.storage.setItem('class', major + className);
				plus.nativeUI.toast("修改成功");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			plus.nativeUI.toast("网络错误");
		}
	});
}

//打开查询结果的链接
function SearchResultLink(way) {
	plus.storage.setItem("searchWay", way);
	if (way == 'byclass') {
		var school = document.getElementById("school").value;
		var major = document.getElementById("major").value;
		var className = document.getElementById("class").value;
		plus.storage.setItem("searchSchool", school);
		plus.storage.setItem("searchMajor", major);
		plus.storage.setItem("searchClass", className);
	} else if (way == "byteacher" || way == "bycourse") {
		var name = document.getElementById("teachercoursename").value;
		plus.storage.setItem("searchName", name);
	}
	mui.openWindow({
		url: "ck.html",
		styles: {
			scrollIndicator: 'none'
		}
	});
}

//蹭课信息
function GetCourseMessages() {
	var way = plus.storage.getItem("searchWay");
	if (way == "byclass") {
		GetCourseByClassName();
	} else if (way == "byteacher") {
		GetCourceByTeacherName();
	} else if (way == "bycourse") {
		GetCourceByCourseName();
	}
}

//根据班级获得课程信息
function GetCourseByClassName() {
	var school = plus.storage.getItem("searchSchool");
	var major = plus.storage.getItem("searchMajor");
	var className = plus.storage.getItem("searchClass");
	var classExists = ClassExists(school, major, className);
	if (classExists == 0) {
		plus.nativeUI.toast("班级不存在");
		document.getElementById("class").focus();
		return;
	}

	mui.ajax('http://2.minikb.sinaapp.com/controller/course_controller.php', {
		data: {
			c: 'GetCourseByClassName',
			schoolName: school,
			collegeName: major,
			classNum: className
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			//服务器返回响应，根据响应结果，分析是否登录成功；
			var dx = {
				0: '一',
				1: '二',
				2: '三',
				3: '四',
				4: '五',
				5: '六',
				6: '日'
			};
			var dataTime = {
				1: '8:00~9.40',
				2: '10:00~11.40',
				3: '14.00~15.40',
				4: '16.00~17.40',
				5: "19.00~20.40",
				6: ''
			};
			var color = {
				0: 'changcolor1',
				1: 'changcolor',
				2: 'changcolor2',
				3: 'changcolor3',
				4: 'changcolor4'
			};
			var colorNumber = 0;
			var dateTime = new Date();
			var date1 = dateTime.getDate(); //今天的日期
			var times = new Array(9, 11, 15, 17, 20); //课程结束时间
			var day = new Array(7, 1, 2, 3, 4, 5, 6)[dateTime.getDay()];
			var currentTime = day; //今天星期几
			var _arr = [];

			for (var flag = 0; flag <= 6; flag++) //一周有七天
				for (var j = 0; j <= 5; j++) { //一天六节课
				time = j * 7 + flag + 1;
				time = 's' + time;
				if (data[0][time]) {
					if ((j + 1) > 5) {
						dateTime[j + 1] == "";
					}
					var html = document.getElementById("course_list");
					var insertHtml = '<li class="cell ' + color[colorNumber % 5] + '"><div class="mui-table"><div class="mui-table-cell"><h4 class="mui-ellipsis">' + '周' + dx[flag] + '第' + (j + 1) + '大节</h4>' + '<p>' +
						data[0][time] + '</p><p class="mui-h6 mui-ellipsis">' + dataTime[j + 1] + '</p></div></div></li>';
					html.innerHTML = html.innerHTML + insertHtml;
					colorNumber++;
				}
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			plus.nativeUI.toast("网络错误");
		}
	});
}

//根据老师名获得课程信息
function GetCourceByTeacherName() {

	var teacherName = plus.storage.getItem("searchName");
	var schoolName = plus.storage.getItem("xx");
	if (teacherName == '') {
		plus.nativeUI.toast("请输入信息");
		document.getElementById("teachercoursename").focus();
		return;
	}
	var color = {
		0: 'changcolor1',
		1: 'changcolor',
		2: 'changcolor2',
		3: 'changcolor3',
		4: 'changcolor4'
	};
	var colorNumber = 0;
	mui.ajax('http://2.minikb.sinaapp.com/controller/course_controller.php', {
		data: {
			c: 'GetCourceByTeacherName',
			schoolName: schoolName,
			teacherName: teacherName
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			for (var i = 0; i < data.length; i++) {
				var html = document.getElementById("course_list");
				var insertHtml = '<li class="cell ' + color[colorNumber % 5] + '"><div class="mui-table"><div class="mui-table-cell mui-col-xs-10 "><h4 class="mui-ellipsis">' + data[i].course_name + '</h4><p>' + data[i].course_time + '</p><p class="mui-h6 mui-ellipsis">' + data[i].course_room + '</p></div><div class="mui-table-cell mui-col-xs-2 mui-text-right"  style="margin-right:40px"><span class="mui-h5">' + data[i].course_teaacher + '</span></div></div></li>';
				html.innerHTML = html.innerHTML + insertHtml;
				colorNumber++;
			}
			var html = document.getElementById("course_list");
			var insertHtml = '<li class=" ' + color[colorNumber % 5] + '"><div class="mui-table" style="text-align:center"><p>' + '没有更多信息了' + '</p></div></li>';
			html.innerHTML = html.innerHTML + insertHtml;
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			plus.nativeUI.toast("网络错误");
		}
	});
}

//根据课程名获得课程信息
function GetCourceByCourseName() {
	var courseName = plus.storage.getItem("searchName");
	var schoolName = plus.storage.getItem("xx");
	if (courseName == '') {
		plus.nativeUI.toast("请输入信息");
		document.getElementById("teachercoursename").focus();
		return;
	}
	var color = {
		0: 'changcolor1',
		1: 'changcolor',
		2: 'changcolor2',
		3: 'changcolor3',
		4: 'changcolor4'
	};
	var colorNumber = 0;
	mui.ajax('http://2.minikb.sinaapp.com/controller/course_controller.php', {
		data: {
			c: 'GetCourceByCourseName',
			schoolName: schoolName,
			courseName: courseName
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			for (var i = 0; i < data.length; i++) {
				var html = document.getElementById("course_list");
				var insertHtml = '<li class="cell ' + color[colorNumber % 5] + '"><div class="mui-table"><div class="mui-table-cell mui-col-xs-10 "><h4 class="mui-ellipsis">' + data[i].course_name + '</h4><p>' + data[i].course_time + '</p><p class="mui-h6 mui-ellipsis">' + data[i].course_room + '</p></div><div class="mui-table-cell mui-col-xs-2 mui-text-right"  style="margin-right:40px"><span class="mui-h5">' + data[i].course_teaacher + '</span></div></div></li>';
				html.innerHTML = html.innerHTML + insertHtml;
				colorNumber++;
			}
			var html = document.getElementById("course_list");
			var insertHtml = '<li class="cell ' + color[colorNumber % 5] + '"><div class="mui-table"><div class="mui-table-cell mui-col-xs-10 "><h4 class="mui-ellipsis"></h4><p>' + '没有更多信息了' + '</p><p class="mui-h6 mui-ellipsis"></p></div><div class="mui-table-cell mui-col-xs-2 mui-text-right"  style="margin-right:40px"><span class="mui-h5"></span></div></div></li>';
			html.innerHTML = html.innerHTML + insertHtml;
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			plus.nativeUI.toast("网络错误");
		}
	});
}

//得到开学时间
function GetStartTime() {
	var day = "1";
	if (plus.storage.getItem('holiday'))
		day = GetDateDiff(plus.storage.getItem('holiday'));
	if (day)
		document.getElementById("day").innerHTML = "第" + day + "周";
	mui.ajax('http://2.minikb.sinaapp.com/public/json/config.php', {
		data: {
			c: 'start_time'
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 3000, //超时时间设置为10秒；
		success: function(data) {
			day = GetDateDiff(data);
			plus.storage.setItem('holiday', data);
			document.getElementById("day").innerHTML = "第" + day + "周";
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			plus.nativeUI.toast("网络错误");
			console.log(type);
		}
	});
}

//得到当前周数
function GetDateDiff(startDate) {
	var startTime = new Date(Date.parse(startDate.replace(/-/g, "/"))).getTime();
	var endtime = new Date();
	var endTime = endtime.getTime();
	var dates = Math.abs((startTime - endTime)) / (1000 * 60 * 60 * 24) / 7;
	return Math.ceil(dates);
}

//修改用户密码
function AlertUserPwd() {
	var old_password = document.getElementById("oldpassword").value;
	var new_password = document.getElementById("password").value;
	var new_password2 = document.getElementById("password_confirm").value;

	if (!old_password || !new_password || !new_password2) {
		plus.nativeUI.toast("请将信息输入完整");
		return;
	}

	if (new_password != new_password2) {
		plus.nativeUI.toast("两次密码不一致");
		return;
	}

	var id = plus.storage.getItem("id");
	mui.ajax('http://2.minikb.sinaapp.com/controller/user_controller.php', {
		//		async: false,
		data: {
			c: 'AlertUserPwd',
			userId: id,
			userPwd: new_password,
			oldPwd: old_password
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			if (data == 1) {
				plus.nativeUI.toast("修改成功");
			} else {
				plus.nativeUI.toast("旧密码错误，请重试");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			plus.nativeUI.toast("网络错误");
		}
	});
}
//修改课表函数

function xgkc() {
	var rq = document.getElementById('rq').value;
	var jc = document.getElementById('jc').value;
	var nr = document.getElementById('nr').value;
	nr = nr.replace(/[ ]/g, "")
	jc--;
	var nus = num = parseInt(jc * 7) + parseInt(rq);
	num = '"' + num + '"';
	if (jc != 6) {
		var kcval = plus.storage.setItem(num, nr);
		AlertCourse(nus, nr)
		var detailPage = plus.webview.getWebviewById('list.html');
		//触发详情页面的newsId事件
		mui.fire(detailPage, 'customEvent', {});
		mui.alert('修改成功！', '修改课表');
	} else {
		plus.storage.setItem('"' + 43 + '"', nr);
		AlertCourse(43, nr);
		mui.alert('修改成功！', '修改课表');
	}
}

function AlertCourse(id, course) {
	mui.ajax('http://2.minikb.sinaapp.com/controller/user_controller.php', {
		data: {
			c: 'AlertCouse',
			userId: plus.storage.getItem('id'),
			isLogin: plus.storage.getItem('lsPwd'),
			courseId: id,
			courseContent: course
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			//				if (data != 0) {
			//					for (var i = 1; i <= 44; i++) {
			//						var ind = 's' + i;
			//						plus.storage.setItem('"' + i + '"', data[ind]);
			//					}
			//					plus.nativeUI.toast("课表更新成功，请到全部课表页面查看");
			//				} else {
			//					plus.nativeUI.toast("还没有新的课表哦！");
			//				}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			plus.nativeUI.toast("网络错误");
		}
	});
}

function kecheng() {
	var rq = document.getElementById('rq').value;
	var jc = document.getElementById('jc').value;

	jc--;
	var num = parseInt(jc * 7) + parseInt(rq);
	num = '"' + num + '"';
	if (jc != 6) {
		var nr = document.getElementById('nr').value = plus.storage.getItem(num);
	} else {
		document.getElementById('nr').value = plus.storage.getItem('"' + 43 + '"');
	}
}

//查看课表是否更新
function UpdataCourse() {
	var id = plus.storage.getItem("id") || localStorage.getItem('id');
	mui.ajax('http://2.minikb.sinaapp.com/controller/user_controller.php', {
		data: {
			c: 'UpdataCourse',
			userId: id
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			if (data != 0) {
				for (var i = 1; i <= 44; i++) {
					var ind = 's' + i;
					plus.storage.setItem('"' + i + '"', data[ind]);
				}
				plus.nativeUI.toast("课表更新成功，请到全部课表页面查看");
			} else {
				plus.nativeUI.toast("还没有新的课表哦！");
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			plus.nativeUI.toast("网络错误");
		}
	});
}
//storage兼容性。

function CheckStorage() {
	if (localStorage.ex == 1) {
		for (var i = 1; i <= 44; i++) {
			plus.storage.setItem('"' + i + '"', localStorage.getItem(i));
		}

		plus.storage.setItem("ex", '1');
		plus.storage.setItem('nc', localStorage.getItem('nc'));
		plus.storage.setItem('xx', localStorage.getItem('school'));
		plus.storage.setItem('class', localStorage.getItem('class'));
		plus.storage.setItem('id', localStorage.getItem('id'));
		UPdataUserInfoByUserId();
		localStorage.removeItem('ex');
	}
}
//得到热评榜单和高分榜单

function GetRankList() {
	mui.ajax('http://4.minikb.sinaapp.com/php/action/ranklist.php', {
		data: {
			name: "1"
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			var num = data[0];
			var nums = num.split("@");

			for (var i = 1; i < data.length; i++) {
				var intro = data[i].split("@");
				var html = document.getElementById("hotlist");
				var insertHtml = '<li class="mui-table-view-cell" onclick="GetEvaluate()">' +
					'<div class="mui-table">' +
					'<div class="mui-table-cell mui-col-xs-2 mui-text-left ranking">' +
					'<span class="mui-h2">' + i + '</span>' +
					'</div>' +
					'<div class="mui-table-cell mui-col-xs-7">' +
					'<h4 class="mui-ellipsis-2">' + intro[0] + '</h4>' +
					'<h5 class="mui-ellipsis address">' +
					'综合楼521周一第一大节等等综合楼521周一第一大节等等' +
					'</h5>' +
					'</div>' +
					'<div class="mui-table-cell mui-col-xs-3 mui-text-right">' +
					'<span class="mui-h4">' + nums[i - 1] + '条' + '</span>' +
					'<br />' +
					'<p class="more">' + intro[1] + '</p>' +
					'</div>' +
					'</div>' +
					'</li>';
				html.innerHTML = html.innerHTML + insertHtml;
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			plus.nativeUI.toast("网络错误");
		}
	});

	mui.ajax('http://4.minikb.sinaapp.com/php/action/ranklist.php', {
		data: {
			name: "2"
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
			var num = data[0];
			var nums = num.split("@");

			for (var i = 1; i < data.length; i++) {
				var intro = data[i].split("@");
				var html = document.getElementById("highlist");
				var insertHtml = '<li class="mui-table-view-cell">' +
					'<div class="mui-table">' +
					'<div class="mui-table-cell mui-col-xs-2 mui-text-left ranking">' +
					'<span class="mui-h2">' + i + '</span>' +
					'</div>' +
					'<div class="mui-table-cell mui-col-xs-7">' +
					'<h4 class="mui-ellipsis-2">' + intro[0] + '</h4>' +
					'<h5 class="mui-ellipsis address">' +
					'综合楼521周一第一大节等等综合楼521周一第一大节等等' +
					'</h5>' +
					'</div>' +
					'<div class="mui-table-cell mui-col-xs-3 mui-text-right">' +
					'<span class="mui-h4">' + (parseFloat(nums[i - 1])).toFixed(2) + '分' + '</span>' +
					'<br />' +
					'<p class="more">' + intro[1] + '</p>' +
					'</div>' +
					'</div>' +
					'</li>';
				html.innerHTML = html.innerHTML + insertHtml;
			}
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			plus.nativeUI.toast("网络错误");
		}
	});
}

//得到
function Getxiaoli() {
	mui.ajax('http://minikb.sinaapp.com/public/json/holiday.php', {
		data: {},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 3000, //超时时间设置为10秒；
		success: function(data) {
			if (!data) {
				mui.alert("网络错误");
			}
			localStorage.holiday = JSON.stringify(data);
			//					plus.storage.setItem("holiday",JSON.stringify(data));
		},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			plus.nativeUI.toast("网络错误");
		}
	});
}