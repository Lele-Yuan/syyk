const { getCase, listProducts } = require('../../../utils/db.js');

Page({
  data: { id: '', caseInfo: null, snapshotMode: false, snapshot: null },
  async onLoad(query) {
    this.setData({ id: query.id });
    if (!query.id) return;
    // 朋友圈单页模式（scene 1154）下云开发被网关拒绝，渲染分享时携带的基础信息
    var scene = 0;
    try { scene = (wx.getLaunchOptionsSync && wx.getLaunchOptionsSync().scene) || 0; } catch (e) { scene = 0; }
    if (scene === 1154) {
      this.setData({
        snapshotMode: true,
        snapshot: {
          title: query.t ? decodeURIComponent(query.t) : '工程案例',
          cover: query.c ? decodeURIComponent(query.c) : ''
        }
      });
      return;
    }
    var caseInfo = null;
    try {
      caseInfo = await getCase(query.id);
    } catch (e) {
      console.error('[case-detail] getCase failed:', e);
      this.setData({
        snapshotMode: true,
        snapshot: {
          title: query.t ? decodeURIComponent(query.t) : '工程案例',
          cover: query.c ? decodeURIComponent(query.c) : ''
        }
      });
      return;
    }
    if (!caseInfo) {
      this.setData({
        snapshotMode: true,
        snapshot: {
          title: query.t ? decodeURIComponent(query.t) : '工程案例',
          cover: query.c ? decodeURIComponent(query.c) : ''
        }
      });
      return;
    }
    var products = [];
    try {
      products = (await listProducts()) || [];
    } catch (e) {
      console.error('[case-detail] listProducts failed (ignored):', e);
    }
    if (Array.isArray(caseInfo.materials)) {
      caseInfo.materials = caseInfo.materials.map(function (m) {
        var item = Object.assign({}, m);
        // 没有 productId 或 desc 时，按名称匹配产品自动补全
        var matched = null;
        if (!item.productId || !item.desc) {
          for (var i = 0; i < products.length; i++) {
            if (products[i].title === item.name) { matched = products[i]; break; }
          }
          if (matched) {
            if (!item.productId) item.productId = matched._id;
            if (!item.desc) item.desc = matched.description || matched.material || '';
          }
        }
        // 已关联产品时，再次定位产品取头图（cover）
        if (item.productId && !matched) {
          for (var j = 0; j < products.length; j++) {
            if (products[j]._id === item.productId) { matched = products[j]; break; }
          }
        }
        if (matched && matched.cover) item.cover = matched.cover;
        return item;
      });
    }
    this.setData({ caseInfo: caseInfo });
  },
  onInquiry() {
    getApp().globalData.forceInquirySubmitTab = true;
    wx.switchTab({ url: '/pages/inquiry/index/index' });
  },
  onProduct(e) {
    const id = e.currentTarget.dataset.id;
    if (id) wx.navigateTo({ url: '/pages/products/detail/index?id=' + id });
  },
  onShareAppMessage() {
    const c = this.data.caseInfo;
    return { title: c ? c.title : '工程案例', path: '/pages/cases/detail/index?id=' + this.data.id };
  },
  onShareTimeline() {
    const c = this.data.caseInfo;
    var query = 'id=' + this.data.id;
    if (c) {
      if (c.title) query += '&t=' + encodeURIComponent(c.title);
      if (c.cover) query += '&c=' + encodeURIComponent(c.cover);
    }
    return {
      title: c ? c.title : '工程案例',
      query: query
    };
  }
});
