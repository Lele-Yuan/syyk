# 内容管理 — 型材系列模块

## 需求场景
在「内容管理」中新增「型材系列」入口，管理员可：
- 查看现有系列列表
- 新增系列（输入名称即可）
- 删除系列
- 通过拖动手柄上下排序

默认数据（首次访问、未配置时）：
- 双玻
- 全钢
- 极简超高
- 其他/暂未确定

系列列表的下游使用：
1. **询价页**（`pages/inquiry/index/index`）：意向系列 picker 选项动态加载
2. **产品编辑页**（`pages/admin/product-edit`）：series 字段改为 picker（可选输入）+ 自由输入兜底
3. （`product.series` 仍为字符串，无需迁移）

## 技术方案
- 数据：`siteConfig/series` 文档：`{ items: [{ id, name }] }`
  - id 由前端生成（时间戳+随机），保证拖动时 wx:key 稳定
- 读取：在 `utils/db.js` 增加 `getSeriesConfig()` + `SERIES_DEFAULT`
- 写入：复用 `upsertSiteConfig` 通用 action（白名单加入 `series`）
- 拖动排序：基于 `bindtouchstart/move/end`，监听拖动手柄触发，实时计算 deltaY 与行高比值进行数组 splice 重排，UI 在拖动行上叠加 `translateY` 视觉反馈
  - 使用 `wx.createSelectorQuery()` 测量行高，无 hard-code
  - 拖动结束清理状态（不立即落库，等用户点击「保存」时统一 upsert）

## 影响文件
- 修改：`utils/db.js` — 新增 SERIES_DEFAULT / getSeriesConfig
- 修改：`cloudfunctions/adminAction/index.js` — `SITE_DOCS` 白名单加 `series`
- 新增：`pages/admin/series-edit/index.{js,json,wxml,wxss}`
- 修改：`app.json` — 注册新页面
- 修改：`pages/admin/content/index.js` — 内容管理首页加「型材系列」卡片
- 修改：`pages/inquiry/index/index.{js,wxml}` — onShow 拉取 seriesOpts，picker 用动态选项
- 修改：`pages/admin/product-edit/index.{js,wxml}` — series 字段改为 picker（可选 + 输入并存），保持向后兼容
- （可选）`pages/products/list/index.js` — 后续可在筛选中加入系列；本次不实现

## 实现细节

### 1. utils/db.js
```js
const SERIES_DEFAULT = {
  items: [
    { id: 's_default_1', name: '双玻' },
    { id: 's_default_2', name: '全钢' },
    { id: 's_default_3', name: '极简超高' },
    { id: 's_default_4', name: '其他/暂未确定' }
  ]
};
async function getSeriesConfig() {
  const cfg = await getSiteConfig('series', SERIES_DEFAULT);
  const items = (cfg.items || []).filter(function (x) { return x && x.name; });
  return { items: items.length ? items : SERIES_DEFAULT.items };
}
```

### 2. 云函数白名单
```js
const SITE_DOCS = ['home', 'about', 'products', 'cases', 'series'];
```

### 3. 拖动排序核心逻辑
```js
// 数据
data: { items: [], dragIndex: -1, dragY: 0, rowH: 0 }

// 测量行高
onReady() {
  wx.createSelectorQuery().in(this).select('.row').boundingClientRect(rect => {
    if (rect) this.setData({ rowH: rect.height });
  }).exec();
}

onDragStart(e) {
  this.setData({
    dragIndex: e.currentTarget.dataset.i,
    dragStartY: e.touches[0].pageY,
    dragOffset: 0
  });
},
onDragMove(e) {
  if (this.data.dragIndex < 0) return;
  const dy = e.touches[0].pageY - this.data.dragStartY;
  const rowH = this.data.rowH || 88;
  const moveSteps = Math.round(dy / rowH);
  let target = this.data.dragIndex + moveSteps;
  target = Math.max(0, Math.min(this.data.items.length - 1, target));
  if (target !== this.data.dragIndex) {
    const items = this.data.items.slice();
    const removed = items.splice(this.data.dragIndex, 1)[0];
    items.splice(target, 0, removed);
    this.setData({
      items: items,
      dragIndex: target,
      dragStartY: e.touches[0].pageY
    });
  }
},
onDragEnd() { this.setData({ dragIndex: -1 }); }
```
WXML 在每行渲染拖动手柄 `≡`，绑定 `catchtouchstart/move/end`，正在拖动的行高亮：
```wxml
<view wx:for="{{items}}" wx:key="id"
      class="row {{dragIndex===index?'dragging':''}}">
  <input ... value="{{item.name}}" data-i="{{index}}" bindinput="onNameInput"/>
  <view class="rm" data-i="{{index}}" bindtap="onRemove">删除</view>
  <view class="handle" data-i="{{index}}"
        catchtouchstart="onDragStart"
        catchtouchmove="onDragMove"
        catchtouchend="onDragEnd"
        catchtouchcancel="onDragEnd">≡</view>
</view>
```

### 4. 询价页接入
```js
async onShow() {
  ...
  try {
    const cfg = await getSeriesConfig();
    const opts = cfg.items.map(function (x) { return x.name; });
    this.setData({ seriesOpts: opts });
  } catch (e) {}
}
```

### 5. 产品编辑页改造
- series 改为 picker（range = seriesOpts），同时保留「自定义」选项允许输入旧值
- 简化方案：picker 选 + 一个 input 显示当前值；选中时同步 input；input 也可手改

## 边界 / 异常
- 数据库未配置 series：使用默认 4 项
- 新增项时分配 id：`'s_' + Date.now() + '_' + Math.random()`
- 删除最后一项：toast 提示「至少保留 1 个系列」
- 名称去前后空格；空名称的项保存时过滤
- 拖动越界：clamp 到 [0, len-1]
- onShow 多次进入页面时数据合并：以最新 DB 数据为准

## 数据流
- 编辑页 onLoad → getSeriesConfig → 渲染 items
- 用户拖动/编辑/增删 → 仅修改本地 items
- 点击「保存」 → adminCall('upsertSiteConfig', { docId: 'series', data: { items } })
- 询价页 / 其他下游 → onShow → getSeriesConfig

## 预期结果
- 内容管理增加「📑 型材系列」卡片
- 编辑页可拖动排序、增删、改名
- 询价页 picker 选项与后台保持同步
- 产品编辑页可从已配置系列中快速选择
