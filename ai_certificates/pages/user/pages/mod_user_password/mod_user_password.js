// pages/mod_user_password/mod_user_password.js
import Notify from '../../vantweapp/notify/notify'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userPhone: "",
        userPassword: "",
        repeat_userPassword: "",
        smsCode: "",
        if_correct_phone: false, // 是否显示手机格式的提示信息
        correct_message: "", // 手机格式的提示信息
        if_same_password: false, // 是否显示密码格式的提示信息
        same_password_message: "" // 密码不同的提示信息
    },
    sendsms: function () {
        if (this.data.if_correct_phone == true) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: "none"
            });
            return;
        } else {
            wx.request({
                url: 'http://127.0.0.1:8000/customer/open/common/createsms/' + this.data.userPhone,
                method: 'GET',
                header: {
                    'content-type': 'application/json' // 默认值
                },
                success: (res) => {
                    this.data.smsCode = res.data.data["sms"];
                    Notify('手机验证码为：' + res.data.data["sms"]);
                },
                fail(res) {
                    Toast("请求接口失败");
                }
            })
        }
    },
    checkPhone: function () {
        var reg = /^[\d]*$/; // 匹配纯数字
        if (!reg.test(this.data.userPhone) || this.data.userPhone.length != 11) {
            this.data.if_correct_phone = true;
            this.data.correct_message = "手机号格式错误! 请输入11位数字"
        } else {
            this.data.if_correct_phone = false;
        }
        this.setData({
            if_correct_phone: this.data.if_correct_phone,
            correct_message: this.data.correct_message
        })
    },
    checkPassword: function () {
        if (this.data.userPassword != this.data.repeat_userPassword) {
            this.data.if_same_password = true;
            this.data.same_password_message = "请输入相同的密码!";
        } else {
            this.data.if_same_password = false;
        }
        this.setData({
            if_same_password: this.data.if_same_password,
            same_password_message: this.data.same_password_message
        });
    },
    modUserPassword: function () {
        if (!this.data.userPassword || !this.data.userPhone || !this.data.repeat_userPassword || !this.data.smsCode) {
            wx.showToast({
                title: '请完善信息',
                icon: "none",
                duration: 1000
            });
        } else {
            var data = {
                "userPhone": this.data.userPhone,
                "userPassword": this.data.userPassword,
                "smsCode": this.data.smsCode
            }
            wx.request({
                url: 'http://127.0.0.1:8000/customer/auth/personal/modUserPassword',
                method: "POST",
                data: data,
                header: {
                    'content-type': 'application/json',
                    'token': wx.getStorageSync('token')
                },
                success: (res) => {
                    if (res.data.code == 200) {
                        wx.showToast({
                            title: '修改成功',
                            duration: 1000
                        });
                        setTimeout(() => {
                            // wx.redirectTo({
                            //     url: '/pages/my/my',
                            // })
                            wx.navigateBack({
                              delta: 1,
                            })
                        }, 1000);
                    } else if (res.data.code == 201) {
                        wx.showToast({
                            title: "修改失败",
                            icon: "none"
                        })
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
                            title: "验证码错误",
                            icon: "none"
                        })
                    }
                },
                fail(res) {
                    wx.showToast({
                        title: '接口失效',
                    })
                }

            })

        }

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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