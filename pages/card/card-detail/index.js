const { getCard, isCardSaved, saveContact, listContacts } = require('../../../utils/db.js');
const { ensureLogin } = require('../../../utils/auth.js');

var AREA_ICONS = ['🪟', '🔳', '🧩', '🔥', '🏗️', '💡'];

Page({
  data: {
    card: null, isOwner: false, saved: false, authed: false, showLogin: false,
    contactId: '', showRemark: false, remarkInput: '',
    ownerRemark: '', areaIcons: [], loading: true,
    snapshotMode: false, snapshot: null
  },
  onLoad(options) {
    this._id = options.id || '';
    this._contactId = options.contactId || '';
    this._shareName = options.n ? decodeURIComponent(options.n) : '';
    this._shareTitle = options.t ? decodeURIComponent(options.t) : '';
    this._shareCover = options.c ? decodeURIComponent(options.c) : '';
    // 朋友圈单页模式（scene 1154）下云开发被网关拒绝，渲染分享时携带的基础信息
    var scene = 0;
    try { scene = (wx.getLaunchOptionsSync && wx.getLaunchOptionsSync().scene) || 0; } catch (e) { scene = 0; }
    if (scene === 1154) {
      this.setData({
        loading: false,
        snapshotMode: true,
        snapshot: {
          name: this._shareName || '名片详情',
          title: this._shareTitle,
          cover: this._shareCover
        }
      });
      this._snapshot = true;
    }
  },
  onShow() {
    if (this._snapshot) return;
    this.loadCard();
  },
  async loadCard() {
    if (!this._id) {
      this.setData({
        loading: false,
        snapshotMode: true,
        snapshot: { name: this._shareName || '名片详情', title: this._shareTitle, cover: this._shareCover }
      });
      return;
    }
    try {
      const card = await getCard(this._id);
      if (!card) {
        this.setData({
          loading: false,
          snapshotMode: true,
          snapshot: { name: this._shareName || '名片详情', title: this._shareTitle, cover: this._shareCover }
        });
        return;
      }
      const user = await ensureLogin();
      const isOwner = !!(user && card._openid && card._openid === (user._openid || user.openid));
      const areaIcons = [];
      for (var i = 0; i < (card.businessAreas || []).length; i++) {
        areaIcons.push(AREA_ICONS[i] || '🔹');
      }
      var ownerRemark = isOwner ? (card.remark || '') : '';
      var saved = false;
      var contactId = this._contactId;
      if (!isOwner && user) {
        saved = await isCardSaved(this._id);
        if (saved && !contactId) {
          const contacts = await listContacts();
          for (var j = 0; j < contacts.length; j++) {
            if (contacts[j].cardId === this._id) { contactId = contacts[j]._id; break; }
          }
        }
      }
      var displayCard = Object.assign({}, card, { remark: undefined });
      this.setData({
        card: displayCard, isOwner: isOwner, saved: saved, authed: !!user,
        contactId: contactId, ownerRemark: ownerRemark,
        areaIcons: areaIcons, loading: false
      });
      wx.setNavigationBarTitle({ title: card.name ? card.name + '的名片' : '名片详情' });
    } catch (e) {
      console.error('[card-detail] loadCard failed:', e);
      this.setData({
        loading: false,
        snapshotMode: true,
        snapshot: { name: this._shareName || '名片详情', title: this._shareTitle, cover: this._shareCover }
      });
    }
  },
  onEdit() { wx.navigateTo({ url: '/pages/card/card-edit/index?id=' + this._id }); },
  onSave() {
    if (this.data.saved) return;
    if (!this.data.authed) {
      this.setData({ showLogin: true });
      return;
    }
    this.setData({ showRemark: true, remarkInput: '' });
  },
  onRemarkInput(e) { this.setData({ remarkInput: e.detail.value }); },
  async onConfirmSave() {
    const card = this.data.card;
    if (!card) return;
    wx.showLoading({ title: '保存中', mask: true });
    try {
      await saveContact(card, this.data.remarkInput);
      wx.hideLoading();
      this.setData({ saved: true, showRemark: false });
      wx.showToast({ title: '已保存到通讯录', icon: 'success' });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },
  onCancelSave() { this.setData({ showRemark: false }); },
  onLoginSuccess() { this.setData({ authed: true, showLogin: false }); this.loadCard(); },
  onCancelLogin() { this.setData({ showLogin: false }); },
  onShareAppMessage() {
    return {
      title: (this.data.card ? this.data.card.name : '') + '的名片',
      path: '/pages/card/card-detail/index?id=' + this._id
    };
  },
  onShareTimeline() {
    var c = this.data.card;
    var query = 'id=' + this._id;
    if (c) {
      if (c.name) query += '&n=' + encodeURIComponent(c.name);
      if (c.title) query += '&t=' + encodeURIComponent(c.title);
      if (c.avatarUrl) query += '&c=' + encodeURIComponent(c.avatarUrl);
    }
    return {
      title: (c ? c.name : '') + '的名片',
      query: query
    };
  },
  onCall() {
    if (!this.data.authed) {
      this.setData({ showLogin: true });
      return;
    }
    const phone = this.data.card && this.data.card.phone;
    if (phone) wx.makePhoneCall({ phoneNumber: phone, fail: function () {} });
  },
  onNavOffice(e) {
    var i = e.currentTarget.dataset.i;
    var offices = this.data.card && this.data.card.offices;
    if (!offices || !offices[i]) return;
    var o = offices[i];
    if (typeof o.latitude === 'number' && typeof o.longitude === 'number') {
      wx.openLocation({
        latitude: o.latitude, longitude: o.longitude,
        name: o.name || '', address: o.address || '', scale: 16
      });
    } else {
      wx.setClipboardData({ data: o.address || o.name || '' });
    }
  }
});
