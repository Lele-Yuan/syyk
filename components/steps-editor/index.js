// 施工流程步骤编辑器：[{title, desc}]
Component({
  properties: { value: { type: Array, value: [] } },
  data: { items: [] },
  observers: {
    'value': function (v) {
      this.setData({ items: (v || []).map(x => Object.assign({}, x)) });
    }
  },
  methods: {
    _emit(items) {
      this.triggerEvent('change', { value: items });
    },
    onAdd() {
      const next = this.data.items.concat([{ title: '', desc: '' }]);
      this.setData({ items: next });
      this._emit(next);
    },
    onRemove(e) {
      const i = e.currentTarget.dataset.i;
      const next = this.data.items.slice();
      next.splice(i, 1);
      this.setData({ items: next });
      this._emit(next);
    },
    onInput(e) {
      const i = e.currentTarget.dataset.i;
      const k = e.currentTarget.dataset.k;
      const next = this.data.items.slice();
      const patch = {};
      patch[k] = e.detail.value;
      next[i] = Object.assign({}, next[i], patch);
      this.setData({ items: next });
      this._emit(next);
    }
  }
});
