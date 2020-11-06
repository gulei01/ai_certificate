const {
    default: Toast
} = require("../../vantweapp/toast/toast")

// pages/myaddress/myaddress.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        addressList: [],
        if_choosed: "false", // 地址是否可以被选择，如果可以，说明就是生成订单的时候使用本页面
    },
    addAddress: function () {
        wx.navigateTo({
            url: '/pages/addressInfo/addressInfo',
        })
    },
    chooseaddress: function (event) {
        var index = event.currentTarget.dataset.index;
        var address_info = this.data.addressList[index];
        if (this.data.if_choosed == "true") {
            wx.setStorageSync('address_info', address_info);
            this.data.if_choosed == "false";
            wx.navigateBack({
                delta: 1,
            });
        }
    },
    emptyFunc:function(){

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.if_choosed = options.if_choosed;
        if (this.data.if_choosed == "true") {
            console.log("地址是否可以被选择：", this.data.if_choosed);
        }
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
        wx.request({
            url: 'http://127.0.0.1:8000/customer/auth/personal/getAddress',
            method: "GET",
            header: {
                'content-type': 'application/json',
                'token': wx.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code == 200) {
                    this.data.addressList = res.data.data["address_info"];
                    this.setData({
                        addressList: this.data.addressList
                    });
                } else if (res.data.code == 202) {
                    wx.showToast({
                        title: 'token失效',
                        icon: "none"
                    });

                } else {
                    wx.showToast({
                        title: '未知错误..0.0',
                        icon: "none"
                    })
                }
            },
            fail(res) {
                wx.showToast({
                    title: '接口失效',
                    icon: "none"
                })
            }
        })

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