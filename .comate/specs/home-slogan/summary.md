# 首页 Slogan 完成总结

## 已完成
- `utils/db.js`：HOME_DEFAULT 增加 `slogan`，`getHomeConfig` 透传
- `pages/admin/home-edit`：表单新增「Slogan」输入项，保存/恢复默认/加载均同步
- `pages/index`：data 增加 `homeSlogan`；brand-card 渲染 `homeSubtitle / homeSlogan`
- `pages/cases/list`：引入 `getHomeConfig`，loadHero 并行拉取 home 配置；brand-card 文案绑定 `homeSubtitle / homeSlogan`

## 字段映射
- bc-title ← home.subtitle（默认：东北工业级隔断系统领导品牌）
- bc-sub   ← home.slogan（默认：12年深耕，累计交付面积超过 1,000,000+ ㎡）

## 兼容性
- 旧文档无 slogan 字段时，`getHomeConfig` 自动回退到默认值
- 云函数 `adminAction` 白名单已含 `home`，无需重新部署
