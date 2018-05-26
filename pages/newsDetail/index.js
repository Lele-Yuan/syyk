/*index.js*/
var util = require('../../utils/util.js');
var WxParse = require('../../wxParse/wxParse.js');
Page({  
  data: {    
		newsDetail : {},
		dateAdd : "",
		content : ""
	},
	onLoad: function (options) { 
		var _this = this;
		console.log(options.id) 
		util.requestFun({
      url: 'cms/news/detail?id='+options.id,
      success: function(res){
        var contentTemp = WxParse.wxParse('content', 'html', res.data.data.content , _this, 5);
        _this.setData({
          newsDetail : res.data.data,
          dateAdd : res.data.data.dateAdd.split(" ")[0],
          content : contentTemp
        })
      }
    })
	} 
})