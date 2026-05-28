const { submitInquiry, listMyInquiries, listProducts } = require('../../../utils/db.js');
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
    seriesOpts: ['100系列', 'Y-100 双玻', 'Y-80 全钢', 'Y-120 极简超高', '其他/暂未确定'],
    productList: [],
    inquiries: [],
    loading: false
  },
  async onShow() {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({ authed: true });
      this.prefillFromUser(app.globalData.userInfo);
      this.loadData();
    } else {
      this.setData({ authed: false, showLogin: true });
    }
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
      const [inquiries, products] = await Promise.all([listMyInquiries(), listProducts()]);
      this.setData({
        inquiries: (inquiries || []).map(i => Object.assign({}, i, {
          createdTxt: formatTime(i.createdAt),
          statusTxt: statusLabel(i.status)
        })),
        productList: products || []
      });
    } catch (e) { /* ignore */ }
  },
  onTab(e) { this.setData({ activeTab: e.currentTarget.dataset.k }); },
  onInput(e) {
    const k = e.currentTarget.dataset.k;
    this.setData({ [`form.${k}`]: e.detail.value });
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
      await submitInquiry({
        projectName: f.projectName,
        userName: f.userName,
        phone: f.phone,
        address: f.address,
        area: Number(f.area) || f.area,
        series: this.data.seriesOpts[f.seriesIdx],
        remark: f.remark
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
  }
});
