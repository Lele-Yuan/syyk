const { requireAdmin } = require('../../../utils/auth.js');
const { getProduct, adminCall } = require('../../../utils/db.js');

Page({
  data: {
    id: '',
    form: {
      title: '', series: '', badge: '', material: '',
      fireRating: '', surface: '', description: '',
      cover: '', images: [],
      features: [
        { icon: '🛡️', title: '', desc: '' },
        { icon: '⚡', title: '', desc: '' },
        { icon: '🔥', title: '', desc: '' }
      ],
      specs: []
    },
    submitting: false
  },
  async onLoad(opts) {
    const ok = await requireAdmin();
    if (!ok) return;
    if (opts.id) {
      this.setData({ id: opts.id });
      try {
        const p = await getProduct(opts.id);
        const form = Object.assign({}, this.data.form, p);
        if (!form.features || form.features.length < 3) {
          form.features = this.data.form.features;
        }
        if (!form.specs) form.specs = [];
        if (!form.images) form.images = [];
        this.setData({ form });
      } catch (e) {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    }
  },
  onInput(e) {
    const k = e.currentTarget.dataset.k;
    this.setData({ [`form.${k}`]: e.detail.value });
  },
  onFeatureInput(e) {
    const { idx, k } = e.currentTarget.dataset;
    this.setData({ [`form.features[${idx}].${k}`]: e.detail.value });
  },
  onCoverChange(e) {
    const v = e.detail.value;
    this.setData({ 'form.cover': Array.isArray(v) ? v[0] || '' : v });
  },
  onImagesChange(e) {
    this.setData({ 'form.images': e.detail.value || [] });
  },
  onSpecsChange(e) {
    this.setData({ 'form.specs': e.detail.value || [] });
  },
  async onSubmit() {
    const f = this.data.form;
    if (!f.title) return wx.showToast({ title: '请填写标题', icon: 'none' });
    if (!f.cover) return wx.showToast({ title: '请上传主图', icon: 'none' });
    this.setData({ submitting: true });
    try {
      await adminCall('upsertProduct', f, this.data.id || undefined);
      wx.showToast({ title: '保存成功' });
      setTimeout(() => wx.navigateBack(), 600);
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
