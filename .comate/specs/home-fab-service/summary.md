# 首页客服浮动球与配置 完成总结

## 已完成内容

### 1. 数据层
- `utils/db.js`：新增 `SERVICE_DEFAULT`（苑经理 18540270142 / 罗顾问 18842394828），新增 `getServiceConfig()` 过滤掉空号码。
- `cloudfunctions/adminAction/index.js`：`SITE_DOCS` 白名单加入 `'service'`。**需要重新部署 adminAction 云函数才能生效。**

### 2. 客服电话编辑页
- 新建 `pages/admin/service-edit/index.{js,json,wxml,wxss}`
- 表单 2 行（性别 picker + 称呼 + 手机号），保存时 `^1\d{10}$` 校验
- 通过 `adminAction.upsertSiteConfig(docId='service')` 写入云端
- 底部固定保存按钮样式与「关于我们」一致

### 3. 注册与入口
- `app.json` 注册 `pages/admin/service-edit/index`
- `pages/admin/content/index.js` 新增「📞 客服电话」卡片入口

### 4. 首页浮动球
- `pages/index/index.js`：`onShow` 通过 `Promise.all` 拉 `getServiceConfig`，新增 `fabOpen / agents` 状态
- `onFab`：有客服配置时切换 `fabOpen`，否则回退到跳询价页
- 新增 `onCallAgent(e)`、`onCloseFab()`，通过 `data-phone` 调 `wx.makePhoneCall`
- WXML：浮动球展开时显示蒙层 + 卡片化客服列表（性别 → 👨‍💼/👩‍💼 + 称呼 + 号码），图标在 💬 / ✕ 间切换
- WXSS：渐入动画 `fabIn` + 圆角胶囊布局，位于浮动球上方

## 后续动作
1. **重新部署 cloudfunctions/adminAction**（否则保存客服配置会被白名单拦截）
2. 进入 内容管理 → 客服电话，按需修改两位客服信息
