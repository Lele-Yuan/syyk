const { listProducts, getProductsConfig, PRODUCTS_DEFAULT } = require('../../../utils/db.js');

Page({
  data: {
    products: [],
    loading: true,
    showFilter: false,
    filters: { material: '', surface: '', fireRating: '' },
    materialOpts: ['', '工业铝合金', '冷轧钢板', '定制系列'],
    fireOpts: ['', 'A级', 'B1级', 'B2级'],
    surfaceOpts: ['', '阳极氧化', '粉末喷涂', '木纹饰面'],
    heroCover: PRODUCTS_DEFAULT.heroCover,
    heroFallback: '/images/default-cover.png',
    heroTitle: PRODUCTS_DEFAULT.title,
    heroSubtitle: PRODUCTS_DEFAULT.subtitle
  },
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
      const products = await listProducts(this.data.filters);
      this.setData({ products: products, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  toggleFilter() { this.setData({ showFilter: !this.data.showFilter }); },
  onFilter(e) {
    const k = e.currentTarget.dataset.k;
    const v = e.detail.value;
    const key = 'filters.' + k;
    const val = this.data[k + 'Opts'] ? this.data[k + 'Opts'][v] : v;
    const patch = {};
    patch[key] = val;
    this.setData(patch);
  },
  onApply() { this.setData({ showFilter: false }); this.loadList(); },
  onReset() {
    this.setData({ filters: { material: '', surface: '', fireRating: '' } });
    this.loadList();
  },
  onCardTap(e) {
    wx.navigateTo({ url: '/pages/products/detail/index?id=' + e.detail.id });
  },
  onInquiry(e) {
    wx.switchTab({ url: '/pages/inquiry/index/index' });
  },
  onScrollTop() {
    wx.pageScrollTo({ scrollTop: 0, duration: 300 });
  }
});
