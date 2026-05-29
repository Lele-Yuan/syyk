const { requireAdmin } = require('../../../utils/auth.js');
const { getAboutConfig, adminCall, ABOUT_DEFAULT } = require('../../../utils/db.js');

Page({
  data: {
    form: {
      intro: ABOUT_DEFAULT.intro,
      offices: ABOUT_DEFAULT.offices.slice(),
      qualifications: ABOUT_DEFAULT.qualifications.slice()
    },
    submitting: false
  },
  async onLoad() {
    const ok = await requireAdmin();
    if (!ok) return;
    try {
      const cfg = await getAboutConfig();
      this.setData({
        form: {
          intro: cfg.intro || '',
          offices: (cfg.offices || []).map(function (o) {
            return { city: o.city || '', addr: o.addr || '', phone: o.phone || '' };
          }),
          qualifications: (cfg.qualifications || []).slice()
        }
      });
    } catch (e) {}
  },
  onIntroInput(e) {
    this.setData({ 'form.intro': e.detail.value });
  },
  onOfficeInput(e) {
    const i = e.currentTarget.dataset.i;
    const k = e.currentTarget.dataset.k;
    const list = this.data.form.offices.slice();
    const item = Object.assign({}, list[i]);
    item[k] = e.detail.value;
    list[i] = item;
    this.setData({ 'form.offices': list });
  },
  onAddOffice() {
    const list = this.data.form.offices.slice();
    list.push({ city: '', addr: '', phone: '' });
    this.setData({ 'form.offices': list });
  },
  onRemoveOffice(e) {
    const i = e.currentTarget.dataset.i;
    const list = this.data.form.offices.slice();
    list.splice(i, 1);
    this.setData({ 'form.offices': list });
  },
  onPickLocation(e) {
    const i = e.currentTarget.dataset.i;
    const that = this;
    wx.chooseLocation({
      success: function (res) {
        const list = that.data.form.offices.slice();
        const item = Object.assign({}, list[i], {
          latitude: res.latitude,
          longitude: res.longitude,
          locName: res.name || '',
          addr: list[i].addr || res.address || ''
        });
        list[i] = item;
        that.setData({ 'form.offices': list });
        wx.showToast({ title: '已设置坐标', icon: 'success' });
      },
      fail: function (err) {
        if (err && err.errMsg && err.errMsg.indexOf('cancel') >= 0) return;
        wx.showModal({
          title: '提示',
          content: '需要在 app.json 中配置 "permission.scope.userLocation" 并允许位置授权',
          showCancel: false
        });
      }
    });
  },
  onQuaInput(e) {
    const i = e.currentTarget.dataset.i;
    const list = this.data.form.qualifications.slice();
    list[i] = e.detail.value;
    this.setData({ 'form.qualifications': list });
  },
  onAddQua() {
    const list = this.data.form.qualifications.slice();
    list.push('');
    this.setData({ 'form.qualifications': list });
  },
  onRemoveQua(e) {
    const i = e.currentTarget.dataset.i;
    const list = this.data.form.qualifications.slice();
    list.splice(i, 1);
    this.setData({ 'form.qualifications': list });
  },
  async onSave() {
    if (this.data.submitting) return;
    const f = this.data.form;
    const offices = (f.offices || []).map(function (o) {
      const out = {
        city: (o.city || '').trim(),
        addr: (o.addr || '').trim(),
        phone: (o.phone || '').trim()
      };
      if (typeof o.latitude === 'number' && typeof o.longitude === 'number') {
        out.latitude = o.latitude;
        out.longitude = o.longitude;
      }
      if (o.locName) out.locName = o.locName;
      return out;
    }).filter(function (o) { return o.city || o.addr || o.phone; });
    if (!offices.length) return wx.showToast({ title: '至少 1 个办公地点', icon: 'none' });
    for (let i = 0; i < offices.length; i++) {
      if (!offices[i].city || !offices[i].addr) {
        return wx.showToast({ title: '城市与地址必填', icon: 'none' });
      }
    }
    const qualifications = (f.qualifications || []).map(function (q) {
      return (q || '').trim();
    }).filter(function (q) { return q; });
    const data = {
      intro: (f.intro || '').trim() || ABOUT_DEFAULT.intro,
      offices: offices,
      qualifications: qualifications.length ? qualifications : ABOUT_DEFAULT.qualifications
    };
    this.setData({ submitting: true });
    try {
      const r = await adminCall('upsertSiteConfig', { docId: 'about', data: data });
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
