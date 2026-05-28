// utils/format.js — 通用格式化
function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const pad = n => (n < 10 ? '0' + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function statusLabel(s) {
  return { pending: '待回复', replied: '已回复', closed: '已关闭' }[s] || s;
}
module.exports = { formatTime, statusLabel };
