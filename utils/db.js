// utils/db.js — 数据库与云函数封装
const db = () => wx.cloud.database();

const HOME_DEFAULT = {
  banners: ['/images/default-cover.png'],
  tag: '100系列 极致全景',
  title: '沈阳银科隔墙',
  subtitle: '东北工业级隔断系统领导品牌',
  slogan: '12年深耕，累计交付面积超过 1,000,000+ ㎡'
};

const ABOUT_DEFAULT = {
  intro: '银科 12 年深耕东北建筑装饰行业，专注于工业级铝合金隔断、双玻百叶系统、医用级抗震隔断的研发与施工。累计交付超 1,000,000+ ㎡ 项目，服务包括科技独角兽企业、三甲医院、知名商业地产等行业标杆客户。',
  offices: [
    { city: '沈阳总部', addr: '沈阳市浑南区火炬路12号科技大厦', phone: '024-88886666' },
    { city: '大连分公司', addr: '大连市中山区人民路88号', phone: '0411-88886666' }
  ],
  qualifications: [
    '建筑装饰装修工程专业承包二级',
    'ISO 9001 质量管理体系认证',
    '国家高新技术企业',
    'AAA 级信用企业'
  ]
};

const PRODUCTS_DEFAULT = {
  heroCover: '/images/default-cover.png',
  title: '数字化展厅',
  subtitle: '探索领先的工业级隔断铝型材与空间系统'
};

const CASES_DEFAULT = {
  title: '工程作品',
  subtitle: '扎根东北，服务全国。以工业精度定义建筑之美，通过真实案例见证银科实力。'
};

const SERVICE_DEFAULT = {
  agents: [
    { gender: 'male', name: '苑经理', phone: '18540270142' },
    { gender: 'female', name: '罗顾问', phone: '18842394828' }
  ]
};

const SERIES_DEFAULT = {
  items: [
    { id: 's_default_1', name: '双玻' },
    { id: 's_default_2', name: '全钢' },
    { id: 's_default_3', name: '极简超高' },
    { id: 's_default_4', name: '其他/暂未确定' }
  ]
};

async function getSiteConfig(docId, defaults) {
  try {
    // 用 where 替代 doc().get()，避免文档不存在时控制台报错
    const r = await db().collection('siteConfig').where({ _id: docId }).limit(1).get();
    const data = (r.data && r.data[0]) || null;
    return Object.assign({}, defaults, data || {});
  } catch (e) {
    return Object.assign({}, defaults);
  }
}

async function getHomeConfig() {
  const cfg = await getSiteConfig('home', HOME_DEFAULT);
  return {
    banners: (cfg.banners && cfg.banners.length) ? cfg.banners : HOME_DEFAULT.banners,
    tag: cfg.tag || HOME_DEFAULT.tag,
    title: cfg.title || HOME_DEFAULT.title,
    subtitle: cfg.subtitle || HOME_DEFAULT.subtitle,
    slogan: cfg.slogan || HOME_DEFAULT.slogan
  };
}

async function getAboutConfig() {
  const cfg = await getSiteConfig('about', ABOUT_DEFAULT);
  return {
    intro: cfg.intro || ABOUT_DEFAULT.intro,
    offices: (cfg.offices && cfg.offices.length) ? cfg.offices : ABOUT_DEFAULT.offices,
    qualifications: (cfg.qualifications && cfg.qualifications.length) ? cfg.qualifications : ABOUT_DEFAULT.qualifications
  };
}

async function getProductsConfig() {
  const cfg = await getSiteConfig('products', PRODUCTS_DEFAULT);
  return {
    heroCover: cfg.heroCover || PRODUCTS_DEFAULT.heroCover,
    title: cfg.title || PRODUCTS_DEFAULT.title,
    subtitle: cfg.subtitle || PRODUCTS_DEFAULT.subtitle
  };
}

async function getCasesConfig() {
  const cfg = await getSiteConfig('cases', CASES_DEFAULT);
  return {
    title: cfg.title || CASES_DEFAULT.title,
    subtitle: cfg.subtitle || CASES_DEFAULT.subtitle
  };
}

async function getSeriesConfig() {
  const cfg = await getSiteConfig('series', SERIES_DEFAULT);
  const list = (cfg.items || []).filter(function (x) { return x && x.name; });
  return { items: list.length ? list : SERIES_DEFAULT.items };
}

async function getServiceConfig() {
  const cfg = await getSiteConfig('service', SERVICE_DEFAULT);
  const list = (cfg.agents || []).filter(function (a) { return a && a.phone; });
  return { agents: list };
}

async function listProducts() {
  const r = await db().collection('products').orderBy('createdAt', 'desc').limit(50).get();
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
// ── 名片夹 ──────────────────────────────────────
async function listMyCards() {
  var openid = (getApp().globalData.userInfo || {})._openid;
  var col = db().collection('businessCards');
  if (openid) {
    col = col.where({ _openid: openid });
  }
  const r = await col.orderBy('createdAt', 'desc').get();
  return r.data;
}
async function getCard(id) {
  const r = await db().collection('businessCards').doc(id).get();
  return r.data;
}
async function createCard(data) {
  return db().collection('businessCards').add({
    data: Object.assign({}, data, {
      createdAt: db().serverDate(),
      updatedAt: db().serverDate()
    })
  });
}
async function updateCard(id, data) {
  return db().collection('businessCards').doc(id).update({
    data: Object.assign({}, data, { updatedAt: db().serverDate() })
  });
}
async function deleteCard(id) {
  return db().collection('businessCards').doc(id).remove();
}
async function listContacts() {
  const r = await db().collection('contacts').orderBy('savedAt', 'desc').get();
  return r.data;
}
async function saveContact(card, remark) {
  return db().collection('contacts').add({
    data: {
      cardId: card._id,
      snapshot: {
        name: card.name || '',
        title: card.title || '',
        titleEn: card.titleEn || '',
        phone: card.phone || '',
        email: card.email || '',
        address: card.address || '',
        specialties: card.specialties || [],
        businessAreas: card.businessAreas || [],
        avatarUrl: card.avatarUrl || ''
      },
      remark: remark || '',
      savedAt: db().serverDate()
    }
  });
}
async function isCardSaved(cardId) {
  const r = await db().collection('contacts').where({ cardId: cardId }).get();
  return !!(r.data && r.data.length);
}
async function deleteContact(id) {
  return db().collection('contacts').doc(id).remove();
}

async function countPendingInquiries() {
  const r = await db().collection('inquiries').where({ status: 'pending' }).count();
  return r.total || 0;
}

async function adminCall(action, payload, id) {  const r = await wx.cloud.callFunction({ name: 'adminAction', data: { action: action, payload: payload, id: id } });
  return r.result;
}

module.exports = {
  db, listProducts, getProduct, listCases, getCase,
  submitInquiry, listMyInquiries, getInquiry, countPendingInquiries, adminCall,
  getHomeConfig, getAboutConfig, getProductsConfig, getCasesConfig, getSeriesConfig, getServiceConfig,
  listMyCards, getCard, createCard, updateCard, deleteCard,
  listContacts, saveContact, isCardSaved, deleteContact,
  HOME_DEFAULT, ABOUT_DEFAULT, PRODUCTS_DEFAULT, CASES_DEFAULT, SERIES_DEFAULT, SERVICE_DEFAULT
};

