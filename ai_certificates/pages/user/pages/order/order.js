// pages/order/order.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        active: 3,
        header_tab_active: 0,
        textActive: "",
        orderDigitalPhotoList: [], // 电子照片1
        orderPhotoList: [] // 实体照片订单

    },
    onChange: function (event) {
        this.setData({
            active: event.detail
        });
        getApp().toPage(event);
    },
    openCamera: function () {
        getApp().openCamera(); // 调用全局函数，打开摄像头
    },
    showOrderInfo: function (event) {
        var temp = event.currentTarget.dataset.index.split("-");
        console.log(temp);
        var order_info;
        if (temp[0] == "digital") {
            order_info = this.data.orderDigitalPhotoList[Number(temp[1])];
        } else {
            order_info = this.data.orderPhotoList[Number(temp[1])];
        }
        console.log("传递的数据是：", order_info);
        order_info = encodeURIComponent(JSON.stringify(order_info));

        wx.navigateTo({
            url: '/pages/order_info/order_info?order_info=' + order_info,
        })
    },
    oneMore: function () {
        wx.redirectTo({
            url: '/pages/shouye/shouye',
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.request({
            url: 'http://127.0.0.1:8000/customer/auth/order/all',
            method: "GET",
            header: {
                'content-type': 'application/json',
                'token': wx.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code == 200) {
                    var all_order = res.data.data;
                    for (let i = 0; i < all_order.length; i++) {
                        all_order[i].create_at = all_order[i].create_at.replace('T', ' '); // 时间格式错误，将T替换成空格
                        if (all_order[i].order_type == 2) { // 电子照
                            this.data.orderDigitalPhotoList.push(all_order[i]);
                        } else {
                            this.data.orderPhotoList.push(all_order[i]);
                        }
                        this.setData({
                            orderDigitalPhotoList: this.data.orderDigitalPhotoList,
                            orderPhotoList: this.data.orderPhotoList
                        });
                        console.log(this.data.orderDigitalPhotoList);
                    }
                } else if (res.data.code == 202) {
                    wx.showToast({
                        title: 'token失效，请先登录或者注册',
                        icon: "none"
                    })
                }
            }
        })

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})