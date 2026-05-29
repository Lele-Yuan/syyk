const { requireAdmin } = require('../../../utils/auth.js');
const { getCasesConfig, adminCall, CASES_DEFAULT } = require('../../../utils/db.js');

Page({
  data: {
    form: { title: CASES_DEFAULT.title, subtitle: CASES_DEFAULT.subtitle },
    submitting: false
  },
  async onLoad() {
    const ok = await requireAdmin();
    if (!ok) return;
    try {
      const cfg = await getCasesConfig();
      this.setData({ form: { title: cfg.title, subtitle: cfg.subtitle } });
    } catch (e) {}
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
      title: (f.title || '').trim() || CASES_DEFAULT.title,
      subtitle: (f.subtitle || '').trim() || CASES_DEFAULT.subtitle
    };
    this.setData({ submitting: true });
    try {
      const r = await adminCall('upsertSiteConfig', { docId: 'cases', data: data });
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
