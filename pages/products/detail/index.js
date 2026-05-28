const { getProduct, listCases } = require('../../../utils/db.js');

Page({
  data: {
    id: '',
    product: null,
    galleryIdx: 0,
    relatedCases: []
  },
  async onLoad(query) {
    const id = query.id;
    this.setData({ id });
    if (!id) return;
    try {
      const product = await getProduct(id);
      this.setData({ product });
      const cases = await listCases('all');
      this.setData({ relatedCases: (cases || []).slice(0, 2) });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  onSwiperChange(e) { this.setData({ galleryIdx: e.detail.current }); },
  onInquiry() { wx.switchTab({ url: '/pages/inquiry/index/index' }); },
  onSample() { wx.showToast({ title: '已提交申请', icon: 'success' }); },
  onShareTap() { wx.showToast({ title: '请使用右上角分享', icon: 'none' }); },
  onFav() { wx.showToast({ title: '已收藏', icon: 'success' }); },
  onCase(e) { wx.navigateTo({ url: '/pages/cases/detail/index?id=' + e.currentTarget.dataset.id }); },
  onCompare() { wx.showToast({ title: '对比工具开发中', icon: 'none' }); },
  onShareAppMessage() {
    const p = this.data.product;
    return { title: p ? p.title : '沈阳银科隔墙', path: '/pages/products/detail/index?id=' + this.data.id };
  }
});
