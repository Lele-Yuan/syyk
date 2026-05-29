const { requireAdmin } = require('../../../utils/auth.js');
const { getCase, adminCall, listProducts, getSeriesConfig } = require('../../../utils/db.js');

const CATEGORIES = ['办公空间', '医疗教育', '商业零售'];

Page({
  data: {
    id: '',
    categories: CATEGORIES,
    catIdx: 0,
    form: {
      title: '', subtitle: '', category: CATEGORIES[0],
      location: '', area: '', duration: '', mainMaterial: '', series: '',
      description: '', difficulty: '',
      cover: '', images: [],
      stats: [],
      steps: [],
      materials: [],
      testimonial: { name: '', role: '', content: '', rating: 5, avatar: '' },
      tags: ''
    },
    products: [],     // 可选铝型材
    seriesOpts: [],
    seriesIdx: -1,
    submitting: false
  },
  async onLoad(opts) {
    const ok = await requireAdmin();
    if (!ok) return;
    // 并行加载产品列表
    listProducts().then(list => this.setData({ products: list || [] })).catch(() => {});
    this.loadSeries();
    if (opts.id) {
      this.setData({ id: opts.id });
      try {
        const c = await getCase(opts.id);
        const form = Object.assign({}, this.data.form, c);
        if (Array.isArray(form.tags)) form.tags = form.tags.join(',');
        if (!form.testimonial) form.testimonial = this.data.form.testimonial;
        const catIdx = Math.max(0, CATEGORIES.indexOf(form.category));
        this.setData({ form, catIdx });
        this.syncSeriesIdx();
      } catch (e) {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    }
  },
  async loadSeries() {
    try {
      const cfg = await getSeriesConfig();
      const names = (cfg.items || []).map(function (it) { return it.name; });
      this.setData({ seriesOpts: names });
      this.syncSeriesIdx();
    } catch (e) {}
  },
  syncSeriesIdx() {
    const cur = this.data.form.series || '';
    const idx = (this.data.seriesOpts || []).indexOf(cur);
    this.setData({ seriesIdx: idx });
  },
  onSeriesPick(e) {
    const idx = Number(e.detail.value);
    const name = this.data.seriesOpts[idx] || '';
    this.setData({ seriesIdx: idx, 'form.series': name });
  },
  onInput(e) {
    const patch = {};
    patch['form.' + e.currentTarget.dataset.k] = e.detail.value;
    this.setData(patch);
  },
  onTestimonialInput(e) {
    const patch = {};
    patch['form.testimonial.' + e.currentTarget.dataset.k] = e.detail.value;
    this.setData(patch);
  },
  onCatChange(e) {
    const idx = e.detail.value;
    this.setData({ catIdx: idx, 'form.category': CATEGORIES[idx] });
  },
  onCoverChange(e) {
    const v = e.detail.value;
    this.setData({ 'form.cover': Array.isArray(v) ? v[0] || '' : v });
  },
  onImagesChange(e) { this.setData({ 'form.images': e.detail.value || [] }); },
  onStatsChange(e) { this.setData({ 'form.stats': e.detail.value || [] }); },
  onStepsChange(e) { this.setData({ 'form.steps': e.detail.value || [] }); },

  // —— 所用材料：支持从产品列表选择 ——
  onPickMaterial() {
    const products = this.data.products || [];
    if (!products.length) {
      return wx.showToast({ title: '暂无可选铝型材', icon: 'none' });
    }
    const selectedIds = (this.data.form.materials || []).map(m => m.productId).filter(Boolean);
    const available = products.filter(p => !selectedIds.includes(p._id));
    if (!available.length) {
      return wx.showToast({ title: '已全部添加', icon: 'none' });
    }
    wx.showActionSheet({
      itemList: available.map(p => p.title || '未命名'),
      success: (res) => {
        const p = available[res.tapIndex];
        const next = (this.data.form.materials || []).concat([{
          productId: p._id,
          name: p.title || '',
          desc: p.description || p.material || '',
          icon: '🧱'
        }]);
        this.setData({ 'form.materials': next });
      }
    });
  },
  onAddManualMaterial() {
    const next = (this.data.form.materials || []).concat([{ productId: '', name: '', desc: '', icon: '🧱' }]);
    this.setData({ 'form.materials': next });
  },
  onMaterialFieldInput(e) {
    const i = e.currentTarget.dataset.i;
    const k = e.currentTarget.dataset.k;
    const patch = {};
    patch['form.materials[' + i + '].' + k] = e.detail.value;
    this.setData(patch);
  },
  onRemoveMaterial(e) {
    const i = e.currentTarget.dataset.i;
    const next = (this.data.form.materials || []).slice();
    next.splice(i, 1);
    this.setData({ 'form.materials': next });
  },

  async onSubmit() {
    const f = Object.assign({}, this.data.form);
    if (!f.title) return wx.showToast({ title: '请填写标题', icon: 'none' });
    if (!f.cover) return wx.showToast({ title: '请上传主图', icon: 'none' });
    f.tags = (f.tags || '').split(/[,，\s]+/).filter(Boolean);
    this.setData({ submitting: true });
    try {
      await adminCall('upsertCase', f, this.data.id || undefined);
      wx.showToast({ title: '保存成功' });
      setTimeout(() => wx.navigateBack(), 600);
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
