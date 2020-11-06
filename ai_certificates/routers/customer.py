from fastapi import APIRouter, Header, File, UploadFile
from utils import security, database
from pydantic import BaseModel
import string
import random
import time
import os
from typing import List
import uuid


router = APIRouter()


class User_login_item(BaseModel):
    userPhone: str
    userPassword: str


class User_reg_item(BaseModel):
    userPhone: str
    userPassword: str
    smsCode: str


class mod_address_item(BaseModel):
    address_id: str
    accept_user: str
    accept_phone: str
    accept_address: str


class mod_userpassword_item(BaseModel):
    userPhone: str
    userPassword: str
    smsCode: str


class add_address_item(BaseModel):
    accept_user: str
    accept_phone: str
    accept_address: str


class add_cart_item(BaseModel):
    wm_photo: str
    bgcolor: str
    spec_text: str
    pixel: str


class order_detail_item(BaseModel):
    order_photo_type: str
    order_photo_size: str
    order_photo_bgcolor: str
    order_photo_num: str
    order_photo_price: str
    order_wm_photo: str


class order_info_item(BaseModel):
    order_money: str
    order_accept_name: str = None
    order_accept_phone: str = None
    order_accept_address: str = None
    order_status: str = '0'
    store_name: str = None
    store_address: str = None
    store_contact_phone: str = None
    store_contact_name: str = None
    order_type: str
    order_data: List[order_detail_item] = []


def get_nowtime():
    ct = time.time()
    local_time = time.localtime(ct)
    nowtime = time.strftime("%Y-%m-%d %H:%M:%S", local_time)
    return nowtime


sms_userPhone_dict = {}


@router.post("/customer/open/user/login/", tags=["customer"])
async def user_login(item: User_login_item):
    user_phone = item.userPhone
    user_password = item.userPassword
    mysql = database.db_helper()
    mysql.connect_database()
    params = [user_phone, user_password]
    sql = "select user_id from t_user_info where user_phone=%s and user_password=%s"
    query_data = mysql.query(sql, params)
    if len(query_data) == 1:
        user_id = query_data[0][0]
        token = security.generate_token(user_id)        # 对user_id进行加密生成token
        data = {
            "token": token,
        }
        response_data = {
            "code": 200,
            "msg": "登录成功",
            "data": data
        }
        return response_data
    else:
        return {"code": 200, "msg": "登录失败"}


@router.get("/customer/open/common/createsms/{user_phone}", tags=["customer"])
async def common_createsms(user_phone):
    seeds = string.digits
    random_str = random.choices(seeds, k=4)
    sms = "".join(random_str)
    sms_userPhone_dict[user_phone] = sms
    print("验证码字典：", sms_userPhone_dict)
    return {
        "code": 200,
        "msg": "请求成功",
        "data": {
            "sms": sms
        }
    }


@router.post("/customer/open/user/reg/", tags=["customer"])
async def user_reg(item: User_reg_item):
    sms = item.smsCode
    user_phone = item.userPhone
    user_password = item.userPassword
    # 先判断user_phone是否存在keys中，然后在判断是否相同
    if user_phone in sms_userPhone_dict.keys():
        if sms == sms_userPhone_dict[user_phone]:
            sms_userPhone_dict.pop(user_phone)
            sql = "select * from t_user_info where user_phone=%s"
            params = [user_phone]
            mysql = database.db_helper()
            # 判断手机号是否被注册过
            if len(mysql.query(sql, params)) == 0:
                user_type = 1  # 表示顾客
                create_at = update_at = get_nowtime()
                params = [user_phone, user_password,
                          user_type, create_at, update_at]
                sql = "insert into t_user_info(user_phone, user_password, user_type,create_at,update_at) values(%s, %s, %s, %s,%s)"
                mysql = database.db_helper()
                mysql.connect_database()
                if mysql.execute(sql, params):
                    token = security.generate_token(user_phone)
                    return {
                        "code": 200,
                        "msg": "注册成功",
                        "data": {
                            "token": token
                        }
                    }
                else:
                    return {
                        "code": 500,
                        "msg": "注册失败",
                    }
            else:
                return {
                    "code": 200,
                    "msg": "手机号已经被注册"
                }
        else:
            return {
                "code": 200,
                "msg": "验证码错误"
            }


