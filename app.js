// app.js
App({
  globalData: {
    userInfo: null,
    role: null,
    cloudReady: false
  },
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: 'cloud1-1g7rlzwk02e38290',
      traceUser: true
    });
    this.globalData.cloudReady = true;
    // 仅恢复本地缓存，不主动登录
    const cached = wx.getStorageSync('userInfo');
    if (cached && cached._openid) {
      this.globalData.userInfo = cached;
      this.globalData.role = cached.role || 'user';
    }
  }
});
