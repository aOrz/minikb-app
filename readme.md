# 迷你课表APP


---

一款可自动获取学校课程表的APP。

## 开发必读

标签（空格分隔）： 迷你课表

---

迷你课表大部分代码是我们大一时候所写，可想而知是非常烂的，欢迎大家对代码进行重构，在push代码是应该经过严格的测试，有解决不了的问题可以直接提Issure。

## 你可能会用到的东西
1. 基础的HTML，CSS,JS知识
2. Hbuilder编辑器
3. MUI框架[MUI文档and论坛][1]，Vue.js框架
4. HTML 5+扩展语法[Html5+文档][2]


  [1]: http://dev.dcloud.net.cn/mui/
  [2]: http://www.html5plus.org/


## 分享交流

打赏|加小助手进微信群
:---:|:---:
<img src="https://fddcn.cn/wp-content/uploads/2017/12/WechatIMG117.jpeg" width="200"/>  |  <img src="https://fddcn.cn/wp-content/uploads/2017/12/WechatIMG116.jpeg" width="200"/>

## 本地回归检查

仓库根目录新增不依赖 npm 安装的回归测试（仅测试工具要求 Node.js 18+，不改变 APP 的运行时要求）：

```bash
npm run check
TZ=America/New_York npm test
```

覆盖课程文本安全渲染、编辑弹窗重复操作、课表更新失败/取消、学期周数及小程序请求边界。
测试模拟 HTML5+ / 微信 API，不等于 HBuilder 打包或真机验证。可选的 `tests/browser_smoke.py`
使用 Python Playwright 和 `/usr/bin/chromium` 检查真实 DOM（所有网络/native API 均为本地模拟）。
详细结果、兼容性限制和未处理的安全风险见 [优化记录](doc/优化记录.md)。
