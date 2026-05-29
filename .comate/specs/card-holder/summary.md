# 名片夹模块 完成总结

## 已完成

### 数据层 utils/db.js
- `listMyCards / getCard / createCard / updateCard`
- `listContacts / saveContact / isCardSaved / deleteContact`
- `businessCards.remark` 仅创建者可见；`contacts.remark` 仅保存者可见

### pages/card/card-detail
- 深蓝渐变 Hero + 圆形头像 + 姓名/职位/专长标签（参照 Figma 设计）
- 白卡：主营业务 Grid + 联系方式 + 地址 + 操作按钮
- isOwner=true：显示「编辑名片」；他人名片：显示「保存到通讯录」（已保存变灰）
- 保存时弹出底部 sheet 填写备注（可选）
- `onShareAppMessage` 支持微信分享
- 底部「专业与品质」统计区

### pages/card/my-cards
- 空状态引导（未创建时提示前往添加）
- 名片列表（头像 + 姓名职位电话）
- 右下角 FAB 快速新增；点击进入名片详情

### pages/card/card-edit
- 表单：姓名/职位/英文职位/电话/邮箱/地址
- 专长标签 2 个文本输入
- 主营业务 Toggle 多选（6 项预设）
- 私密备注 textarea
- 新建/编辑共用，编辑时回显数据

### pages/card/contacts
- 通讯录列表（snapshot 展示：头像/姓名/职位/电话）
- 如有备注显示橙色备注行
- 点击进入名片详情（传入 contactId）

### profile 页面
- 服务中心下方新增「名片夹」分组：我的名片 + 通讯录

## 云数据库
需在微信云开发控制台创建以下集合（默认权限：仅创建者可读写）：
- `businessCards`
- `contacts`
