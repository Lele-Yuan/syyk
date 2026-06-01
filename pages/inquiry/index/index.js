const { submitInquiry, listMyInquiries, listProducts, getSeriesConfig } = require('../../../utils/db.js');
const { formatTime, statusLabel } = require('../../../utils/format.js');

Page({
  data: {
    authed: false,
    showLogin: false,
    activeTab: 'submit',  // submit | mine
    form: {
      projectName: '',
      userName: '',
      phone: '',
      address: '',
      area: '',
      seriesIdx: 0,
      remark: ''
    },
    seriesOpts: ['双玻', '全钢', '极简超高', '其他/暂未确定'],
    productList: [],
    inquiries: [],
    loading: false
  },
  async onShow() {
    const app = getApp();
    this.loadSeries();
    if (app.globalData.userInfo) {
      this.setData({ authed: true, showLogin: false });
      this.prefillFromUser(app.globalData.userInfo);
      this.loadData();
    } else {
      this.setData({ authed: false, showLogin: true });
    }
  },
  async loadSeries() {
    try {
      const cfg = await getSeriesConfig();
      const names = (cfg.items || []).map(function (it) { return it.name; });
      if (names.length) {
        const patch = { seriesOpts: names };
        if (this.data.form.seriesIdx >= names.length) patch['form.seriesIdx'] = 0;
        this.setData(patch);
      }
    } catch (e) {}
  },
  onLoginSuccess(e) {
    this.setData({ authed: true, showLogin: false });
    this.prefillFromUser(e.detail);
    this.loadData();
  },
  prefillFromUser(u) {
    if (!u) return;
    const patch = {};
    if (u.nickName && !this.data.form.userName) patch['form.userName'] = u.nickName;
    if (u.phoneNumber && !this.data.form.phone) patch['form.phone'] = u.phoneNumber;
    if (Object.keys(patch).length) this.setData(patch);
  },
  onCancelLogin() {
    this.setData({ showLogin: false });
    wx.switchTab({ url: '/pages/index/index' });
  },
  async loadData() {
    try {
      const results = await Promise.all([listMyInquiries(), listProducts()]);
      const inquiries = results[0] || [];
      const products = results[1] || [];
      this.setData({
        inquiries: inquiries.map(i => Object.assign({}, i, {
          createdTxt: formatTime(i.createdAt),
          statusTxt: statusLabel(i.status)
        })),
        productList: products
      });
    } catch (e) { /* ignore */ }
  },
  onTab(e) { this.setData({ activeTab: e.currentTarget.dataset.k }); },
  onInput(e) {
    const k = e.currentTarget.dataset.k;
    const patch = {};
    patch['form.' + k] = e.detail.value;
    this.setData(patch);
  },
  onSeries(e) { this.setData({ 'form.seriesIdx': e.detail.value }); },
  async onSubmit() {
    const f = this.data.form;
    if (!f.projectName) return wx.showToast({ title: '请填写项目名称', icon: 'none' });
    if (!f.userName) return wx.showToast({ title: '请填写联系人', icon: 'none' });
    if (!/^1\d{10}$/.test(f.phone)) return wx.showToast({ title: '手机号格式有误', icon: 'none' });
    if (!f.address) return wx.showToast({ title: '请填写项目地址', icon: 'none' });
    if (!f.area) return wx.showToast({ title: '请填写项目面积', icon: 'none' });
    wx.showLoading({ title: '提交中', mask: true });
    try {
      const userInfo = wx.getStorageSync('userInfo') || {};
      await submitInquiry({
        projectName: f.projectName,
        userName: f.userName,
        phone: f.phone,
        address: f.address,
        area: Number(f.area) || f.area,
        series: this.data.seriesOpts[f.seriesIdx],
        remark: f.remark,
        userAvatar: userInfo.avatarUrl || ''
      });
      wx.hideLoading();
      wx.showToast({ title: '提交成功', icon: 'success' });
      this.setData({
        form: { projectName: '', userName: '', phone: '', address: '', area: '', seriesIdx: 0, remark: '' },
        activeTab: 'mine'
      });
      this.loadData();
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '提交失败', icon: 'none' });
    }
  },
  onItemTap(e) {
    wx.navigateTo({ url: '/pages/inquiry/detail/index?id=' + e.currentTarget.dataset.id });
  },
  onShareAppMessage() {
    return { title: '沈阳银科隔墙 - 在线询价', path: '/pages/inquiry/index/index' };
  }
});
