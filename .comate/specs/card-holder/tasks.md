# 名片夹模块 实施任务

- [x] Task 1: 数据层 utils/db.js
    - 1.1: 新增 listMyCards / getCard / createCard / updateCard
    - 1.2: 新增 listContacts / saveContact / isCardSaved

- [x] Task 2: 名片详情页 pages/card/card-detail
    - 2.1: index.js（加载名片、判断 isOwner、保存/分享/编辑）
    - 2.2: index.json（page 配置）
    - 2.3: index.wxml（Hero + 白卡 + 操作按钮，参照设计稿）
    - 2.4: index.wxss（深蓝渐变 Hero + 白卡布局 + 动作按钮）

- [x] Task 3: 我的名片列表 pages/card/my-cards
    - 3.1: index.js（拉取我的名片、空状态）
    - 3.2: index.json
    - 3.3: index.wxml（空状态引导 + 名片卡片列表）
    - 3.4: index.wxss

- [x] Task 4: 名片编辑 pages/card/card-edit
    - 4.1: index.js（onLoad 读取已有名片、onSave 创建/更新；remark 字段仅写入 businessCards）
    - 4.2: index.json
    - 4.3: index.wxml（表单：姓名/职位/电话/邮箱/地址/专长/主营业务 + 备注 textarea）
    - 4.4: index.wxss

- [x] Task 5: 通讯录 pages/card/contacts
    - 5.1: index.js（拉取 contacts 列表）
    - 5.2: index.json
    - 5.3: index.wxml（名片卡列表，点击进详情，传入 contactId 以便读取 remark）
    - 5.4: index.wxss

- [x] Task 6: 注册路由 + profile 入口
    - 6.1: app.json 注册 4 个新页面
    - 6.2: pages/profile/index.js 增加 onMyCards / onContacts
    - 6.3: pages/profile/index.wxml 增加「名片夹」分组
