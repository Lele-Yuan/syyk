const { getCard, createCard, updateCard } = require('../../../utils/db.js');
const { ensureLogin } = require('../../../utils/auth.js');

var AREA_PRESETS = ['双玻百叶隔断', '高隔间系统', '模块化装配', '防火隔断墙', '抗震隔断', '医用隔断'];

Page({
  data: {
    isEdit: false, cardId: '',
    form: { name: '', title: '', phone: '', email: '', specialty0: '', specialty1: '', remark: '', avatarUrl: '' },
    selectedPresets: [false, false, false, false, false, false],
    customAreas: [],
    customAreaInput: '',
    offices: [],
    achievements: [],
    areaPresets: AREA_PRESETS,
    uploading: false,
    submitting: false
  },
  async onLoad(options) {
    const user = await ensureLogin();
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(function () { wx.navigateBack(); }, 800);
      return;
    }
    const cached = wx.getStorageSync('userInfo') || {};
    this.setData({ 'form.avatarUrl': cached.avatarUrl || '' });
    if (options.id) {
      this.setData({ isEdit: true, cardId: options.id });
      this.loadCard(options.id);
    }
  },
  async loadCard(id) {
    wx.showLoading({ title: '加载中', mask: true });
    try {
      const card = await getCard(id);
      wx.hideLoading();
      if (!card) return;
      // 拆分预设业务 vs 自定义
      var areas = card.businessAreas || [];
      var selectedPresets = [false, false, false, false, false, false];
      var customAreas = [];
      for (var i = 0; i < areas.length; i++) {
        var isPreset = false;
        for (var j = 0; j < AREA_PRESETS.length; j++) {
          if (areas[i] === AREA_PRESETS[j]) { selectedPresets[j] = true; isPreset = true; break; }
        }
        if (!isPreset) customAreas.push(areas[i]);
      }
      var specialties = card.specialties || [];
      this.setData({
        'form.name': card.name || '',
        'form.title': card.title || '',
        'form.phone': card.phone || '',
        'form.email': card.email || '',
        'form.specialty0': specialties[0] || '',
        'form.specialty1': specialties[1] || '',
        'form.remark': card.remark || '',
        'form.avatarUrl': card.avatarUrl || '',
        selectedPresets: selectedPresets,
        customAreas: customAreas,
        offices: (card.offices || []).slice(),
        achievements: (card.achievements || []).slice()
      });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  onInput(e) {
    var k = e.currentTarget.dataset.k;
    var patch = {};
    patch['form.' + k] = e.detail.value;
    this.setData(patch);
  },
  async onChooseAvatar(e) {
    var tmpPath = e.detail.avatarUrl;
    if (!tmpPath) return;
    this.setData({ uploading: true });
    try {
      var cloudPath = 'cardAvatars/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
      var r = await wx.cloud.uploadFile({ cloudPath: cloudPath, filePath: tmpPath });
      this.setData({ 'form.avatarUrl': r.fileID, uploading: false });
    } catch (e) {
      this.setData({ uploading: false });
      wx.showToast({ title: '头像上传失败', icon: 'none' });
    }
  },

  // ─ 主营业务：预设 ─
  onTogglePreset(e) {
    var i = e.currentTarget.dataset.i;
    var sp = this.data.selectedPresets.slice();
    sp[i] = !sp[i];
    this.setData({ selectedPresets: sp });
  },
  // ─ 主营业务：自定义 ─
  onCustomAreaInput(e) { this.setData({ customAreaInput: e.detail.value }); },
  onAddCustomArea() {
    var val = (this.data.customAreaInput || '').trim();
    if (!val) return;
    var list = this.data.customAreas.slice();
    list.push(val);
    this.setData({ customAreas: list, customAreaInput: '' });
  },
  onRemoveCustomArea(e) {
    var i = e.currentTarget.dataset.i;
    var list = this.data.customAreas.slice();
    list.splice(i, 1);
    this.setData({ customAreas: list });
  },

  // ─ 办公地址 ─
  onAddOffice() {
    var list = this.data.offices.slice();
    list.push({ name: '', address: '', latitude: null, longitude: null });
    this.setData({ offices: list });
  },
  onRemoveOffice(e) {
    var i = e.currentTarget.dataset.i;
    var list = this.data.offices.slice();
    list.splice(i, 1);
    this.setData({ offices: list });
  },
  onOfficeInput(e) {
    var i = e.currentTarget.dataset.i;
    var k = e.currentTarget.dataset.k;
    var list = this.data.offices.slice();
    var item = Object.assign({}, list[i]);
    item[k] = e.detail.value;
    list[i] = item;
    this.setData({ offices: list });
  },
  onPickOfficeLocation(e) {
    var i = e.currentTarget.dataset.i;
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        var list = that.data.offices.slice();
        var item = Object.assign({}, list[i], {
          latitude: res.latitude,
          longitude: res.longitude,
          address: list[i].address || res.address || ''
        });
        list[i] = item;
        that.setData({ offices: list });
        wx.showToast({ title: '已设置坐标', icon: 'success' });
      },
      fail: function (err) {
        if (err && err.errMsg && err.errMsg.indexOf('cancel') >= 0) return;
        wx.showToast({ title: '位置选取失败', icon: 'none' });
      }
    });
  },

  // ─ 专业与品质 ─
  onAddAchievement() {
    var list = this.data.achievements.slice();
    list.push({ numTitle: '', subtitle: '', desc: '' });
    this.setData({ achievements: list });
  },
  onRemoveAchievement(e) {
    var i = e.currentTarget.dataset.i;
    var list = this.data.achievements.slice();
    list.splice(i, 1);
    this.setData({ achievements: list });
  },
  onAchievementInput(e) {
    var i = e.currentTarget.dataset.i;
    var k = e.currentTarget.dataset.k;
    var list = this.data.achievements.slice();
    var item = Object.assign({}, list[i]);
    item[k] = e.detail.value;
    list[i] = item;
    this.setData({ achievements: list });
  },

  async onSave() {
    if (this.data.submitting) return;
    var f = this.data.form;
    if (!f.name) return wx.showToast({ title: '请填写姓名', icon: 'none' });
    if (!f.title) return wx.showToast({ title: '请填写职位', icon: 'none' });
    if (!/^1\d{10}$/.test(f.phone)) return wx.showToast({ title: '手机号格式有误', icon: 'none' });

    // 合并业务领域
    var businessAreas = [];
    for (var i = 0; i < AREA_PRESETS.length; i++) {
      if (this.data.selectedPresets[i]) businessAreas.push(AREA_PRESETS[i]);
    }
    for (var j = 0; j < this.data.customAreas.length; j++) {
      if (this.data.customAreas[j]) businessAreas.push(this.data.customAreas[j]);
    }

    // 专长标签
    var specialties = [];
    if ((f.specialty0 || '').trim()) specialties.push(f.specialty0.trim());
    if ((f.specialty1 || '').trim()) specialties.push(f.specialty1.trim());

    // 办公地址（过滤空行）
    var offices = this.data.offices.filter(function (o) {
      return (o.name || '').trim() || (o.address || '').trim();
    }).map(function (o) {
      var out = { name: (o.name || '').trim(), address: (o.address || '').trim() };
      if (typeof o.latitude === 'number' && typeof o.longitude === 'number') {
        out.latitude = o.latitude;
        out.longitude = o.longitude;
      }
      return out;
    });

    // 专业与品质（过滤空行）
    var achievements = this.data.achievements.filter(function (a) {
      return (a.numTitle || '').trim();
    }).map(function (a) {
      return {
        numTitle: (a.numTitle || '').trim(),
        subtitle: (a.subtitle || '').trim(),
        desc: (a.desc || '').trim()
      };
    });

    var payload = {
      name: f.name.trim(),
      title: f.title.trim(),
      phone: f.phone.trim(),
      email: (f.email || '').trim(),
      specialties: specialties,
      businessAreas: businessAreas,
      offices: offices,
      achievements: achievements,
      remark: (f.remark || '').trim(),
      avatarUrl: f.avatarUrl || ''
    };

    this.setData({ submitting: true });
    wx.showLoading({ title: '保存中', mask: true });
    try {
      if (this.data.isEdit) {
        await updateCard(this.data.cardId, payload);
      } else {
        await createCard(payload);
      }
      wx.hideLoading();
      wx.showToast({ title: '已保存', icon: 'success' });
      setTimeout(function () { wx.navigateBack(); }, 600);
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
