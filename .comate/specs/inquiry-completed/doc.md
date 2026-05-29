# 询价回复状态闭环 (inquiry-completed)

## 需求场景
- 用户在询价页提交问题，状态默认 `pending`（待回复）
- 管理员在「询价管理」中能筛选「待回复」工单
- 管理员回复后，工单状态变为 `completed`（已完成），文案统一显示为「已完成」

## 当前问题（代码审查发现）
1. `cloudfunctions/adminAction/index.js#replyInquiry` 写入 `status: 'replied'`，与「已完成」语义不符
2. `pages/admin/inquiry-manage/index.js#loadList` 读取 `res.list`，但云函数返回 `res.data` → 列表始终为空
3. `cloudfunctions/adminAction/index.js#listInquiries` 鉴权为 admin only ✅（已正确）
4. `utils/format.js#statusLabel` 没有 `completed` 映射，且把 `replied` 映射为「已回复」
5. 询价管理页 tabs 含「已回复」「已关闭」，需调整为「已完成」「已关闭」（或合并）

## 技术方案
- 新增状态值 `completed`，作为回复后的最终态
- 云函数 `replyInquiry` 写入 `status: 'completed'`
- 兼容历史：`statusLabel` 中将 `replied` 与 `completed` 都映射为「已完成」（避免历史数据显示异常）
- `listInquiries` 接收 `status: 'completed'` 参数，可选地 OR `replied` 兼容历史

## 影响文件
- `cloudfunctions/adminAction/index.js`：replyInquiry 写入 completed；listInquiries 兼容 replied/completed
- `utils/format.js`：statusLabel 增加 completed 映射，replied 改为「已完成」
- `pages/admin/inquiry-manage/index.js`：修复 res.data 字段、tabs 改为 pending/completed/closed
- `pages/admin/inquiry-manage/index.wxml`（如需要）：保持基于 data 渲染
- `pages/inquiry/index/index.js`（用户侧）：仅展示文案对齐，无逻辑改动
- `pages/inquiry/detail/index.js`（如有）：文案对齐

## 边界条件
- 历史 `replied` 数据：自动以「已完成」展示，无需迁移
- 已 `closed` 工单不再支持回复（云函数当前未限制，可选保留现状）

## 预期结果
- 管理员进入「询价管理」→ 默认「全部」tab 能看到列表
- 切到「待回复」可筛选 pending；回复后该工单进入「已完成」tab
- 用户端我的询价中状态文案显示「已完成」
