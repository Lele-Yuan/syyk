const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


const globalUrl = 'https://api.it120.cc/syyk/';

var requestFun = function(param){
  wx.request({
    method: param.method || 'get',
    url: (globalUrl + param.url) || '', //仅为示例，并非真实的接口地址
    data: param.data || '',
    dataType: param.type || 'json',
    header: param.header ||  {
        'content-type': 'application/json' // 默认值
    },
    success: function (res) {
      typeof param.success === 'function' && param.success(res);
    },
    error: function (err) { 
      typeof param.error === 'function' && param.error(err.statusText);
    }
  })
}

module.exports = {
  formatTime: formatTime,
  requestFun: requestFun
}
