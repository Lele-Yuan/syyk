# 企业资质配置 实施任务

- [x] Task 1: 数据层
    - 1.1: ABOUT_DEFAULT 增加 qualifications 默认数组
    - 1.2: getAboutConfig 返回 qualifications（空则回退默认）

- [x] Task 2: 关于我们编辑页
    - 2.1: about-edit data.form 增加 qualifications 数组
    - 2.2: onLoad 同步 qualifications
    - 2.3: 新增 onQuaInput / onAddQua / onRemoveQua 方法
    - 2.4: WXML 新增「企业资质」分组，循环渲染输入项 + 新增/删除按钮
    - 2.5: onSave 序列化（trim+filter 空值），写入 about 文档

- [x] Task 3: 关于我们前台
    - 3.1: pages/about/index.js data 增加 qualifications，onShow 写入
    - 3.2: WXML 改为循环渲染 qualifications
