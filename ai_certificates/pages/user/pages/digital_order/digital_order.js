// pages/digital_order/digital_order.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order_id: "", // 记录订单号
        submit_disabled: false,
        price: 300,
        spec_text: "",
        img_url: "",
        bgcolor: "",
        pixel: "",
        cart_id: "",
        actions: [{
                name: "支付宝"
            },
            {
                name: "微信"
            }
        ],
        show: false,

    },
    onSubmit: function () {
        this.setData({
            submit_disabled: true
        });
        wx.request({
            url: 'http://127.0.0.1:8000/customer/auth/cart/delcart/' + this.data.cart_id,
            method: "GET",
            header: {
                'content-type': 'application/json',
                'token': wx.getStorageSync('token')
            },
            success(res) {
                if (res.data.code == 200) {
                    console.log("购物车删除成功")
                } else if (res.data.code == 202) {
                    wx.showToast({
                        title: 'token失效',
                        icon: "none",
                        duration: 1000
                    });
                    setTimeout(() => {
                        wx.redirectTo({
                            url: '/pages/index/index',
                        })
                    }, 1000);
                } else {
                    console.log("接口错误");
                    return;
                }

            },
            fail(res) {
                console.log("请求接口失败");
                return;
            }
        });
        var data = {
            "order_money": this.data.price,
            "order_type": '2', // 表示电子照片业务
            "order_data": [{
                "order_photo_type": this.data.spec_text,
                "order_photo_size": this.data.pixel,
                "order_photo_bgcolor": this.data.bgcolor,
                "order_photo_num": '1',
                "order_photo_price": this.data.price,
                "order_wm_photo": this.data.img_url
            }]
        }
        wx.request({
            url: 'http://127.0.0.1:8000/customer/auth/order/pay',
            data: data,
            method: "POST",
            header: {
                'content-type': 'application/json',
                'token': wx.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code == 200) {
                    console.log("创建订单成功...");
                    // console.log(res.data);
                    this.data.order_id = res.data.data.order_id;
                    // console.log("订单号为：", this.data.order_id);
                    wx.showLoading({
                        title: '正在生成订单',
                        duration: 2000
                    })
                    setTimeout(() => {
                        this.setData({
                            show: true
                        })
                    }, 2000);
                }
            },
            fail(res) {

            }
        })

    },
    close: function () {
        this.setData({
            show: false
        })
    },
    purchase: function (event) {
        console.log(event.detail);
        var purchase_type = event.detail.name;

        wx.request({
            url: 'http://127.0.0.1:8000/customer/auth/order/modorderstatus/' + this.data.order_id,
            header: {
                'content-type': 'application/json',
                'token': wx.getStorageSync('token')
            },
            method: "GET",
            success: (res) => {
                if (res.data.code == 200) {
                    wx.showToast({
                        title: purchase_type + "支付成功",
                        duration: 2000
                    });
                    setTimeout(()=>{
                        wx.reLaunch({
                          url: '/pages/shouye/shouye',
                        });
                    },2000);
                } else if (res.data.code == 202) {
                    console.log("token失效");
                } else {
                    console.log("支付失败");
                }
            }
        })
        this.close();

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(JSON.parse(decodeURIComponent(options.data)));
        var data = JSON.parse(decodeURIComponent(options.data));
        this.setData({
            spec_text: data.spec_text,
            img_url: data.img_url,
            bgcolor: data.bgcolor,
            pixel: data.pixel,
            cart_id: data.cart_id
        });

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