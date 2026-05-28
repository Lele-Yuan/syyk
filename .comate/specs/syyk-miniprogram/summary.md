# 沈阳银科隔墙 微信小程序 — 任务总结

## 完成情况
全部 16 项任务已完成。

## 已交付内容

### 基础设施
- `app.js / app.json / app.wxss / project.config.json / sitemap.json`
- 全局主题色变量（深蓝 #002045 / 砖红 #A63B00）、reset 与通用类
- 5 项 tabBar：首页 / 展厅 / 案例 / 咨询 / 我的
- `wx.cloud.init` 启动初始化 + 本地缓存恢复（不主动登录）

### 工具库（utils/）
- `auth.js`：`ensureLogin()` 懒登录、`requireAdmin()` 角色守卫、`logout()`
- `db.js`：products / cases / inquiries 读取与 `adminCall()` 调用
- `format.js`：时间与状态文案
- `theme.js`：主题色常量

### 复用组件（components/）
1. section-title — 砖红短条 + 标题
2. floating-btn — 悬浮按钮
3. product-card — 产品卡（含 admin 模式编辑/删除）
4. case-card — 案例卡
5. upload-image — 云存储图片上传（单/多图）
6. kv-editor — KV 列表编辑器
7. steps-editor — 时间线步骤编辑器
8. login-mask — 登录引导遮罩

### 业务页面（pages/）
- 首页 `index`：Banner、双地址、入口 Grid、案例横滚、悬浮按钮
- 展厅列表 `products/list`：智能筛选 + 产品卡列表 + 回到顶部
- 产品详情 `products/detail`：图册、卖点、规格表、对比卡、配套案例、底部操作栏
- 案例列表 `cases/list`：分类 Tab + 案例卡 + 品牌 CTA
- 案例详情 `cases/detail`：Banner、数据三栏、概况、实景、流程、材料、评价、底部 CTA
- 询价 `inquiry/index`：表单 / 我的询价双 Tab
- 询价详情 `inquiry/detail`：客户视角的工单详情 + 管理员回复
- 我的 `profile/index`：用户卡 + 入口列表 + 管理员专属入口 + 登出
- 关于 `about/index`：公司简介、双地址、资质

### 管理员页面（pages/admin/）
- `products-manage` 铝型材管理列表（新增/编辑/删除）
- `cases-manage` 工程作品管理列表
- `product-edit` 添加/编辑铝型材（多图上传、卖点、规格 KV）
- `case-edit` 添加/编辑工程作品（流程步骤、材料、评价、多图）
- `inquiry-manage` 询价管理（状态 Tab 筛选）
- `inquiry-reply` 询价回复（回复内容、关闭工单、拨打电话）

### 云函数（cloudfunctions/）
- `login`：写入/读取 users 集合，依据 ADMIN_OPENIDS 自动赋管理员角色
- `adminAction`：upsertProduct / deleteProduct / upsertCase / deleteCase / replyInquiry / closeInquiry / listInquiries（均含管理员权限校验）

## 关键设计决策
1. **懒登录策略**：仅在「我的」「咨询」入口触发 `ensureLogin`，避免一进入小程序就弹授权框，提升首次体验
2. **双层管理员权限**：前端 `requireAdmin` 拦截路由 + 云函数 OPENID 二次校验，UI 与数据双重防御
3. **数据来源云开发**：所有产品/案例/询价数据走云数据库，图片资源走云存储 fileID，便于运营更新
4. **组件化表单编辑器**：`kv-editor` / `steps-editor` / `upload-image` 让管理员侧无需重复编写动态条目逻辑
5. **响应式 RPX**：所有尺寸基于 390px 设计稿映射 RPX，机型适配自动完成

## 后续建议（非本次范围）
- 增加产品收藏功能（用户表新增 favorites 字段）
- 询价新增"消息推送"接入 subscribeMessage 模板
- 接入腾讯地图 SDK 在「关于」页展示办公地址
- 富文本字段（描述/项目概况）切换为 mp-html 提升排版
- 增加运营 banner 配置集合，首页 Banner 可后台维护

## 部署
参考根目录 `README.md`，需配置：
- 云开发环境 ID（修改 app.js）
- 云函数环境变量 `ADMIN_OPENIDS`
- 创建 4 个数据库集合 (users / products / cases / inquiries) 并配置权限
