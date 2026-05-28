# 沈阳银科隔墙 微信小程序

## 项目简介
工业级铝合金隔断系统的微信小程序，覆盖产品展示、工程案例、询价沟通、用户与管理员双角色。

## 目录结构
- `pages/` 业务页面（首页/展厅/案例/询价/我的/关于 + admin/*）
- `components/` 复用组件（section-title、product-card、case-card、upload-image、kv-editor、steps-editor、login-mask、floating-btn）
- `cloudfunctions/` 云函数（login、adminAction）
- `utils/` 工具（auth/db/format/theme）

## 部署步骤

### 1. 微信公众平台
- AppID 已配置：`wx79db5b2a7ccda8ac`（在 `project.config.json` 中）

### 2. 云开发环境
1. 在微信开发者工具左上角"云开发"创建环境
2. 修改 `app.js` 中的 `env` 字段为你的云环境 ID（默认 `syyk-dev`）
3. 创建云数据库集合：
   - `users`：字段 `_openid`、`role`(user/admin)、`nickName`、`avatarUrl`
   - `products`：铝型材数据
   - `cases`：工程案例
   - `inquiries`：询价工单
4. 集合权限建议：
   - `products` / `cases`：所有用户可读，仅创建者可写（管理走云函数）
   - `inquiries`：仅创建者可读写
   - `users`：仅创建者可读写

### 3. 云函数部署
分别右键以下目录 → 上传并部署：
- `cloudfunctions/login`
- `cloudfunctions/adminAction`

### 4. 配置管理员
在云函数 `login` 与 `adminAction` 的环境变量中设置：
- `ADMIN_OPENIDS`：用逗号分隔的管理员 openid 列表

首次以管理员账号进入小程序登录后，users 表中将自动写入 `role: 'admin'`。

### 5. 静态资源
- `images/figma/` 仅保留 5 张内容封面占位图（image_5/16/27/38/45），实际内容图建议上传到云存储；其余装饰图标已用 emoji + CSS 实现
- 富图与产品图集建议上传到云存储，前端使用 `cloud://` fileID

## 登录策略
- 不在 app 启动时主动登录
- 进入"我的"或"咨询"时调用 `ensureLogin()`
- `requireAdmin()` 在 admin/* 页面 onLoad/onShow 调用，非管理员自动 navigateBack

## 主要技术
- 微信小程序原生（WXML / WXSS / JS）
- CloudBase（数据库 + 云函数 + 云存储）
- RPX 响应式（基于 390px 设计稿）
- 主题色：深蓝 `#002045` + 砖红 `#A63B00`
