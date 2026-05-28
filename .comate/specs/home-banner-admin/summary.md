# 首页内容管理 — 实施总结

## 完成内容
1. 数据层
   - `utils/db.js` 新增 `HOME_DEFAULT` 默认配置常量与 `getHomeConfig()` 方法（异常自动回退默认）
   - `cloudfunctions/adminAction/index.js` 新增 `upsertHomeConfig` 分支，使用 `siteConfig/home` 文档 `set` 实现 upsert
2. 管理员编辑页（`pages/admin/home-edit/`）
   - 复用 `upload-image` 组件，多图模式 + 最多 4 张
   - 三个文本字段（tag / title / subtitle），支持「恢复默认文案」
   - 提交校验：banner 数量 1–4 张；空文案自动回退默认
3. 入口与注册
   - `app.json` 注册新页面
   - `pages/profile` 管理员中心新增「🖼️ 首页内容管理」入口
4. 首页接入
   - `pages/index/index.js` onShow 拉取 `getHomeConfig()`，覆盖 banner 与文案
   - WXML 将 b-tag / b-title / b-sub 改为变量绑定
   - banner 与案例图增加 `binderror` fallback，避免坏图渲染异常

## 数据库与权限
- 新增集合：`siteConfig`
  - 推荐权限：「所有用户可读，仅创建者可读写」（写操作走云函数无影响）；或更宽松「所有用户可读」
  - 文档结构：
    ```js
    { _id: 'home', banners: ['cloud://...'], tag, title, subtitle, updatedAt }
    ```

## 部署提醒
- 需要重新部署 `adminAction` 云函数以使 `upsertHomeConfig` 生效
- 首次访问编辑页若集合不存在，保存时会自动创建文档；如果云数据库默认拒绝从云函数创建集合，请提前在云开发控制台手动创建 `siteConfig` 集合

## 默认值
- Tag：`100系列 极致全景`
- 标题：`沈阳银科隔墙`
- 副标题：`东北工业级隔断系统领导品牌`
- Banner：`/images/default-cover.png`
