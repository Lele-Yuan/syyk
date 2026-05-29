// utils/nav.js — 地图导航辅助
function navigateToOffice(office) {
  if (!office) return;
  const hasCoord = typeof office.latitude === 'number' && typeof office.longitude === 'number';
  if (hasCoord) {
    wx.openLocation({
      latitude: office.latitude,
      longitude: office.longitude,
      name: office.locName || office.city || '',
      address: office.addr || '',
      scale: 16
    });
    return;
  }
  // 无坐标 fallback：复制地址 + 提示
  const text = office.addr || '';
  if (!text) return;
  wx.setClipboardData({
    data: text,
    success: function () {
      wx.showModal({
        title: '地址已复制',
        content: '当前地址未配置坐标，已复制到剪贴板，可在地图App中粘贴搜索导航。',
        showCancel: false
      });
    }
  });
}

module.exports = { navigateToOffice };
