const {
    default: Toast
} = require("../../vantweapp/toast/toast");
// import Toast from '../../vantweapp/toast/toast'
// pages/myinfo/myinfo.js
Page({
    data: {
        userLogo: "",
        userPhone: "",
        userName: "",
        userId: Number,
        show: false,
        modUserName: ""
    },
    modUserName: function () {
        wx.request({
            url: 'http://127.0.0.1:8000/customer/auth/personal/modUserName?userName=' + this.data.modUserName,
            method: "GET",
            header: {
                'content-type': 'application/json',
                'token': wx.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code == 200) {
                    this.setData({
                        userName: this.data.modUserName
                    });
                    this.onClose();
                    wx.showToast({
                        title: '修改成功',
                        icon: 'success',
                        duration: 1000
                    });
                } else if (res.data.code == 202) {
                    Toast("token失效,请重新登录");
                    setTimeout(() => {
                        wx.redirectTo({
                            url: '/pages/index/index',
                        })
                    }, 2000);
                } else {
                    Toast("修改失败")
                }
            },
            fail(res) {
                Toast("请求接口失败");
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (wx.getStorageSync('token') == '') {
            wx.showToast({
                title: '请进行登录/注册',
                icon: "none",
                duration: 1000
            });
            setTimeout(() => {
                wx.redirectTo({
                    url: '/pages/index/index',
                });
            }, 1000);

        }
        var userInfo = JSON.parse(decodeURIComponent(options.userInfo))
        console.log(userInfo);
        this.setData({
            userPhone: userInfo.userPhone,
            userName: userInfo.userName,
            userLogo: userInfo.userLogo,
            userId: userInfo.userId
        })
    },
    showPopup: function () {
        this.setData({
            show: true,
        })
    },
    onClose: function () {
        this.setData({
            show: false
        })
    },
    showUserPhone: function () {
        Toast("手机账号不能修改0.0")
    },
    showMyAddress: function () {
        wx.navigateTo({
            url: '/pages/myaddress/myaddress',
        })
    },
    modUserPassword: function () {
        wx.navigateTo({
            url: '/pages/mod_user_password/mod_user_password',
        })
    },
    chooseImg: function () { // 修改用户logo
        wx.chooseImage({
            count: 1,
            sourceType: ['album', 'camera'],
            success: (res) => {
                const tempFilePaths = res.tempFilePaths;
                console.log(tempFilePaths[0]);
                wx.uploadFile({
                    filePath: tempFilePaths[0],
                    url: 'http://127.0.0.1:8000/customer/auth/personal/modLogo',
                    header: {
                        'content-type': 'multipart/form-data',
                        'token': wx.getStorageSync('token')
                    },
                    name: "file",
                    success: (res) => {
                        var data = JSON.parse(res.data); // res.data类型是string
                        console.log(data.data.img_url)
                        if (data.code == 200) {
                            this.setData({
                                userLogo: data.data.img_url
                            });
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
                                title: '上传失败',
                                icon: "none"
                            })
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