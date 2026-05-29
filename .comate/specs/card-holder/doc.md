# 名片夹模块

## 需求
在「我的」页面服务中心新增「名片夹」分组，包含：
- **我的名片**：展示当前用户创建的名片列表；未创建时显示引导入口；点击名片进入名片详情
- **通讯录**：展示已保存的他人名片；点击进入名片详情

## 数据结构

### businessCards 集合（自动绑定 _openid）
```json
{
  "name": "张建华",
  "title": "销售总监",
  "titleEn": "SALES DIRECTOR",
  "phone": "13800000000",
  "email": "zhangjh@yinke.com",
  "address": "辽宁省沈阳市铁西区...",
  "specialties": ["双玻系统专家", "空间规划顾问"],
  "businessAreas": ["双玻百叶隔断", "高隔间系统"],
  "avatarUrl": "",
  "remark": "仅创建者可见的私密备注",
  "createdAt": {},
  "updatedAt": {}
}
```

### contacts 集合（自动绑定 _openid = 保存者）
```json
{
  "cardId": "<businessCards._id>",
  "snapshot": { /* 名片数据快照（不含 remark）*/ },
  "remark": "仅保存者可见的私密备注",
  "savedAt": {}
}
```

## 备注可见性规则
- `businessCards.remark`：仅名片创建者（isOwner）在详情页可见
- `contacts.remark`：仅保存者在自己的通讯录详情中可见
- 分享给他人时，详情页不展示任何备注字段

## 页面规划
| 页面 | 路径 |
|------|------|
| 我的名片列表 | pages/card/my-cards/index |
| 名片编辑 | pages/card/card-edit/index?id=xxx（新建不带id）|
| 名片详情 | pages/card/card-detail/index?id=xxx&owner=1 |
| 通讯录 | pages/card/contacts/index |

## 设计参考（Figma）
- Hero 区：深蓝渐变背景，圆形头像 + 姓名 + 职位 + 专长标签
- Card 区：白卡，主营业务（2×2 grid）、联系方式、地址、操作按钮
- 他人名片：「保存到通讯录」+ 「分享名片」
- 自己名片：「编辑名片」+ 「分享名片」
- 未登录：显示 login-mask

## 共享逻辑
- 已保存名片的「保存到通讯录」按钮变灰/不可点
- 分享通过 `onShareAppMessage` 返回 `/pages/card/card-detail/index?id=xxx`
- 避免 Babel 助手：不用 for...of、数组解构、模板字面量做路由
