// 云函数 publicQuery: 提供公开读取接口，绕过朋友圈单页模式下未登录用户被数据库安全规则拒绝的问题
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event) => {
  const { action, id, category } = event || {};
  try {
    if (action === 'getProduct') {
      if (!id) return { code: 400, msg: '缺少 id' };
      const r = await db.collection('products').doc(id).get();
      return { code: 0, data: r.data };
    }
    if (action === 'getCase') {
      if (!id) return { code: 400, msg: '缺少 id' };
      const r = await db.collection('cases').doc(id).get();
      return { code: 0, data: r.data };
    }
    if (action === 'listProducts') {
      const r = await db.collection('products').orderBy('createdAt', 'desc').limit(50).get();
      return { code: 0, data: r.data };
    }
    if (action === 'listCases') {
      const where = (category && category !== 'all') ? { category } : {};
      const r = await db.collection('cases').where(where).orderBy('createdAt', 'desc').limit(50).get();
      return { code: 0, data: r.data };
    }
    if (action === 'getCard') {
      if (!id) return { code: 400, msg: '缺少 id' };
      const r = await db.collection('businessCards').doc(id).get();
      return { code: 0, data: r.data };
    }
    if (action === 'getSiteConfig') {
      const SITE_DOCS = ['home', 'about', 'products', 'cases', 'series', 'service'];
      if (SITE_DOCS.indexOf(id) < 0) return { code: 400, msg: '非法 docId' };
      try {
        const r = await db.collection('siteConfig').doc(id).get();
        return { code: 0, data: r.data };
      } catch (e) {
        return { code: 0, data: null };
      }
    }
    return { code: 400, msg: '未知操作' };
  } catch (err) {
    return { code: 500, msg: String(err && err.errMsg || err) };
  }
};
