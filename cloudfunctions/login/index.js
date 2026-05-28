// 云函数 login: 创建/读取用户记录、解码手机号、返回角色
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const ADMIN_OPENIDS = (process.env.ADMIN_OPENIDS || '').split(',').filter(Boolean);

async function decodePhone(phoneCode) {
  if (!phoneCode) return '';
  try {
    const res = await cloud.openapi.phonenumber.getPhoneNumber({ code: phoneCode });
    return (res && res.phoneInfo && res.phoneInfo.phoneNumber) || '';
  } catch (e) {
    console.error('decodePhone failed:', e);
    return '';
  }
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const { userInfo = {}, phoneCode = '' } = event || {};
  const col = db.collection('users');
  try {
    const phoneNumber = await decodePhone(phoneCode);
    const exist = await col.where({ _openid: OPENID }).limit(1).get();
    const isAdminEnv = ADMIN_OPENIDS.includes(OPENID);
    if (exist.data.length === 0) {
      const role = isAdminEnv ? 'admin' : 'user';
      await col.add({
        data: {
          _openid: OPENID,
          role,
          nickName: userInfo.nickName || '',
          avatarUrl: userInfo.avatarUrl || '',
          phoneNumber,
          createdAt: db.serverDate()
        }
      });
      return {
        _openid: OPENID, role,
        nickName: userInfo.nickName || '',
        avatarUrl: userInfo.avatarUrl || '',
        phoneNumber
      };
    }
    const u = exist.data[0];
    const updateData = {};
    if (isAdminEnv && u.role !== 'admin') updateData.role = 'admin';
    if (userInfo.nickName && userInfo.nickName !== u.nickName) updateData.nickName = userInfo.nickName;
    if (userInfo.avatarUrl && userInfo.avatarUrl !== u.avatarUrl) updateData.avatarUrl = userInfo.avatarUrl;
    if (phoneNumber && phoneNumber !== u.phoneNumber) updateData.phoneNumber = phoneNumber;
    if (Object.keys(updateData).length) {
      updateData.updatedAt = db.serverDate();
      await col.doc(u._id).update({ data: updateData });
    }
    return {
      _openid: OPENID,
      role: updateData.role || u.role || 'user',
      nickName: userInfo.nickName || u.nickName || '',
      avatarUrl: userInfo.avatarUrl || u.avatarUrl || '',
      phoneNumber: phoneNumber || u.phoneNumber || ''
    };
  } catch (err) {
    return { code: 500, msg: String(err) };
  }
};
