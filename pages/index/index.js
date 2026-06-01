const { listProducts, listCases, getHomeConfig, getAboutConfig, getServiceConfig, HOME_DEFAULT, ABOUT_DEFAULT } = require('../../utils/db.js');
const { navigateToOffice } = require('../../utils/nav.js');

Page({
  data: {
    banners: HOME_DEFAULT.banners.slice(),
    bannerFallback: '/images/default-cover.png',
    caseFallback: '/images/default-cover.png',
    homeTag: HOME_DEFAULT.tag,
    homeTitle: HOME_DEFAULT.title,
    homeSubtitle: HOME_DEFAULT.subtitle,
    homeSlogan: HOME_DEFAULT.slogan,
    bannerIdx: 0,
    offices: ABOUT_DEFAULT.offices.slice(),
    cases: [],
    products: [],
    agents: [],
    fabOpen: false
  },
  async onShow() {
    try {
      const results = await Promise.all([
        getHomeConfig(),
        listCases('all'),
        listProducts(),
        getAboutConfig(),
        getServiceConfig()
      ]);
      const cfg = results[0] || HOME_DEFAULT;
      const cases = results[1] || [];
      const products = results[2] || [];
      const about = results[3] || ABOUT_DEFAULT;
      const service = results[4] || { agents: [] };
      this.setData({
        banners: (cfg.banners && cfg.banners.length) ? cfg.banners : HOME_DEFAULT.banners.slice(),
        homeTag: cfg.tag,
        homeTitle: cfg.title,
        homeSubtitle: cfg.subtitle,
        homeSlogan: cfg.slogan,
        offices: (about.offices && about.offices.length) ? about.offices : ABOUT_DEFAULT.offices.slice(),
        cases: cases.slice(0, 4),
        products: products.slice(0, 3),
        agents: service.agents || []
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
  onAbout() {
    wx.navigateTo({ url: '/pages/about/index' });
  },
  onNavAddr(e) {
    const i = e.currentTarget.dataset.i;
    navigateToOffice(this.data.offices[i]);
  },
  onCase(e) {
    wx.navigateTo({ url: '/pages/cases/detail/index?id=' + e.currentTarget.dataset.id });
  },
  onFab() {
    if (this.data.agents && this.data.agents.length) {
      this.setData({ fabOpen: !this.data.fabOpen });
    } else {
      wx.switchTab({ url: '/pages/inquiry/index/index' });
    }
  },
  onCloseFab() { this.setData({ fabOpen: false }); },
  onCallAgent(e) {
    const phone = e.currentTarget.dataset.phone;
    if (!phone) return;
    wx.makePhoneCall({ phoneNumber: phone, fail: function () {} });
  },
  onCallSy() { wx.makePhoneCall({ phoneNumber: '02488886666', fail() {} }); },
  onShareAppMessage() {
    return { title: '沈阳银科隔墙 - 专业隔墙系统解决方案', path: '/pages/index/index' };
  }
});

