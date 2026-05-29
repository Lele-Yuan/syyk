# 询价回复状态闭环 总结

## 修改清单

### 1. `cloudfunctions/adminAction/index.js`
- `replyInquiry`：写入 `status: 'completed'`（原为 replied）
- `listInquiries`：当筛选 `completed` 时，使用 `db.command.in(['completed','replied'])` 同时返回历史数据

### 2. `utils/format.js`
- `statusLabel` 增加 `completed → 已完成`，并将历史 `replied` 也映射为「已完成」

### 3. `pages/admin/inquiry-manage/index.js`
- 修复 `res.list` → `res.data`（之前列表始终为空的 bug）
- TABS 调整：全部 / 待回复 / 已完成 / 已关闭
- 用 `Object.assign` 替代 `...it` 避免 babel runtime helper

## 数据流
1. 用户提交询价 → status=pending → 管理员「待回复」可见
2. 管理员在回复页提交 → 云函数写入 status=completed
3. 列表回到「已完成」tab，用户端「我的询价」状态文案变为「已完成」

## 注意事项
- ⚠️ **必须在微信开发者工具中右键 `cloudfunctions/adminAction` → 上传部署**，否则回复仍写入 replied
- 历史已回复（status=replied）数据：兼容显示「已完成」、并出现在「已完成」tab
- closed 工单不变
