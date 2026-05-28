# 首页内容管理 实施任务

- [x] Task 1: 扩展数据访问与云函数
    - 1.1: 在 `utils/db.js` 中新增 `HOME_DEFAULT` 常量与 `getHomeConfig()` 方法（带默认 fallback）
    - 1.2: 导出 `getHomeConfig`、`HOME_DEFAULT`
    - 1.3: 在 `cloudfunctions/adminAction/index.js` 新增 `upsertHomeConfig` 分支，使用 `siteConfig` 集合 `doc('home').set()`
    - 1.4: 重新部署 adminAction 云函数（提示用户）

- [x] Task 2: 创建管理员首页编辑页
    - 2.1: 新建 `pages/admin/home-edit/index.{js,json,wxml,wxss}`
    - 2.2: js 中 onLoad 调用 `getHomeConfig()` 预填 form，含 banners/tag/title/subtitle
    - 2.3: wxml 使用 `upload-image` 组件（multiple + max=4）+ 三个 input
    - 2.4: 实现 onChangeBanners / 文本输入 / onSave，保存时校验 banner 至少 1 张
    - 2.5: 保存调用 `adminCall('upsertHomeConfig', form)`，成功 toast + navigateBack
    - 2.6: 添加基础样式（与现有 admin 编辑页一致）

- [x] Task 3: 注册页面与管理员入口
    - 3.1: 在 `app.json` pages 数组追加 `pages/admin/home-edit/index`
    - 3.2: 在 `pages/profile/index.wxml` 管理员中心追加入口行（图标 🖼️ 首页内容管理）
    - 3.3: 在 `pages/profile/index.js` 添加跳转方法 `onAdminHome`

- [x] Task 4: 首页接入动态配置
    - 4.1: `pages/index/index.js` data 增加 `homeTag/homeTitle/homeSubtitle` 默认值
    - 4.2: onShow 中调用 `getHomeConfig()`，覆盖 banners/homeTag/homeTitle/homeSubtitle
    - 4.3: 空 banners 时回落默认占位图
    - 4.4: `pages/index/index.wxml` 将 b-tag/b-title/b-sub 改为变量绑定
