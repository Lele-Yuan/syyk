const { getCase } = require('../../../utils/db.js');

Page({
  data: { id: '', caseInfo: null },
  async onLoad(query) {
    this.setData({ id: query.id });
    if (!query.id) return;
    try {
      const caseInfo = await getCase(query.id);
      this.setData({ caseInfo });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  onInquiry() { wx.switchTab({ url: '/pages/inquiry/index/index' }); },
  onProduct(e) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: '/pages/products/detail/index?id=' + id });
  },
  onShareAppMessage() {
    const c = this.data.caseInfo;
    return { title: c ? c.title : '工程案例', path: '/pages/cases/detail/index?id=' + this.data.id };
  }
});
