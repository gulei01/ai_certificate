// pages/choose_size/choose_size.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        if_loading: true,
        select_spec_list: [], // 已选择的规格
        all_spec_list: [{
                "spec_id": "1",
                "spec_text": "一寸",
                "spec_size": "25x25mm",
                "spec_pixel": "295x413px",
                "img_url": "",
                "spec_active": false
            },
            {
                "spec_id": "10",
                "spec_text": "二寸",
                "spec_size": "35x49mm",
                "spec_pixel": "413x578px",
                "img_url": "",
                "spec_active": false
            },
            {
                "spec_id": "13",
                "spec_text": "小二寸",
                "spec_size": "35x45mm",
                "spec_pixel": "413x531px",
                "img_url": "",
                "spec_active": false
            },
            {
                "spec_id": "4",
                "spec_text": "小一寸",
                "spec_size": "22x32mm",
                "spec_pixel": "259x377px",
                "img_url": "",
                "spec_active": false
            },
            {
                "spec_id": "7",
                "spec_text": "大一寸",
                "spec_size": "33x48mm",
                "spec_pixel": "389x566px",
                "img_url": "",
                "spec_active": false
            },
        ], // 全部规格
        current: 0, // 当前滑块
        show: false, // 是否显示“可选择多种规格的弹出层”
    },
    // 监控轮播图current的变化
    currentChange: function (event) {
        console.log(event.detail);
        this.setData({
            current: event.detail.current
        });
    },
    // 禁止轮播图滑动
    stopTouchMove: function () {
        return false;
    },
    // 点击规格对应的信息，切换图片和显示active蓝点
    showSpecInfo: function (event) {
        // console.log(event)
        var index = event.currentTarget.dataset.index;
        console.log("current index is:", index);
        this.setData({
            current: index
        });
    },
    // 重新选择
    rechoose: function () {
        this.setData({
            show: true
        });
    },
    onClose: function () {
        this.setData({
            show: false
        });
    },
    chooseSpec: function (event) {
        console.log(event);
        var index = event.currentTarget.dataset.index;
        this.data.all_spec_list[index].spec_active = !this.data.all_spec_list[index].spec_active;
        this.setData({
            all_spec_list: this.data.all_spec_list
        });
    },
    // 确定按钮
    confirm: function () {
        this.data.select_spec_list = []; // 清空
        for (let i = 0; i < this.data.all_spec_list.length; i++) {
            if (this.data.all_spec_list[i].spec_active) {
                this.data.select_spec_list.push(this.data.all_spec_list[i]);
            }
        }
        if (this.data.select_spec_list.length == 0) {
            wx.showToast({
                title: '至少选择一项',
                icon: "none",
                duration: 1500
            });
            return;
        }
        this.setData({
            select_spec_list: this.data.select_spec_list,
            show: false
        });
    },
    quickPrint: function () {
        wx.setStorageSync('select_spec_list', this.data.select_spec_list);
        wx.navigateBack({
            delta: 1,
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var data = JSON.parse(decodeURIComponent(options.data));
        console.log(data);
        var bgcolor = data.bgcolor;
        var background_color = [];
        if (bgcolor == "蓝色") {
            background_color = [{
                "start_color": 4427483,
                "color_name": "blue",
                "enc_color": 4427483
            }]
        }
        if (bgcolor == "红色") {
            background_color = [{
                "start_color": 16711680,
                "color_name": "red",
                "enc_color": 16711680
            }]
        }
        if (bgcolor == "白色") {
            background_color = [{
                "start_color": 16777215,
                "color_name": "white",
                "enc_color": 16777215

            }]
        }
        var img_url = data.img_url;
        var spec_text = data.spec_text;
        wx.downloadFile({
            url: img_url,
            success: (res) => {
                for (let i = 0; i < this.data.all_spec_list.length; i++) {
                    if (spec_text == this.data.all_spec_list[i].spec_text) {
                        this.data.all_spec_list[i].img_url = img_url;
                    } else {
                        let request_data = {
                            "file": wx.getFileSystemManager().readFileSync(res.tempFilePath, "base64"),
                            "app_key": "8af6f5751c66c84c2fe1ccb1c2e601f96c493be3",
                            "spec_id": this.data.all_spec_list[i].spec_id,
                            "background_color": background_color
                        };
                        wx.request({
                            url: 'http://apicall.id-photo-verify.com/api/cut_check_pic',
                            data: request_data,
                            method: "POST",
                            header: {
                                'content-type': 'application/json',
                            },
                            success: (res) => {
                                if (res.data.code == 200) {
                                    this.data.all_spec_list[i].img_url = res.data.result.img_wm_url_list[0];
                                    wx.downloadFile({
                                        url: this.data.all_spec_list[i].img_url,
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
                                                    let data = JSON.parse(res.data); // res.data类型是string
                                                    if (data.code == 200) {
                                                        this.data.all_spec_list[i].img_url = data.data.img_url;
                                                        let if_loading = false;
                                                        for (let j = 0; j < this.data.all_spec_list.length; j++) {
                                                            if (this.data.all_spec_list[j].img_url == '') {
                                                                if_loading = true;
                                                            }
                                                        }
                                                        if (if_loading == false) {
                                                            // 加载完成
                                                            for (let i = 0; i < this.data.all_spec_list.length; i++) {
                                                                if (spec_text == this.data.all_spec_list[i].spec_text) {
                                                                    let temp = {
                                                                        spec_text: this.data.all_spec_list[i].spec_text,
                                                                        spec_size: this.data.all_spec_list[i].spec_size,
                                                                        spec_pixel: this.data.all_spec_list[i].spec_pixel,
                                                                        img_url: this.data.all_spec_list[i].img_url,

                                                                    };
                                                                    this.data.select_spec_list.push(temp);
                                                                    this.data.all_spec_list[i].spec_active = true;
                                                                }
                                                            }
                                                        }
                                                        this.setData({
                                                            if_loading: if_loading,
                                                            all_spec_list: this.data.all_spec_list,
                                                            select_spec_list: this.data.select_spec_list
                                                        });
                                                    }
                                                }
                                            })
                                        }
                                    })
                                    // console.log(this.data.all_spec_list);

                                } else {
                                    wx.showToast({
                                        title: '接口请求错误',
                                        duration: 1500,
                                        icon: "none"
                                    });
                                }
                            }
                        })
                    }
                }

            }
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