# 内容管理 实施任务

- [x] Task 1: 数据层与云函数扩展
    - 1.1: `utils/db.js` 新增 `ABOUT_DEFAULT / PRODUCTS_DEFAULT / CASES_DEFAULT` 常量
    - 1.2: 抽取通用 `getSiteConfig(docId, defaults)`；新增 `getAboutConfig / getProductsConfig / getCasesConfig` 并导出
    - 1.3: `cloudfunctions/adminAction/index.js` 新增 `upsertSiteConfig` 分支（白名单：home/about/products/cases）
    - 1.4: 保留旧 `upsertHomeConfig`，内部转发到通用 set 逻辑
    - 1.5: 提示用户重新部署 adminAction

- [x] Task 2: 内容管理入口页
    - 2.1: 新建 `pages/admin/content/index.{js,json,wxml,wxss}`
    - 2.2: 4 张卡片导航：首页内容 / 关于我们 / 展厅头图 / 案例头图
    - 2.3: `app.json` 注册新页面
    - 2.4: profile 入口改为「🗂️ 内容管理」，跳转 content 页面

- [x] Task 3: 关于我们编辑页
    - 3.1: 新建 `pages/admin/about-edit/index.{js,json,wxml,wxss}`
    - 3.2: intro textarea + offices 列表（city/addr/phone 三个 input + 删除按钮）
    - 3.3: 「+ 新增办公地点」按钮
    - 3.4: 保存校验（至少 1 个办公地点，城市与地址非空）后调用 `upsertSiteConfig` docId=about
    - 3.5: `app.json` 注册

- [x] Task 4: 展厅头图编辑页
    - 4.1: 新建 `pages/admin/products-hero-edit/index.{js,json,wxml,wxss}`
    - 4.2: 单图 `upload-image` + title input + subtitle textarea
    - 4.3: 保存调用 `upsertSiteConfig` docId=products
    - 4.4: `app.json` 注册

- [x] Task 5: 案例头图编辑页
    - 5.1: 新建 `pages/admin/cases-hero-edit/index.{js,json,wxml,wxss}`
    - 5.2: title input + subtitle textarea
    - 5.3: 保存调用 `upsertSiteConfig` docId=cases
    - 5.4: `app.json` 注册

- [x] Task 6: 前台页面接入动态配置
    - 6.1: `pages/about/index.{js,wxml}` onShow 拉取 about 配置，intro/offices 改为变量绑定
    - 6.2: `pages/products/list/index.{js,wxml}` onShow 拉取 products 配置，heroCover/title/subtitle 改为变量绑定，加 binderror 兜底
    - 6.3: `pages/cases/list/index.{js,wxml}` onShow 拉取 cases 配置，title/subtitle 改为变量绑定
    - 6.4: 修改 home-edit 编辑页保存逻辑切换为通用 `upsertSiteConfig` docId=home（与新通用 action 对齐）
