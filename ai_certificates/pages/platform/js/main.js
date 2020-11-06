var leftApp = new Vue({
    el: "#main",
    data: {
        active: 0,
        store_active: 0, // 1表示修改，2表示新增
        test: true,
        orderList: [1, 2, 3],
        type: 3,
        order_data: [1, 2, 3, 3, 4],
        showOrderDetail: false,
        storeList: [],
        storeInfo: {},
        store_operate_text: ""
    },
    methods: {
        edit: function (id) {
            $.ajax({
                type: "GET",
                dataType: "json",
                url: 'http://127.0.0.1:8000/platform/auth/store/detail/' + id,
                contentType: "application/json",
                headers: {
                    'Content-Type': 'application/json;charset=utf8',
                    'token': localStorage.getItem('token')
                },
                success: function (result) {
                    if (result.code == 200) {
                        this.store_operate_text = '修改门店信息';
                        this.storeInfo = result.data;
                        console.log(this.storeInfo);
                        $("#store_address").val(this.storeInfo.store_address);
                        $("#store_name").val(this.storeInfo.store_name);
                        $("#store_contact_name").val(this.storeInfo.store_contact_name);
                        $("#store_contact_phone").val(this.storeInfo.store_contact_phone);
                        $("#user_phone").val(this.storeInfo.user_phone);
                        $("#user_password").val(this.storeInfo.user_password);
                        alert("成功");
                    } else {
                        alert("token");
                        window.location.href = 'index.html'
                    }
                }
            });
            alert(id);
            this.store_active = 1;


        },
        changeBar: function (active) {
            this.active = active;
            if (this.active == 2) {}
        },
        closeOtherInfo: function () {
            this.showOrderDetail = false;
        },
        showOrder: function () {
            this.showOrderDetail = true;
        }
    }
});
var graph = echarts.init(document.getElementById('graph'));

option = {
    title: {
        text: "销售趋势榜",
        top: 15,
        left: 20
    },
    color: ['#7979F8'],
    tooltip: {
        trigger: 'axis',
        axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: [{
        type: 'category',
        data: ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
        axisTick: {
            alignWithLabel: true
        }
    }],
    yAxis: [{
        type: 'value'
    }],
    series: [{
        name: '本月销售额',
        type: 'bar',
        barWidth: '60%',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }]
};
graph.setOption(option);


function getWorkData() {
    // alert(111111);
    $.ajax({
        type: "GET",
        dataType: "json",
        url: 'http://127.0.0.1:8000/platform/auth/work/',
        contentType: "application/json",
        headers: {
            'Content-Type': 'application/json;charset=utf8',
            'token': localStorage.getItem('token')
        },
        success: function (result) {
            if (result.code == 200) {
                var total = document.getElementById("total");
                var today = document.getElementById("today");
                var day = document.getElementById("day");
                total.innerText = result.data.total / 100;
                today.innerText = result.data.today / 100;
                day.innerText = result.data.day / 100;

                option.series[0].data = result.data.trend;
                graph.setOption(option);
                // console.log(option)
            } else {
                alert("token");
                window.location.href = 'index.html'
            }
        }
    });
}

function getOrderInfo(leftApp) {
    $.ajax({
        type: "GET",
        dataType: "json",
        url: 'http://127.0.0.1:8000/platform/auth/store/list',
        contentType: "application/json",
        headers: {
            'Content-Type': 'application/json;charset=utf8',
            'token': localStorage.getItem('token')
        },
        success: function (result) {
            if (result.code == 200) {
                leftApp.storeList = result.data;
            } else {
                alert("token");
                window.location.href = 'index.html'
            }
        }
    });
}

var flag = 0; // 判断是否更新过门店列表
function listen() {
    if (flag == 0 && leftApp.active == 2) {
        getOrderInfo(leftApp);
        flag = 1;
    }
}

// $("#editStore").bind("click",function(){
//     var store_id = $(this).attr('data-id');
//     alert(store_id);
// })

setInterval(listen, 1000);
setInterval(getWorkData, 1000);