const { requireAdmin } = require('../../../utils/auth.js');
const { getProductsConfig, adminCall, PRODUCTS_DEFAULT } = require('../../../utils/db.js');

Page({
  data: {
    form: {
      heroCover: '',
      title: PRODUCTS_DEFAULT.title,
      subtitle: PRODUCTS_DEFAULT.subtitle
    },
    submitting: false
  },
  async onLoad() {
    const ok = await requireAdmin();
    if (!ok) return;
    try {
      const cfg = await getProductsConfig();
      this.setData({
        form: {
          heroCover: cfg.heroCover === PRODUCTS_DEFAULT.heroCover ? '' : (cfg.heroCover || ''),
          title: cfg.title,
          subtitle: cfg.subtitle
        }
      });
    } catch (e) {}
  },
  onCoverChange(e) {
    const v = e.detail.value;
    this.setData({ 'form.heroCover': Array.isArray(v) ? (v[0] || '') : (v || '') });
  },
  onFieldInput(e) {
    const k = e.currentTarget.dataset.k;
    const patch = {};
    patch['form.' + k] = e.detail.value;
    this.setData(patch);
  },
  async onSave() {
    if (this.data.submitting) return;
    const f = this.data.form;
    const data = {
      heroCover: (f.heroCover || '').trim() || PRODUCTS_DEFAULT.heroCover,
      title: (f.title || '').trim() || PRODUCTS_DEFAULT.title,
      subtitle: (f.subtitle || '').trim() || PRODUCTS_DEFAULT.subtitle
    };
    this.setData({ submitting: true });
    try {
      const r = await adminCall('upsertSiteConfig', { docId: 'products', data: data });
      if (r && r.code === 0) {
        wx.showToast({ title: '已保存' });
        setTimeout(function () { wx.navigateBack(); }, 600);
      } else {
        wx.showToast({ title: (r && r.msg) || '保存失败', icon: 'none' });
      }
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
