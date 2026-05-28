// 登录引导组件（自管理：头像/昵称/手机号 → 调用云函数 login）
Component({
  properties: {
    visible: { type: Boolean, value: false },
    title: { type: String, value: '登录后查看' },
    desc: { type: String, value: '请使用微信账号登录后继续操作' }
  },
  data: {
    avatarUrl: '',
    nickName: '',
    phoneCode: '',
    submitting: false
  },
  observers: {
    'visible': function (v) {
      if (!v) {
        this._nickName = '';
        this.setData({ avatarUrl: '', nickName: '', phoneCode: '', submitting: false });
      }
    }
  },
  methods: {
    onChooseAvatar(e) {
      this.setData({ avatarUrl: e.detail.avatarUrl });
    },
    onNickInput(e) {
      const v = (e.detail.value || '').trim();
      this._nickName = v;            // 同步缓存：规避 input type=nickname 的 blur 时序
      this.setData({ nickName: v });
    },
    onGetPhone(e) {
      if (!e.detail.code) {
        return wx.showToast({ title: '未授权手机号', icon: 'none' });
      }
      this.setData({ phoneCode: e.detail.code });
    },
    async onSubmit() {
      const { avatarUrl, phoneCode } = this.data;
      const nickName = (this._nickName || this.data.nickName || '').trim();
      if (!avatarUrl) return wx.showToast({ title: '请选择头像', icon: 'none' });
      if (!nickName) return wx.showToast({ title: '请输入昵称', icon: 'none' });
      // if (!phoneCode) return wx.showToast({ title: '请获取手机号', icon: 'none' });
      this.setData({ submitting: true });
      try {
        // 上传头像到云存储（chooseAvatar 返回的是临时本地路径）
        let avatarFileID = avatarUrl;
        if (/^(wxfile|http):/.test(avatarFileID) || /^\/?tmp/.test(avatarFileID)) {
          const cloudPath = `avatars/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
          const r = await wx.cloud.uploadFile({ cloudPath, filePath: avatarFileID });
          avatarFileID = r.fileID;
        }
        const { result } = await wx.cloud.callFunction({
          name: 'login',
          data: {
            userInfo: { nickName, avatarUrl: avatarFileID },
            phoneCode
          }
        });
        if (!result || result.code === 500) {
          throw new Error((result && result.msg) || 'login failed');
        }
        const app = getApp();
        app.globalData.userInfo = result;
        app.globalData.role = result.role;
        wx.setStorageSync('userInfo', result);
        this.triggerEvent('success', result);
      } catch (err) {
        console.error(err);
        wx.showToast({ title: '登录失败', icon: 'none' });
      } finally {
        this.setData({ submitting: false });
      }
    },
    onCancel() { this.triggerEvent('cancel'); }
  }
});
