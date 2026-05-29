# 首页客服浮动球与配置 实施任务

- [x] Task 1: 数据层与云函数白名单
    - 1.1: utils/db.js 新增 SERVICE_DEFAULT（苑经理/罗顾问占位）
    - 1.2: 新增 getServiceConfig 并导出
    - 1.3: cloudfunctions/adminAction 白名单 SITE_DOCS 加 'service'
    - 1.4: 提示用户重新部署 adminAction

- [x] Task 2: 客服电话编辑页
    - 2.1: 新建 pages/admin/service-edit/index.{js,json,wxml,wxss}
    - 2.2: 表单 2 行（性别 picker + 称呼 input + 手机号 input），onLoad 鉴权 + 拉取
    - 2.3: 保存校验手机号格式（^1\d{10}$），调用 upsertSiteConfig docId=service
    - 2.4: 复用与关于我们一致的固定底部保存按钮样式

- [x] Task 3: 注册页面与入口
    - 3.1: app.json 注册 pages/admin/service-edit/index
    - 3.2: pages/admin/content/index.js items 增加「📞 客服电话」卡片

- [x] Task 4: 首页浮动球展开两个客服
    - 4.1: pages/index/index.js data 增加 fabOpen / agents；onShow 拉 getServiceConfig
    - 4.2: 修改 onFab：有客服配置时切换 fabOpen，否则保留跳询价逻辑
    - 4.3: 新增 onCallAgent(e) 调 wx.makePhoneCall
    - 4.4: WXML 在浮动球附近增加蒙层 + 两个圆形头像（gender → 👨‍💼/👩‍💼）+ 称呼标签
    - 4.5: 点击蒙层 / 浮动球收起
    - 4.6: WXSS 头像渐入动画与定位
