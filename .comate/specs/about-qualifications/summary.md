# 企业资质配置 完成总结

## 已完成
- `utils/db.js`：ABOUT_DEFAULT 增加 qualifications 默认 4 项；getAboutConfig 透传，空时回退默认
- `pages/admin/about-edit/index.js`：form 增加 qualifications；onLoad 同步；新增 onQuaInput / onAddQua / onRemoveQua；onSave trim+filter 空值写入
- `pages/admin/about-edit/index.wxml`：新增「企业资质」分组，支持逐条编辑与新增/删除
- `pages/admin/about-edit/index.wxss`：qua-row flex 布局样式
- `pages/about/index.js`：data 增加 qualifications；onShow 写入
- `pages/about/index.wxml`：企业资质卡片改为 wx:for 循环渲染

## 兼容性
- 旧 about 文档无 qualifications 字段时，getAboutConfig 回退默认 4 项
- 云函数白名单无需变更（about 已在内）
