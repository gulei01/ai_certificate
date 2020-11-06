from jose.exceptions import ExpiredSignatureError, JWTError
from jose import jwt
from datetime import datetime, timedelta

# 密钥
SECRET_KEY = "(-ASp+_)-Ulhw0848hnvVG-iqKyJSD&*&^-H3C9mqEqSl8KN-YRzRE"


def generate_token(user_id):        # 对user_id进行加密
    expire = datetime.utcnow() + timedelta(minutes=60)  # 过期时间：现在时间+有效时间
    to_encode = {"exp": expire, "user_id": user_id}
    # 生成token
    token = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    print(token)
    return token

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms="HS256")
        # print(payload["user_id"])
        return payload["user_id"]
    # 当然两个异常捕获也可以写在一起，不区分
    except ExpiredSignatureError as e:
        print("token过期")
    except JWTError as e:
        print("token验证失败")
    return None

token = generate_token("1233445")
verify_token(token)
