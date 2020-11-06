// pages/order_info/order_info.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order_item: [], // 图片信息列表
        order_info: "", // 订单信息对象
    },
    // 再来一单
    one_more: function () {
        wx.redirectTo({
            url: '/pages/shouye/shouye',
        })
    },
    // 支付
    payoff: function () {
        wx.showModal({
            content: "进行支付",
            success: (res) => {
                if (res.confirm) {
                    console.log('用户点击确定')
                    wx.request({
                        url: 'http://127.0.0.1:8000/customer/auth/order/modorderstatus/' + this.data.order_info.order_id,
                        header: {
                            'content-type': 'application/json',
                            'token': wx.getStorageSync('token')
                        },
                        method: "GET",
                        success: (res) => {
                            if (res.data.code == 200) {
                                wx.showToast({
                                    title: "支付成功",
                                    duration: 2000
                                });
                                setTimeout(() => {
                                    wx.removeStorageSync('select_spec_list');
                                    wx.redirectTo({
                                        url: '/pages/shouye/shouye',
                                    })
                                }, 2000);
                            } else if (res.data.code == 202) {
                                console.log("token失效");
                            } else {
                                console.log("支付失败");
                            }
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var order_info = JSON.parse(decodeURIComponent(options.order_info));
        console.log(order_info)
        this.data.order_info = order_info;
        var order_id = order_info.order_id;
        wx.request({
            url: 'http://127.0.0.1:8000/customer/auth/order/detail/' + order_id,
            method: "GET",
            header: {
                'content-type': 'multipart/form-data',
                'token': wx.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code == 200) {
                    this.data.order_item = res.data.data;
                    console.log(this.data.order_item);
                    this.setData({
                        order_info: this.data.order_info,
                        order_item: this.data.order_item
                    });
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