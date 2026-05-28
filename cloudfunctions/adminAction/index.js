// 云函数 adminAction: 仅管理员可执行的写操作
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const RESERVED = ['_id', '_openid', 'createdAt', 'createdBy', 'updatedAt'];
function sanitize(data) {
  const o = Object.assign({}, data);
  RESERVED.forEach(k => { delete o[k]; });
  return o;
}

async function isAdmin(openid) {
  const r = await db.collection('users').where({ _openid: openid }).limit(1).get();
  return r.data[0] && r.data[0].role === 'admin';
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { action, payload = {}, id } = event || {};
  if (!await isAdmin(OPENID)) return { code: 403, msg: '无权限' };
  try {
    if (action === 'upsertProduct') {
      const data = sanitize(payload);
      if (id) {
        await db.collection('products').doc(id).update({ data: Object.assign({}, data, { updatedAt: db.serverDate() }) });
        return { code: 0, _id: id };
      }
      const r = await db.collection('products').add({ data: Object.assign({}, data, { createdAt: db.serverDate(), createdBy: OPENID }) });
      return { code: 0, _id: r._id };
    }
    if (action === 'upsertCase') {
      const data = sanitize(payload);
      if (id) {
        await db.collection('cases').doc(id).update({ data: Object.assign({}, data, { updatedAt: db.serverDate() }) });
        return { code: 0, _id: id };
      }
      const r = await db.collection('cases').add({ data: Object.assign({}, data, { createdAt: db.serverDate(), createdBy: OPENID }) });
      return { code: 0, _id: r._id };
    }
    if (action === 'deleteProduct') { await db.collection('products').doc(id).remove(); return { code: 0 }; }
    if (action === 'deleteCase') { await db.collection('cases').doc(id).remove(); return { code: 0 }; }
    if (action === 'replyInquiry') {
      await db.collection('inquiries').doc(id).update({
        data: {
          status: 'replied',
          reply: { content: payload.content, repliedBy: OPENID, repliedAt: db.serverDate() },
          updatedAt: db.serverDate()
        }
      });
      return { code: 0 };
    }
    if (action === 'closeInquiry') {
      await db.collection('inquiries').doc(id).update({ data: { status: 'closed', updatedAt: db.serverDate() } });
      return { code: 0 };
    }
    if (action === 'upsertHomeConfig') {
      const data = sanitize(payload);
      await db.collection('siteConfig').doc('home').set({
        data: Object.assign({}, data, { updatedAt: db.serverDate() })
      });
      return { code: 0 };
    }
    if (action === 'listInquiries') {
      const where = (payload.status && payload.status !== 'all') ? { status: payload.status } : {};
      const r = await db.collection('inquiries').where(where).orderBy('createdAt', 'desc').limit(100).get();
      return { code: 0, data: r.data };
    }
    return { code: 400, msg: '未知操作' };
  } catch (err) {
    return { code: 500, msg: String(err) };
  }
};
