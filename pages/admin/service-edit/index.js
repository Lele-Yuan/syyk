const { requireAdmin } = require('../../../utils/auth.js');
const { getServiceConfig, adminCall, SERVICE_DEFAULT } = require('../../../utils/db.js');

const GENDERS = ['male', 'female'];
const GENDER_LABELS = ['男', '女'];

function buildAgent(a) {
  const g = a && a.gender === 'female' ? 'female' : 'male';
  return {
    gender: g,
    genderIdx: GENDERS.indexOf(g),
    name: (a && a.name) || '',
    phone: (a && a.phone) || ''
  };
}

Page({
  data: {
    genderLabels: GENDER_LABELS,
    agents: [
      buildAgent(SERVICE_DEFAULT.agents[0]),
      buildAgent(SERVICE_DEFAULT.agents[1])
    ],
    submitting: false
  },
  async onLoad() {
    const ok = await requireAdmin();
    if (!ok) return;
    try {
      const cfg = await getServiceConfig();
      const list = cfg.agents || [];
      const next = [
        buildAgent(list[0] || SERVICE_DEFAULT.agents[0]),
        buildAgent(list[1] || SERVICE_DEFAULT.agents[1])
      ];
      this.setData({ agents: next });
    } catch (e) {}
  },
  onGender(e) {
    const i = Number(e.currentTarget.dataset.i);
    const idx = Number(e.detail.value);
    const list = this.data.agents.slice();
    list[i] = Object.assign({}, list[i], { gender: GENDERS[idx], genderIdx: idx });
    this.setData({ agents: list });
  },
  onInput(e) {
    const i = Number(e.currentTarget.dataset.i);
    const k = e.currentTarget.dataset.k;
    const list = this.data.agents.slice();
    const item = Object.assign({}, list[i]);
    item[k] = e.detail.value;
    list[i] = item;
    this.setData({ agents: list });
  },
  async onSave() {
    if (this.data.submitting) return;
    const list = this.data.agents.map(function (a) {
      return {
        gender: a.gender || 'male',
        name: (a.name || '').trim(),
        phone: (a.phone || '').trim()
      };
    });
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (!a.phone) continue;
      if (!/^1\d{10}$/.test(a.phone)) {
        return wx.showToast({ title: '客服' + (i + 1) + '手机号格式有误', icon: 'none' });
      }
      out.push(a);
    }
    if (!out.length) return wx.showToast({ title: '至少配置 1 个手机号', icon: 'none' });
    this.setData({ submitting: true });
    try {
      const r = await adminCall('upsertSiteConfig', { docId: 'service', data: { agents: out } });
      if (r && r.code === 0) {
        wx.showToast({ title: '已保存' });
        setTimeout(function () { wx.navigateBack(); }, 600);
      } else {
        wx.showToast({ title: (r && r.msg) || '保存失败', icon: 'none' });
      }
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
