# 型材系列管理 实施总结

## 已完成内容

### 1. 数据层 (`utils/db.js`)
- 新增 `SERIES_DEFAULT`：默认 4 项（双玻 / 全钢 / 极简超高 / 其他/暂未确定）
- 新增 `getSeriesConfig()`：从 `siteConfig/series` 读取，空数据兜底默认值
- 导出 `SERIES_DEFAULT`、`getSeriesConfig`

### 2. 云函数 (`cloudfunctions/adminAction/index.js`)
- `upsertSiteConfig` 白名单新增 `series`
- ⚠️ **需在微信开发者工具中重新部署 adminAction 云函数**

### 3. 系列编辑页 (`pages/admin/series-edit/`)
- `id + name` 行结构，支持名称输入、删除（保留至少 1 项）、新增
- 拖动排序：`bindtouchstart/move/end` + `selectorQuery` 动态测量行高，按 Y 位移整除得到目标位置，松手 splice 重排
- 拖动行高亮（蓝），目标位置高亮（黄），实时跟手
- 保存时去空名 + 重名校验 + 调用 `upsertSiteConfig docId=series`

### 4. 入口注册
- `app.json`：注册 `pages/admin/series-edit/index`
- `pages/admin/content/index.js`：新增「📑 型材系列」卡片

### 5. 下游接入
- 询价页 `pages/inquiry/index/index.js`：onShow 调用 `loadSeries()` 动态填充 `seriesOpts`，处理 `seriesIdx` 越界
- 产品编辑页 `pages/admin/product-edit/`：
  - 加载已配置 series 列表
  - 系列字段上方新增 picker（已选系列回显），下方保留 input 允许自定义
  - 选择 picker 自动填入 `form.series`

## 注意事项
1. 云函数 adminAction 必须重新上传部署，否则 `series` docId 写入会被拒绝（"非法 docId"）
2. 历史 inquiries 中保存的 series 字符串与新系列名不匹配时，仅展示层不一致，不影响数据
3. 产品已存的 `series` 值不在新列表内时，picker 显示"从已配置系列中选择"，但 input 仍展示原值，可保留或更换
