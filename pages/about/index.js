var app = getApp();
var util = require('../../utils/util.js');

Page({
	data : {
    shareImage : ''
	},
	calling:function(){  
    wx.makePhoneCall({  
      phoneNumber: '15604004036', //沈阳银科电话号码
      success:function(){  
        console.log("拨打电话成功！")  
      },  
      fail:function(){  
        console.log("拨打电话失败！")  
      }  
    })  
  },
	wanting:function(){  
    wx.makePhoneCall({  
      phoneNumber: '18510371421', // 小程序需求电话
      success:function(){  
        console.log("拨打电话成功！")  
      },  
      fail:function(){  
        console.log("拨打电话失败！")  
      }  
    })  
  },
  location: function(){
  	// 经纬度 41.8159200000,123.2887600000
  	wx.openLocation({
      latitude: 41.81592,
      longitude: 123.28876,
      scale: 28,
      name: "沈阳银科",
      address: "沈阳市于洪区东平湖街于洪交警大队附近"
    })
  },
  share: function(){
    var _this = this;
    wx.request({
      method: 'get',
      url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+ app.globalData.appid +'&secret='+ app.globalData.secret, //仅为示例，并非真实的接口地址
      dataType: 'json',
      header: {
          'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        wx.request({
          url: 'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=' + res.data.access_token,
          method: 'POST',
          data: {
            "path": "pages/index/index",
            "width": 430
          },
          success(res) {
            // res是二进制流，后台获取后，直接保存为图片，然后将图片返回给前台
            // 后台二进制怎么转图片？我也不会后台，学会了再贴代码
            _this.setData({
              shareImage : 'data:image/png;base64,' + res.data
            })
          }
        })
      },
      error: function (err) { 

      }
    })
  }
})