@router.get("/customer/auth/personal/msg", tags=["customer"])
async def get_personal_msg(*, token: str = Header(None)):
    user_id = security.verify_token(token)          # 将token解码为user_id
    if user_id:
        sql = "select user_phone, user_logo,user_name from t_user_info where user_id=%s"
        params = [user_id]
        mysql = database.db_helper()
        query_data = mysql.query(sql, params)
        if len(query_data) == 1:
            user_phone = query_data[0][0]
            user_logo = query_data[0][1]
            user_name = query_data[0][2]
            return {
                "code": 200,
                "msg": "请求成功",
                "data": {
                    "user_phone": user_phone,
                    "user_logo": user_logo,
                    "user_name": user_name,
                    "user_id": user_id
                }
            }
        else:
            return {"code": 201, "msg": "请求失败"}
    else:
        return {"code": 202, "msg": "token失效"}


@router.get("/customer/auth/personal/modUserName", tags=["customer"])
async def mod_username(userName: str, token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        user_name = userName
        print(user_name)
        sql = "update t_user_info set user_name=%s where user_id=%s"
        params = [user_name, user_id]
        mysql = database.db_helper()
        if mysql.execute(sql, params):
            return {"code": 200, "msg": "修改成功"}
        else:
            return {"code": 201, "msg": "修改失败"}
    else:
        return {"code": 202, "msg": "token失效"}


@router.get("/customer/auth/personal/getAddress", tags=["customer"])
async def get_address(*, token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        sql = "select address_id, accept_user,accept_phone,accept_address from t_address_info where user_id=%s"
        params = [user_id]
        mysql = database.db_helper()
        query_data = mysql.query(sql, params)
        address_info = []
        for i in query_data:
            item = {
                "address_id": i[0],
                "accept_user": i[1],
                "accept_phone": i[2],
                "accept_address": i[3],
            }
            address_info.append(item)
        return {
            "code": 200,
            "msg": "请求成功",
            "data": {
                "address_info": address_info
            }
        }
    else:
        return {"code": 202, "msg": "token失效"}


@router.get("/customer/auth/personal/delAddress", tags=["customer"])
async def del_address(address_id: str, token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        sql = "delete from t_address_info where address_id=%s"
        params = [address_id]
        mysql = database.db_helper()
        if mysql.execute(sql, params):
            return {"code": 200, "msg": "删除成功"}
        else:
            return {"code": 201, "msg": "删除失败"}
    else:
        return {"code": 202, "msg": "token失效"}


@router.post("/customer/auth/personal/modAddress", tags=["customer"])
async def mod_address(item: mod_address_item, token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        address_id = item.address_id
        accept_user = item.accept_user
        accept_phone = item.accept_phone
        accept_address = item.accept_address
        sql = "update t_address_info set accept_user=%s, accept_phone=%s, accept_address=%s where address_id=%s"
        params = [accept_user, accept_phone, accept_address, address_id]
        mysql = database.db_helper()
        if mysql.execute(sql, params):
            return {"code": 200, "msg": "修改成功"}
        else:
            return {"code": 201, "msg": "修改失败"}

    else:
        return {"code": 202, "msg": "token失效"}


@router.post("/customer/auth/personal/addAddress", tags=["customer"])
async def add_address(item: add_address_item, token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        accept_user = item.accept_user
        accept_phone = item.accept_phone
        accept_address = item.accept_address
        sql = "insert into t_address_info(accept_user,accept_phone,accept_address, user_id) values(%s,%s,%s,%s)"
        params = [accept_user, accept_phone, accept_address, user_id]
        mysql = database.db_helper()
        if mysql.execute(sql, params):
            return {"code": 200, "msg": "增加成功"}
        else:
            return {"code": 201, "msg": "增加失败"}
    else:
        return {"code": 202, "msg": "token失效"}


@router.post("/customer/auth/personal/modUserPassword", tags=["customer"])
async def mod_user_password(item: mod_userpassword_item, token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        user_phone = item.userPhone
        user_password = item.userPassword
        smsCode = item.smsCode
        # 判断验证码是否是一致
        if smsCode == sms_userPhone_dict[user_phone]:
            sms_userPhone_dict.pop(user_phone)
            sql = "update t_user_info set user_password=%s where user_phone=%s"
            params = [user_password, user_phone]
            mysql = database.db_helper()
            if mysql.execute(sql, params):
                return {"code": 200, "msg": "修改成功"}
            else:
                return {"code": 201, "msg": "修改失败"}
        else:
            return {"code": 203, "msg": "验证码错误"}
    else:
        return {"code": 202, "msg": "token失效"}


@router.post("/customer/auth/personal/modLogo", tags=["customer"])
async def modLogo(file: UploadFile = File(...), token: str = Header(None)):
    user_id = security.verify_token(token)
    print(user_id)
    if user_id:
        filename = file.filename
        temp = filename.split('.')
        if temp[len(temp)-1] not in ["png", "jpg"]:    # 不是png，jpg
            return {"code": 203, "msg": "不支持的图片格式"}
        else:
            try:
                res = await file.read()
                with open("upload_img/" + filename, "wb") as f:
                    f.write(res)
                img_url = "http://127.0.0.1:7777/upload_img/"+filename
                sql = "update t_user_info set user_logo=%s where user_id=%s"
                params = [img_url, user_id]
                mysql = database.db_helper()
                if mysql.execute(sql, params):
                    return {
                        "code": 200,
                        "msg": "上传成功",
                        "data": {
                            "img_url": img_url
                        }
                    }
                else:
                    os.remove("upload_img/"+filename)
                    return {"code": 201, "msg": "上传失败"}
            except Exception as e:
                return {"code": 201, "msg": "上传失败"}
    else:
        return {"code": 202, "msg": "token失效"}


@router.post("/customer/auth/photo/upload", tags=["customer"])
async def upload(file: UploadFile = File(...), token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        filename = file.filename
        temp = filename.split('.')
        if temp[len(temp)-1] in ["png", "jpg"]:
            try:
                res = await file.read()
                with open('upload_img/'+filename, 'wb') as f:
                    f.write(res)
                img_url = "http://127.0.0.1:7777/upload_img/"+filename
                return {
                    "code": 200,
                    "msg": "上传成功",
                    "data": {
                        "img_url": img_url
                    }
                }
            except Exception as e:
                print(e)
                return {"code": 201, "msg": "上传失败"}
        else:
            return {"code": 203, "msg": "不支持的图片格式"}
    else:
        return {"code": 202, "msg": "token失效"}


@router.post("/customer/auth/cart/addcart", tags=["customer"])
async def add_cart(item: add_cart_item, token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        print("add_cart_item is :", item)
        wm_photo = item.wm_photo
        bgcolor = item.bgcolor
        spec_text = item.spec_text
        pixel = item.pixel
        sql = "insert into t_user_cart(user_id, cart_user_watermarking_photo, \
               cart_photo_bgcolor,cart_photo_spec_text,cart_photo_pixel) values(%s,%s,%s,%s,%s)"
        params = [user_id, wm_photo, bgcolor, spec_text, pixel]
        mysql = database.db_helper()
        if mysql.execute(sql, params):
            sql = "select max(cart_id) from t_user_cart"
            query_data = mysql.query(sql)
            cart_id = query_data[0][0]
            print("query data is: ", query_data)
            return {
                "code": 200,
                "msg": "增加成功",
                "data": {
                    "cart_id": cart_id
                }
            }
        else:
            return {"code": 201, "msg": "增加失败"}
    else:
        return {"code": 202, "msg": "token失效"}


@router.get("/customer/auth/cart/delcart/{cart_id}", tags=["customer"])
async def del_cart(cart_id: str, token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        sql = "delete from t_user_cart where cart_id=%s"
        params = [cart_id]
        mysql = database.db_helper()
        if mysql.execute(sql, params):
            return {"code": 200, "msg": "删除成功"}
        else:
            return {"code": 201, "msg": "删除失败"}
    else:
        return {"code": 202, "msg": "token失效"}


@router.post("/customer/auth/order/pay", tags=["customer"])
async def order_pay(item: order_info_item, token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        order_id = uuid.uuid1().hex
        order_money = item.order_money
        order_accept_name = item.order_accept_name
        order_accept_phone = item.order_accept_phone
        order_accept_address = item.order_accept_address
        order_status = item.order_status
        store_name = item.store_name
        store_address = item.store_address
        store_contact_phone = item.store_contact_phone
        store_contact_name = item.store_contact_name
        order_type = item.order_type
        order_data = item.order_data
        create_at = get_nowtime()
        #
        sql = "insert into t_order_info(order_id, user_id, order_money, \
               order_accept_name,order_accept_phone,order_accept_address,\
               order_status, store_name, store_address, store_contact_phone,\
               store_contact_name, order_type,  create_at) values \
               (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
        params = [
            order_id, user_id, order_money, order_accept_name,
            order_accept_phone, order_accept_address, order_status,
            store_name, store_address, store_contact_phone,
            store_contact_name, order_type, create_at
        ]
        mysql = database.db_helper()
        if mysql.execute(sql, params):
            print("insert into t_order_info success")
            sql = "insert into t_order_detail(order_id, user_id, order_photo_type, \
                  order_photo_size, order_photo_bgcolor, order_photo_num, order_photo_price,\
                  order_wm_photo) values (%s,%s,%s,%s,%s,%s,%s,%s)"
            sql_insert_str = ",(%s,%s,%s,%s,%s,%s,%s,%s)"
            if (len(order_data) >= 2):
                sql += sql_insert_str * (len(order_data)-1)
            params = []
            for i in order_data:
                temp_params = [order_id, user_id]
                temp_params.append(i.order_photo_type)
                temp_params.append(i.order_photo_size)
                temp_params.append(i.order_photo_bgcolor)
                temp_params.append(i.order_photo_num)
                temp_params.append(i.order_photo_price)
                temp_params.append(i.order_wm_photo)
                # print("temp_params is:", temp_params)
                params.extend(temp_params)
            # print("params is:", params)
            mysql = database.db_helper()
            if mysql.execute(sql, params):
                return {"code": 200, "msg": "创建订单成功", "data": {"order_id": order_id, "create_at": create_at}}
            else:
                return {"code": 201, "msg": "接口错误"}
        else:
            return {"code": 201, "msg": "接口错误"}
    else:
        return {"code": 202, "msg": "token失效"}


@router.get("/customer/auth/order/modorderstatus/{order_id}", tags=["customer"])
async def mod_order_status(order_id: str, token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        sql = "update t_order_info set order_status=1 where order_id=%s"
        params = [order_id]
        mysql = database.db_helper()
        if mysql.execute(sql, params):
            return {"code": 200, "msg": "支付成功"}
        else:
            return {"code": 201, "msg": "支付失败"}
    else:
        return {"code": 202, "msg": "token失效"}


@router.get("/customer/auth/store/list", tags=["customer"])
async def get_store_list(token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        sql = "select store_name, store_address,store_contact_name,store_contact_phone, \
                store_id from t_store_info"
        params = []
        mysql = database.db_helper()
        query_data = mysql.query(sql, params)
        print(query_data)
        data = []
        for i in query_data:
            temp = {
                "store_name": i[0],
                "store_address": i[1],
                "store_contact_name": i[2],
                "store_contact_phone": i[3],
                "store_id": i[4]
            }
            data.append(temp)
        return {"code": 200, "msg": "业务成功", "data": data}
    else:
        return {"code": 202, "msg": "token失效"}


@router.get("/customer/auth/order/detail/{order_id}", tags=["customer"])
async def get_order_detail(order_id: str, token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        sql = "select order_photo_type,order_photo_size,order_photo_bgcolor,order_photo_num, \
            order_photo_price,order_wm_photo from t_order_detail where order_id=%s"
        params = [order_id]
        mysql = database.db_helper()
        query_data = mysql.query(sql, params)
        print(query_data)
        data = []
        for i in query_data:
            temp = {
                "order_id": order_id,
                "order_photo_type": i[0],
                "order_photo_size": i[1],
                "order_photo_bgcolor": i[2],
                "order_photo_num": i[3],
                "order_photo_price": i[4],
                "order_wm_photo": i[5]
            }
            data.append(temp)
        print(query_data)
        return {"code": 200, "msg": "业务成功", "data": data}
    else:
        return {"code": 202, "msg": "token失效"}


@router.get("/customer/auth/order/all", tags=["customer"])
async def get_order_all(token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        sql = "select order_id, order_money,order_type, order_accept_name, \
            order_accept_address, order_accept_phone, create_at, order_status,\
            store_name, store_address, store_contact_name, store_contact_phone \
            from t_order_info where user_id=%s order by create_at desc"
        mysql = database.db_helper()
        query_data = mysql.query(sql, [user_id])
        data = []
        for i in query_data:
            temp = {
                "order_id": i[0],
                "order_money": i[1],
                "order_type": i[2],
                "order_accept_name": i[3],
                "order_accept_address": i[4],
                "order_accept_phone": i[5],
                "create_at": i[6],
                "order_status": i[7],
                "store_name": i[8],
                "store_address": i[9],
                "store_contact_name": i[10],
                "store_contact_phone": i[11],
            }
            data.append(temp)
            print(data)
        return {"code": 200, "msg": "请求成功", "data": data}
    else:
        return {"code": 202, "msg": "token失效"}


@router.get("/customer/auth/cart/all", tags=["customer"])
async def get_cart_all(token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        sql = "select cart_id, cart_photo_pixel,cart_photo_bgcolor,cart_user_watermarking_photo,\
            cart_photo_spec_text from t_user_cart where user_id=%s"
        mysql = database.db_helper()
        query_data = mysql.query(sql, [user_id])
        data = []
        for i in query_data:
            temp = {
                "cart_id": i[0],
                "pixel": i[1],
                "bgcolor": i[2],
                "img_url": i[3],
                "spec_text": i[4],
            }
            data.append(temp)
        return {"code": 200, "msg": "请求成功", "data": data}
    return {"code": 202, "msg": "token失效"}


    