// pages/physical_order/physical_order.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order_type: 1, // 1表示门店自取，3表示快递收货
        accept_user: "",
        accept_address: "",
        accept_phone: "",
        address_info: "", // 收货地址对象
        store_info: "", // 门店信息
        showStoreList: false,
        storeList: [], // 门店列表
        // select_spec_info: {}, // 显示的选择规格
        select_spec_list: [], // 选择图片的规格列表
        price_list: [], // 价格
        img_url: "", //保存接受的图片
        cart_id: Number, //保存购物车id
        bgcolor: "", // 保存背景颜色
        spec_text: "", // 保存规格名
        pixel: "", // 像素尺寸
        all_price: 0, // 总的金额


    },
    // 选择收货类型
    choose_accept_type: function (event) {
        // console.log(event);
        this.data.order_type = event.target.dataset.order_type;
        this.setData({
            order_type: this.data.order_type
        });
    },
    // 选择收货地址
    chooseAddress: function () {
        wx.navigateTo({
            url: '/pages/myaddress/myaddress?if_choosed=true',
        });
    },
    // 展示门店列表
    showStoreList: function () {
        wx.request({
            url: 'http://127.0.0.1:8000/customer/auth/store/list',
            method: "GET",
            header: {
                'content-type': 'multipart/form-data',
                'token': wx.getStorageSync('token')
            },
            success: (res) => {
                if (res.data.code == 200) {
                    console.log("门店列表为:", res.data.data);
                    this.data.storeList = res.data.data;
                    this.setData({
                        showStoreList: true,
                        storeList: this.data.storeList
                    });
                } else if (res.data.code == 202) {
                    wx.showToast({
                        title: 'token过期',
                        icon: "none",
                        duration: 2000
                    });
                    setTimeout(() => {
                        wx.redirectTo({
                            url: '/pages/index/index',
                        })
                    }, 2000);
                }

            },
            fail(res) {
                wx.showToast({
                    title: '接口失效',
                    icon: "none"
                })
            }
        })
    },
    closeStoreList: function () {
        this.setData({
            showStoreList: false
        });
    },
    // 在弹出层中选择门店
    chooseStore: function (event) {
        var index = event.currentTarget.dataset.index;
        this.data.store_info = this.data.storeList[index];
        this.setData({
            store_info: this.data.store_info
        });
        this.closeStoreList();
    },
    // 选择更多尺寸
    chooseMoreSize: function () {
        var data = {
            "img_url": this.data.img_url,
            "bgcolor": this.data.bgcolor,
            "spec_text": this.data.spec_text
        };
        wx.navigateTo({
            url: '/pages/choose_size/choose_size?data=' + encodeURIComponent(JSON.stringify(data)),
        })
    },
    // 修改数量
    changeSpecSize: function (event) {
        var index = event.currentTarget.dataset.index;
        var val = event.detail;
        this.data.price_list[index] = val;
        console.log(this.data.price_list);
        this.data.all_price = 0;
        for (let i = 0; i < this.data.price_list.length; i++) {
            this.data.all_price += this.data.price_list[i] * 1500;
        }
        this.setData({
            all_price: this.data.all_price
        });
    },
    // 提交订单
    onSubmit: function () {
        if (this.data.all_price == 0) {
            wx.showToast({
                title: '请至少购买一件',
                icon: "none"
            });
            return;
        }
        if (this.data.store_info == '' && this.data.order_type == 1) {
            wx.showToast({
                title: '请选择线下门店',
                icon: "none"
            });
            return;
        }
        if (this.data.address_info == '' && this.data.order_type == 3) {
            wx.showToast({
                title: '请选择收货地址',
                icon: "none"
            });
            return;
        }
        // 删除购物车项
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
        var order_data = [];
        for (let i = 0; i < this.data.select_spec_list.length; i++) {
            let temp = {
                "order_photo_type": this.data.select_spec_list[i].spec_text,
                "order_photo_size": this.data.select_spec_list[i].spec_pixel,
                "order_photo_bgcolor": this.data.bgcolor,
                "order_photo_num": this.data.price_list[i],
                "order_photo_price": 1500,
                "order_wm_photo": this.data.select_spec_list[i].img_url
            };
            order_data.push(temp);
        }
        var data;
        if (this.data.order_type == 1) {
            data = {
                "order_money": this.data.all_price,
                "order_type": this.data.order_type,
                "order_data": order_data,
                "store_name": this.data.store_info.store_name,
                "store_address": this.data.store_info.store_address,
                "store_contact_phone": this.data.store_info.store_contact_phone,
                "store_contact_name": this.data.store_info.store_contact_name
            };
        } else if (this.data.order_type == 3) {
            data = {
                "order_money": this.data.all_price,
                "order_type": this.data.order_type,
                "order_data": order_data,
                "order_accept_name": this.data.accept_user,
                "order_accept_phone": this.data.accept_phone,
                "order_accept_address": this.data.accept_address
            };
        }
        console.log("提交的订单数据为：", data);
        // 生成订单
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
                    var order_id = res.data.data.order_id; // 生成的订单号id
                    var create_at = res.data.data.create_at; // 订单创建时间
                    // console.log("订单号为：", this.data.order_id);
                    console.log("订单号为：", order_id);
                    wx.showLoading({
                        title: '正在生成订单',
                        duration: 2000
                    })
                    setTimeout(() => {
                        let order_info = {
                            "order_id": order_id,
                            "order_money": this.data.all_price,
                            "order_type": this.data.order_type,
                            "order_accept_name": "",
                            "order_accept_phone": "",
                            "order_accept_address": "",
                            "create_at": create_at,
                            "order_status": 0,
                            "store_name": "",
                            "store_address": "",
                            "store_contact_name": "",
                            "store_contact_phone": ""
                        }
                        if (this.data.order_type == 1) {
                            order_info["store_name"] = this.data.store_info.store_name;
                            order_info["store_address"] = this.data.store_info.store_address;
                            order_info["store_contact_name"] = this.data.store_info.store_contact_name;
                            order_info["store_contact_phone"] = this.data.store_info.store_contact_phone;
                        }
                        if (this.data.order_type == 3) {
                            order_info["order_accept_name"] = this.data.address_info.accept_user;
                            order_info["order_accept_phone"] = this.data.address_info.accept_phone;
                            order_info["order_accept_address"] = this.data.address_info.accept_address;
                        }
                        wx.redirectTo({
                            url: '/pages/order_info/order_info?order_info=' + encodeURIComponent(JSON.stringify(order_info)),
                        })
                    }, 2000);
                }
            },
            fail(res) {}
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var data = JSON.parse(decodeURIComponent(options.data));
        console.log(data); // 接受传递过来的数据
        this.data.cart_id = data.cart_id;
        this.data.bgcolor = data.bgcolor;
        this.data.img_url = data.img_url;
        this.data.spec_text = data.spec_text;
        this.data.pixel = data.pixel;
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
        // 初始化每个规格选择数量
        this.data.address_info = wx.getStorageSync('address_info');
        this.data.select_spec_list = wx.getStorageSync('select_spec_list');
        for (let i = 0; i < this.data.select_spec_list.length; i++) {
            this.data.price_list.push(1);
        }
        this.data.all_price = 0;
        for (let i = 0; i < this.data.price_list.length; i++) {
            this.data.all_price += this.data.price_list[i] * 1500;
        }
        this.setData({
            address_info: this.data.address_info,
            select_spec_list: this.data.select_spec_list,
            all_price: this.data.all_price
        });

        // 如果没有key，返回的是string类型，存在Key，则返回object
        if (this.data.address_info != '') {
            // console.log(this.data.address_info);
            // console.log(this.data.address_info.accept_phone);
            this.setData({
                accept_address: this.data.address_info.accept_address,
                accept_user: this.data.address_info.accept_user,
                accept_phone: this.data.address_info.accept_phone
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