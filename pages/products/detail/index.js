const { getProduct, listCases } = require('../../../utils/db.js');
const { ensureLogin } = require('../../../utils/auth.js');

Page({
  data: {
    id: '',
    product: null,
    imagesIdx: 0,
    relatedCases: [],
    authed: false,
    showLogin: false,
    snapshotMode: false,
    snapshot: null
  },
  async onLoad(query) {
    const id = query.id;
    this.setData({ id });
    if (!id) return;
    // 朋友圈单页模式（scene 1154）下，云开发因未认证无法访问，渲染分享时带的基础信息
    var scene = 0;
    try { scene = (wx.getLaunchOptionsSync && wx.getLaunchOptionsSync().scene) || 0; } catch (e) { scene = 0; }
    if (scene === 1154) {
      this.setData({
        snapshotMode: true,
        snapshot: {
          title: query.t ? decodeURIComponent(query.t) : '产品详情',
          cover: query.c ? decodeURIComponent(query.c) : ''
        }
      });
      return;
    }
    var product = null;
    try {
      product = await getProduct(id);
    } catch (e) {
      console.error('[product-detail] getProduct failed:', e);
      this.setData({
        snapshotMode: true,
        snapshot: {
          title: query.t ? decodeURIComponent(query.t) : '产品详情',
          cover: query.c ? decodeURIComponent(query.c) : ''
        }
      });
      return;
    }
    if (!product) {
      this.setData({
        snapshotMode: true,
        snapshot: {
          title: query.t ? decodeURIComponent(query.t) : '产品详情',
          cover: query.c ? decodeURIComponent(query.c) : ''
        }
      });
      return;
    }
    var gallery = [];
    if (product.cover) gallery.push(product.cover);
    if (product.images && product.images.length) {
      for (var i = 0; i < product.images.length; i++) {
        if (product.images[i] && product.images[i] !== product.cover) {
          gallery.push(product.images[i]);
        }
      }
    }
    product.gallery = gallery;
    this.setData({ product });
    // 关联案例为辅助内容，加载失败不影响主页面
    try {
      const cases = await listCases('all');
      this.setData({ relatedCases: (cases || []).slice(0, 2) });
    } catch (e) {
      console.error('[product-detail] listCases failed (ignored):', e);
    }
  },
  async onShow() {
    const user = await ensureLogin();
    this.setData({ authed: !!user });
  },
  onSwiperChange(e) { this.setData({ imagesIdx: e.detail.current }); },
  onInquiry() {
    getApp().globalData.forceInquirySubmitTab = true;
    wx.switchTab({ url: '/pages/inquiry/index/index' });
  },
  onSample() {
    if (!this.data.authed) {
      this.setData({ showLogin: true });
      return;
    }
    getApp().globalData.forceInquirySubmitTab = true;
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
  },
  onShareTimeline() {
    const p = this.data.product;
    var query = 'id=' + this.data.id;
    if (p) {
      if (p.title) query += '&t=' + encodeURIComponent(p.title);
      if (p.cover) query += '&c=' + encodeURIComponent(p.cover);
    }
    return {
      title: p ? p.title : '沈阳银科隔墙',
      query: query
    };
  }
});
