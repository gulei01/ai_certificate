// pages/login/login.js
import Toast from '../../vantweapp/toast/toast'
import Notify from '../../vantweapp/notify/notify'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        operate: 'login', // 登录/注册/快捷登录/忘记密码
        checked: false, // 复选框
        userPhone: "", // login的手机号 
        userPassword: "", // login密码
        smsCode: "", // 验证码
        reg_userPhone: "", // 注册手机号
        reg_userPassword: "", // 注册密码
        // reg_repeat_userPassword: "", // 重复密码
        login_disabled: true, // 登录按钮状态
        sms_disabled: true, // 发送验证码按钮状态
        showMessage: false, // 是否展示提示信息
        message: "", // 相关提示信息
    },
    setRegister: function () {
        this.data.operate = "register";
        this.setData({
            operate: this.data.operate
        })
    },
    setLogin: function () {
        this.data.operate = "login";
        this.setData({
            operate: this.data.operate
        })
    },
    setForget: function () {
        this.data.operate = "forgetpassword";
        this.setData({
            operate: this.data.operate
        })
    },
    setSms: function (event) { // 设置发送验证码功能按钮的状态
        // console.log("当前手机为：", event.detail);
        if (event.detail.length == 11) {
            this.setData({
                sms_disabled: false,
            })
        } else {
            this.setData({
                sms_disabled: true,
            })
        }
    },
    loginByPhone: function () {
        this.data.operate = "loginByPhone";
        this.setData({
            operate: this.data.operate
        })
    },
    changeChecked: function (event) { // 设置同意协议
        this.setData({
            checked: event.detail,
        });
    },
    checkPhone: function (event) {
        console.log(event)
        // console.log(event.target)
        // console.log(event.target.dataset.phone);
        var reg = /^[\d]*$/; // 匹配纯数字
        if (!reg.test(event.target.dataset.phone) || event.target.dataset.phone.length != 11 && event.target.dataset.phone.length > 0) {
            this.data.login_disabled = true;
            Toast("手机号格式错误! 请输入11位数字");
        } else {
            this.data.login_disabled = false;
        }
        if (event.target.dataset.phone.length == 11) {
            this.data.sms_disabled = false;
        }
        this.setData({
            login_disabled: this.data.login_disabled,
            sms_disabled: this.data.sms_disabled
        })
    },
    checkPassword: function (event) {
        if (event.detail != this.data.reg_userPassword) {
            this.data.message = "请输入相同的密码!";
            this.data.showMessage = true;
        } else {
            this.data.message = "";
            this.data.showMessage = false;
        }
        this.setData({
            message: this.data.message,
            showMessage: this.data.showMessage
        });
    },
    login: function () { // 登录
        if (!this.data.userPhone || !this.data.userPhone) {
            Toast("请完善登录信息");
            return;
        }
        var data = {
            "userPhone": this.data.userPhone,
            "userPassword": this.data.userPassword
        }
        wx.request({
            url: 'http://127.0.0.1:8000/customer/open/user/login/',
            header: {
                'content-type': 'application/json' // 默认值
            },
            method: "POST",
            data: data,
            success(res) {
                if (res.data.msg == "登录成功") {
                    wx.showToast({
                        title: '登录成功',
                        duration: 1000
                    });
                    // wx.setStorageSync({ // 设置登录令牌
                    //     data: res.data.data["token"],
                    //     key: 'token',
                    // })
                    wx.setStorageSync('token', res.data.data["token"]);
                    // var user_id = res.data.data["user_info"]["user_id"];
                    // var user_name = res.data.data["user_info"]["user_name"];
                    // var user_logo = res.data.data["user_info"]["user_logo"];
                    // var user_info = {
                    //     "user_id": user_id,
                    //     "user_name": user_name,
                    //     "user_logo": user_logo
                    // };
                    // var url = "/pages/my/my?user_info=" + encodeURIComponent(JSON.stringify(user_info));
                    setTimeout(() => {
                        wx.redirectTo({
                            url: "/pages/my/my"
                        })
                    }, 1000);
                } else {
                    Toast("账号/密码错误")
                }
            },
            fail(res) {
                Toast("登录接口失效")
            }
        })
    },
    register: function () { // 注册
        if (!this.data.reg_userPhone || !this.data.reg_userPassword || !this.data.smsCode) {
            Toast("请完善信息");
            return;
        }
        if (!this.data.checked) {
            Toast("请同意相关协议")
            return;
        }
        var data = {
            "userPhone": this.data.reg_userPhone,
            "userPassword": this.data.reg_userPassword,
            "smsCode": this.data.smsCode
        }
        wx.request({
            url: 'http://127.0.0.1:8000/customer/open/user/reg/',
            method: "POST",
            data: data,
            header: {
                'content-type': 'application/json' // 默认值
            },
            success(res) {
                if (res.data.msg == "注册成功") {
                    // wx.setStorageSync({
                    //     data: res.data.data["token"],
                    //     key: 'token',
                    // });
                    wx.setStorageSync('token', res.data.data["token"]);
                    wx.showToast({
                        title: '注册成功',
                        duration: 1000
                    });
                    setTimeout(() => {
                        wx.redirectTo({
                            url: '/pages/my/my',
                        })
                    }, 1000);
                }
            },
            fail(res) {
                Toast("请求注册接口失效")
            }
        })
    },
    sendsms: function () {
        wx.request({
            url: 'http://127.0.0.1:8000/customer/open/common/createsms/' + this.data.reg_userPhone,
            method: 'GET',
            header: {
                'content-type': 'application/json' // 默认值
            },
            success: (res) => {
                console.log("sms位：", res.data.data["sms"])
                this.data.smsCode = res.data.data["sms"];
                Notify('手机验证码为：' + res.data.data["sms"]); 
                
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