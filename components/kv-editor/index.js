// KV 列表编辑器：支持自定义字段名（默认 label/value）
Component({
  properties: {
    value: { type: Array, value: [] },
    labelKey: { type: String, value: 'label' },
    valueKey: { type: String, value: 'value' },
    labelPlaceholder: { type: String, value: '名称' },
    valuePlaceholder: { type: String, value: '值' }
  },
  data: { items: [] },
  observers: {
    'value, labelKey, valueKey': function (v, lk, vk) {
      const items = (v || []).map(x => ({
        label: x && x[lk] != null ? x[lk] : '',
        value: x && x[vk] != null ? x[vk] : ''
      }));
      this.setData({ items });
    }
  },
  methods: {
    _emit(items) {
      const lk = this.data.labelKey;
      const vk = this.data.valueKey;
      const value = items.map(it => ({ [lk]: it.label, [vk]: it.value }));
      this.triggerEvent('change', { value });
    },
    onAdd() {
      const next = this.data.items.concat([{ label: '', value: '' }]);
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
      const { i, k } = e.currentTarget.dataset;
      const next = this.data.items.slice();
      next[i] = Object.assign({}, next[i], { [k]: e.detail.value });
      this.setData({ items: next });
      this._emit(next);
    }
  }
});
