const { requireAdmin } = require('../../../utils/auth.js');
const { listCases, adminCall } = require('../../../utils/db.js');

Page({
  data: { list: [], loading: true },
  async onShow() {
    const ok = await requireAdmin();
    if (!ok) return;
    this.loadList();
  },
  async loadList() {
    this.setData({ loading: true });
    try {
      const list = await listCases();
      this.setData({ list, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  onAdd() { wx.navigateTo({ url: '/pages/admin/case-edit/index' }); },
  onEdit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/admin/case-edit/index?id=${id}` });
  },
  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除确认', content: '确定要删除此工程案例吗？',
      success: async (r) => {
        if (!r.confirm) return;
        try {
          await adminCall('deleteCase', null, id);
          wx.showToast({ title: '已删除' });
          this.loadList();
        } catch (err) {
          wx.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    });
  }
});
