// utils/db.js — 数据库与云函数封装
const db = () => wx.cloud.database();

const HOME_DEFAULT = {
  banners: ['/images/default-cover.png'],
  tag: '100系列 极致全景',
  title: '沈阳银科隔墙',
  subtitle: '东北工业级隔断系统领导品牌'
};

async function getHomeConfig() {
  try {
    const r = await db().collection('siteConfig').doc('home').get();
    const data = r.data || {};
    return {
      banners: (data.banners && data.banners.length) ? data.banners : HOME_DEFAULT.banners,
      tag: data.tag || HOME_DEFAULT.tag,
      title: data.title || HOME_DEFAULT.title,
      subtitle: data.subtitle || HOME_DEFAULT.subtitle
    };
  } catch (e) {
    return Object.assign({}, HOME_DEFAULT);
  }
}

async function listProducts(filters = {}) {
  const where = {};
  ['material', 'fireRating', 'surface'].forEach(k => { if (filters[k]) where[k] = filters[k]; });
  const r = await db().collection('products').where(where).orderBy('createdAt', 'desc').limit(50).get();
  return r.data;
}
async function getProduct(id) {
  const r = await db().collection('products').doc(id).get();
  return r.data;
}
async function listCases(category) {
  const where = (category && category !== 'all') ? { category } : {};
  const r = await db().collection('cases').where(where).orderBy('createdAt', 'desc').limit(50).get();
  return r.data;
}
async function getCase(id) {
  const r = await db().collection('cases').doc(id).get();
  return r.data;
}
async function submitInquiry(payload) {
  return db().collection('inquiries').add({
    data: Object.assign({}, payload, {
      status: 'pending',
      createdAt: db().serverDate(),
      updatedAt: db().serverDate()
    })
  });
}
async function listMyInquiries() {
  const r = await db().collection('inquiries').orderBy('createdAt', 'desc').get();
  return r.data;
}
async function getInquiry(id) {
  const r = await db().collection('inquiries').doc(id).get();
  return r.data;
}
async function adminCall(action, payload, id) {
  const r = await wx.cloud.callFunction({ name: 'adminAction', data: { action, payload, id } });
  return r.result;
}

module.exports = {
  db, listProducts, getProduct, listCases, getCase,
  submitInquiry, listMyInquiries, getInquiry, adminCall,
  getHomeConfig, HOME_DEFAULT
};
