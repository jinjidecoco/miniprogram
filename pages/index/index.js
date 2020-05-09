import config from '../../config'
const fetch  = require('../../utils/request.js')
const app = getApp()
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    circular: true,
    curCategoryId: '00001',
    isFixed:false
  },
  getInfo :function(){
  wx.getSystemInfo({
    success(res) {
      console.log(res.model)
      console.log(res.pixelRatio)
      console.log(res.windowWidth)
      console.log(res.windowHeight)
      console.log(res.language)
      console.log(res.version)
      console.log(res.platform)
    }
  })
},
  tabClick: function (e) {
    this.setData({
      curCategoryId: e.currentTarget.id
    })
    this.getGoodsList(this.data.curCategoryId);
  },
  onLoad: function () {
    var that = this;
    //请求轮播页面
    fetch('/banner/list').then(function (res) {
      // console.log(res);
      if (res.code == 404) {
        wx.showModal({
          title: '提示',
          content: '请在后台添加 banner 轮播图片',
          showCancel: false
        })
      } else {
        that.setData({
          imgUrls: res.data
        })
      }
    }).catch(function (res) {
      // console.log(res);
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    })
    //请求商品目录
      fetch('/shop/goods/category/all').then(function (res) {
      let categories = [{
        id: '00001',
        name: '全部'
      }];
      if (res.code == 0) {
        res.data.map(function (val) {
          categories.push(val);
        })
        that.setData({
          categories: categories
        })
      }
    })
    that.getGoodsList('00001');
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title:   config.shareProfile,
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    };
  },
  onPageScroll:function(res){
    if(res.scrollTop>150){
        this.setData({
          isFixed:true
        })
    }else{
      this.setData({
        isFixed:false
      })
    }
  },
  //获取所有商品
  getGoodsList: function (categoriesId) {
    var that = this;
    if (categoriesId === '00001') categoriesId = '';
    wx.showLoading({
      title: '加载中',
    })
    fetch('/shop/goods/list', {
      categoryId: categoriesId
    }).then(function (res) {
      wx.hideLoading();
      if (res.code == 0) {
        that.setData({
          goods: res.data
        })
      }
    })

  },
  getDetail: function (e) {
    wx.navigateTo({
      url: '/pages/goods-detail/index?id=' + e.currentTarget.id
    })
  }
})