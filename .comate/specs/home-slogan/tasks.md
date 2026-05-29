# 首页 Slogan 实施任务

- [x] Task 1: 数据层增加 slogan
    - 1.1: HOME_DEFAULT 增加 slogan 默认值
    - 1.2: getHomeConfig 返回字段补全 slogan

- [x] Task 2: 首页内容编辑表单
    - 2.1: home-edit data.form 增加 slogan
    - 2.2: WXML 新增「Slogan」输入项
    - 2.3: onSave、onResetDefaults、onLoad 同步 slogan

- [x] Task 3: 首页 brand-card 动态渲染
    - 3.1: pages/index data 增加 homeSlogan
    - 3.2: onShow 写入 homeSlogan
    - 3.3: WXML 用 homeSubtitle / homeSlogan 渲染 bc-title / bc-sub

- [x] Task 4: 案例页 brand-card 动态渲染
    - 4.1: cases/list 引入 getHomeConfig
    - 4.2: data 增加 homeSubtitle / homeSlogan
    - 4.3: loadHero 同时拉 home 配置
    - 4.4: WXML 替换 brand-card 文案绑定
