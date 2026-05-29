const { listContacts } = require('../../../utils/db.js');
const { ensureLogin } = require('../../../utils/auth.js');

Page({
  data: { contacts: [], loading: true, authed: false, showLogin: false },
  async onShow() {
    const user = await ensureLogin();
    if (!user) {
      this.setData({ authed: false, showLogin: true, loading: false });
      return;
    }
    this.setData({ authed: true, showLogin: false });
    this.loadContacts();
  },
  async loadContacts() {
    this.setData({ loading: true });
    try {
      const list = await listContacts();
      this.setData({ contacts: list || [], loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },
  onCardTap(e) {
    var cardId = e.currentTarget.dataset.cardId;
    var contactId = e.currentTarget.dataset.contactId;
    var remark = e.currentTarget.dataset.remark;
    var url = '/pages/card/card-detail/index?id=' + cardId + '&contactId=' + contactId;
    wx.navigateTo({ url: url });
  },
  onLoginSuccess() {
    this.setData({ authed: true, showLogin: false });
    this.loadContacts();
  },
  onCancelLogin() {
    this.setData({ showLogin: false });
    wx.navigateBack();
  }
});
