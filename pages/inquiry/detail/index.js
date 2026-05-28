const { getInquiry } = require('../../../utils/db.js');
const { formatTime, statusLabel } = require('../../../utils/format.js');

Page({
  data: { item: null },
  async onLoad(q) {
    if (!q.id) return;
    try {
      const item = await getInquiry(q.id);
      this.setData({
        item: Object.assign({}, item, {
          createdTxt: formatTime(item.createdAt),
          statusTxt: statusLabel(item.status),
          repliedTxt: item.reply ? formatTime(item.reply.repliedAt) : ''
        })
      });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  onCall() {
    if (this.data.item && this.data.item.phone) {
      wx.makePhoneCall({ phoneNumber: this.data.item.phone, fail() {} });
    }
  }
});
