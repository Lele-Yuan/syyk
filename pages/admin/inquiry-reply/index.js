const { requireAdmin } = require('../../../utils/auth.js');
const { getInquiry, adminCall } = require('../../../utils/db.js');
const { formatTime, statusLabel } = require('../../../utils/format.js');

Page({
  data: { id: '', item: null, replyText: '', submitting: false },
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
      if (item.reply && item.reply.repliedAt) {
        item.reply.timeText = formatTime(item.reply.repliedAt);
      }
      this.setData({ item, replyText: (item.reply && item.reply.content) || '' });
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
      await adminCall('replyInquiry', { content }, this.data.id);
      wx.showToast({ title: '已回复' });
      this.loadDetail();
    } catch (e) {
      wx.showToast({ title: '回复失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
  onClose() {
    wx.showModal({
      title: '关闭工单', content: '确定要关闭此询价吗？',
      success: async (r) => {
        if (!r.confirm) return;
        try {
          await adminCall('closeInquiry', null, this.data.id);
          wx.showToast({ title: '已关闭' });
          this.loadDetail();
        } catch (e) {
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  },
  onCallPhone() {
    if (!this.data.item) return;
    wx.makePhoneCall({ phoneNumber: this.data.item.phone, fail() {} });
  }
});
