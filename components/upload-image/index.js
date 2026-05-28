// 单/多图上传至云存储
Component({
  properties: {
    value: { type: null, value: [] },           // String 或 Array
    multiple: { type: Boolean, value: false },
    max: { type: Number, value: 9 },
    dir: { type: String, value: 'misc' }
  },
  data: { fileIDs: [] },
  observers: {
    'value': function (v) {
      const arr = !v ? [] : (Array.isArray(v) ? v : [v]);
      this.setData({ fileIDs: arr });
    }
  },
  methods: {
    _emit(next) {
      const value = this.data.multiple ? next : (next[0] || '');
      this.triggerEvent('change', { value });
    },
    async onAdd() {
      const remain = this.data.multiple ? this.data.max - this.data.fileIDs.length : 1;
      if (remain <= 0) return wx.showToast({ title: '已达上限', icon: 'none' });
      try {
        const { tempFiles } = await wx.chooseMedia({
          count: remain, mediaType: ['image'], sizeType: ['compressed']
        });
        wx.showLoading({ title: '上传中', mask: true });
        const fids = [];
        for (const f of tempFiles) {
          const ext = (f.tempFilePath.split('.').pop() || 'jpg').toLowerCase();
          const cloudPath = `${this.data.dir}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
          const r = await wx.cloud.uploadFile({ cloudPath, filePath: f.tempFilePath });
          fids.push(r.fileID);
        }
        wx.hideLoading();
        const next = this.data.multiple ? this.data.fileIDs.concat(fids) : fids.slice(0, 1);
        this.setData({ fileIDs: next });
        this._emit(next);
      } catch (e) {
        wx.hideLoading();
        if (e && e.errMsg && e.errMsg.indexOf('cancel') < 0) {
          wx.showToast({ title: '上传失败', icon: 'none' });
        }
      }
    },
    onRemove(e) {
      const i = e.currentTarget.dataset.i;
      const next = this.data.fileIDs.slice();
      next.splice(i, 1);
      this.setData({ fileIDs: next });
      this._emit(next);
    },
    onPreview(e) {
      const i = e.currentTarget.dataset.i;
      wx.previewImage({ urls: this.data.fileIDs, current: this.data.fileIDs[i] });
    }
  }
});
