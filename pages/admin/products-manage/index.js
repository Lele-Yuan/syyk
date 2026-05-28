const { requireAdmin } = require('../../../utils/auth.js');
const { listProducts, adminCall } = require('../../../utils/db.js');

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
      const list = await listProducts();
      this.setData({ list, loading: false });
    } catch (e) {
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  onAdd() { wx.navigateTo({ url: '/pages/admin/product-edit/index' }); },
  onEdit(e) {
    const id = e.detail && e.detail.id || e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/admin/product-edit/index?id=${id}` });
  },
  onDelete(e) {
    const id = e.detail && e.detail.id || e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除确认', content: '确定要删除此铝型材数据吗？',
      success: async (r) => {
        if (!r.confirm) return;
        try {
          await adminCall('deleteProduct', null, id);
          wx.showToast({ title: '已删除' });
          this.loadList();
        } catch (err) {
          wx.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    });
  }
});
