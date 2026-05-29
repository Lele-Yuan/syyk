const { requireAdmin } = require('../../../utils/auth.js');
const { adminCall } = require('../../../utils/db.js');
const { formatTime, statusLabel } = require('../../../utils/format.js');

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待回复' },
  { key: 'replied', label: '已回复' },
  { key: 'closed', label: '已关闭' }
];

Page({
  data: { tabs: TABS, tabKey: 'all', list: [], loading: true },
  async onShow() {
    const ok = await requireAdmin();
    if (!ok) return;
    this.loadList();
  },
  async loadList() {
    this.setData({ loading: true });
    try {
      const status = this.data.tabKey === 'all' ? null : this.data.tabKey;
      const res = await adminCall('listInquiries', { status: status });
      const raw = (res && res.data) || [];
      const list = raw.map(function (it) {
        return Object.assign({}, it, {
          timeText: formatTime(it.createdAt),
          statusText: statusLabel(it.status)
        });
      });
      this.setData({ list: list, loading: false });
    } catch (e) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  onTab(e) {
    const key = e.currentTarget.dataset.key;
    if (key === this.data.tabKey) return;
    this.setData({ tabKey: key });
    this.loadList();
  },
  onItem(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/admin/inquiry-reply/index?id=' + id });
  }
});
