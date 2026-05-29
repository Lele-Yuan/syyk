const { listCases, getCasesConfig, getHomeConfig, CASES_DEFAULT, HOME_DEFAULT } = require('../../../utils/db.js');

Page({
  data: {
    tabs: [
      { id: 'all', label: '全部' },
      { id: '办公空间', label: '办公空间' },
      { id: '医疗教育', label: '医疗教育' },
      { id: '商业零售', label: '商业零售' }
    ],
    activeTab: 'all',
    cases: [],
    loading: true,
    heroTitle: CASES_DEFAULT.title,
    heroSubtitle: CASES_DEFAULT.subtitle,
    homeSubtitle: HOME_DEFAULT.subtitle,
    homeSlogan: HOME_DEFAULT.slogan
  },
  async onShow() {
    this.loadHero();
    await this.loadList();
  },
  async loadHero() {
    try {
      const results = await Promise.all([getCasesConfig(), getHomeConfig()]);
      const caseCfg = results[0];
      const homeCfg = results[1];
      this.setData({
        heroTitle: caseCfg.title,
        heroSubtitle: caseCfg.subtitle,
        homeSubtitle: homeCfg.subtitle,
        homeSlogan: homeCfg.slogan
      });
    } catch (e) {}
  },
  async loadList() {
    this.setData({ loading: true });
    try {
      const cases = await listCases(this.data.activeTab);
      this.setData({ cases: cases || [], loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  onTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.id });
    this.loadList();
  },
  onCardTap(e) {
    wx.navigateTo({ url: '/pages/cases/detail/index?id=' + e.detail.id });
  },
  onInquiry() { wx.switchTab({ url: '/pages/inquiry/index/index' }); }
});
