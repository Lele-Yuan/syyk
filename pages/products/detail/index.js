const { getProduct, listCases } = require('../../../utils/db.js');
const { ensureLogin } = require('../../../utils/auth.js');

Page({
  data: {
    id: '',
    product: null,
    galleryIdx: 0,
    relatedCases: [],
    authed: false,
    showLogin: false
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
  async onShow() {
    const user = await ensureLogin();
    this.setData({ authed: !!user });
  },
  onSwiperChange(e) { this.setData({ galleryIdx: e.detail.current }); },
  onInquiry() { wx.switchTab({ url: '/pages/inquiry/index/index' }); },
  onSample() {
    if (!this.data.authed) {
      this.setData({ showLogin: true });
      return;
    }
    wx.switchTab({ url: '/pages/inquiry/index/index' });
  },
  onLoginSuccess() { this.setData({ authed: true, showLogin: false }); },
  onCancelLogin() { this.setData({ showLogin: false }); },
  onShareTap() { wx.showToast({ title: '请使用右上角分享', icon: 'none' }); },
  onFav() { wx.showToast({ title: '已收藏', icon: 'success' }); },
  onCase(e) { wx.navigateTo({ url: '/pages/cases/detail/index?id=' + e.currentTarget.dataset.id }); },
  onCompare() { wx.showToast({ title: '对比工具开发中', icon: 'none' }); },
  onShareAppMessage() {
    const p = this.data.product;
    return { title: p ? p.title : '沈阳银科隔墙', path: '/pages/products/detail/index?id=' + this.data.id };
  }
});
