// pages/photo.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        active: 1,
        current: 0, // 图片的index,从0开始
        cart_list: [],

    },
    onChange: function (event) { // 页面跳转
        this.setData({
            active: event.detail
        });
        getApp().toPage(event);
    },
    openCamera: function () {
        getApp().openCamera(); // 调用全局函数，打开摄像头
    },
    getCurrentIndex: function (event) {
        this.setData({
            current: event.detail.current
        })
    },
    chooseImage: function () { // 系统相册选择图片
    },
    deleteImg: function () {
        wx.showModal({
            content: "删除图片后无法恢复，是否删除",
            confirmText: "删除",
            success: (res) => {
                if (res.confirm) {
                    wx.request({
                        url: 'http://127.0.0.1:8000/customer/auth/cart/delcart/' + this.data.cart_list[this.data.current].cart_id,
                        method: "GET",
                        header: {
                            'content-type': 'application/json',
                            'token': wx.getStorageSync('token')
                        },
                        success: (res) => {
                            if (res.data.code == 200) {
                                console.log("删除成功");
                            } else if (res.data.code == 201) {
                                wx.showToast({
                                    title: 'token失效，请登录',
                                    icon: "none"
                                })
                            } else {
                                wx.showToast({
                                    title: '接口错误',
                                    icon: "none"
                                })
                            }
                        }
                    })
                    this.data.cart_list.splice(this.data.current, 1);
                    if (this.data.current != 0) {
                        this.data.current--;
                    }
                    this.setData({
                        current: this.data.current,
                        cart_list: this.data.cart_list
                    });

                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        })
    },
    // 导出高清照
    export_digital: function () {
        wx.redirectTo({
            url: '/pages/digital_order/digital_order?data=' + encodeURIComponent(JSON.stringify(this.data.cart_list[this.data.current])),
        })
    },
    // 立即打印
    print_quick: function () {
        var select_spec_list = [{
            "spec_text": this.data.cart_list[this.data.current].spec_text,
            "bgcolr": this.data.cart_list[this.data.current].bgcolr,
            "spec_pixel": this.data.cart_list[this.data.current].spec_pixel,
            "img_url": this.data.cart_list[this.data.current].img_url
        }]
        wx.setStorageSync('select_spec_list', select_spec_list);
        wx.redirectTo({
            url: '/pages/physical_order/physical_order?data=' + encodeURIComponent(JSON.stringify(this.data.cart_list[this.data.current])),
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.request({
            url: 'http://127.0.0.1:8000/customer/auth/cart/all',
            method: "GET",
            header: {
                'content-type': 'application/json',
                'token': wx.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code == 200) {
                    console.log(res.data.data);
                    this.data.cart_list = res.data.data;
                    this.setData({
                        cart_list: this.data.cart_list
                    });
                } else if (res.data.code == 202) {
                    wx.showToast({
                        title: 'token过期，请先登录',
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