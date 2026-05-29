# 内容管理 — 实施总结

## 完成内容
1. **数据层**（`utils/db.js`）
   - 新增 `ABOUT_DEFAULT / PRODUCTS_DEFAULT / CASES_DEFAULT`
   - 抽取通用 `getSiteConfig(docId, defaults)`
   - 新增 `getAboutConfig / getProductsConfig / getCasesConfig`，并均带默认值回退
2. **云函数**（`cloudfunctions/adminAction/index.js`）
   - 新增 `upsertSiteConfig`，参数 `{ docId, data }`，限定 docId 白名单
   - 保留旧 `upsertHomeConfig`（向后兼容）
3. **管理员侧**
   - 新增「内容管理」入口页 `pages/admin/content/`
   - 复用首页编辑页 `pages/admin/home-edit/`，切换为通用 action
   - 新增关于我们编辑页 `pages/admin/about-edit/`：intro + offices 列表（增删/校验）
   - 新增展厅头图编辑页 `pages/admin/products-hero-edit/`：单图 + title + subtitle
   - 新增案例头图编辑页 `pages/admin/cases-hero-edit/`：title + subtitle
   - profile 入口由「首页内容管理」替换为「🗂️ 内容管理」
4. **前台接入**
   - `pages/about/index` onShow 拉取 about 配置
   - `pages/products/list/index` onShow 拉取 products 配置（heroCover/title/subtitle），加 binderror 兜底
   - `pages/cases/list/index` onShow 拉取 cases 配置
5. **app.json** 注册 4 个新页面

## 数据库与权限
- 集合：`siteConfig`
  - 文档：`home / about / products / cases`
  - 推荐权限：所有用户可读，写操作走云函数

## 部署提醒
- 重新上传部署 `adminAction` 云函数（含 `upsertSiteConfig` 新分支）
- 在云开发控制台手动创建 `siteConfig` 集合（如尚未创建）

## 后续可选优化
- intro 富文本支持（当前为纯文本 textarea）
- offices 排序（拖拽）
- 在内容管理首页展示各模块的「最近更新时间」
