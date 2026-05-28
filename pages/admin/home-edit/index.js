const { requireAdmin } = require('../../../utils/auth.js');
const { getHomeConfig, adminCall, HOME_DEFAULT } = require('../../../utils/db.js');

Page({
  data: {
    form: {
      banners: [],
      tag: HOME_DEFAULT.tag,
      title: HOME_DEFAULT.title,
      subtitle: HOME_DEFAULT.subtitle
    },
    submitting: false
  },
  async onLoad() {
    const ok = await requireAdmin();
    if (!ok) return;
    try {
      const cfg = await getHomeConfig();
      this.setData({
        form: {
          banners: cfg.banners || [],
          tag: cfg.tag,
          title: cfg.title,
          subtitle: cfg.subtitle
        }
      });
    } catch (e) {}
  },
  onBannersChange(e) {
    const value = e.detail.value;
    this.setData({ 'form.banners': Array.isArray(value) ? value : (value ? [value] : []) });
  },
  onFieldInput(e) {
    const k = e.currentTarget.dataset.k;
    this.setData({ ['form.' + k]: e.detail.value });
  },
  async onSave() {
    if (this.data.submitting) return;
    const f = this.data.form;
    const banners = (f.banners || []).filter(Boolean);
    if (!banners.length) return wx.showToast({ title: '至少上传 1 张 banner', icon: 'none' });
    if (banners.length > 4) return wx.showToast({ title: '最多 4 张 banner', icon: 'none' });
    const payload = {
      banners,
      tag: (f.tag || '').trim() || HOME_DEFAULT.tag,
      title: (f.title || '').trim() || HOME_DEFAULT.title,
      subtitle: (f.subtitle || '').trim() || HOME_DEFAULT.subtitle
    };
    this.setData({ submitting: true });
    try {
      const r = await adminCall('upsertHomeConfig', payload);
      if (r && r.code === 0) {
        wx.showToast({ title: '已保存' });
        setTimeout(() => wx.navigateBack(), 600);
      } else {
        wx.showToast({ title: (r && r.msg) || '保存失败', icon: 'none' });
      }
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
  onResetDefaults() {
    wx.showModal({
      title: '恢复默认',
      content: '确认将文案恢复为默认值？（不影响已上传的 banner 图）',
      success: (r) => {
        if (!r.confirm) return;
        this.setData({
          'form.tag': HOME_DEFAULT.tag,
          'form.title': HOME_DEFAULT.title,
          'form.subtitle': HOME_DEFAULT.subtitle
        });
      }
    });
  }
});
