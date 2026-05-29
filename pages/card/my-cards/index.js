const { listMyCards, deleteCard } = require('../../../utils/db.js');
const { ensureLogin } = require('../../../utils/auth.js');

Page({
  data: { cards: [], loading: true, authed: false, showLogin: false, swipeOpenId: '' },
  async onShow() {
    const user = await ensureLogin();
    if (!user) {
      this.setData({ authed: false, showLogin: true, loading: false });
      return;
    }
    this.setData({ authed: true, showLogin: false });
    this.loadCards();
  },
  async loadCards() {
    this.setData({ loading: true, swipeOpenId: '' });
    try {
      const cards = await listMyCards();
      this.setData({ cards: cards || [], loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  // ── 左划手势 ──
  onTouchStart(e) {
    this._touchStartX = e.touches[0].clientX;
    this._touchItemId = e.currentTarget.dataset.id;
  },
  onTouchEnd(e) {
    var endX = e.changedTouches[0].clientX;
    var dx = endX - this._touchStartX;
    var id = this._touchItemId;
    if (dx < -50) {
      // 左划：打开当前，关闭其他
      this.setData({ swipeOpenId: id });
    } else if (dx > 30) {
      // 右划：关闭
      if (this.data.swipeOpenId === id) this.setData({ swipeOpenId: '' });
    }
  },

  // ── 点击内容区：若有已打开项先关闭 ──
  onCardTap(e) {
    if (this.data.swipeOpenId) {
      this.setData({ swipeOpenId: '' });
      return;
    }
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/card/card-detail/index?id=' + id + '&owner=1' });
  },

  // ── 编辑 ──
  onEditCard(e) {
    var id = e.currentTarget.dataset.id;
    this.setData({ swipeOpenId: '' });
    wx.navigateTo({ url: '/pages/card/card-edit/index?id=' + id });
  },

  // ── 删除 ──
  onDeleteCard(e) {
    var id = e.currentTarget.dataset.id;
    var that = this;
    wx.showModal({
      title: '删除名片',
      content: '确认删除这张名片？删除后不可恢复。',
      confirmColor: '#d23b3b',
      success: function (res) {
        if (!res.confirm) return;
        that.doDelete(id);
      }
    });
  },
  async doDelete(id) {
    wx.showLoading({ title: '删除中', mask: true });
    try {
      await deleteCard(id);
      wx.hideLoading();
      wx.showToast({ title: '已删除', icon: 'success' });
      var cards = this.data.cards.filter(function (c) { return c._id !== id; });
      this.setData({ cards: cards, swipeOpenId: '' });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  onCreateCard() { wx.navigateTo({ url: '/pages/card/card-edit/index' }); },
  onLoginSuccess() { this.setData({ authed: true, showLogin: false }); this.loadCards(); },
  onCancelLogin() { this.setData({ showLogin: false }); wx.navigateBack(); }
});
