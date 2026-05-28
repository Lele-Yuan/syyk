# 沈阳银科隔墙 微信小程序设计文档

## 一、项目概述

### 项目定位
为「沈阳银科隔墙」打造的官方微信小程序，主要服务于工业级铝合金隔断型材产品的展示、询价和购物。是面向 B 端（装修公司、工程客户）和 C 端（零售客户）的双轨业务承载平台。**接入微信云开发**，数据存储于云数据库与云存储，并具备**用户角色管理**（普通用户 / 管理员）。

### 基本信息
- 项目名称：沈阳银科隔墙
- AppID：`wx79db5b2a7ccda8ac`
- 技术栈：原生微信小程序（WXML + WXSS + JS + JSON）+ 微信云开发（CloudBase：DB / Storage / 云函数）
- 设计参考：Figma 设计稿（数字化展厅、工程作品列表、案例详情）
- 设计 Token（来自设计稿）
  - 主色：`#002045` / `#A63B00` / `#FC6C29`
  - 文本：`#181C1E` / `#43474E` / `#FFFFFF`
  - 中性：`#F1F4F6` / `#EBEEF0` / `#C4C6CF`
  - 圆角：8 / 12 / 16 / 24 px

## 二、云开发架构

### 2.1 云环境
- 在小程序后台开通云开发，环境 ID 在 `app.js` 中配置：`wx.cloud.init({ env: 'cloud1-1g7rlzwk02e38290', traceUser: true })`。
- 部署目录 `cloudfunctions/`：包含云函数 `login`、`getProfile`、`setRole`、`adminAction`。

### 2.2 云数据库集合（Collection）
| 集合 | 字段 | 用途 |
|---|---|---|
| `users` | `_id`, `_openid`, `nickName`, `avatarUrl`, `role`(`user`/`admin`), `createdAt` | 用户与角色 |
| `products` | `_id`, `title`, `series`, `cover`(fileID), `gallery`(fileID[]), `badge`, `badgeType`, `material`, `acoustic`, `thickness`, `fireRating`, `surface`, `moduleWidth`, `features`(`{title,desc,icon}[]`), `specs`(`{label,value}[]`), `description`, `createdAt`, `createdBy` | 铝型材产品 |
| `cases` | `_id`, `title`, `subtitle`, `category`(办公/医疗/商业), `location`, `area`, `cover`, `gallery`, `tags`(string[]), `summary`, `address`, `difficulty`, `process`(`{step,title,desc}[]`), `materials`(`{productId,name,desc,icon}[]`), `testimonial`(`{name,role,content,rating,avatar}`), `stats`(`{label,value}[]`), `createdAt`, `createdBy` | 工程作品 |
| `inquiries` | `_id`, `_openid`, `userName`, `phone`, `projectName`, `address`, `area`, `series`, `productId`/`caseId`, `remark`, `status`(`pending`/`replied`/`closed`), `reply`(`{content, repliedBy, repliedAt}`), `createdAt`, `updatedAt` | 询价记录（含管理员回复） |

### 2.3 云存储
- 路径规范：`products/{productId}/cover/xxx.jpg`、`products/{productId}/gallery/xxx.jpg`、`cases/{caseId}/...`。
- 上传：管理员页面通过 `wx.cloud.uploadFile()` 上传，得到 `fileID`，存入对应集合字段。
- 渲染：`<image>` 直接绑定 fileID，小程序原生支持 `cloud://` 协议（也可用 `wx.cloud.getTempFileURL` 拿临时链接）。

### 2.4 数据库权限
- `users`：仅创建者可读写（其私密资料）；管理员可读写所有（通过云函数）。
- `products`、`cases`：所有用户可读；仅管理员可写（通过云函数 `adminAction` 进行写入，前端按钮在普通角色下隐藏，云函数二次校验）。
- `inquiries`：仅创建者可读；管理员可读所有。

