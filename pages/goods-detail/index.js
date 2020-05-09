const api = require('../../utils/api');
const fetch = require("../../utils/request.js");
const app = getApp();
const WxParse = require("../../wxParse/wxParse.js");

Page({
  data: {
    goodsDetail: {}, //商品细节
    hideSize: false,
    hidePopup: true, //隐藏弹窗
    primarySize: "default",
    realCount: 1,
    childId: "",
    childName: [],
    shopCarInfo: {},
    shopNum: 0, //购物车商品数量
    selectedPro: [],
    propName: []
  },
  onLoad: function (e) {
    const token = wx.getStorageSync('token')
    var that = this;
    fetch(api.getDetail, {
      id: e.id
    }).then(function (res) {
      if (res.code == 0) {
        WxParse.wxParse("article", "html", res.data.content, that, 5);
        let retData = res.data;
        that.setData({
          goodsDetail: retData
        });
        let goodsSizeLabel = "";
        if (retData.properties) {
          retData.properties.map(items => {
            goodsSizeLabel = goodsSizeLabel + "" + items.name;
            if (items) {
              let goodsSizeName = "";
              items.childsCurGoods.map(item => {
                goodsSizeName = item.name;
              });
              that.setData({
                selectSize: goodsSizeName
              });
            }
            // console.log(newP);
          });
          that.setData({
            hideSize: true,
            selectLabel: goodsSizeLabel
          });
        }
      }
    });
    //获取购物车信息
    fetch(api.getShopCar, {
      token: token
    }).then(res => {
      // console.log(res);
      if (res.code === 0) {
        this.setData({
          shopNum: res.data.number
        })
      }
    })
    const carInfo = wx.getStorageSync('carInfo');
    console.log(carInfo);
    that.setData({
      shopCarInfo: carInfo,
    });
  },
  showCar() {
    this.setData({
      hidePopup: false
    });
  },
  closeCar() {
    this.setData({
      hidePopup: true
    });
  },
  chooseSize(e) {
    var that = this;
    let dataProperties = this.data.goodsDetail.properties;
    let Ind = e.currentTarget.dataset.index; //当前选中属性索引
    let propId = e.currentTarget.dataset.propid
    let len = dataProperties[Ind].childsCurGoods.length; //商品属性 如颜色、大小、
    let childIdx = e.currentTarget.dataset.childidx; //选中属性子索引

    for (var i = 0; i < len; i++) {
      dataProperties[Ind].childsCurGoods[i].cur = false;
    }
    dataProperties[Ind].childsCurGoods[childIdx].cur = true;
    const lenth = dataProperties.length;
    let childId = "";
    let childName = "";
    let curCount = 0;
    let flag = false;
    let selectedPro = [];
    let propName = [];
    dataProperties.forEach(type => {
      type.childsCurGoods.forEach((item, index) => {
        if (index == childIdx) {
          selectedPro.push({
            optionId: type.id,
            optionValueId: item.id
          })
          propName.push({
            propName: type.name,
            childName: item.name
          })
        }
      })
    })
    that.setData({
      selectedPro,
      propName
    })

    const selectedPropId = this.data.selectedPro
    const newChildId = selectedPropId.map(item => {
      return item.optionId + ':' + item.optionValueId
    })
    const selectChildName = this.data.propName
    const newChildName = selectChildName.map(item => {
      return item.propName + ':' + item.childName
    })

    //保证所有商品属性都被选择
    if (this.data.selectedPro.length == lenth) {
      flag = true;
    }
    //计算所选中规格价格
    if (flag) {
      fetch("/shop/goods/price", {
          goodsId: that.data.goodsDetail.basicInfo.id,
          propertyChildIds: newChildId.length > 0 ? newChildId.join(',') : newChildId[0]
        })
        .then(function (res) {
          if (res.code == 0) {
            that.setData({
              selectPrie: res.data.price,
              score: res.data.score,
              maxNum: res.data.stores,
              childId: newChildId,
              childName: newChildName
            });
          }
        });
    }
    that.setData({
      goodsDetail: this.data.goodsDetail, //更新goodsDetail
      flag: flag
    });
    console.log(this.data.goodsDetail);
  },
  addCount() {
    this.setData({
      realCount: this.data.realCount + 1
    });
  },
  reduceCount() {
    if (this.data.realCount > 1) {
      this.setData({
        realCount: this.data.realCount - 1
      });
    } else {
      console.log("不能再减少了");
    }
  },
  goCar() {
    wx.reLaunch({
      url: "/pages/car/index"
    });
  },
  addCar() {
    var that = this;
    let dataProperties = this.data.goodsDetail.properties;
    if (dataProperties && !this.data.flag) {
      wx.showModal({
        title: "提示",
        content: "请选择商品规格"
      });
    } else {
      this.closeCar();
      const shopCarInfo = this.buildCar();
      console.log(shopCarInfo);

      //设置购物车数据
      // this.setData({
      //   shopCarInfo: shopCarInfo,
      //    shopNum: shopCarInfo.shopNum
      // });
      wx.setStorageSync("carInfo", shopCarInfo);

      const token = wx.getStorageSync('token')
      const sku = that.data.selectedPro //选中规格
      fetch('/shopping-cart/add', {
        token: token,
        goodsId: this.data.goodsDetail.basicInfo.id,
        number: this.data.realCount,
        sku: JSON.stringify(sku),
      }, "post").then(
        res => {
          if (res.code === 0) {
            this.setData({
              shopNum: this.data.shopNum + this.data.realCount
            })
            wx.showToast({
              title: "加入购物车成功",
              icon: "success",
              duration: 2000
            });
          }
        }
      )
    }
  },
  buildCar() {
    //组件购物车
    var shopCar = {};
    shopCar.goodsId = this.data.goodsDetail.basicInfo.id;
    shopCar.pic = this.data.goodsDetail.basicInfo.pic;
    shopCar.name = this.data.goodsDetail.basicInfo.name;
    shopCar.price = this.data.goodsDetail.basicInfo.originalPrice;
    shopCar.miniPrice = this.data.goodsDetail.basicInfo.minPrice
    shopCar.propId = this.data.childId
    shopCar.selected= true;
    shopCar.propName = this.data.childName;
    shopCar.buyNumber = this.data.realCount;
    
    let shopCarInfo = this.data.shopCarInfo||{}
    console.log(shopCarInfo);
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    // var curKey = -1;
    // shopCarInfo.carList.map((item, key) => {
    //   if (item.goodsId == shopCar.goodsId && item.propId == shopCar.propId) {
    //     curKey = key;
    //     item.realCount = item.realCount + shopCar.realCount;
    //   }
    // });
    // shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.realCount;
    // if (curKey > -1) {
    //   shopCarInfo.carList.splice(curKey, 1, shopCar); //购同款不向购物车里添加，直接数量增加
    // } else {
    //   shopCarInfo.carList.push(shopCar);
    // }
    //插到最前面
    shopCarInfo.shopList.unshift(shopCar)
    return shopCarInfo;
  }
});