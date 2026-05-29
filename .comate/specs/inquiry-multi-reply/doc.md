# 询价多次回复 (inquiry-multi-reply)

## 需求
1. 状态文案：所有「已完成」改回「已回复」
2. 支持多次回复：管理员可对同一询价发送多条回复，按时间倒序/正序展示完整历史
3. 文案：「更新回复」改成「继续回复」

## 数据结构变更
原结构：单条 `reply: { content, repliedBy, repliedAt }`
新结构：`replies: [{ content, repliedBy, repliedAt }]` （数组，按时间追加）

兼容：如果文档存在旧 `reply` 字段，读取时合并到 `replies` 列表头部展示

## 影响文件
- `cloudfunctions/adminAction/index.js#replyInquiry`
  - 用 `db.command.push` 追加到 `replies` 数组
  - 保持 `status: 'replied'`（不再用 completed；同时把未来端的状态写回 replied）
- `utils/format.js#statusLabel`
  - `replied: '已回复'`、`completed: '已回复'`（兼容历史 completed 数据）
- `pages/admin/inquiry-manage/index.js`
  - tabs 中「已完成」改回「已回复」
  - listInquiries 使用 `replied`，云函数 in 包含 `completed` 兼容历史
- `pages/admin/inquiry-reply/index.{js,wxml}`
  - 加载时把 `reply` 合并到 `replies` 头部
  - 历史回复区改为遍历 `replies`
  - section-title 在已有回复时显示「继续回复」（替换原「更新回复」）
- `pages/inquiry/detail/index.{js,wxml}`
  - 同上展示 `replies` 数组，逐条卡片渲染
- `pages/inquiry/index/index.js` 文案随 statusLabel 自动生效

## 边界
- 旧数据 `reply` 单条：自动合并展示，无需迁移
- 同时存在 `reply` + 新增 `replies` 时：以合并去重为准（按 repliedAt 时间戳）
- 关闭后的工单不再支持回复（保持现有 closed 不可见 close 按钮逻辑）

## 预期
- 管理员页面同一工单可多次输入并发送回复，每次发送追加新条目，UI 展示按时间正序的所有历史
- 用户侧详情页能看到回复列表
- 状态文案统一为「待回复 / 已回复 / 已关闭」
