# 内容管理（统一站点配置）

## 需求场景
将原「首页内容管理」入口扩展为「内容管理」，覆盖站点全部静态内容：
1. **首页内容**：banners（≤4 张）、tag、主标题、副标题
2. **关于我们**：公司介绍（多行长文本）、办公地点列表（city / addr / phone，可任意增删）
3. **展厅头图**：1 张图 + title / subtitle
4. **案例头图**：title / subtitle（无 banner，沿用现纯文本头）

管理员入口为「内容管理」，进入后展示子模块卡片导航：首页 / 关于我们 / 展厅 / 案例。

## 技术方案
所有配置统一存入 `siteConfig` 集合，按文档 id 划分：
- `siteConfig/home`：首页（已有）
- `siteConfig/about`：关于我们 `{ intro, offices: [{city, addr, phone}] }`
- `siteConfig/products`：展厅头图 `{ heroCover, title, subtitle }`
- `siteConfig/cases`：案例 `{ title, subtitle }`

云函数 `adminAction` 用一个通用 action 替代多分支：
- `upsertSiteConfig`：参数 `{ docId, data }`，限定 docId 在白名单内。

## 影响文件
- 修改：`utils/db.js`
  - 新增默认配置 `ABOUT_DEFAULT / PRODUCTS_DEFAULT / CASES_DEFAULT`
  - 新增 `getAboutConfig() / getProductsConfig() / getCasesConfig()`
  - 旧 `getHomeConfig()` 保留
- 修改：`cloudfunctions/adminAction/index.js`
  - 新增 `upsertSiteConfig` 分支（白名单：`home | about | products | cases`）
  - 保留旧 `upsertHomeConfig` 兼容（内部转发到通用逻辑）
- 重命名/新增页面 `pages/admin/content/`
  - `index/`：内容管理首页（4 张子卡片）
  - 复用现有 `pages/admin/home-edit/` 作为 home 子页
  - 新增 `pages/admin/about-edit/`：编辑公司介绍 + offices 列表（沿用 kv 编辑模式：增加/删除/编辑每行 city/addr/phone）
  - 新增 `pages/admin/products-hero-edit/`：单图 + tag
  - 新增 `pages/admin/cases-hero-edit/`：title + subtitle
- 修改：`app.json` 注册新页面
- 修改：`pages/profile/index.{wxml,js}` 入口改为「内容管理」，跳转到 `pages/admin/content/index`
- 修改：`pages/about/index.{js,wxml}` onShow 拉取 about 配置
- 修改：`pages/products/list/index.{js,wxml}` onShow 拉取 products 配置
- 修改：`pages/cases/list/index.{js,wxml}` onShow 拉取 cases 配置

## 实现细节

### 1. utils/db.js 新增默认与读取
```js
const ABOUT_DEFAULT = {
  intro: '银科 12 年深耕东北建筑装饰行业……',
  offices: [
    { city: '沈阳总部', addr: '沈阳市浑南区火炬路12号科技大厦', phone: '024-88886666' },
    { city: '大连分公司', addr: '大连市中山区人民路88号', phone: '0411-88886666' }
  ]
};
const PRODUCTS_DEFAULT = { heroCover: '/images/default-cover.png', title: '数字化展厅', subtitle: '探索领先的工业级隔断铝型材与空间系统' };
const CASES_DEFAULT = { title: '工程作品', subtitle: '扎根东北，服务全国。…' };

async function getSiteConfig(docId, defaults) {
  try {
    const r = await db().collection('siteConfig').doc(docId).get();
    return Object.assign({}, defaults, r.data || {});
  } catch (e) { return Object.assign({}, defaults); }
}
function getHomeConfig() { return getSiteConfig('home', HOME_DEFAULT); }
function getAboutConfig() { return getSiteConfig('about', ABOUT_DEFAULT); }
function getProductsConfig() { return getSiteConfig('products', PRODUCTS_DEFAULT); }
function getCasesConfig() { return getSiteConfig('cases', CASES_DEFAULT); }
```
> 注：`getHomeConfig` 保留原字段过滤逻辑，仍需对空 banner/字段回落默认。

### 2. 云函数通用 upsert
```js
const SITE_DOCS = ['home', 'about', 'products', 'cases'];
if (action === 'upsertSiteConfig') {
  if (!SITE_DOCS.includes(payload.docId)) return { code: 400, msg: '非法 docId' };
  const data = sanitize(payload.data || {});
  await db.collection('siteConfig').doc(payload.docId).set({
    data: Object.assign({}, data, { updatedAt: db.serverDate() })
  });
  return { code: 0 };
}
// 保留旧 upsertHomeConfig：内部 set siteConfig/home（向后兼容）
```

### 3. 内容管理入口页 `pages/admin/content/index`
4 张卡片，bindtap 分别跳转：
- 首页内容 → `home-edit`
- 关于我们 → `about-edit`
- 展厅头图 → `products-hero-edit`
- 案例头图 → `cases-hero-edit`

### 4. 关于我们编辑页
- intro：textarea
- offices：列表（每行三个 input：city/addr/phone + 删除按钮），底部「+ 新增办公地点」
- 保存：`adminCall('upsertSiteConfig', { docId: 'about', data: { intro, offices } })`
- 校验：至少 1 个办公地点；每行至少城市与地址非空

### 5. 展厅头图编辑页
- 单图 `upload-image`（`multiple={{false}}`）
- tag input
- 保存：`docId='products'`

### 6. 案例头图编辑页
- title input
- subtitle textarea
- 保存：`docId='cases'`

### 7. 前台页面接入
- `pages/about/index.js` onShow 调 `getAboutConfig()`，setData intro/offices
- `pages/products/list/index.js` onShow 调 `getProductsConfig()`，覆盖 heroCover/title/subtitle
- `pages/cases/list/index.js` onShow 调 `getCasesConfig()`，覆盖 title/subtitle
- 对应 wxml 改为变量绑定，添加图片 binderror 兜底

### 8. profile 入口文案变更
- 「🖼️ 首页内容管理」→「🗂️ 内容管理」，目标页改为 `pages/admin/content/index`

## 边界 / 异常
- siteConfig 集合或文档不存在：getXxxConfig 静默回退默认
- offices 空数组：保存时阻止；前台展示时使用 ABOUT_DEFAULT.offices
- intro 空字符串：使用默认介绍
- 展厅头图未上传：使用默认本地占位图
- 上传/保存异常 toast 提示

## 数据流
- 编辑页 → adminCall('upsertSiteConfig', { docId, data }) → siteConfig/{docId}
- 各前台页 onShow → getXxxConfig → setData

## 预期结果
- 个人中心管理员区显示「🗂️ 内容管理」一个入口
- 进入后看到 4 张子卡片，分别管理首页/关于/展厅/案例内容
- 普通用户访问对应页面时拉取最新配置
- 配置缺失或加载失败均不影响页面渲染（使用默认值）
