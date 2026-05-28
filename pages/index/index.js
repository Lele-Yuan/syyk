const { listProducts, listCases, getHomeConfig, HOME_DEFAULT } = require('../../utils/db.js');

Page({
  data: {
    banners: HOME_DEFAULT.banners.slice(),
    bannerFallback: '/images/default-cover.png',
    caseFallback: '/images/default-cover.png',
    homeTag: HOME_DEFAULT.tag,
    homeTitle: HOME_DEFAULT.title,
    homeSubtitle: HOME_DEFAULT.subtitle,
    bannerIdx: 0,
    quickEntries: [
      { icon: '🏛️', label: '数字化展厅', url: '/pages/products/list/index', type: 'tab' },
      { icon: '🏗️', label: '工程作品', url: '/pages/cases/list/index', type: 'tab' },
      { icon: '📝', label: '一键询价', url: '/pages/inquiry/index/index', type: 'tab' },
      { icon: '🏢', label: '关于我们', url: '/pages/about/index', type: 'nav' }
    ],
    offices: [
      { city: '沈阳', addr: '沈阳市浑南区火炬路12号' },
      { city: '大连', addr: '大连市中山区人民路88号' }
    ],
    cases: [],
    products: []
  },
  async onShow() {
    try {
      const [cfg, cases, products] = await Promise.all([
        getHomeConfig(),
        listCases('all'),
        listProducts()
      ]);
      this.setData({
        banners: (cfg.banners && cfg.banners.length) ? cfg.banners : HOME_DEFAULT.banners.slice(),
        homeTag: cfg.tag,
        homeTitle: cfg.title,
        homeSubtitle: cfg.subtitle,
        cases: (cases || []).slice(0, 4),
        products: (products || []).slice(0, 3)
      });
    } catch (e) { /* 云未初始化时静默 */ }
  },
  onSwiperChange(e) { this.setData({ bannerIdx: e.detail.current }); },
  onBannerError(e) {
    const i = e.currentTarget.dataset.i;
    const banners = this.data.banners.slice();
    banners[i] = this.data.bannerFallback;
    this.setData({ banners });
  },
  onCaseImgError(e) {
    const i = e.currentTarget.dataset.i;
    const cases = this.data.cases.slice();
    if (cases[i]) {
      cases[i] = Object.assign({}, cases[i], { cover: this.data.caseFallback });
      this.setData({ cases });
    }
  },
  onEntry(e) {
    const { url, type } = e.currentTarget.dataset;
    if (type === 'tab') wx.switchTab({ url });
    else wx.navigateTo({ url });
  },
  onCase(e) {
    wx.navigateTo({ url: '/pages/cases/detail/index?id=' + e.currentTarget.dataset.id });
  },
  onFab() {
    wx.switchTab({ url: '/pages/inquiry/index/index' });
  },
  onCallSy() { wx.makePhoneCall({ phoneNumber: '02488886666', fail() {} }); }
});

