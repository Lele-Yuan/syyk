const { listProducts, getProductsConfig, PRODUCTS_DEFAULT } = require('../../../utils/db.js');

Page({
  data: {
    products: [],
    loading: true,
    showFilter: false,
    keyword: '',
    heroCover: PRODUCTS_DEFAULT.heroCover,
    heroFallback: '/images/default-cover.png',
    heroTitle: PRODUCTS_DEFAULT.title,
    heroSubtitle: PRODUCTS_DEFAULT.subtitle
  },
  _allProducts: [],
  async onShow() {
    this.loadHero();
    await this.loadList();
  },
  async loadHero() {
    try {
      const cfg = await getProductsConfig();
      this.setData({
        heroCover: cfg.heroCover,
        heroTitle: cfg.title,
        heroSubtitle: cfg.subtitle
      });
    } catch (e) {}
  },
  onHeroError() {
    this.setData({ heroCover: this.data.heroFallback });
  },
  async loadList() {
    this.setData({ loading: true });
    try {
      const all = await listProducts();
      this._allProducts = all || [];
      this.applyKeyword();
      this.setData({ loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  applyKeyword() {
    var kw = (this.data.keyword || '').trim().toLowerCase();
    if (!kw) {
      this.setData({ products: this._allProducts });
      return;
    }
    var result = [];
    for (var i = 0; i < this._allProducts.length; i++) {
      var p = this._allProducts[i];
      // 拼接所有文本字段
      var text = [
        p.title, p.series, p.badge,
        p.material, p.fireRating, p.surface,
        p.description
      ].join(' ').toLowerCase();
      // features 卖点
      var features = p.features || [];
      for (var j = 0; j < features.length; j++) {
        text += ' ' + (features[j].title || '') + ' ' + (features[j].desc || '');
      }
      if (text.indexOf(kw) >= 0) {
        result.push(p);
      }
    }
    this.setData({ products: result });
  },
  noop() {},
  toggleFilter() { this.setData({ showFilter: !this.data.showFilter }); },
  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
    this.applyKeyword();
  },
  onApply() {
    this.applyKeyword();
    this.setData({ showFilter: false });
  },
  onReset() {
    this.setData({ keyword: '', showFilter: false });
    this.setData({ products: this._allProducts });
  },
  onCardTap(e) {
    wx.navigateTo({ url: '/pages/products/detail/index?id=' + e.detail.id });
  },
  onInquiry(e) {
    wx.switchTab({ url: '/pages/inquiry/index/index' });
  },
  onScrollTop() {
    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  },
  onShareAppMessage() {
    return { title: '沈阳银科隔墙 - 产品库房', path: '/pages/products/list/index' };
  }
});
