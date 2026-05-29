const { getAboutConfig, ABOUT_DEFAULT } = require('../../utils/db.js');
const { navigateToOffice } = require('../../utils/nav.js');

Page({
  data: {
    intro: ABOUT_DEFAULT.intro,
    offices: ABOUT_DEFAULT.offices.slice(),
    qualifications: ABOUT_DEFAULT.qualifications.slice()
  },
  async onShow() {
    try {
      const cfg = await getAboutConfig();
      this.setData({ intro: cfg.intro, offices: cfg.offices, qualifications: cfg.qualifications });
    } catch (e) {}
  },
  onCall(e) { wx.makePhoneCall({ phoneNumber: e.currentTarget.dataset.phone, fail: function () {} }); },
  onNavAddr(e) {
    const i = e.currentTarget.dataset.i;
    navigateToOffice(this.data.offices[i]);
  }
});

