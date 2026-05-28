const { logout } = require('../../utils/auth.js');

Page({
  data: { authed: false, showLogin: false, user: null, isAdmin: false },
  onShow() {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        authed: true,
        user: app.globalData.userInfo,
        isAdmin: app.globalData.role === 'admin'
      });
    } else {
      this.setData({ authed: false, showLogin: true });
    }
  },
  onLoginSuccess(e) {
    const app = getApp();
    this.setData({
      authed: true,
      showLogin: false,
      user: e.detail,
      isAdmin: app.globalData.role === 'admin'
    });
  },
  onCancelLogin() {
    this.setData({ showLogin: false });
    wx.switchTab({ url: '/pages/index/index' });
  },
  onMyInquiry() { wx.switchTab({ url: '/pages/inquiry/index/index' }); },
  onAbout() { wx.navigateTo({ url: '/pages/about/index' }); },
  onAdminProducts() { wx.navigateTo({ url: '/pages/admin/products-manage/index' }); },
  onAdminCases() { wx.navigateTo({ url: '/pages/admin/cases-manage/index' }); },
  onAdminInquiry() { wx.navigateTo({ url: '/pages/admin/inquiry-manage/index' }); },
  onAdminHome() { wx.navigateTo({ url: '/pages/admin/home-edit/index' }); },
  onLogout() {
    wx.showModal({
      title: '退出登录', content: '确定要退出登录吗？',
      success: (r) => {
        if (r.confirm) {
          logout();
          this.setData({ authed: false, user: null, isAdmin: false, showLogin: true });
        }
      }
    });
  }
});