### 2.5 登录与角色管理
**登录策略：延迟登录（懒加载）**
- 小程序 `onLaunch` 仅执行 `wx.cloud.init`，**不**主动调用登录、不弹授权。
- 用户浏览首页 / 展厅 / 案例 / 产品详情 / 案例详情等页面均无需登录。
- **触发登录的入口**（仅这两个）：
  1. 点击底部 TabBar「咨询」（询价购物页 `pages/inquiry/index`）
  2. 点击底部 TabBar「我的」或个人中心相关入口（`pages/profile/index`）
- 触发逻辑：在这两个页面的 `onShow` 调用 `ensureLogin()`：
  - 若 `app.globalData.userInfo` 已存在 → 直接渲染。
  - 否则展示「登录提示页/遮罩」：一个居中按钮 `<button open-type="getUserInfo">微信登录</button>`（使用 `wx.getUserProfile` 拉取头像昵称），用户点击后：
    1. `wx.getUserProfile` 获取昵称头像
    2. `wx.cloud.callFunction({ name: 'login', data: { userInfo } })` 写入/读取 `users` 集合
    3. 写入 `app.globalData.userInfo` + `wx.setStorageSync('userInfo', ...)` 缓存
    4. 关闭遮罩，渲染目标页内容
- 角色：
  - `login` 云函数若 `users` 集合无该 openid 则创建，默认 `role: 'user'`；存在则返回当前 role。
  - 管理员通过云开发控制台手工改 `role` 为 `admin`，或预置 `ADMIN_OPENIDS` 环境变量。
  - 进入 `pages/admin/*` 前在 `onLoad` 调 `requireAdmin()`，先调 `ensureLogin()`，再校验 role；非 admin toast 后返回。
- 询价/申请样品/收藏 等动作前同样调用 `ensureLogin()`，未登录则先弹登录遮罩，登录成功后继续动作。

## 三、功能模块

### 3.1 首页（pages/index/index）
- 顶部 Banner（轮播）+ 公司信息 + 4-6 功能图标区 + 局部工程案例 + 悬浮咨询按钮。
- 数据：从 `products`/`cases` 集合拉取 `limit(3)` 作为推荐展示。

### 3.2 数字化展厅（pages/products/list）
- 顶部 Banner、标题、智能筛选（材质/规格/表面处理/防火）、纵向卡片列表。
- 数据：`db.collection('products').where(filters).orderBy('createdAt','desc').get()`。

### 3.3 产品详情（pages/products/detail）
- 头图轮播、三大卖点卡、技术规格表、参数对比工具、配套工程案例、底部固定操作栏（转发/收藏/申请样品/一键询价）。
- 数据：根据 `id` 查 `products`；配套案例：`cases.where({ relatedProducts: id })`。

### 3.4 工程作品列表（pages/cases/list）
- 标题、分类筛选 Tab（全部/办公/医疗/商业）、案例卡片列表、CTA 卡。
- 数据：`db.collection('cases').where({ category })`。

### 3.5 案例详情（pages/cases/detail）
- 顶部 Banner + 数据三栏 + 项目概况 + 实景展示（横滚）+ 施工流程（步骤列表）+ 所用材料（深蓝卡）+ 客户评价 + 底部 CTA。
- 数据：根据 `id` 查 `cases`。

### 3.6 询价购物（pages/inquiry/index）
登录后可见。Tab 切换：**提交询价 / 我的询价**（管理员额外多一个 Tab：**询价管理**）。

#### 3.6.1 提交询价（用户）
表单字段：
- 项目名称（必填）
- 联系人姓名（必填）
- 联系电话（必填，11 位手机号校验）
- 项目具体地址（省市区 + 详细地址，必填）
- 项目面积（数字，单位 ㎡，必填）
- 意向系列 / 产品（picker，从 `products` 集合拉取，可选）
- 备注（textarea，选填）
- 提交：写入 `inquiries` 集合，`status='pending'`，toast「提交成功，我们会尽快与您联系」。

