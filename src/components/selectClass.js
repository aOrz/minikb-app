  function getGradeList() {
  	var gradeN = [];
  	var date = new Date();
  	var year = date.getFullYear();
	  for(var i = 0; i < 5; i++){
	    gradeN.push({
	      value: year % 2000,
	      label: year + '级'
	    });
	    year--;
	  }
	  return gradeN;
  }
var selectClass = Vue.extend({
	template: `<div class="school_select">
						<select @change="getClassList" v-model="school">
							<option v-for="s in schoolInfo['school']"  :value="$key">{{s}}</option>
							<option value="">其他</option>
						</select>
						<div class="icon">
							<span class="mui-icon mui-icon-home"></span>
						</div>
					</div>
					<div class="major_select" v-show="school">
						<select @change="getClassList" v-model="grade">
							<option v-for="g in gradeList" :value="g" >{{g}}</option>
						</select>
						<div class="icon">
							<span class="mui-icon mui-icon-star"></span>
						</div>
					</div>
					<div class="major_select" style="top: -80px;" v-show="school">
						<select @change="getClassList" v-model="nianji">
							<option v-for="g in ninjiList" :value="g.value" >{{g.label}}</option>
						</select>
						<div class="icon">
							<span class="mui-icon mui-icon-star"></span>
						</div>
					</div>
					<div class="class_input" style="top: -120px;" v-show="school">
						<select v-model="className">
			              <option v-for="i in classList" :value="i">{{i}}</option>
			          	</select>
						<div class="icon">
							<span class="mui-icon mui-icon-compose"></span>
						</div>
					</div>`,
	data: function () {
		var ninjiList = getGradeList();
		return {
			ninjiList: ninjiList,
			classList: [],
			nianji: ninjiList[0].value,
			school: 'yd',
			grade: '',
			classList: [],
			className: '',
			schoolInfo: {}
		}
	},
	computed: {
		gradeList: function (){
			this.grade = this.schoolInfo[this.school][0];
			return this.schoolInfo[this.school];
		},
		classNum: function () {
			return this.className.match(/\d.*/)[0];
		}
	},
	methods: {
		getClassList: function () {
			if(this.school == ""){
				return;
			}
			var that = this;
			mui.ajax('http://kb.fddcn.cn/controller/course_controller.php', {
				async: false,
				data: {
					c: 'Getclass',
					schoolName: that.school,
					school_info: that.grade + '' + that.nianji
				},
				beforeSend: function() {
						plus.nativeUI.showWaiting();
				},
				complete: function() {
						plus.nativeUI.closeWaiting();
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'get', //HTTP请求类型
				timeout:8000,//超时时间设置为8秒；
				success: function(data) {
					console.log("success");
					//服务器返回响应，根据响应结果，分析是否请求成功；
					if (data && data!=0) {
						that.className = data[0];
						that.classList = data;
						console.log(JSON.stringify(data))
					}else {
						plus.nativeUI.toast("没找到班级");
					}
		
				},
				error: function(xhr, type, errorThrown) {
					console.log("error");
					//异常处理；
//					GetStaticSchoolName(school);
					plus.nativeUI.toast("网络错误");
				}
			});
		}
	},
	created: function () {
		var that = this;
		mui.ajax('http://kb.fddcn.cn/public/json/config.php', {
			async: false,
			data: {
				c: 'getSchoolInfo'
			},
			beforeSend: function() {
					plus.nativeUI.showWaiting();
			},
			complete: function() {
					plus.nativeUI.closeWaiting();
			},
			dataType: 'json', //服务器返回json格式数据
			type: 'get', //HTTP请求类型
			timeout:8000,//超时时间设置为8秒；
			success: function(data) {
				console.log("success");
				//服务器返回响应，根据响应结果，分析是否请求成功；
				if (data) {
					localStorage.setItem('schoolInfo', JSON.stringify(data));
					that.schoolInfo = data;
					that.getClassList();
					console.log(JSON.stringify(data))
				}
	
			},
			error: function(xhr, type, errorThrown) {
				plus.nativeUI.closeWaiting();
				console.log("error");
				//异常处理；
				//GetStaticSchoolName(school);
				plus.nativeUI.toast("网络错误");
			}
		});
	}
});