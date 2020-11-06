// pages/addressInfo/addressInfo.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show: false,
        address_id: Number,
        accept_user: "",
        accept_phone: "",
        accept_address: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("地址信息为：", options.addressInfo);
        if (options.addressInfo) { // 如果有addressInfo的数据传过来，说明存在地址，因此可以进行删除操作
            console.log("have data");
            this.setData({
                show: true
            });
            var addressInfo = JSON.parse(decodeURIComponent(options.addressInfo))
            this.data.accept_user = addressInfo.accept_user;
            this.data.accept_phone = addressInfo.accept_phone;
            this.data.accept_address = addressInfo.accept_address;
            this.data.address_id = addressInfo.address_id;
            this.setData({
                accept_user: this.data.accept_user,
                accept_phone: this.data.accept_phone,
                accept_address: this.data.accept_address,
            })
        } else {
            console.log("no data");
        }
    },
    deleteAddress: function () {
        wx.showModal({
            content: "是否删除",
            success: (res) => {
                if (res.confirm) {
                    wx.request({
                        url: 'http://127.0.0.1:8000/customer/auth/personal/delAddress?address_id=' + this.data.address_id,
                        method: "GET",
                        header: {
                            'content-type': 'application/json',
                            'token': wx.getStorageSync('token')
                        },
                        success(res) {
                            if (res.data.code == 200) {
                                wx.showToast({
                                    title: '删除成功！',
                                    duration: 1000
                                })
                                setTimeout(() => {
                                    // wx.redirectTo({
                                    //     url: '/pages/myaddress/myaddress',
                                    // })
                                    wx.navigateBack({
                                      delta: 1,
                                    })
                                }, 1000);
                            } else if (res.data.code == 202) {
                                wx.showToast({
                                    title: 'token失效，重新登录',
                                    duration: 1000
                                });
                                setTimeout(() => {
                                    wx.redirectTo({
                                        url: '/pages/index/index',
                                    })
                                }, 1000)
                            } else {
                                wx.showToast({
                                    title: '删除失败',
                                    duration: 1000
                                });
                            }
                        }
                    })
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })

    },
    modAddress: function () {
        if (!this.data.accept_phone || !this.data.accept_user || !this.data.accept_address) {
            wx.showToast({
                title: '请完善信息',
                icon: "none"
            });
            return;
        }
        var data = {
            "address_id": this.data.address_id,
            "accept_user": this.data.accept_user,
            "accept_phone": this.data.accept_phone,
            "accept_address": this.data.accept_address
        };
        wx.request({
            url: 'http://127.0.0.1:8000/customer/auth/personal/modAddress',
            data: data,
            method: "POST",
            header: {
                'content-type': 'application/json',
                'token': wx.getStorageSync('token')
            },
            success(res) {
                if (res.data.code == 200) {
                    wx.showToast({
                        title: '修改成功',
                        duration: 1000
                    });
                } else if (res.data.code == 202) {
                    wx.showToast({
                        title: 'token失效，重新登录',
                        duration: 1000
                    });
                    setTimeout(() => {
                        wx.redirectTo({
                            url: '/pages/index/index',
                        })
                    }, 1000)
                } else {
                    wx.showToast({
                        title: '修改失败',
                    })
                }
            },
            fail(res) {
                wx.showToast({
                    title: '接口失效',
                })
            }
        })
    },
    addAddress: function () {
        if (!this.data.accept_phone || !this.data.accept_user || !this.data.accept_address) {
            wx.showToast({
                title: '请完善信息',
                icon: "none"
            });
            return;
        }
        var data = {
            "accept_user": this.data.accept_user,
            "accept_phone": this.data.accept_phone,
            "accept_address": this.data.accept_address
        };
        wx.request({
            url: 'http://127.0.0.1:8000/customer/auth/personal/addAddress',
            data: data,
            method: "POST",
            header: {
                'content-type': 'application/json',
                'token': wx.getStorageSync('token')
            },
            success(res) {
                if (res.data.code == 200) {
                    wx.showToast({
                        title: '增加成功',
                        duration: 1000
                    });
                    setTimeout(() => {
                        // wx.redirectTo({
                        //     url: '/pages/myaddress/myaddress',
                        // })
                        wx.navigateBack({
                          delta: 1,
                        })
                    }, 1000);
                } else if (res.data.code == 201) {
                    wx.showToast({
                        title: 'token过期，重新登录',
                        duration: 1000
                    });
                    setTimeout(() => {
                        wx.redirectTo({
                            url: '/pages/index/index',
                        })
                    }, 1000);
                } else {
                    wx.showToast({
                        title: '增加地址失败',
                    })
                }
            },
            fail(res) {
                wx.showToast({
                    title: '接口失效',
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