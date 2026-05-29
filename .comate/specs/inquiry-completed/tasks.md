# 询价回复状态闭环 实施任务

- [x] Task 1: 云函数调整
    - 1.1: replyInquiry 写入 status 改为 completed
    - 1.2: listInquiries 当 status=completed 时兼容 replied（in 查询）
    - 1.3: 提示用户重新部署 adminAction

- [x] Task 2: 文案与工具函数
    - 2.1: utils/format.js statusLabel 加入 completed 映射「已完成」
    - 2.2: replied 也映射为「已完成」做历史兼容

- [x] Task 3: 管理员询价管理页修复
    - 3.1: inquiry-manage TABS 改为 全部 / 待回复 / 已完成 / 已关闭
    - 3.2: loadList 读取 res.data（修复 res.list bug），并对 tabKey 做映射
    - 3.3: 兼容写法：使用 Object.assign 替代 `...it`，避免 babel runtime 报错

- [x] Task 4: 验证用户端展示
    - 4.1: 复核 pages/inquiry/index/index.js 状态文案随 statusLabel 自动生效
    - 4.2: 复核 pages/inquiry/detail/index 状态文案
