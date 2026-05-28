Page({
  data: {
    offices: [
      { city: '沈阳总部', addr: '沈阳市浑南区火炬路12号科技大厦', phone: '024-88886666' },
      { city: '大连分公司', addr: '大连市中山区人民路88号', phone: '0411-88886666' }
    ]
  },
  onCall(e) { wx.makePhoneCall({ phoneNumber: e.currentTarget.dataset.phone, fail() {} }); },
  onCopy(e) { wx.setClipboardData({ data: e.currentTarget.dataset.text }); }
});
