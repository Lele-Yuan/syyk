const { requireAdmin } = require('../../../utils/auth.js');
const { getInquiry, adminCall } = require('../../../utils/db.js');
const { formatTime, statusLabel } = require('../../../utils/format.js');

function mergeReplies(item) {
  const list = [];
  if (item.replies && item.replies.length) {
    for (let i = 0; i < item.replies.length; i++) list.push(item.replies[i]);
  }
  if (item.reply && item.reply.content) {
    let exists = false;
    for (let i = 0; i < list.length; i++) {
      if (list[i].content === item.reply.content) { exists = true; break; }
    }
    if (!exists) list.unshift(item.reply);
  }
  list.sort(function (a, b) {
    const ta = new Date(a.repliedAt || 0).getTime();
    const tb = new Date(b.repliedAt || 0).getTime();
    return ta - tb;
  });
  return list.map(function (r) {
    return Object.assign({}, r, { timeText: formatTime(r.repliedAt) });
  });
}

Page({
  data: { id: '', item: null, replies: [], replyText: '', submitting: false },
  async onLoad(opts) {
    const ok = await requireAdmin();
    if (!ok) return;
    this.setData({ id: opts.id });
    this.loadDetail();
  },
  async loadDetail() {
    try {
      const item = await getInquiry(this.data.id);
      item.timeText = formatTime(item.createdAt);
      item.statusText = statusLabel(item.status);
      const replies = mergeReplies(item);
      this.setData({ item: item, replies: replies, replyText: '' });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  onReplyInput(e) { this.setData({ replyText: e.detail.value }); },
  async onSendReply() {
    const content = (this.data.replyText || '').trim();
    if (!content) return wx.showToast({ title: '请输入回复内容', icon: 'none' });
    this.setData({ submitting: true });
    try {
      await adminCall('replyInquiry', { content: content }, this.data.id);
      wx.showToast({ title: '已回复' });
      this.loadDetail();
    } catch (e) {
      wx.showToast({ title: '回复失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
  onClose() {
    const that = this;
    wx.showModal({
      title: '关闭工单', content: '确定要关闭此询价吗？',
      success: async function (r) {
        if (!r.confirm) return;
        try {
          await adminCall('closeInquiry', null, that.data.id);
          wx.showToast({ title: '已关闭' });
          that.loadDetail();
        } catch (e) {
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },
  onCallPhone() {
    if (!this.data.item) return;
    wx.makePhoneCall({ phoneNumber: this.data.item.phone, fail: function () {} });
  }
});
