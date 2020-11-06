let input_list = document.getElementsByTagName("input")
for (i = 0; i < input_list.length; i++) {
    //获取焦点
    input_list[i].addEventListener("focus", function () {
        let pa = this.parentNode;
        pa.classList.add('focus');
    }, true);
    //失去焦点， 注意要使用this，作用域还不清楚
    input_list[i].addEventListener("blur", function () {
        if (this.value == "") {
            let pa = this.parentNode;
            pa.classList.remove('focus')
        }
    }, true)
}

function login(){
    var userPhone = document.getElementById("userPhone").value;
    var userPassword = document.getElementById("userPassword").value;
    $.ajax({
        type: "POST",
        dataType: "json",
        url: 'http://127.0.0.1:8000/platform/open/user/login',
        contentType: "application/json",
        data:JSON.stringify({
            "userPhone": userPhone,
            "userPassword": userPassword
        }),
        success: function (result) {
            if (result.code == 200){
                localStorage.setItem('token', result.data.token);
                console.log(localStorage.getItem('token'));
                window.location.href = 'main.html';
            }else{
                alert("登录失败");
            }
        }
    });
}