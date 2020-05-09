const fetch = require("../../utils/request.js");
var app = getApp();
Page({
  /*
   页面的初始数据
   */
  data: {},

  /**
   监听页面加载
   */
  onLoad: function(options) {},

  /**
   监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   *监听页面显示
   */
  onShow: function() {},

  /**
   * 监听页面隐藏
   */
  onHide: function() {},

  /*
   监听页面卸载
   */
  onUnload: function() {},

  /*事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},

  bindGetUserInfo:function(e){
    const _this=this;
    const userInfo = e.detail.userInfo;
    if (!userInfo){
      return;
    } 
    //当网络正常存储信息
    if(app.globalData.isConnected) {
      wx.setStorageSync("userInfo", userInfo);   
    }else{
      wx.showToast({
        title:'请确保网络正常',
        icon:'none'
      })
    }
    wx.login({
      success:function(res) {
        fetch("/user/wxapp/login", {
            code: res.code,
          }).then(res => {
            console.log(res);
            if(res.data.code===10000){ //还未注册
              // console.log('还未注册');
              _this.register();
            }
            wx.setStorageSync('token',res.data.token);
            wx.setStorageSync('uid',res.data.uid);
            wx.reLaunch({
              url: '/pages/index/index',
            })
          });
      }
    })
  },
  register:function(){
    wx.login({
      success:function(res) {
        const code =res.code;
        wx.getUserInfo({
          success: function (userinfo){
            console.log('新用户')
            fetch("/user/wxapp/register/simple", {
                code: code,
              })
              .then(res => {
                if(res.code===0){
                  wx.showModal({
                      title: '登录成功',
                  })
                }
                wx.reLaunch({
                  url: '/pages/index/index',
                })
              });
          }
        })
      }
    })
  }
});