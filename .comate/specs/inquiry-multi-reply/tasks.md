# 询价多次回复 实施任务

- [x] Task 1: 云函数支持多条回复
    - 1.1: replyInquiry 改为向 replies 数组 push 新条目（含 content/repliedBy/repliedAt）
    - 1.2: 保持 status='replied'
    - 1.3: 提示用户重新部署 adminAction

- [x] Task 2: 工具函数文案回退
    - 2.1: utils/format.js statusLabel 改为 replied:'已回复'，completed 兼容映射「已回复」

- [x] Task 3: 管理员询价管理页文案
    - 3.1: inquiry-manage TABS「已完成」→「已回复」(key=replied)
    - 3.2: loadList tabKey 走 replied，云函数侧已兼容 completed

- [x] Task 4: 管理员回复页支持多条
    - 4.1: 加载时把旧字段 reply 合并到 replies 头部并按时间排序
    - 4.2: WXML 历史回复区遍历 replies 渲染
    - 4.3: 标题文案「更新回复」→「继续回复」
    - 4.4: 发送成功后清空输入框并重新加载详情

- [x] Task 5: 用户端详情页展示多条回复
    - 5.1: pages/inquiry/detail/index.js 合并 reply→replies 并格式化时间
    - 5.2: WXML 用 wx:for 遍历 replies 渲染卡片