#### 3.6.2 我的询价（用户）
- 列表：当前 openid 名下的所有询价，按 `createdAt desc`。
- 卡片字段：项目名 + 状态徽章（`待回复`/`已回复`/`已关闭`） + 提交时间 + 摘要（地址、面积）。
- 点击进入「询价详情页」`pages/inquiry/detail`：展示完整提交信息 + 管理员回复（若 `status==='replied'`）。

#### 3.6.3 询价管理（管理员）
路径 `pages/admin/inquiry-manage`：
- 顶部筛选 Tab：全部 / 待回复 / 已回复 / 已关闭。
- 列表：所有用户询价（按状态、时间倒序），卡片含用户昵称、电话、项目名、地址、面积、状态。
- 点击进入「询价回复页」`pages/admin/inquiry-reply`：
  - 上半屏：完整询价信息只读展示。
  - 下半屏：回复输入框（textarea） + 「发送回复」按钮 + 「关闭工单」按钮。
  - 提交回复：调云函数 `adminAction({ action:'replyInquiry', id, payload:{ content } })`，设置 `status='replied'`、`reply={...}`、`updatedAt`。

#### 3.6.4 通知
- 用户提交询价：管理员端列表实时刷新（进入页面时拉取）；可选用「订阅消息」推送。
- 管理员回复：用户进入「我的询价」可见状态变更，可选订阅消息通知。
- 实现：本期通过页面 `onShow` 重新拉取数据实现刷新，订阅消息为后续可选增强。

### 3.7 我的（pages/profile/index）—— 新增
- 用户信息卡（头像、昵称、角色徽章 `管理员`/`普通用户`）。
- 入口列表：我的询价、我的收藏、关于我们。
- 当 `role === 'admin'` 时额外显示**管理员入口**：管理铝型材、管理工程作品。

### 3.8 管理员页面 —— 新增
路径基于详情页结构镜像设计，便于复用样式：

#### 3.8.1 管理列表（pages/admin/products-manage / cases-manage）
- 顶部操作栏：标题、`+ 新增` 按钮（砖红 CTA）。
- 数据列表：复用 `product-card` / `case-card` 但右上角增加 `编辑 / 删除` 浮层按钮。

#### 3.8.2 添加/编辑铝型材（pages/admin/product-edit）
对应「产品详情页」结构 1:1 字段化：
- 基本信息表单
  - 标题（必填）、系列、徽章文案、徽章类型选择
  - 材质、隔音值、壁厚、防火等级、表面处理、模块宽度
- 描述（textarea）
- 三大卖点：动态条目（最多 6 条），每条 `图标 + 标题 + 描述`，可增删
- 技术规格（KV 列表，可增删行）
- 主图上传（单图）+ 图集上传（多图，最多 9 张）
- 关联工程案例：多选已存在案例
- 提交按钮：调用云函数 `adminAction({ action:'upsertProduct', payload })`。

#### 3.8.3 添加/编辑工程作品（pages/admin/case-edit）
对应「案例详情页」结构：
- 项目基本：标题、副标题、分类（picker）、地点、面积、项目类型标签
- 项目概况：描述（textarea）、地址、施工难点
- 数据三栏（KV：施工面积/施工周期/主要型材）
- 实景展示图集（多图上传）
- 施工流程：步骤列表（动态条目：编号自增，title + desc，可增删/排序）
- 所用材料：从 `products` 集合中选择 + 自填描述（多条）
- 客户评价：姓名、职位、内容、星级、头像
- 关联标签：多选 chips（双玻百叶系统、超白钢化玻璃、高隔音隔断 …）
- 主图上传 + 渐变蒙层标签文案
- 提交按钮：`adminAction({ action:'upsertCase', payload })`。

> 添加页面整体使用 `<scroll-view>` 包裹，每个 section 用 `section-title` 组件作分组标题，与首页/详情页视觉一致。

### 3.9 关于我们（pages/about/index）
公司简介 + 双地址（沈阳/大连） + 联系电话 + 资质。

## 四、工程结构

