(function(w,index) {
	var server = "http://2.minikb.sinaapp.com/updata.json", //获取升级描述文件服务器地址
		localDir = "update",
		localFile = "update.json", //本地保存升级描述目录和文件名
		keyUpdate = "updateCheck", //取消升级键名
		keyAbort = "updateAbort", //忽略版本键名
		checkInterval = 259200, //升级检查间隔，单位为ms,7天为7*24*60*60*1000=60480000, 如果每次启动需要检查设置值为0
		dir = null;
	/**
	 * 准备升级操作
	 * 创建升级文件保存目录
	 */
	function initUpdate() {
		// 打开doc根目录
		plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs) {
			fs.root.getDirectory(localDir, {
				create: true
			}, function(entry) {
				dir = entry;
				checkUpdate();
			}, function(e) {
				console.log("准备升级操作，打开update目录失败：" + e.message);
			});
		}, function(e) {
			console.log("准备升级操作，打开doc目录失败：" + e.message);
		});
	}

	/**
	 * 检测程序升级
	 */
	function checkUpdate() {
		// 判断升级检测是否过期
		var lastcheck = plus.storage.getItem(keyUpdate);
		if (lastcheck) {
			var dc = parseInt(lastcheck);
			var dn = (new Date()).getTime();
			if (dn - dc < checkInterval) { // 未超过上次升级检测间隔，不需要进行升级检查
				return;
			}
			// 取消已过期，删除取消标记
			plus.storage.removeItem(keyUpdate);
		}
		// 读取本地升级文件
		dir.getFile(localFile, {
			create: false
		}, function(fentry) {
			fentry.file(function(file) {
				var reader = new plus.io.FileReader();
				reader.onloadend = function(e) {
					fentry.remove();
					var data = null;
					try {
						data = JSON.parse(e.target.result);
					} catch (e) {
						console.log("读取本地升级文件，数据格式错误！");
						return;
					}
					checkUpdateData(data);
				}
				reader.readAsText(file);
			}, function(e) {
				console.log("读取本地升级文件，获取文件对象失败：" + e.message);
				fentry.remove();
			});
		}, function(e) {
			// 失败表示文件不存在，从服务器获取升级数据
			getUpdateData();
		});
	}
	/*资源更新下载安装包*/
	function downWgt(wgtUrl) {
		plus.nativeUI.showWaiting("下载wgt文件...");
		plus.downloader.createDownload(wgtUrl, {
			filename: "_doc/update/"
		}, function(d, status) {
			if (status == 200) {
				console.log("下载wgt成功：" + d.filename);
				installWgt(d.filename); // 安装wgt包
			} else {
				console.log("下载wgt失败！");
				plus.nativeUI.alert("下载wgt失败！");
			}
			plus.nativeUI.closeWaiting();
		}).start();
	}
	/**应用下载的资源*/
	function installWgt(path) {
		plus.nativeUI.showWaiting("安装wgt文件...");
		plus.runtime.install(path, {}, function() {
			plus.nativeUI.closeWaiting();
			console.log("安装wgt文件成功！");
			plus.nativeUI.alert("应用资源更新完成！", function() {
				plus.runtime.restart();
			});
		}, function(e) {
			plus.nativeUI.closeWaiting();
			console.log("安装wgt文件失败[" + e.code + "]：" + e.message);
			plus.nativeUI.alert("安装wgt文件失败[" + e.code + "]：" + e.message);
		});
	}
	/**
	 * 检查升级数据
	 */
	function checkUpdateData(j) {
		/*var curVer=plus.runtime.version,
		
		inf = j[plus.os.name];
		if ( inf ){
			var srvVer = inf.version;
			// 判断是否存在忽略版本号
			var vabort = plus.storage.getItem( keyAbort );
			if ( vabort && srvVer==vabort ) {
				// 忽略此版本
				return;
			}
			// 判断是否需要升级
			if ( compareVersion(curVer,srvVer) ) {
				// 提示用户是否升级
				plus.ui.confirm( inf.note, function(i){
				alert(i)  
				i=i.index; 
					if ( 0==i ) { 
					alert(111)
						//plus.runtime.openURL( inf.url );
						wgtUrl(inf.url);
					} else if ( 1==i ) {
					alert(2)
						plus.storage.setItem( keyAbort, srvVer );
						plus.storage.setItem( keyUpdate, (new Date()).getTime().toString() );
					} else { 
					alert(3)
						plus.storage.setItem( keyUpdate, (new Date()).getTime().toString() );
					}
				}, inf.title, ["立即更新","跳过此版本","取　　消"] );
			}
		}*/
		/**差量更新*/
		plus.runtime.getProperty(plus.runtime.appid, function(infs) {
			curVer = infs.version;
			console.log('当前版本' + curVer)
			sercover=j['course_version'][plus.storage.getItem('xx')];//服务器端
			cname= 'course_version'+plus.storage.getItem('xx');
			curcover = parseInt(localStorage.getItem(cname)) ;
			console.log(sercover)
			console.log(curcover)
			if(!curcover){
				localStorage.setItem(cname,sercover)
			}else if(sercover>curcover){
				localStorage.setItem(cname,sercover);
				localStorage.setItem('course_updata',1)
				index.course_updata = 1;
			}
			
			inf = j['ziyuan'];
			if (inf) {
				//console.log(JSON.stringify(inf))
				var srvVer = inf.version;
				// 判断是否存在忽略版本号
				var vabort = plus.storage.getItem(keyAbort);
				if (vabort && srvVer == vabort) {
					// 忽略此版本
					return;
				}
				// 判断是否需要升级
				if (compareVersion(curVer, srvVer)) {
					console.log('检测升级')
						// 提示用户是否升级
					plus.ui.confirm(inf.note, function(event) {
						i=event.index; 
						if (0 == i) {
							//plus.runtime.openURL(inf.url);
							downWgt(inf.url);    
						} else if (1 == i) {
							plus.storage.setItem(keyAbort, srvVer);
							plus.storage.setItem(keyUpdate, (new Date()).getTime().toString());
						} else {
							plus.storage.setItem(keyUpdate, (new Date()).getTime().toString());
						}
					}, inf.title, ["立即更新", "跳过此版本", "取　　消"]);
				}
			}
		});




	}

	/**
	 * 从服务器获取升级数据
	 */
	function getUpdateData() {
		var xhr = new plus.net.XMLHttpRequest();
		xhr.onreadystatechange = function() {
			switch (xhr.readyState) {
				case 4:
					if (xhr.status == 200) {
						// 保存到本地文件中
						dir.getFile(localFile, {
							create: true
						}, function(fentry) {
							fentry.createWriter(function(writer) {
								writer.onerror = function() {
									console.log("获取升级数据，保存文件失败！");
								}
								writer.write(xhr.responseText);
							}, function(e) {
								console.log("获取升级数据，创建写文件对象失败：" + e.message);
							});
						}, function(e) {
							console.log("获取升级数据，打开保存文件失败：" + e.message);
						});
					} else {
						console.log("获取升级数据，联网请求失败：" + xhr.status);
					}
					break;
				default:
					break;
			}
		}
		xhr.open("GET", server);
		xhr.send();
	}

	/**
	 * 比较版本大小，如果新版本nv大于旧版本ov则返回true，否则返回false
	 * @param {String} ov
	 * @param {String} nv
	 * @return {Boolean} 
	 */
	function compareVersion(ov, nv) {
		console.log('ss' + ov + 'ss' + nv)
		if (!ov || !nv || ov == "" || nv == "") {
			return false;
		}
		var b = false,
			ova = ov.split(".", 4),
			nva = nv.split(".", 4);
		for (var i = 0; i < ova.length && i < nva.length; i++) {
			var so = ova[i],
				no = parseInt(so),
				sn = nva[i],
				nn = parseInt(sn);
			if (nn > no || sn.length > so.length) {
				return true;
			} else if (nn < no) {
				return false;
			}
		}
		if (nva.length > ova.length && 0 == nv.indexOf(ov)) {
			return true;
		}
	}

	if (w.plus) {
		initUpdate();
	} else {
		document.addEventListener("plusready", initUpdate, false);
	}

})(window,index);