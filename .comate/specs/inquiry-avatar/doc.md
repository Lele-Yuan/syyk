# 询价携带用户头像

## 需求
- 用户提交询价时，把当前登录用户的头像（avatarUrl）写入 inquiries 文档
- 管理员询价管理列表中：有头像则展示圆形头像，无头像不显示

## 实现要点
- 用户头像从 `wx.getStorageSync('userInfo').avatarUrl` 取
- inquiries 文档新增字段 `userAvatar`
- inquiry-manage 列表项左侧加 avatar，复用 cloud:// 直接 image src（已是 https/微信头像 URL）

## 影响文件
- pages/inquiry/index/index.js：提交时附带 userAvatar
- pages/admin/inquiry-manage/index.{wxml,wxss}：列表项渲染头像
