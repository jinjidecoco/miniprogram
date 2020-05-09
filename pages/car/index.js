var app = getApp();
Page({
  data: {
    carList:[],
    allSelect:false, //全选
    isSelect:false,
    totalPrice:0,
    checkedGoods:[]
  },
  onload: function(e) {

  },
  onReady: function() {},
  onShow: function() {
    //清空购物车
    // wx.clearStorageSync()
    let list=[];
    const carInfo = wx.getStorageSync("carInfo");
    if(carInfo&&carInfo.shopList){
      list = carInfo.shopList
    }
    const checkedGoods= list.filter((item =>{
      return  item.selected == true
    }))
    this.setData({
      carList:list,
      checkedGoods:checkedGoods
    })
    this.setGoodsList(this.checkSelectedAll(),this.getTotalPrice())
  },
  //选中与取消
  selectItem: function(e){
    let index = e.currentTarget.dataset.itemIndex;
    const carLists = this.data.carList
    if(index>=0){
      carLists[index].selected =!carLists[index].selected
      this.setData({
        carList:  carLists
      })
    }
    this.setData({
      allSelect: this.checkSelectedAll(),
      checkedGoods:this.getCheckedGoods()
    })
    this.getTotalPrice()
  },
  //检查是否全选
  checkSelectedAll: function(){
    const carLists = this.data.carList
    var flag=carLists.every((item) =>{
      if(item.selected==true){
        return true
      }else{
        return false
      }
    })
    return flag
  },
  setGoodsList: function(allSelect,totalPrice,){
    // console.log(checkedGoods)
    this.setData({
      allSelect:allSelect,
      // checkedGoods:checkedGoods,
      totalPrice:totalPrice,
    })
  },
  //获取选中的数据
  getCheckedGoods:function(){
    if(this.data.carList.length>0){
      const carLists = this.data.carList
      const checkedGoods= carLists.filter((item =>{
        return  item.selected == true
      }))
      return checkedGoods
    }
  },
  getTotalPrice:function(){
    if(this.data.checkedGoods.length){
      let  totalPrice =0
      console.log(this.data.checkedGoods);
      this.data.checkedGoods.forEach(item =>{
        console.log(item);
        totalPrice += parseFloat(item.price)
      })
    // }
    console.log(totalPrice)
    // if(totalPrice){
      this.setData({
        totalPrice:parseFloat(totalPrice.toFixed(2))
      })
      console.log(totalPrice)
      return parseFloat(totalPrice.toFixed(2))
    }
  },
  //全选
  bindSelectAll:function(){
    this.setData({
      allSelect:!this.data.allSelect
    })
  }
});