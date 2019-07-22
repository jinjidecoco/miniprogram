App({
  onLaunch() {
      const _this =this;
      const checkNewVersion = wx.getUpdateManager()
      checkNewVersion.onUpdateReady(function () {
        wx.showModal({
          title:'更新提示',
          content:'有新的版本了，是否更新到最新版',
          success(res) {
            if(res.confirm) {
              checkNewVersion.applyUpdate()
            }
          }
        })
      });
      //获取当前网络情况
      wx.getNetworkType({
        success(res) {
          const networkType =res.networkType
          if(networkType === 'none'){ //无网络
            _this.globalData.isConnected=false
            wx.showToast({
              title:'当前无网络',
              icon:'loading',
              duration:2000
            })
          }
        }
      })
      //监听网络状态变化
      wx.onNetworkStatusChange(res =>{
        console.log(res);
        if(!res.isConnected){
          _this.globalData.isConnected =false
          wx.showToast({
            title:'网络已断开了',
            icon:"loading",
            duration:2000,
            complete:function(){
              // 网络恢复跳转到相应的页面
              console.log("网络恢复跳转到相应的页面");
            }
          })
        }else{
          _this.globalData.isConnected = true
          wx.hideToast()
        }
      })
  },
  onShow(e){
    console.log('----show');
    console.log(e);


    this.checkLoginStatus();
  },
  //检测登录状态
  checkLoginStatus() {
    const _this = this
    const token = wx.getStorageSync('token');
    console.log(token);
    // console.log('检验登录状态');
    if (!token) {
      _this.loginTimeout()
      // console.log('去授权')
    }
    wx.checkSession({
      fail() {
        _this.loginTimeout()
        return;
      }
    })
  },
  loginTimeout(){
    wx.removeStorageSync('token');
    // console.log('登录过期了')
    // setTimeout(() => {
      wx.reLaunch({
        url:'/pages/authorize/index'
      })
    // }, 1000);
  },

  globalData:{
    isConnected:true
  }
})
