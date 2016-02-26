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
	localStorage.setItem('mail', userId);
	localStorage.setItem('pwd', userPwd);
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
				beforeSend: function() {
					plus.nativeUI.showWaiting();
				},
				complete: function() {
					plus.nativeUI.closeWaiting();
				},
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
						localStorage.setItem('xx', data['school']);
						plus.storage.setItem('class', data['class']);
						plus.storage.setItem('id', userId);

						plus.nativeUI.toast("登陆成功");
						detailPage = plus.webview.getWebviewById('list.html');
						mui.fire(detailPage, 'customEvent', {});
						plus.nativeUI.closeWaiting();
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

	localStorage.setItem('mail', userId);
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
			beforeSend: function() {
				plus.nativeUI.showWaiting();
			},
			complete: function() {
				plus.nativeUI.closeWaiting();
			},
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
					localStorage.setItem('xx', data['school']);
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

////得到今日课表
//function GetTodayClass() {
//	var html = document.getElementById("course_list");
//	html.innerHTML = '';
//	var dx = {
//		1: '一',
//		2: '二',
//		3: '三',
//		4: '四',
//		5: '五',
//		6: '六',
//		7: '日'
//	};
//	var dataTime = {
//		1: '8:00~9.40',
//		2: '10:00~11.40',
//		3: '14.00~15.40',
//		4: '16.00~17.40',
//		5: "19.00~20.40"
//	};
//	var color = {
//		0: 'changcolor1',
//		1: 'changcolor',
//		2: 'changcolor2',
//		3: 'changcolor3',
//		4: 'changcolor4'
//	};
//	var colorNumber = 0;
//	var dateTime = new Date();
//	var date1 = dateTime.getDate(); //今天的日期
//	var times = new Array(9, 11, 15, 17, 20); //课程结束时间
//	var day = new Array(7, 1, 2, 3, 4, 5, 6)[dateTime.getDay()];
//	var currentTime = day; //今天星期几
//	var _arr = [];
//	var isture = 0;
//
//	for (var i = 0; i < 5; i++) {
//		n1 = (i + 1);
//		var num = parseInt(i * 7) + parseInt(currentTime);
//		var tdatac = plus.storage.getItem('"' + num + '"');
//
//
//		if (tdatac) {
//			var myData = new Date();
//			if ((times[i] > myData.getHours()) || (times[i]) == myData.getHours() && myData.getMinutes() > 40) {
//				colorNumber++;
//				isture = 1;
//				var n1 = parseInt(i) + parseInt(1);
//				//var html = document.getElementById("course_list");
//				var insertHtml = '<li class="cell ' + color[colorNumber % 5] + '"><div class="mui-table"><div class="mui-table-cell"><h4 class="mui-ellipsis">' + '周' + dx[currentTime] + '第' + n1 + '大节</h4>' + '<p>' +
//					tdatac + '</p><p class="mui-h6 mui-ellipsis">' + dataTime[n1] + '</p></div></div></li>';
//				html.innerHTML = html.innerHTML + insertHtml;
//			}
//		}
//	}
//
//	//提示今天没有课了
//	if (!isture) {
//		colorNumber++;
//		//var html = document.getElementById("course_list");
//		var insertHtml = '<li class="cell ' + color[colorNumber % 5] + '"><div class="mui-table"><div class="mui-table-cell"><h4 class="mui-ellipsis"></h4><p>' + '今天没课了哦！准备明天的课吧！' + '</p><p class="mui-h6 mui-ellipsis"></p></div></div></li>';
//		html.innerHTML = html.innerHTML + insertHtml;
//	}
//	isture = 0;
//	if (currentTime == 7) {
//		currentTime = 1;
//	} else {
//		currentTime++;
//	}
//
//	//var html = document.getElementById("course_list");
//	var insertHtml = '<hr style="border:1px dashed  #cccccc;width: 90%" />';
//	html.innerHTML = html.innerHTML + insertHtml;
//
//	//明天的课
//	for (var i = 0; i < 5; i++) {
//		n1 = (i + 1);
//		var num = parseInt(i * 7) + parseInt(currentTime);
//		var tdatac = plus.storage.getItem('"' + num + '"');
//		if (tdatac) {
//			colorNumber++;
//			isture = 1;
//			var n1 = parseInt(i) + parseInt(1);
//			//var html = document.getElementById("course_list");
//			var insertHtml = '<li class="cell ' + color[colorNumber % 5] + '"><div class="mui-table"><div class="mui-table-cell"><h4 class="mui-ellipsis">' + '周' + dx[currentTime] + '第' + n1 + '大节</h4>' + '<p>' + tdatac + '</p><p class="mui-h6 mui-ellipsis">' + dataTime[n1] + '</p></div></div></li>';
//			html.innerHTML = html.innerHTML + insertHtml;
//		}
//	}
//
//	//提示明天没有课了
//	if (!isture) {
//		colorNumber++;
//		//var html = document.getElementById("course_list");
//		var insertHtml = '<li class="cell ' + color[colorNumber % 5] + '"><div class="mui-table"><div class="mui-table-cell"><h4 class="mui-ellipsis"></h4><p>' + '明天没课了哦！计划怎么去玩吧！' + '</p><p class="mui-h6 mui-ellipsis"></p></div></div></li>';
//		html.innerHTML = html.innerHTML + insertHtml;
//	}
//}

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
				b += '<td data-num="' + num + '" data-no="' + j + '" data-noi="' + i + '"  class=' + setColor[colorCs] + ' ">' + plus.storage.getItem('"' + num + '"') + '</td>';
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
			console.log(JSON.stringify(data))
			plus.storage.setItem("ex", '1');
			plus.storage.setItem('nc', data['nick_name']);
			plus.storage.setItem('xx', data['school']);
			localStorage.setItem('xx', data['school']);
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
		beforeSend: function() {
			plus.nativeUI.showWaiting();
		},
		complete: function() {
			plus.nativeUI.closeWaiting();
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
				localStorage.setItem('xx', school);
				plus.storage.setItem('class', major + className);
				plus.nativeUI.toast("修改成功");
			} else {
				for (var i = 1; i <= 44; i++) {
					var ind = 's' + i;
					plus.storage.setItem('"' + i + '"', data[0][ind]);
				}
				plus.storage.setItem('nc', userName);
				plus.storage.setItem('xx', school);
				localStorage.setItem('xx', school);
				plus.storage.setItem('class', major + className);
				plus.nativeUI.toast("修改成功");
			}
			var menu = plus.webview.getWebviewById('index-menu');
			//触发菜单页更新昵称
			if (menu)
				mui.fire(menu, 'up_nick', {});
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
		
	var classExists = ClassExists(school, major, className);
	if (classExists == 0) {
		plus.nativeUI.toast("班级不存在");
		return;
	}
		mui.openWindow({
			url: "ckkb.html",
			styles: {
				scrollIndicator: 'none'
			}
		});
	} else if (way == "byteacher" || way == "bycourse") {
		var name = document.getElementById("teachercoursename").value;
		plus.storage.setItem("searchName", name);
		mui.openWindow({
			url: "ck.html",
			styles: {
				scrollIndicator: 'none'
			}
		});
	}

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
		beforeSend: function() {
			plus.nativeUI.showWaiting();
		},
		complete: function() {
			plus.nativeUI.closeWaiting();
		},
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		success: function(data) {
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
					num = 's' + num;
					if (data[0][num] && j != 7) {
						b += '<td data-num="' + num + '" data-no="' + j + '" data-noi="' + i + '"  class=' + setColor[colorCs] + ' ">' + data[0][num] + '</td>';
						colorCs++;
					} else {
						if (j != 7)
							b += '<td data-num="' + num + '"></td>';
					}

					if (j == 7 && data[0][num]) {
						if (data[0][num]) {
							b += '<td data-num="' + num + '" data-no="' + j + '" data-noi="' + i + '"   colspan="7" class="' + setColor[2] + ' ">' + data[0][num] + '</td>';
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
		beforeSend: function() {
			plus.nativeUI.showWaiting();
		},
		complete: function() {
			plus.nativeUI.closeWaiting();
		},
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
		beforeSend: function() {
			plus.nativeUI.showWaiting();
		},
		complete: function() {
			plus.nativeUI.closeWaiting();
		},
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
	if (day == 0) {
		document.getElementById("day").innerHTML = "还没开学呢";
	} else if (day) {
		document.getElementById("day").innerHTML = "第" + day + "周";
	}
	mui.ajax('http://2.minikb.sinaapp.com/public/json/config.php', {
		data: {
			c: 'start_time'
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 8000, //超时时间设置为10秒；
		success: function(data) {
			day = GetDateDiff(data);
			plus.storage.setItem('holiday', data);
			if (day == 0) {
		document.getElementById("day").innerHTML = "还没开学呢";
	} else if (day) {
		document.getElementById("day").innerHTML = "第" + day + "周";
	}
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
	var dates = -(startTime - endTime) / (1000 * 60 * 60 * 24) / 7;
	if (dates < 0) {
		dates = 0;
	}
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

//function xgkc() {
//	var nr = document.getElementById('nr').value;
//	nr = nr.replace(/[ ]/g, "")
//	jc--;
//	var nus = num = parseInt(jc * 7) + parseInt(rq);
//	num = '"' + num + '"';
//	if (jc != 6) {
//		var kcval = plus.storage.setItem(num, nr);
//		AlertCourse(nus, nr)
//		var detailPage = plus.webview.getWebviewById('list.html');
//		//触发详情页面的newsId事件
//		mui.fire(detailPage, 'customEvent', {});
//		mui.alert('修改成功！', '修改课表');
//	} else {
//		plus.storage.setItem('"' + 43 + '"', nr);
//		AlertCourse(43, nr);
//		mui.alert('修改成功！', '修改课表');
//	}
//}

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
		success: function(data) {},
		error: function(xhr, type, errorThrown) {
			//异常处理；
			console.log(type);
			plus.nativeUI.toast("网络错误");
		}
	});
}
/*
function kecheng() {
	var rq = document.getElementById('rq').value;
	var jc = document.getElementById('jc').value;

	jc--;
	var num = parseInt(jc * 7) + parseInt(rq);
	num = '"' + num +F '"';
	if (jc != 6) {
		var nr = document.getElementById('nr').value = plus.storage.getItem(num);
	} else {
		document.getElementById('nr').value = plus.storage.getItem('"' + 43 + '"');
	}

*/
//查看课表是否更新 
function UpdataCourse() {
	var id = plus.storage.getItem("id") || localStorage.getItem('id');
	mui.ajax('http://2.minikb.sinaapp.com/controller/user_controller.php', {
		data: {
			c: 'UpdataCourse',
			userId: id
		},
		beforeSend: function() {
			plus.nativeUI.showWaiting();
		},
		complete: function() {
			plus.nativeUI.closeWaiting();
		},
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；   

		success: function(data) {
			data = data[0];
			if (data != 0) {
				for (var i = 1; i <= 44; i++) {
					var ind = 's' + i;
					plus.storage.setItem('"' + i + '"', data[ind]);
				}
				detailPage = plus.webview.getWebviewById('list.html');
				mui.fire(detailPage, 'customEvent', {});
				localStorage.setItem('course_updata', 0)
				plus.nativeUI.toast("课表重置成功");
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
//文本转html
function Tohtml(str) {
	str = ((str.replace(/<(.+?)>/gi, "&lt;$1&gt;")).replace(/ /gi, "&nbsp;")).replace(/\n/gi, "<br>")

	return str;
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
getDateDiff = function(dateTimeStamp) {
	//JavaScript函数：
	var minute = 60;
	var hour = minute * 60;
	var day = hour * 24;
	var halfamonth = day * 15;
	var month = day * 30;
	var year = day * 365;
	var now = parseInt(new Date().getTime() / 1000);
	var diffValue = now - dateTimeStamp;
	if (diffValue < 0) {
		//若日期不符则弹出窗口告之
		//alert("结束日期不能小于开始日期！");
	}
	var yearC = diffValue / year;
	var monthC = diffValue / month;
	var weekC = diffValue / (7 * day);
	var dayC = diffValue / day;
	var hourC = diffValue / hour;
	var minC = diffValue / minute;
	if (yearC >= 1) {
		result = "" + parseInt(monthC) + "年前";
	} else if (monthC >= 1) {
		result = "" + parseInt(monthC) + "个月前";
	} else if (weekC >= 1) {
		result = "" + parseInt(weekC) + "周前";
	} else if (dayC >= 1) {
		result = "" + parseInt(dayC) + "天前";
	} else if (hourC >= 1) {
		result = "" + parseInt(hourC) + "个小时前";
	} else if (minC >= 1) {
		result = "" + parseInt(minC) + "分钟前";
	} else
		result = "刚刚";
	return result;
};
//获取星期几
function Getday() {
	var dateTime = new Date();
	var day = new Array(7, 1, 2, 3, 4, 5, 6)[dateTime.getDay()];
	return day;
}
/**
 *  对话框的HTML,很简单的布局!
  	<div class="layer_root">
		<div class="layer_main">
			<div class="layer_title">标题</div>
			<div class="layer_content">内容</div>
			<table class="layer_btns">
				<tr>
					<td class="layer_btn_left">左按钮</td>
					<td class="layer_btn_middle">中按钮</td>
					<td class="layer_btn_right">右按钮</td>
				</tr>
			</table>
		</div>
	</div>
 */

/**
 * 创建对话框
 *
 * 必填项:
 * content:"内容" (字符串; 可为html)
 *
 * 选填项:
 * title:"标题" (字符串; 不传值默认 "温馨提示:";传空串"",则不显示标题;)
 * btn:["按钮1","按钮2",...] (数组; 空则不显示按钮)
 * event:[回调1,回调2,...] (数组; 和按钮数组对应;如果回调return true,则点击按钮后不关闭对话框)
 * shadeClose:false (布尔值; 点击对话框外面是否关闭; 默认false不关闭)
 * backClose:true (布尔值; Android点击back键关闭; 默认true关闭)
 * closeEvent:function (对话框关闭的回调)
 * style:{"title":"样式","content":"样式","btn":"样式"}//自定义样式(标题,内容,按钮)
 */
function layerOpen(options) {
	if (!options || !options.content) return;
	//根布局
	var layer_root = document.createElement("div");
	layer_root.setAttribute("id", "layer_root");
	layer_root.setAttribute("class", "layer_root opacityIn");
	//标题
	var layer_title;
	var layer_title_style = 'class="layer_title"';
	if (options.style && options.style.title) {
		layer_title_style += " style='" + options.style.title + "'";
	}
	if (options.title == null) {
		//1.如果不传,则默认标题:温馨提示
		layer_title = '<div ' + layer_title_style + '>温馨提示:</div>';
	} else if (options.title == "") {
		//2.如果传空串"",则不显示标题
		layer_title = "";
	} else {
		//3.如果有值,则显示对应的值
		layer_title = '<div ' + layer_title_style + '>' + options.title + '</div>'
	}
	//按钮
	var layer_btns = "";
	var layer_btns_style = 'id="layer_btns" class="layer_btns"';
	if (options.style && options.style.btn != null) {
		layer_btns_style += " style='" + options.style.btn + "'";
	}
	if (options.btn) {
		var btn_count = options.btn.length;
		if (btn_count == 1) {
			//1.只有一个按钮
			layer_btns = '<table ' + layer_btns_style + '><tr><td id="0" class="layer_btn_single">' + options.btn[0] + '</td></tr></table>';
		} else if (btn_count == 2) {
			//2.只有两个按钮
			layer_btns = '<table ' + layer_btns_style + '><tr><td id="0" class="layer_btn_left">' + options.btn[0] + '</td><td id="1" class="layer_btn_right">' + options.btn[1] + '</td></tr></table>';
		} else if (btn_count > 2) {
			//3.有多个按钮
			for (var i = 0; i < btn_count; i++) {
				if (i == 0) {
					layer_btns += '<td id="0" class="layer_btn_left">' + options.btn[i] + '</td>'; //最左边的按钮
				} else if (i < btn_count - 1) {
					layer_btns += '<td id="' + i + '" class="layer_btn_middle">' + options.btn[i] + '</td>'; //中间的按钮
				} else {
					layer_btns += '<td id="' + i + '" class="layer_btn_right">' + options.btn[i] + '</td>'; //最右边的按钮
				}
			}
			layer_btns = '<table ' + layer_btns_style + '><tr>' + layer_btns + '</tr></table>';
		}
	}
	//拼接主体:标题,内容,按钮
	var layer_content_style = 'class="layer_content"';
	if (options.style && options.style.content != null) {
		layer_content_style = " style='" + options.style.content + "'";
	}
	var layerHTML = '<div class="layer_main scaleIn opacityIn" id="layer_main">' + layer_title + '<div ' + layer_content_style + '>' + options.content + '</div>' + layer_btns + '</div>';
	layer_root.innerHTML = layerHTML;
	//加入到body中显示
	document.body.appendChild(layer_root);
	//按钮点击事件
	if (layer_btns) {
		var layer_btns_dom = document.getElementById("layer_btns");
		if (layer_btns_dom) {
			layer_btns_dom.addEventListener("tap", function(e) {
				var tagId = e.target.getAttribute("id");
				if (tagId) {
					var index = Number(tagId);
					if (options.event && options.event.length > index) {
						var event = options.event[index];
						if (event && event()) return; //执行回调返回true,则继续显示对话框
					}
					layerClose(options.closeEvent);
				}
			});
		}
	}
	//对话框主体,阻止事件冒泡
	var layer_main = document.getElementById("layer_main");
	layer_main.addEventListener("tap", function(e) {
		e.stopPropagation();
	});
	//点击对话框外是否关闭
	document.getElementById("layer_root").addEventListener("touchmove", function(e) {
		e.preventDefault();
	});
	if (options.shadeClose) {
		layer_root.addEventListener("tap", function() {
			layerClose(options.closeEvent);
		});
	}
	//Android点击back键是否关闭,默认不传,则为true关闭
	if (options.backClose != false && mui.os.android) {
		var old_back = mui.back;
		//重写back方法
		mui.back = function() {
				layerClose(options.closeEvent);
			}
			//关闭后需还原
		androidBackEvent = function() {
			mui.back = old_back;
		}
	}
}
/*
 * 关闭对话框
 */
var androidBackEvent; //Android点击后退键关闭对话框的回调
function layerClose(closeEvent) {
	var layer_root = document.getElementById("layer_root");
	if (layer_root) {
		//关闭动画320毫秒,比300毫秒长一点,防止闪烁
		var layer_main = document.getElementById("layer_main");
		layer_main.classList.add("scaleOut");
		layer_main.classList.add("opacityOut");
		layer_root.classList.add("opacityOut");
		//延时关闭,防止事件穿透
		setTimeout(function() {
			document.body.removeChild(layer_root);
		}, 300);
	}
	//对话框关闭的回调
	closeEvent && closeEvent();
	//Android点击后退键关闭对话框的回调
	androidBackEvent && androidBackEvent();
}