const { listProducts } = require('../../../utils/db.js');

Page({
  data: {
    products: [],
    loading: true,
    showFilter: false,
    filters: { material: '', surface: '', fireRating: '' },
    materialOpts: ['', '工业铝合金', '冷轧钢板', '定制系列'],
    fireOpts: ['', 'A级', 'B1级', 'B2级'],
    surfaceOpts: ['', '阳极氧化', '粉末喷涂', '木纹饰面']
  },
  async onShow() {
    await this.loadList();
  },
  async loadList() {
    this.setData({ loading: true });
    try {
      const products = await listProducts(this.data.filters);
      this.setData({ products, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  toggleFilter() { this.setData({ showFilter: !this.data.showFilter }); },
  onFilter(e) {
    const { k } = e.currentTarget.dataset;
    const v = e.detail.value;
    this.setData({ [`filters.${k}`]: this.data[k + 'Opts'] ? this.data[k + 'Opts'][v] : v });
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
