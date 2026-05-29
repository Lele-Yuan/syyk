const { requireAdmin } = require('../../../utils/auth.js');
const { getSeriesConfig, adminCall, SERIES_DEFAULT } = require('../../../utils/db.js');

function genId() {
  return 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

Page({
  data: {
    items: [],
    submitting: false,
    rowH: 110,
    dragIndex: -1,
    dragY: 0,
    targetIndex: -1
  },
  _startY: 0,
  _startTop: 0,
  async onLoad() {
    const ok = await requireAdmin();
    if (!ok) return;
    try {
      const cfg = await getSeriesConfig();
      const items = (cfg.items || []).map(function (it) {
        return { id: it.id || genId(), name: it.name || '' };
      });
      this.setData({ items: items });
    } catch (e) {
      this.setData({ items: SERIES_DEFAULT.items.slice() });
    }
  },
  onReady() {
    const that = this;
    wx.createSelectorQuery().select('.row').boundingClientRect(function (rect) {
      if (rect && rect.height) that.setData({ rowH: rect.height });
    }).exec();
  },
  onNameInput(e) {
    const i = e.currentTarget.dataset.i;
    const list = this.data.items.slice();
    const item = Object.assign({}, list[i]);
    item.name = e.detail.value;
    list[i] = item;
    this.setData({ items: list });
  },
  onAdd() {
    const list = this.data.items.slice();
    list.push({ id: genId(), name: '' });
    this.setData({ items: list });
  },
  onRemove(e) {
    const i = e.currentTarget.dataset.i;
    if (this.data.items.length <= 1) {
      return wx.showToast({ title: '至少保留 1 项', icon: 'none' });
    }
    const list = this.data.items.slice();
    list.splice(i, 1);
    this.setData({ items: list });
  },
  onDragStart(e) {
    const i = e.currentTarget.dataset.i;
    this._startY = e.touches[0].clientY;
    this.setData({ dragIndex: i, dragY: 0, targetIndex: i });
  },
  onDragMove(e) {
    if (this.data.dragIndex < 0) return;
    const dy = e.touches[0].clientY - this._startY;
    const rowH = this.data.rowH || 110;
    const offset = Math.round(dy / rowH);
    let target = this.data.dragIndex + offset;
    if (target < 0) target = 0;
    if (target > this.data.items.length - 1) target = this.data.items.length - 1;
    this.setData({ dragY: dy, targetIndex: target });
  },
  onDragEnd() {
    const from = this.data.dragIndex;
    const to = this.data.targetIndex;
    if (from < 0) return;
    if (from !== to && to >= 0) {
      const list = this.data.items.slice();
      const moved = list.splice(from, 1)[0];
      list.splice(to, 0, moved);
      this.setData({ items: list });
    }
    this.setData({ dragIndex: -1, dragY: 0, targetIndex: -1 });
  },
  async onSave() {
    if (this.data.submitting) return;
    const items = (this.data.items || []).map(function (it) {
      return { id: it.id || genId(), name: (it.name || '').trim() };
    }).filter(function (it) { return it.name; });
    if (!items.length) return wx.showToast({ title: '至少 1 个系列', icon: 'none' });
    const seen = {};
    for (let i = 0; i < items.length; i++) {
      if (seen[items[i].name]) return wx.showToast({ title: '名称重复：' + items[i].name, icon: 'none' });
      seen[items[i].name] = true;
    }
    this.setData({ submitting: true });
    try {
      const r = await adminCall('upsertSiteConfig', { docId: 'series', data: { items: items } });
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