```
/
├── app.js / app.json / app.wxss
├── project.config.json (appId: wx79db5b2a7ccda8ac, cloudfunctionRoot)
├── sitemap.json
├── pages/
│   ├── index/
│   ├── products/{list,detail}/
│   ├── cases/{list,detail}/
│   ├── inquiry/                    用户询价（提交 + 我的询价）
│   │   ├── index/
│   │   └── detail/                 询价详情（用户视角，看回复）
│   ├── profile/
│   ├── about/
│   └── admin/
│       ├── products-manage/
│       ├── cases-manage/
│       ├── product-edit/
│       ├── case-edit/
│       ├── inquiry-manage/         询价管理列表
│       └── inquiry-reply/          询价详情 + 回复
├── components/
│   ├── section-title/
│   ├── product-card/
│   ├── case-card/
│   ├── floating-btn/
│   ├── upload-image/         单/多图云上传
│   ├── kv-editor/            KV 列表动态编辑器
│   └── steps-editor/         施工流程步骤编辑器
├── cloudfunctions/
│   ├── login/                index.js, package.json
│   ├── getProfile/
│   └── adminAction/          统一入口 upsert/delete product/case
├── utils/
│   ├── theme.js
│   ├── auth.js               登录态、角色判断
│   └── db.js                 db 集合封装
└── images/figma/             复制自 figma assets
```

## 五、关键代码片段

### app.js
```js
App({
  globalData: { userInfo: null, role: null },
  onLaunch() {
    if (!wx.cloud) return console.error('请使用 2.2.3+ 基础库');
    wx.cloud.init({ env: 'cloud1-1g7rlzwk02e38290', traceUser: true });
    // 仅恢复本地缓存，不主动登录
    const cached = wx.getStorageSync('userInfo');
    if (cached) {
      this.globalData.userInfo = cached;
      this.globalData.role = cached.role;
    }
  }
});
```

### utils/auth.js
```js
const app = getApp();

// 确保已登录；未登录则跳转登录页或返回 false 由调用方处理遮罩
export const ensureLogin = () => new Promise((resolve) => {
  if (app.globalData.userInfo) return resolve(app.globalData.userInfo);
  wx.getUserProfile({
    desc: '用于完善您的会员资料',
    success: async ({ userInfo }) => {
      const { result } = await wx.cloud.callFunction({ name: 'login', data: { userInfo } });
      const merged = { ...userInfo, ...result };
      app.globalData.userInfo = merged;
      app.globalData.role = result.role;
      wx.setStorageSync('userInfo', merged);
      resolve(merged);
    },
    fail: () => resolve(null)
  });
});

export const requireAdmin = async () => {
  const u = await ensureLogin();
  if (!u || u.role !== 'admin') {
    wx.showToast({ title: '需管理员权限', icon: 'none' });
    setTimeout(() => wx.navigateBack(), 800);
    return false;
  }
  return true;
};
```

### 询价 / 我的页 onShow 模式
```js
import { ensureLogin } from '../../utils/auth';
Page({
  data: { authed: false, userInfo: null },
  async onShow() {
    const u = await ensureLogin();
    if (!u) return this.setData({ authed: false }); // 显示登录引导遮罩
    this.setData({ authed: true, userInfo: u });
    this.loadData();
  },
  async onTapLogin() {        // 遮罩中按钮触发
    const u = await ensureLogin();
    if (u) this.setData({ authed: true, userInfo: u }), this.loadData();
  }
});
```

### cloudfunctions/login/index.js
```js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const ADMIN_OPENIDS = (process.env.ADMIN_OPENIDS || '').split(',');

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { userInfo = {} } = event;
  const col = db.collection('users');
  const exist = await col.where({ _openid: OPENID }).get();
  if (exist.data.length === 0) {
    const role = ADMIN_OPENIDS.includes(OPENID) ? 'admin' : 'user';
    await col.add({ data: {
      _openid: OPENID, role,
      nickName: userInfo.nickName || '',
      avatarUrl: userInfo.avatarUrl || '',
      createdAt: db.serverDate()
    }});
    return { openid: OPENID, role };
  }
  // 已存在：用最新昵称/头像更新一次
  if (userInfo.nickName) {
    await col.doc(exist.data[0]._id).update({ data: {
      nickName: userInfo.nickName, avatarUrl: userInfo.avatarUrl
    }});
  }
  return { openid: OPENID, role: exist.data[0].role };
};
```

