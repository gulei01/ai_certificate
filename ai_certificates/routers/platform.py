from fastapi import APIRouter, Header, File, UploadFile
from utils import security, database
from pydantic import BaseModel
import time

router = APIRouter()

def get_nowtime():
    ct = time.time()
    local_time = time.localtime(ct)
    nowtime = time.strftime("%Y-%m-%d %H:%M:%S", local_time)
    return nowtime

class login_item(BaseModel):
    userPhone: str
    userPassword: str

@router.post("/platform/open/user/login", tags=["platform"])
async def login(item:login_item):
    user_phone = item.userPhone
    user_password = item.userPassword
    print('user_phone' + user_phone)
    sql = "select user_id from t_user_info where user_phone=%s and user_password=%s"
    mysql = database.db_helper()
    query_data = mysql.query(sql,[user_phone,user_password])
    print(query_data)
    if len(query_data) > 0:
        user_id = query_data[0][0]
        token = security.generate_token(user_id)
        return {
            "code": 200,
            "msg": "登录成功",
            "data":{
                "token": token
            }
        }
    else:
        return {"code": 202, "msg":"登录失败"}

@router.get("/platform/auth/work/", tags=["platform"])
async def get_work(token:str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        sql = "select order_money,create_at from t_order_info"
        mysql = database.db_helper()
        query_data = mysql.query(sql, [])
        today = total = month_total = 0
        trend = [0,0,0,0,0,0,0,0,0,0,0,0]
        visited = []
        for i in query_data:
            total += i[0]
            if i[1].day == time.localtime(time.time()).tm_mday:
                today += i[0]
            trend[i[1].month-1] += i[0]/100
        return {
            "code": 200,
            "msg": "请求成功",
            "data": {
                "today": today,
                "total": total,
                "day": today,
                "trend": trend
            }
        }
    else:
        return {"code":202, "msg": "token过期"}


@router.get("/platform/auth/store/list", tags=["platform"])
async def get_store_list(token : str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        sql = "select user_id, store_id,store_address, store_name, store_contact_name, \
            store_contact_phone from t_store_info"
        mysql = database.db_helper()
        query_data = mysql.query(sql,[])
        data = []
        for i in query_data:
            user_id = i[0]
            sql = "select user_phone,user_password from t_user_info where user_id=%s"
            myql = database.db_helper()
            query_data_second = mysql.query(sql, [user_id])
            print("password:", query_data_second)
            temp = {
                "store_id": i[1],
                "store_address": i[2],
                "store_name": i[3],
                "store_contact_name": i[4],
                "store_contact_phone": i[5],
                "user_phone": query_data_second[0][0],
                "user_password": query_data_second[0][1],
            }
            data.append(temp)
        return {"code": 200, "msg": "请求成功", "data": data}
    else:
        return {"code": 202, "msg": "token过期"}

# @router.post("/platform/auth/store/add", tags=["platform"]) 
# async def add_store():
@router.get("/platform/auth/store/detail/{store_id}", tags=["platform"])
async def get_store_detail(store_id:str, token: str = Header(None)):
    user_id = security.verify_token(token)
    if user_id:
        sql = "select store_address, store_name,store_contact_name, store_contact_phone, \
            user_id from t_store_info where store_id=%s"
        mysql = database.db_helper()
        query_data = mysql.query(sql, [store_id])
        user_id = query_data[0][4]
        sql = "select user_phone,user_password from t_user_info where user_id=%s"
        query_data_temp = mysql.query(sql, [user_id])
        data = {
            "store_address": query_data[0][0],
            "store_name": query_data[0][1],
            "store_contact_name": query_data[0][2],
            "store_contact_phone": query_data[0][3],
            "user_phone": query_data_temp[0][0],
            "user_password": query_data_temp[0][1],
        }
        return {"code":200, "msg": "请求成功", "data":data}
    else:
        return {"cide": 202, "msg": "token失效"}

