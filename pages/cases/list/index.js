const { listCases } = require('../../../utils/db.js');

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
    loading: true
  },
  async onShow() { await this.loadList(); },
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