### cloudfunctions/adminAction/index.js
```js
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const me = await db.collection('users').where({ _openid: OPENID }).get();
  if (!me.data[0] || me.data[0].role !== 'admin') {
    return { code: 403, msg: '无权限' };
  }
  const { action, payload, id } = event;
  if (action === 'upsertProduct') {
    return id
      ? db.collection('products').doc(id).update({ data: payload })
      : db.collection('products').add({ data: { ...payload, createdAt: db.serverDate(), createdBy: OPENID } });
  }
  if (action === 'upsertCase') {
    return id
      ? db.collection('cases').doc(id).update({ data: payload })
      : db.collection('cases').add({ data: { ...payload, createdAt: db.serverDate(), createdBy: OPENID } });
  }
  if (action === 'deleteProduct') return db.collection('products').doc(id).remove();
  if (action === 'deleteCase') return db.collection('cases').doc(id).remove();
  if (action === 'replyInquiry') {
    return db.collection('inquiries').doc(id).update({ data: {
      status: 'replied',
      reply: { content: payload.content, repliedBy: OPENID, repliedAt: db.serverDate() },
      updatedAt: db.serverDate()
    }});
  }
  if (action === 'closeInquiry') {
    return db.collection('inquiries').doc(id).update({
      data: { status: 'closed', updatedAt: db.serverDate() }
    });
  }
  if (action === 'listInquiries') {
    const { status } = payload || {};
    const w = status && status !== 'all' ? { status } : {};
    return db.collection('inquiries').where(w).orderBy('createdAt', 'desc').limit(100).get();
  }
  return { code: 400, msg: '未知操作' };
};
```

### utils/auth.js（旧片段已上移到「关键代码片段」一节，此处删除）

### 上传组件 components/upload-image
```js
async chooseAndUpload() {
  const { tempFiles } = await wx.chooseMedia({ count: this.data.max, mediaType: ['image'] });
  const fileIDs = [];
  for (const f of tempFiles) {
    const ext = f.tempFilePath.split('.').pop();
    const cloudPath = `${this.data.dir}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const r = await wx.cloud.uploadFile({ cloudPath, filePath: f.tempFilePath });
    fileIDs.push(r.fileID);
  }
  this.triggerEvent('change', fileIDs);
}
```

## 六、边界与异常
- 未登录或 cloud.init 失败：toast 提示并降级展示空状态。
- 普通用户访问 `pages/admin/*`：`onLoad` 调 `requireAdmin()`，非管理员立即返回。
- 上传超时：try/catch 弹出"上传失败请重试"。
- 删除前 `wx.showModal` 二次确认。
- 字段缺失：表单提交前做必填校验。

## 七、数据流
```
小程序启动 → wx.cloud.init → cloud.callFunction(login) → 保存 role
列表页 → wx.cloud.database().collection(...).get() → setData → 渲染
管理员添加 → 表单 → 上传图片得 fileID → callFunction(adminAction, upsert) → 返回 _id → 提示成功
```

## 八、预期效果
- 全部 13 个页面按 Figma 风格还原（首页 / 展厅 / 产品详情 / 案例列表 / 案例详情 / 询价提交 / 询价详情 / 我的 / 关于 / 产品管理 / 工程管理 / 询价管理 / 询价回复 + 编辑两页）；
- 数据来自云数据库，图片来自云存储；
- 普通用户：浏览所有展示内容；点击「咨询/我的」时触发登录；可提交询价（项目名、地址、面积、电话等）、查看自己的询价历史与管理员回复；
- 管理员：在「我的」中看到管理入口，可增删改产品/案例；可查看全部询价，对工单进行回复或关闭；
- 添加页字段与详情页展示字段一一对应。
