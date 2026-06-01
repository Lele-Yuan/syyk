const { logout } = require('../../utils/auth.js');
const { countPendingInquiries } = require('../../utils/db.js');

Page({
  data: { authed: false, showLogin: false, user: null, isAdmin: false, pendingInquiry: 0 },
  async onShow() {
    const app = getApp();
    if (app.globalData.userInfo) {
      var isAdmin = app.globalData.role === 'admin';
      this.setData({
        authed: true,
        user: app.globalData.userInfo,
        isAdmin: isAdmin
      });
      if (isAdmin) {
        try {
          var n = await countPendingInquiries();
          this.setData({ pendingInquiry: n });
        } catch (e) {}
      }
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
  onMyCards() { wx.navigateTo({ url: '/pages/card/my-cards/index' }); },
  onContacts() { wx.navigateTo({ url: '/pages/card/contacts/index' }); },
  onAbout() { wx.navigateTo({ url: '/pages/about/index' }); },
  onAdminProducts() { wx.navigateTo({ url: '/pages/admin/products-manage/index' }); },
  onAdminCases() { wx.navigateTo({ url: '/pages/admin/cases-manage/index' }); },
  onAdminInquiry() { wx.navigateTo({ url: '/pages/admin/inquiry-manage/index' }); },
  onAdminContent() { wx.navigateTo({ url: '/pages/admin/content/index' }); },
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
  },
  onShareAppMessage() {
    return { title: '沈阳银科隔墙 - 专业隔墙系统解决方案', path: '/pages/index/index' };
  }
});
