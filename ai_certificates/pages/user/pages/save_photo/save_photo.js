// pages/save_photo/save_photo.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        if_loading: true,
        showImageUrl: "", // 保存img的url地址
        spec_text: "",
        bgcolor: "",
        pixel: "",
        cart_id: Number // 购物车号，支付成功，从购物车表中移除
    },
    createOrder: function (event) {
        console.log(event);
        var type = event.currentTarget.dataset.type;
        var data = {
            "img_url": this.data.showImageUrl,
            "spec_text": this.data.spec_text,
            "bgcolor": this.data.bgcolor,
            "pixel": this.data.pixel,
            "cart_id": this.data.cart_id
        };
        if (type == "digital") { // 导出高清照
            console.log("传递的数据为：", data)
            wx.redirectTo({
                url: '/pages/digital_order/digital_order?data=' + encodeURIComponent(JSON.stringify(data)),
            })
        } else { // 立即冲印
            var select_spec_list = [{
                "spec_text": this.data.spec_text,
                "bgcolr": this.data.bgcolor,
                "spec_pixel": this.data.pixel,
                "img_url": this.data.showImageUrl
            }]
            wx.setStorageSync('select_spec_list', select_spec_list)
            wx.redirectTo({
                url: '/pages/physical_order/physical_order?data=' + encodeURIComponent(JSON.stringify(data)),
            });

        }

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var data = JSON.parse(decodeURIComponent(options.data));
        console.log(data);
        this.data.spec_text = data.spec_text;
        this.data.bgcolor = data.bgcolor;
        this.data.pixel = data.pixel;
        wx.downloadFile({
            url: data.imageUrl,
            success: (res) => {
                const temp = res.tempFilePath;
                wx.uploadFile({
                    filePath: temp,
                    name: 'file',
                    url: 'http://127.0.0.1:8000/customer/auth/photo/upload',
                    header: {
                        'content-type': 'multipart/form-data',
                        'token': wx.getStorageSync('token')
                    },
                    success: (res) => {
                        var data = JSON.parse(res.data); // res.data类型是string

                        // console.log(data.data.img_url)
                        if (data.code == 200) {
                            this.data.showImageUrl = data.data.img_url;
                            this.setData({
                                showImageUrl: this.data.showImageUrl,
                                if_loading: false,
                            });
                            var post_data = {
                                "wm_photo": this.data.showImageUrl,
                                "bgcolor": this.data.bgcolor,
                                "spec_text": this.data.spec_text,
                                "pixel": this.data.pixel
                            }
                            console.log(post_data)
                            wx.request({
                                url: 'http://127.0.0.1:8000/customer/auth/cart/addcart',
                                data: post_data,
                                method: "POST",
                                header: {
                                    'content-type': 'application/json',
                                    'token': wx.getStorageSync('token')
                                },
                                success: (res) => {
                                    if (res.data.code == 200) {
                                        console.log("写入购物车/相册成功...");
                                        this.data.cart_id = res.data.data.cart_id; // 订单号

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
                                        wx.showToast({
                                            title: '接口失效',
                                            icon: "none"
                                        });
                                    }
                                }
                            })

                        } else if (data.code == 202) {
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
                            wx.showToast({
                                title: '生成失败',
                                icon: "none",
                                duration: 1000
                            });
                            setTimeout(() => {
                                wx.navigateBack({
                                    delta: 1,
                                });
                            }, 1000);
                        }
                    }
                })
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