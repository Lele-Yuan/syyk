# 型材系列模块 实施任务

- [x] Task 1: 数据层与云函数白名单
    - 1.1: `utils/db.js` 新增 `SERIES_DEFAULT` 常量（4 项默认系列）
    - 1.2: 新增 `getSeriesConfig()` 并导出
    - 1.3: `cloudfunctions/adminAction/index.js` 在 `SITE_DOCS` 白名单加入 `series`
    - 1.4: 提示用户重新部署 adminAction

- [x] Task 2: 系列编辑页（含拖动排序）
    - 2.1: 新建 `pages/admin/series-edit/index.{js,json,wxml,wxss}`
    - 2.2: onLoad 鉴权 + 拉取 getSeriesConfig 渲染 items
    - 2.3: 名称 input 实现 onNameInput
    - 2.4: 新增按钮（生成 id + 空名称行）+ 删除按钮（保留至少 1 项校验）
    - 2.5: 拖动手柄 + bindtouchstart/move/end 实现实时重排
    - 2.6: onReady 用 selectorQuery 测量行高
    - 2.7: 保存按钮调用 `upsertSiteConfig` docId=series，过滤空名称
    - 2.8: 基础样式（dragging 行高亮 + 手柄按钮）

- [x] Task 3: 注册页面与入口
    - 3.1: `app.json` 注册 `pages/admin/series-edit/index`
    - 3.2: `pages/admin/content/index.js` items 数组加入「📑 型材系列」卡片

- [x] Task 4: 询价页接入动态 seriesOpts
    - 4.1: `pages/inquiry/index/index.js` import `getSeriesConfig`
    - 4.2: onShow 调 getSeriesConfig，setData seriesOpts
    - 4.3: 兼容旧 form.seriesIdx 越界（拉取后若超出长度则重置为 0）

- [x] Task 5: 产品编辑页系列选择改造
    - 5.1: `pages/admin/product-edit/index.js` import getSeriesConfig，data 增加 seriesOpts
    - 5.2: onLoad 拉取系列列表
    - 5.3: WXML 在 series 字段上方增加 picker（点击快速选择填入），保留下方 input 允许自定义值
