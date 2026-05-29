# 首页 Slogan 配置

## 需求
1. 内容管理 → 首页内容 编辑表单中新增 `slogan` 字段（CTA 副标题文案）
2. 首页底部「立即获取报价方案」卡片（brand-card）的标题/描述改为从 home 配置读取
   - bc-title ← `subtitle`
   - bc-sub   ← `slogan`
3. 案例列表页底部同结构 brand-card 同步使用 home 配置的 subtitle / slogan

## 数据结构变更
`siteConfig` 文档 `home` 增加字段：
```
{
  ...,
  subtitle: '东北工业级隔断系统领导品牌',
  slogan: '12年深耕，累计交付面积超过 1,000,000+ ㎡'
}
```

## 影响文件
- /utils/db.js：HOME_DEFAULT 增加 slogan，getHomeConfig 透传
- /pages/admin/home-edit/index.{js,wxml}：新增 slogan 编辑项
- /pages/index/index.{js,wxml}：data 增加 homeSlogan，brand-card 渲染 subtitle/slogan
- /pages/cases/list/index.{js,wxml}：拉 home 配置后渲染 brand-card

## 边界
- slogan 为空时回退默认值
- 不改动云函数白名单（home 已在内）
