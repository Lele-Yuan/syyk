# 沈阳银科隔墙 微信小程序 — 任务计划

- [x] Task 1: 项目骨架与云开发初始化
    - 1.1: 创建 `app.js`/`app.json`/`app.wxss`/`project.config.json`/`sitemap.json`，写入 appId `wx79db5b2a7ccda8ac` 与云函数根目录
    - 1.2: 在 `app.js` 中实现 `wx.cloud.init` 与本地缓存恢复逻辑（不主动登录）
    - 1.3: 配置 `tabBar`（首页 / 展厅 / 案例 / 咨询 / 我的）
    - 1.4: 复制 figma assets 到 `images/figma/`
    - 1.5: 在 `app.wxss` 中定义全局主题变量、reset 与通用类

- [x] Task 2: 工具与基础组件
    - 2.1: `utils/theme.js` 主题色常量
    - 2.2: `utils/auth.js` ensureLogin / requireAdmin
    - 2.3: `utils/db.js` 数据库封装（products/cases/inquiries 读取）
    - 2.4: 组件 `section-title`（左侧砖红短条 + 标题）
    - 2.5: 组件 `floating-btn`（悬浮咨询按钮）
    - 2.6: 组件 `product-card`（展厅卡片）
    - 2.7: 组件 `case-card`（案例卡片）

- [x] Task 3: 云函数实现
    - 3.1: `cloudfunctions/login` 写入/读取 users，返回 role
    - 3.2: `cloudfunctions/adminAction` upsert/delete product、case；replyInquiry / closeInquiry / listInquiries
    - 3.3: 各云函数 package.json 与依赖

- [x] Task 4: 首页 pages/index/index
    - 4.1: 顶部 Banner 轮播
    - 4.2: 公司双地址信息卡
    - 4.3: 功能图标 Grid（4-6 入口）
    - 4.4: 局部工程案例横向滚动
    - 4.5: 悬浮"一键咨询/报价"按钮
    - 4.6: 数据接入（products/cases limit 拉取）

- [x] Task 5: 数字化展厅列表 pages/products/list
    - 5.1: 顶部 Banner + 标题区
    - 5.2: 智能筛选区（材质/规格/表面处理/防火）
    - 5.3: 产品卡片列表（map 渲染）
    - 5.4: 悬浮回到顶部按钮
    - 5.5: 云数据库查询 + 筛选

- [x] Task 6: 产品详情 pages/products/detail
    - 6.1: 头图轮播 + 系列标签 + 指示器
    - 6.2: 标题描述区
    - 6.3: 三大卖点卡片网格
    - 6.4: 技术规格表
    - 6.5: 参数对比工具卡片（深蓝大卡）
    - 6.6: 配套工程案例横滚
    - 6.7: 底部固定操作栏（转发/收藏/申请样品/一键询价）
    - 6.8: 数据接入与登录拦截（询价/收藏前 ensureLogin）

- [x] Task 7: 工程作品列表 pages/cases/list
    - 7.1: 标题区 + 副文案
    - 7.2: 分类筛选 Tab（全部/办公/医疗/商业）
    - 7.3: 案例卡片三种样式
    - 7.4: CTA 卡片（东北市场领导品牌）
    - 7.5: 数据接入

- [x] Task 8: 案例详情 pages/cases/detail
    - 8.1: 顶部 Banner + 渐变蒙层 + 标签 + 标题
    - 8.2: 数据三栏卡（施工面积/周期/型材）
    - 8.3: 项目概况卡片
    - 8.4: 实景展示横向滚动图
    - 8.5: 施工流程步骤列表
    - 8.6: 所用材料深蓝卡
    - 8.7: 客户评价浅灰卡
    - 8.8: 底部固定 CTA「获取同款方案报价」

- [x] Task 9: 询价模块（用户侧）
    - 9.1: pages/inquiry/index 提交表单（项目名/姓名/电话/地址/面积/系列/备注）+ 校验
    - 9.2: 我的询价 Tab 列表
    - 9.3: pages/inquiry/detail 询价详情（含管理员回复展示）
    - 9.4: 登录引导遮罩组件（onShow ensureLogin）

- [x] Task 10: 我的页 pages/profile/index
    - 10.1: 用户信息卡（头像/昵称/角色徽章）
    - 10.2: 入口列表（我的询价/我的收藏/关于我们）
    - 10.3: admin 角色额外管理入口（产品/工程/询价管理）
    - 10.4: 登录遮罩与 ensureLogin

- [x] Task 11: 关于我们 pages/about/index
    - 11.1: 公司简介
    - 11.2: 双地址（沈阳/大连）+ 地图入口
    - 11.3: 联系电话 + 资质展示

- [x] Task 12: 管理员 — 产品/案例管理列表
    - 12.1: pages/admin/products-manage 列表 + 新增/编辑/删除按钮
    - 12.2: pages/admin/cases-manage 列表 + 新增/编辑/删除按钮
    - 12.3: 删除二次确认 modal

- [x] Task 13: 管理员 — 添加/编辑铝型材 pages/admin/product-edit
    - 13.1: 基本信息表单（标题/系列/徽章/材质等）
    - 13.2: 描述 textarea
    - 13.3: 三大卖点动态条目编辑器
    - 13.4: 技术规格 KV 编辑器组件
    - 13.5: 主图与图集云存储上传组件
    - 13.6: 提交云函数 upsertProduct

- [x] Task 14: 管理员 — 添加/编辑工程作品 pages/admin/case-edit
    - 14.1: 项目基本字段（标题/分类/地点/面积等）
    - 14.2: 项目概况 + 数据三栏 KV
    - 14.3: 实景展示多图上传
    - 14.4: 施工流程步骤编辑器组件
    - 14.5: 所用材料选择器（关联 products）
    - 14.6: 客户评价表单 + 关联标签 chips
    - 14.7: 提交云函数 upsertCase

- [x] Task 15: 管理员 — 询价管理
    - 15.1: pages/admin/inquiry-manage 列表 + 状态筛选 Tab
    - 15.2: pages/admin/inquiry-reply 详情只读展示
    - 15.3: 回复输入 + 发送 + 关闭工单
    - 15.4: 调用云函数 replyInquiry / closeInquiry

- [x] Task 16: 联调与收尾
    - 16.1: 各页面真机自测、TabBar 切换、登录态流转
    - 16.2: 修复样式与边距细节
    - 16.3: README 简要部署说明（云环境 ID、ADMIN_OPENIDS 配置）
