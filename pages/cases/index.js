/*index.js*/
//获取应用实例
const app = getApp()
var util = require('../../utils/util.js');
Page({  
  data: {    
		imgalist : []
	},
	onLoad: function(){
		var _this = this;
		// 案例列表获取
	    util.requestFun({
	      url: 'shop/goods/list?categoryId=6218&pageSize=6',
	      success: function(res){
	        _this.setData({
	          imgalist : res.data.data
	        })
	      }
	    })
	},
	showImages:function(event){
    app.showImages(event, this.data.imgalist)
  }
})