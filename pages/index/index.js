//index.js
var util = require('../../utils/util.js');
//获取应用实例
Page({
  data: {
    //banner-轮播配置
    imgUrls: [
      /*'/images/index1.jpg',
      '/images/index2.jpg'*/
    ],
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,

    // 案例展示
    productImgUrls: [
      /*'/images/productions/1.jpg',
      '/images/productions/2.jpg',
      '/images/productions/3.jpg',
      '/images/productions/4.jpg'*/
    ],

    // 小样定制图片
    modelImgUrls: [
      /*'/images/models/1.jpg',
      '/images/models/2.jpg',
      '/images/models/3.jpg'*/
    ],

    // 产品展示
    componentImgUrls: [
      /*'/images/components/1.jpg',
      '/images/components/2.jpg',
      '/images/components/3.jpg',
      '/images/components/4.jpg'*/
    ]
  },
  onLoad: function(){
    var _this = this;

    /*util.requestFun({
      url: 'shop/goods/category/all',
      method: 'post',
      success: function(res){
        console.log(res)
      }
    })*/

    // 首页banner  type=banner
    util.requestFun({
      url: 'banner/list?type=banner',
      success: function(res){
        _this.setData({
          imgUrls : res.data.data
        })
      }
    })

    // 产品列表获取
    util.requestFun({
      url: 'shop/goods/list?categoryId=6217&pageSize=6',
      success: function(res){
        _this.setData({
          componentImgUrls : res.data.data
        })
      }
    })

    // 小样儿列表获取
    util.requestFun({
      url: 'shop/goods/list?categoryId=6221&pageSize=6',
      success: function(res){
        _this.setData({
          modelImgUrls : res.data.data
        })
      }
    })

    // 案例列表获取
    util.requestFun({
      url: 'shop/goods/list?categoryId=6218&pageSize=6',
      success: function(res){
        _this.setData({
          productImgUrls : res.data.data
        })
      }
    })
  },
  showImages:function(event){
    var classify = event.currentTarget.dataset.classify;
    var index = event.currentTarget.dataset.current;
    switch(classify){
      case 'productions':
        var urls = this.RebuildImgUrl(this.data.productImgUrls, 'pic');
        wx.previewImage({
          current: urls[index], // 当前显示图片的http链接
          urls: urls // 需要预览的图片http链接列表
        })
        break;
      case 'models':
        var urls = this.RebuildImgUrl(this.data.modelImgUrls, 'pic');
        wx.previewImage({
          current: urls[index], // 当前显示图片的http链接
          urls: urls // 需要预览的图片http链接列表
        })
        break;
      case 'components':
        var urls = this.RebuildImgUrl(this.data.componentImgUrls, 'pic');
        wx.previewImage({
          current: urls[index], // 当前显示图片的http链接
          urls: urls // 需要预览的图片http链接列表
        })
        break;
    }
  },
  RebuildImgUrl: function(list, paramName){
    var imageList = [];
    for (var i = 0; i < list.length; i++) {
      imageList[i] = list[i][paramName]
    }
    return imageList;
  }
})
