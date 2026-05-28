const FALLBACK = '/images/default-cover.png';
Component({
  properties: {
    item: { type: Object, value: {} },
    showAdmin: { type: Boolean, value: false }
  },
  data: { coverSrc: FALLBACK },
  observers: {
    'item': function (it) {
      this.setData({ coverSrc: (it && it.cover) ? it.cover : FALLBACK });
    }
  },
  methods: {
    onTap() { this.triggerEvent('tap', { id: this.data.item._id }); },
    onEdit() { this.triggerEvent('edit', { id: this.data.item._id }); },
    onDelete() { this.triggerEvent('delete', { id: this.data.item._id }); },
    onImgError() { this.setData({ coverSrc: FALLBACK }); },
    noop() {}
  }
});
