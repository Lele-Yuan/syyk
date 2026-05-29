# 首页客服浮动球与配置 (home-fab-service)

## 需求
1. 首页右下角💬浮动球点击后不再直接跳询价，而是展开显示两个客服图标（一男一女）
2. 点击图标各自拨打对应客服手机号
3. 内容管理新增「客服电话」模块，可配置 2 个客服手机号（含称呼字段）

## 数据结构
新增 siteConfig 文档 `service`：
```
{
  agents: [
    { gender: 'male',   name: '苑经理', phone: '18540270142' },
    { gender: 'female', name: '罗顾问', phone: '18842394828' }
  ]
}
```
默认值在 db.js `SERVICE_DEFAULT` 中提供占位

## 影响文件
- `utils/db.js`：新增 SERVICE_DEFAULT、getServiceConfig；导出
- `cloudfunctions/adminAction/index.js`：upsertSiteConfig 白名单 SITE_DOCS 加 'service'（**需重新部署**）
- 新增页面 `pages/admin/service-edit/index.{js,json,wxml,wxss}`：2 行 fixed 表单（每行：性别选择/称呼/手机号）
- `pages/admin/content/index.js`：内容管理新增「📞 客服电话」卡片
- `app.json`：注册新页面
- 浮动球升级：
  - 改造 `components/floating-btn/index.{js,wxml,wxss}` 支持 popover 模式（slot 或属性 agents 数组）
  - 或在 `pages/index/` 直接实现「点击展开 → 两个客服按钮」，不动通用组件
- 选定方案：**在首页本地实现展开层**（避免组件双用途复杂化），floating-btn 仍负责单一💬入口
  - `pages/index/index.{js,wxml,wxss}`：
    - data 新增 fabOpen / agents
    - onShow 拉取 getServiceConfig
    - 浮动球 onFab 改为切换 fabOpen
    - 展开层在浮动球上方堆叠两个客服圆形头像（emoji 👨‍💼 / 👩‍💼），点击 makePhoneCall

## 边界
- 仅配置 1 个手机号时只显示 1 个图标
- 都未配置时默认隐藏图标，点击浮动球退化为直接跳咨询页（保留原行为）
- 性别可选 male/female，决定头像 emoji；称呼仅展示
- 关闭：点浮动球再次点收起；或点击外层蒙层收起

## 预期
- 内容管理可配置两个客服手机号
- 首页浮动球点击展开，分别可一键拨号
- 关于我们/其他页保留 floating-btn 原行为（单击触发 tap 事件）
