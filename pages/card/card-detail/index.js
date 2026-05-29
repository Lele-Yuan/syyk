const { getCard, isCardSaved, saveContact, listContacts } = require('../../../utils/db.js');
const { ensureLogin } = require('../../../utils/auth.js');

var AREA_ICONS = ['🪟', '🔳', '🧩', '🔥', '🏗️', '💡'];

Page({
  data: {
    card: null, isOwner: false, saved: false, authed: false, showLogin: false,
    contactId: '', showRemark: false, remarkInput: '',
    ownerRemark: '', areaIcons: [], loading: true
  },
  onLoad(options) {
    this._id = options.id || '';
    this._contactId = options.contactId || '';
  },
  onShow() {
    this.loadCard();
  },
  async loadCard() {
    if (!this._id) { wx.showToast({ title: '名片不存在', icon: 'none' }); return; }
    try {
      const card = await getCard(this._id);
      if (!card) { wx.showToast({ title: '名片不存在', icon: 'none' }); return; }
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
      this.setData({ loading: false });
      wx.showToast({ title: '加载失败', icon: 'none' });
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
