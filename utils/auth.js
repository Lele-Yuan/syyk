// utils/auth.js — 登录与角色
const getApp_ = () => getApp();

/**
 * 检查登录态：已登录返回用户信息，未登录返回 null。
 * 实际登录流程由 login-mask 组件接管（采集头像/昵称/手机号 → 调云函数 login）。
 */
function ensureLogin() {
  const app = getApp_();
  return Promise.resolve(app.globalData.userInfo || null);
}

async function requireAdmin() {
  const u = await ensureLogin();
  if (!u) {
    wx.showToast({ title: '请先登录', icon: 'none' });
    setTimeout(() => wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/profile/index' }) }), 800);
    return false;
  }
  if (u.role !== 'admin') {
    wx.showToast({ title: '需管理员权限', icon: 'none' });
    setTimeout(() => wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) }), 800);
    return false;
  }
  return true;
}

function logout() {
  const app = getApp_();
  app.globalData.userInfo = null;
  app.globalData.role = null;
  wx.removeStorageSync('userInfo');
}

module.exports = { ensureLogin, requireAdmin, logout };
