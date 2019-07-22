const api = require("../../utils/request.js");
const app = getApp();

const WxParse = require("../../wxParse/wxParse.js");

Page({
  data: {
    goodsDetail: {},
    hideSize: false,
    hidePopup: true,
    primarySize:'default',
    realCount:1,
    childId:''
  },
  onLoad: function(e) {
    var that = this;
    api
      .fetchRequest("/shop/goods/detail", {
        id: e.id
      })
      .then(function(res) {
        // console.log(res.data);
        if (res.data.code == 0) {
          WxParse.wxParse("article", "html", res.data.data.content, that, 5);
          let retData = res.data.data;
          that.setData({
            goodsDetail: retData
          });
          let goodsSizeLabel = "";
          if (retData.properties) {
            retData.properties.map(items => {
              goodsSizeLabel = goodsSizeLabel+''+items.name;
              if (items) {
               let goodsSizeName = "";
                items.childsCurGoods.map(item => {
                  goodsSizeName = item.name;
                  // item.isSelect=false;
                  // console.log(item);
                });
                that.setData({
                  selectSize: goodsSizeName,
                });
              }
              // console.log(newP);
            });
            that.setData({
              hideSize: true,
              selectLabel: goodsSizeLabel
            });
          }
          console.log(res);
        }
      });
  },
  showCar() {
    this.setData({
      hidePopup: false
    });
  },
  closeCar(){
    this.setData({
      hidePopup: true
    });
  },
  chooseSize(e){
    var that=this;
    let dataProperties=this.data.goodsDetail.properties;
    let Ind=e.currentTarget.dataset.index; //当前选中属性索引
    let len =dataProperties[Ind].childsCurGoods.length;
    let childIdx =e.currentTarget.dataset.childidx;
 
    for(var i=0;i<len;i++){
      dataProperties[Ind].childsCurGoods[i].cur= false;
    }
    dataProperties[Ind].childsCurGoods[childIdx].cur = true;

    const  lenth= dataProperties.length;
    let  childId='';
    let  childName='';
    let curCount=0;
    let flag=false;
    for(var i=0; i<lenth; i++){
      var child=dataProperties[i].childsCurGoods;
      for(var j=0;j<child.length;j++){
        if(child[j].cur){
          curCount ++;
          childId= childId+ dataProperties[i].id+':'+child[j].id+',';
          childName = childName+dataProperties[i].name+':'+child[j].name+',';
        }
   
      }
    }
    if(curCount==lenth){
      flag=true;
    }
    //计算所选中规格价格
    if(flag){
      api.fetchRequest('/shop/goods/price',{
          goodsId:that.data.goodsDetail.basicInfo.id,
          propertyChildIds:childId
      }).then(function(res){
        if(res.data.code==0){
          that.setData({
            selectPrie:res.data.data.price,
            score:res.data.data.score,
            maxNum:res.data.data.stores,
            childId:childId,
            childName:childName
          })

        }

      })

    }
    this.setData({
      goodsDetail:this.data.goodsDetail, //更新goodsDetail
      flag:flag
    })
  },
  addCount(){
    this.setData({
      realCount:this.data.realCount+1
    })
  },
  reduceCount(){
    if(this.data.realCount>1){
      this.setData({
        realCount:this.data.realCount-1
      })
    }else{
      console.log('不能再减少了')
    }
  },
  addCar(){
    let dataProperties=this.data.goodsDetail.properties;
    if(dataProperties&&!this.data.flag){
      wx.showModal({
        title:'提示',
        content:'请选择商品规格'
      })
    }else{
      this.closeCar();
      //提示框
      wx.showToast({
        title:'加入购物车成功',
        icon:'success',
        duration: 2000
      })
      var shopCarInfo=this.buildCar();

      //设置购物车数据
      this.setData({
        shopCarInfo:shopCarInfo,
        // shopNum:
      })
    }
  },
  buildCar(){ //组件购物车
    var shopCar={};
    shopCar.goodsId=this.data.goodsDetail.basicInfo.id;
    shopCar.pic =this.data.goodsDetail.basicInfo.pic;
    shopCar.name=this.data.goodsDetail.basicInfo.name;
    shopCar.propId=this.data.childId;
    shopCar.propName= this.data.childName;
    shopCar.buyNumber = this.data.realCount;
    console.log(shopCar);

    if(!shopCarInfo.carList){
      shopCarInfo.carList=[];
    }
    for(var i=0;i<shopCarInfo.carList.length;i++){

    }
    var curKey=-1;//
    shopCarInfo.carList.map((item,key)=>{
      if(item.goodsId==shopCar.goodsId && item.propId==shopCar.propId){
        curKey=key;
        item.realCount=item.realCount + shopCar.realCount
      }
    })
    if(curKey>-1){
      shopCarInfo.carList.splice(curKey,1,shopCar) //购同款不向购物车里添加，直接数量增加
    }else{
      shopCarInfo.carList.push(shopCar)
    }
    return shopCarInfo;
  }
});
