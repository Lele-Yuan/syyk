# 首页内容管理（Banner / 标题 / 副标题 / Tag）

## 需求场景
管理员可在「个人中心 → 管理员中心」中进入「首页内容管理」入口，编辑首页 Banner 顶部展示内容：
- Banner 图片：最多 4 张（最少 1 张），上传到云存储
- 顶部 Tag 文案
- 主标题
- 副标题

普通用户与游客访问首页时读取最新配置；若云端未配置则使用以下默认值：
- Tag：`100系列 极致全景`
- 标题：`沈阳银科隔墙`
- 副标题：`东北工业级隔断系统领导品牌`
- Banner：本地占位图（`/images/figma/image_5.png` / `image_38.png` / `image_45.png`）

## 技术方案
- 数据存储：使用云数据库集合 `siteConfig`，主键文档 `_id = 'home'`，结构：
  ```js
  { _id: 'home', banners: [string], tag: string, title: string, subtitle: string, updatedAt }
  ```
  小程序端可直接读取（`siteConfig` 集合需在云开发控制台开启「所有用户可读」），写操作走云函数 `adminAction`。
- 云函数 `adminAction` 新增 action：
  - `getHomeConfig`（无需鉴权时也可直接读 DB；这里仍提供给管理员页用）
  - `upsertHomeConfig`（仅管理员，使用 `set` 实现 upsert）
- 复用现有 `upload-image` 组件（`multiple` + `max=4`）。

## 影响文件
- 新增：`pages/admin/home-edit/index.{js,json,wxml,wxss}`
- 修改：`app.json`（注册新页面）
- 修改：`pages/profile/index.wxml` + `pages/profile/index.js`（管理员中心新增入口）
- 修改：`pages/index/index.js`（onShow 拉取 siteConfig，覆盖 banners/tag/title/subtitle，失败回落默认值）
- 修改：`pages/index/index.wxml`（tag/title/subtitle 改为变量绑定）
- 修改：`utils/db.js`（新增 `getHomeConfig()` 直接 DB 读取）
- 修改：`cloudfunctions/adminAction/index.js`（新增 upsertHomeConfig 分支）

## 实现细节
### 1. 默认配置常量（utils/db.js）
```js
const HOME_DEFAULT = {
  banners: ['/images/default-cover.png'],
  tag: '100系列 极致全景',
  title: '沈阳银科隔墙',
  subtitle: '东北工业级隔断系统领导品牌'
};
async function getHomeConfig() {
  try {
    const r = await db().collection('siteConfig').doc('home').get();
    return Object.assign({}, HOME_DEFAULT, r.data || {});
  } catch (e) { return HOME_DEFAULT; }
}
```

### 2. 云函数新增分支
```js
if (action === 'upsertHomeConfig') {
  const data = sanitize(payload);
  await db.collection('siteConfig').doc('home').set({
    data: Object.assign({}, data, { updatedAt: db.serverDate() })
  });
  return { code: 0 };
}
```

### 3. 管理员编辑页
- 顶部使用 `upload-image` 组件，`multiple="{{true}}"` + `max="{{4}}"`
- 三个 input 分别绑定 tag / title / subtitle
- 保存按钮调用 `adminCall('upsertHomeConfig', form)`
- 进入页面时通过 `getHomeConfig()` 预填表单

### 4. 首页集成
```js
// onShow
const cfg = await getHomeConfig();
this.setData({
  banners: cfg.banners.length ? cfg.banners : HOME_DEFAULT.banners,
  homeTag: cfg.tag, homeTitle: cfg.title, homeSubtitle: cfg.subtitle
});
```
WXML：
```wxml
<view class="b-tag">{{homeTag}}</view>
<view class="b-title">{{homeTitle}}</view>
<view class="b-sub">{{homeSubtitle}}</view>
```

## 边界 / 异常
- 用户未配置：使用默认值
- banners 为空数组：使用默认占位图，避免空轮播
- `siteConfig` 集合不存在或权限错误：getHomeConfig 静默回退默认
- 上传失败：upload-image 组件已自带 toast
- 文本字段全部 trim；空字符串视为使用默认值

## 数据流
保存：编辑页表单 → upload-image 上传至云存储拿到 fileID → adminCall('upsertHomeConfig') → siteConfig/home 文档
读取：首页 onShow → getHomeConfig() 直读 DB（带默认 fallback）→ setData

## 预期结果
- 管理员可在首页内容管理页：上传/移除 banner、编辑文案、保存
- 首页打开后展示最新配置，无配置时仍显示默认文案
