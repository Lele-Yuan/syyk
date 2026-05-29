# 询价头像 完成总结

## 已完成
- `pages/inquiry/index/index.js`：onSubmit 从 `wx.getStorageSync('userInfo').avatarUrl` 读取头像并写入 inquiries 文档（字段 `userAvatar`）
- `pages/admin/inquiry-manage/index.wxml`：列表项改为左侧头像 + 右侧信息体的 flex 布局，`wx:if="{{item.userAvatar}}"` 控制显隐
- `pages/admin/inquiry-manage/index.wxss`：新增 `.avatar` 圆形样式与 `.body` 自适应宽度

## 兼容性
- 历史询价无 `userAvatar` 字段时，列表中不渲染图片，原始信息布局正常
- 用户未登录或缓存无头像时，提交字段为空字符串，等价于"无头像"
