// pages/cut_photo/cut_photo.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        if_loading: false,
        spec_id: "",
        spec_text: "",
        pixel: "",
        img_wm_url_list: [],
        clo_active: 0, // 控制男女装的切换
        active: 0, // 控制美颜各项功能(美白，瘦脸，磨皮，大眼)的切换
        btn_active: 0, // 控制美颜，背景，换装的切换
        bg_active: 0, // 背景的选择
        slider_value: 0, // 美颜数值，滑动栏的数据
        showSliderValue: false, // 控制显示美颜数值
        skinWhite: 0, // 皮肤美白程度
        skinSoft: 0, // 皮肤光滑程度
        eyeLarge: 0, // 大眼程度
        faceLift: 0, // 瘦脸程度
        originalPhoto: "", // 原始图片，如果用户不保存，原始图片不变，带水印原始图片
        tempPhoto: "", // 用户操作完一种美颜方式后，切换其他方式，这个就是请求文件file参数
        tempFilePath: "", // 用于存放下载临时文件后的临时路径
        processingPhoto: "", // 接受处理过图片，显示到前端
        // 需要注意的问题：对一个美颜效果的处理，应该是原来的图片，不能是效果后的图片

    },
    onDrag: function (event) { // 进度条拖动变化
        this.setData({
            slider_value: event.detail.value,
            showSliderValue: true
        });

    },
    // 数值改变，请求接口，返回图片
    dragEnd: function () { //结束拖动，隐藏数值//不知道为啥，bind:drag-start bind:drag-end不能触发
        setTimeout(() => {
            this.setData({
                showSliderValue: false
            })
        }, 1000);
        // 记录参数
        if (this.data.active == 0) this.data.skinWhite = this.data.slider_value;
        if (this.data.active == 1) this.data.faceLift = this.data.slider_value;
        if (this.data.active == 2) this.data.skinSoft = this.data.slider_value;
        if (this.data.active == 3) this.data.eyeLarge = this.data.slider_value;
        // var skinWhite, skinSoft, eyeLarge, faceLift;
        // if (this.data.active == 0) skinWhite = this.data.slider_value / 100;
        // if (this.data.active == 1) faceLift = this.data.slider_value / 100;
        // if (this.data.active == 2) skinSoft = this.data.slider_value / 100;
        // if (this.data.active == 3) eyeLarge = this.data.slider_value / 100;

        // 下载图片到本地，但是不指定临时文件路径，这样下载的文件就行存放为一个临时文件，然后微信自动清除这些临时文件
        console.log("current photo is :", this.data.tempPhoto);
        wx.downloadFile({
            url: this.data.tempPhoto,
            success: (res) => {
                console.log("临时文件路径：", res.tempFilePath)
                this.data.tempFilePath = res.tempFilePath;
                // console.log(wx.getFileSystemManager().readFileSync(this.data.tempFilePath, "base64"));
                var skinWhite, skinSoft, eyeLarge, faceLift;
                skinWhite = skinSoft = eyeLarge = faceLift = 0;
                if (this.data.active == 0) skinWhite = this.data.skinWhite / 100;
                if (this.data.active == 1) faceLift = this.data.faceLift / 100;
                if (this.data.active == 2) skinSoft = this.data.skinSoft / 100;
                if (this.data.active == 3) eyeLarge = this.data.eyeLarge / 100;
                var data = {
                    "file": wx.getFileSystemManager().readFileSync(this.data.tempFilePath, "base64"),
                    "app_key": "8af6f5751c66c84c2fe1ccb1c2e601f96c493be3",
                    "spec_id": this.data.spec_id,
                    "is_fair": 1,
                    "fair_level": {
                        "leyelarge": eyeLarge,
                        "reyelarge": eyeLarge,
                        "mouthlarge": 0.1,
                        "skinwhite": skinWhite,
                        "skinsoft": skinSoft,
                        "coseye": 0,
                        "facelift": faceLift
                    }
                }
                console.log("---------正在请求接口----------")
                this.setData({
                    if_loading: true
                });
                wx.request({
                    url: 'http://apicall.id-photo-verify.com/api/cut_check_pic',
                    method: "POST",
                    data: data,
                    header: {
                        'content-type': 'application/json',
                    },
                    success: (res) => {
                        console.log(res)
                        if (res.data.code == 200) {
                            this.setData({
                                if_loading: false
                            });
                            this.data.processingPhoto = res.data.result.img_wm_url_list[0];
                            this.setData({
                                processingPhoto: this.data.processingPhoto
                            });
                        } else {
                            this.setData({
                                if_loading: false
                            });
                            wx.showToast({
                                title: '接口请求错误',
                                duration: 1500,
                                icon: "none"
                            });
                            setTimeout(() => {
                                wx.navigateBack({
                                    delta: 1,
                                })
                            }, 1500);
                        }
                    }
                })
            },fail(res){
                console.log("下载失败...")
            }
        });
    },
    changeBtnActive: function (event) {
        this.data.btn_active = event.currentTarget.dataset.btn_active;
        this.setData({
            btn_active: this.data.btn_active
        });
        // 请求背景图片，因为只需要请求一次即可
        if (this.data.btn_active == 3) {
            this.setData({
                if_loading: true
            });
            wx.downloadFile({
                url: this.data.originalPhoto,
                success: (res) => {
                    this.data.tempFilePath = res.tempFilePath;
                    console.log("base64编码为：");
                    console.log(wx.getFileSystemManager().readFileSync(this.data.tempFilePath, "base64"));
                    var data = {
                        "file": wx.getFileSystemManager().readFileSync(this.data.tempFilePath, "base64"),
                        "app_key": "8af6f5751c66c84c2fe1ccb1c2e601f96c493be3",
                        "spec_id": this.data.spec_id,
                        "background_color": [{
                            "start_color": 16777215,
                            "color_name": "white",
                            "enc_color": 16777215
                        }, {
                            "start_color": 4427483,
                            "color_name": "blue",
                            "enc_color": 4427483
                        }, {
                            "start_color": 16711680,
                            "color_name": "red",
                            "enc_color": 16711680
                        }]
                    };
                    wx.request({
                        url: 'http://apicall.id-photo-verify.com/api/cut_check_pic',
                        data: data,
                        method: "POST",
                        header: {
                            'content-type': 'application/json',
                        },
                        success: (res) => {
                            console.log(res);
                            if (res.data.code == 200) {
                                this.setData({
                                    if_loading: false
                                });
                                this.data.img_wm_url_list = res.data.result.img_wm_url_list;
                                console.log("========", this.data.img_wm_url_list);
                            } else {
                                this.setData({
                                    if_loading: false
                                });
                                wx.showToast({
                                    title: '接口请求错误',
                                    duration: 1500,
                                    icon: "none"
                                });
                                setTimeout(() => {
                                    wx.navigateBack({
                                        delta: 1,
                                    })
                                }, 1500);
                            }
                        }
                    })
                }
            });
        }
    },
    choosebg: function (event) {
        this.data.bg_active = event.currentTarget.dataset.bg_active;
        if (this.data.bg_active == 0) {
            this.data.processingPhoto = this.data.originalPhoto;
        } else {
            this.data.processingPhoto = this.data.img_wm_url_list[this.data.bg_active - 1];
        }
        this.setData({
            bg_active: this.data.bg_active,
            processingPhoto: this.data.processingPhoto
        });

    },
    beautifyChange: function (event) { // 美颜各项功能的切换
        // console.log(event.currentTarget.dataset);
        this.data.active = event.currentTarget.dataset.active;
        this.data.tempPhoto = this.data.processingPhoto; // 切换，保存处理过的图片
        var temp = [
            this.data.skinWhite,
            this.data.faceLift,
            this.data.skinSoft,
            this.data.eyeLarge
        ];
        this.setData({
            active: this.data.active,
            slider_value: temp[this.data.active]
        });
    },
    // 点击x,数据不保存
    close: function () {
        this.data.btn_active = 0;
        this.data.skinWhite = 0;
        this.data.faceLift = 0;
        this.data.skinSoft = 0;
        this.data.eyeLarge = 0;
        this.data.slider_value = 0;
        this.setData({ // 重置
            btn_active: this.data.btn_active,
            processingPhoto: this.data.originalPhoto,
            skinSoft: this.data.skinSoft,
            skinWhite: this.data.skinWhite,
            faceLift: this.data.faceLift,
            eyeLarge: this.data.eyeLarge,
            slider_value: this.data.slider_value
        });
    },
    // 点击√，保存
    save: function () {
        this.data.tempPhoto = this.data.originalPhoto = this.data.processingPhoto;

        this.data.btn_active = 0;
        this.setData({
            btn_active: this.data.btn_active
        });
    },
    // 切换男女装
    setClothesActive: function (event) {
        var clothes = event.target.dataset.clothes;
        this.data.clo_active = clothes;
        this.setData({
            clo_active: this.data.clo_active
        });
    },
    // 请求，换装
    chooseClothes: function (event) {
        var type = event.currentTarget.dataset.type;
        console.log(type);
        if (type == "0") {
            this.data.processingPhoto = this.data.originalPhoto;
            this.setData({
                processingPhoto: this.data.processingPhoto
            });
        } else {
            this.setData({
                if_loading: true
            });
            wx.downloadFile({
                url: this.data.originalPhoto,
                success: (res) => {
                    this.data.tempFilePath = res.tempFilePath;
                    var data = {
                        "file": wx.getFileSystemManager().readFileSync(this.data.tempFilePath, "base64"),
                        "spec_id": this.data.spec_id,
                        "app_key": "bfd8e489e193f6ad4cfd28ccd10e1ddb4d250931",
                        "clothes": type
                    };

                    wx.request({
                        url: 'http://apicall.id-photo-verify.com/api/cut_change_clothes',
                        data: data,
                        method: "POST",
                        header: {
                            'content-type': 'application/json',
                        },
                        success: (res) => {
                            console.log(res);
                            if (res.data.code == 200) {
                                this.setData({
                                    if_loading: false
                                });
                                this.data.processingPhoto = res.data.wm_pic_url[0];
                                this.setData({
                                    processingPhoto: this.data.processingPhoto
                                });

                            } else {
                                this.setData({
                                    if_loading: false
                                });
                                wx.showToast({
                                    title: '接口请求错误',
                                    duration: 1500,
                                    icon: "none"
                                });
                                setTimeout(() => {
                                    wx.navigateBack({
                                        delta: 1,
                                    })
                                }, 1500);
                            }
                        }
                    })

                }
            });
        }
    },
    // 确认
    confirm:function (){
        console.log("图片为：",this.data.processingPhoto);
        var bgcolor = ['蓝色', '白色','蓝色','红色'];
        this.data.bgcolor = bgcolor[this.data.bg_active];
        var data = {
            "imageUrl": this.data.processingPhoto,
            "bgcolor": this.data.bgcolor,
            "spec_text": this.data.spec_text,
            "pixel": this.data.pixel,
        }
        var str_data = JSON.stringify(data);
        wx.navigateTo({
          url: '/pages/save_photo/save_photo?data=' + encodeURIComponent(str_data),
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) { // 页面加载就要判断图片是否符合要求
        var data = JSON.parse(decodeURIComponent(options.data));
        console.log(data);
        this.data.processingPhoto = this.data.tempPhoto = this.data.originalPhoto = data.img_url;
        this.data.pixel = data.pixel;
        this.data.spec_text = data.spec_text;
        this.data.spec_id = data.spec_id;
        this.data.if_loading = true;
        this.setData({
            processingPhoto: this.data.processingPhoto,
            if_loading: this.data.if_loading
        });

        var data = {
            "file": wx.getFileSystemManager().readFileSync(data.img_url, "base64"),
            "app_key": "8af6f5751c66c84c2fe1ccb1c2e601f96c493be3",
            "spec_id": this.data.spec_id,
            "is_fair": 0
        }
        wx.request({
            url: 'http://apicall.id-photo-verify.com/api/cut_check_pic',
            method: "POST",
            data: data,
            success: (res) => {
                if (res.data.code == 200) {
                    this.setData({
                        if_loading: false,
                    });
                    if (res.data.result.check == 0) { // 图片不合格
                        console.log(res.data.not_check_result[0].param_message)
                        wx.showToast({
                            title: res.data.not_check_result[0].param_message,
                            duration: 2000,
                            icon: "none"
                        });
                        setTimeout(() => {
                            wx.navigateBack({
                                delta: 1,
                            })
                        }, 2000);
                    } else { // 图片合格
                        this.data.processingPhoto = res.data.result.img_wm_url_list[0];
                        this.setData({
                            processingPhoto: this.data.processingPhoto,
                            originalPhoto: this.data.processingPhoto
                        });
                    }
                } else {
                    this.setData({
                        if_loading: false,
                    });
                    wx.showToast({
                        title: '接口请求错误',
                        duration: 1500,
                        icon: "none"
                    });
                    setTimeout(() => {
                        wx.navigateBack({
                            delta: 1,
                        })
                    }, 1500);
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