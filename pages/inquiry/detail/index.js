const { getInquiry } = require('../../../utils/db.js');
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
  data: { item: null, replies: [] },
  async onLoad(q) {
    if (!q.id) return;
    try {
      const item = await getInquiry(q.id);
      const view = Object.assign({}, item, {
        createdTxt: formatTime(item.createdAt),
        statusTxt: statusLabel(item.status)
      });
      const replies = mergeReplies(item);
      this.setData({ item: view, replies: replies });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  onCall() {
    if (this.data.item && this.data.item.phone) {
      wx.makePhoneCall({ phoneNumber: this.data.item.phone, fail: function () {} });
    }
  }
});
