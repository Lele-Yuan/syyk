# 关于我们 - 企业资质配置

## 需求
- 内容管理 → 关于我们 编辑页中新增「企业资质」配置区
- 资质为字符串列表，支持新增 / 删除 / 编辑
- 关于我们页面的「企业资质」卡片改为从 about 配置读取，未配置时回退默认 4 项

## 数据结构
`siteConfig.about` 增加：
```
qualifications: [
  '建筑装饰装修工程专业承包二级',
  'ISO 9001 质量管理体系认证',
  '国家高新技术企业',
  'AAA 级信用企业'
]
```

## 影响文件
- utils/db.js：ABOUT_DEFAULT 增加 qualifications；getAboutConfig 透传
- pages/admin/about-edit/index.{js,wxml,wxss}：增加 qualifications 编辑区（输入项 + 新增/删除）
- pages/about/index.{js,wxml}：拉取 qualifications，循环渲染

## 边界
- 空字符串自动过滤；保存后空数组回退默认
- 不需要修改云函数白名单（about 已在内）
