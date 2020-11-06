// pages/my/my.js
import Toast from '../../vantweapp/toast/toast'
Page({
    /**
     * 页面的初始数据
     */
    data: {
        active: 4,
        // userLogo: "/static/image/index/logo.jpg",
        userLogo: "/logo.jpg",
        token: "",
        userName: "设置你的昵称(￣﹃￣)",
        userPhone: "",
        userId: Number,

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
    login: function () {
        wx.redirectTo({
            url: '/pages/index/index',
        })
    },
    showMyInfo: function () {
        var userInfo = {
            "userName": this.data.userName,
            "userPhone": this.data.userPhone,
            "userLogo": this.data.userLogo,
            "userId": this.data.userId
        }
        wx.navigateTo({
            url: '/pages/myinfo/myinfo?userInfo=' + encodeURIComponent(JSON.stringify(userInfo))
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
        this.data.token = wx.getStorageSync('token');
        // console.log(this.data.token)
        // if (this.data.token == ''){
        //     console.log("token为控")
        // }
        this.setData({
            token: this.data.token
        });
        if (this.data.token != '') { // token不为空，请求个人信息的接口
            wx.request({
                url: 'http://127.0.0.1:8000/customer/auth/personal/msg',
                method: "GET",
                header: {
                    'content-type': 'application/json',
                    'token': wx.getStorageSync('token')
                },
                success: (res) => {
                    // console.log("响应码为：", res.data);
                    if (res.data.code == 200) {
                        if (res.data.data["user_name"] != null) {
                            this.data.userName = res.data.data["user_name"];
                        }
                        if (res.data.data["user_phone"] != null) {
                            this.data.userPhone = res.data.data["user_phone"];
                        }
                        if (res.data.data["user_logo"] != null) {
                            this.data.userLogo = res.data.data["user_logo"];
                        }
                        this.data.userId = res.data.data["user_id"];
                        this.setData({
                            userPhone: this.data.userPhone,
                            userName: this.data.userName,
                            userLogo: this.data.userLogo,
                            userId: this.data.userId
                        });

                    } else if (res.data.code == 202) {
                        Toast("token失效");
                        setTimeout(() => {
                            wx.redirectTo({
                                url: '/pages/index/index',
                            })
                        }, 2000)
                    } else {
                        Toast("请求接口失败");
                    }
                },
                fail(res) {
                    Toast("请求个人信息接口失败")
                }

            })
        } else {
            wx.showToast({
              title: '请进行登录或注册',
              icon: "none",
              duration: 1000
            });
        }


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