// pages/photo_size_info/photo_size_info.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        lunboData: [{
                "imgUrl": '/static/image/index/logo.jpg'
            },
            {
                "imgUrl": '/static/image/index/logo.jpg'
            },
            {
                "imgUrl": '/static/image/index/logo.jpg'
            }
        ],
        size: "", // 尺寸
        pixel: " ", // 像素
        color: "", // 背景颜色
        spec_id: "", // 规格id
        text: "" // 照片规格
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        wx.setNavigationBarTitle({
            title: options.text
        })
        this.setData({
            size: options.size,
            pixel: options.pixel,
            color: options.color,
            spec_id: options.spec_id,
            text: options.text
        });
    },
    chooseImg: function (event) {
        var type = event.currentTarget.dataset.type;
        console.log(type)
        wx.chooseImage({
            count: 1,
            sourceType: [type],
            success: (res) => {
                const tempFilePaths = res.tempFilePaths;
                var data = {
                    "img_url": tempFilePaths[0],
                    "spec_id": this.data.spec_id,
                    "pixel": this.data.pixel,
                    "spec_text": this.data.text
                };
                var str_data = encodeURIComponent(JSON.stringify(data));
                wx.navigateTo({
                    url: '/pages/cut_photo/cut_photo?data=' + str_data,
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