const { requireAdmin } = require('../../../utils/auth.js');

Page({
  data: {
    items: [
      { icon: '🖼️', title: '首页内容', desc: 'Banner、标题、副标题', url: '/pages/admin/home-edit/index' },
      { icon: '🏢', title: '关于我们', desc: '公司介绍、办公地点', url: '/pages/admin/about-edit/index' },
      { icon: '🧱', title: '展厅头图', desc: '展厅页头图与文案', url: '/pages/admin/products-hero-edit/index' },
      { icon: '🏗️', title: '案例头图', desc: '案例列表页文案', url: '/pages/admin/cases-hero-edit/index' },
      { icon: '📑', title: '型材系列', desc: '管理系列名称与排序', url: '/pages/admin/series-edit/index' },
      { icon: '📞', title: '客服电话', desc: '配置首页浮动球客服联系人', url: '/pages/admin/service-edit/index' }
    ]
  },
  async onLoad() {
    const ok = await requireAdmin();
    if (!ok) return;
  },
  onTap(e) {
    const url = e.currentTarget.dataset.url;
    if (url) wx.navigateTo({ url: url });
  }
});
