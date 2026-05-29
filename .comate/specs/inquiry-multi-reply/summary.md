# 询价多次回复 总结

## 关键变更

### 数据结构
- 新增字段 `replies: Array<{content, repliedBy, repliedAt}>`
- 兼容旧字段 `reply` (单条对象) — 读取时合并展示

### 云函数 `cloudfunctions/adminAction/index.js`
- `replyInquiry`：使用 `db.command.push([item])` 追加；状态写回 `replied`
- `listInquiries`：`replied` / `completed` 任一筛选都返回两者并集（兼容历史 completed 数据）

### 文案
- `utils/format.js`：completed 与 replied 都映射为「已回复」
- `pages/admin/inquiry-manage/index.js`：tabs = 全部/待回复/已回复/已关闭（移除"已完成"）
- 管理员回复页：标题「更新回复」→「继续回复」（基于 replies 是否非空）

### 多条展示
- 管理员 `pages/admin/inquiry-reply/`：合并 reply→replies，按 repliedAt 升序遍历渲染
- 用户 `pages/inquiry/detail/`：同上展示多条卡片

## 注意事项
- ⚠️ **必须重新部署 adminAction 云函数**
- 旧数据 `reply` 字段保留不删除，与新 `replies` 同时存在时按内容去重合并
- 若同一秒内重复发送相同内容，会因内容去重只显示 1 条；如需放开可移除合并函数中的 exists 判断
