/*index.js*/
var util = require('../../utils/util.js');
Page({  
  data: {    
		newslist : []
	},
	onLoad: function(){
		var _this = this;
		// 案例列表获取
	    util.requestFun({
	      url: 'cms/news/list',
	      success: function(res){
	        _this.setData({
	          newslist : res.data.data
	        })
	      }
	    })
	}
})