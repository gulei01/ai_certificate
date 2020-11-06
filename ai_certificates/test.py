import time
def get_nowtime():
    ct = time.time()
    local_time = time.localtime(ct)
    nowtime = time.strftime("%Y-%m-%d %H:%M:%S", local_time)
    return nowtime

# ch = 'wx4238d15d5bf87ed9.o6zAJs05T7OnJhgDWiKTjo-UOFcU.099Eh4DeJfwIa29c5dab7e39cdc8fbebb33b4f212ce0.jpg'
# temp = ch.split('.')
# if temp[len(temp)-1]  in ["png", "jpg"]:
#     print("yes")
# else:
#     print("no")
# import cv2

# def get_water():
#     # 黑底白字
#     src = cv2.imread('水印图.jpg')  # 默认的彩色图(IMREAD_COLOR)方式读入原始图像
#     # black.jpg
#     mask = cv2.imread('di.jpg', cv2.IMREAD_GRAYSCALE)  # 灰度图(IMREAD_GRAYSCALE)方式读入水印蒙版图像
#     # 参数：目标修复图像; 蒙版图（定位修复区域）; 选取邻域半径; 修复算法(包括INPAINT_TELEA/INPAINT_NS， 前者算法效果较好)
#     dst = cv2.inpaint(src, mask, 3, cv2.INPAINT_NS)

#     cv2.imwrite('result1.jpg', dst)

# get_water()

import base64,uuid
def convert(img_url):
    with open(img_url, 'wb') as f:
        base64_data = base64.b64encode(f.read())
        res = base64_data.decode()
        return res

import time

localtime = time.localtime(time.time())
print(localtime)
print(localtime.tm_year)
print(localtime.tm_mon)
print(localtime.tm_mday)
print(localtime.tm_yday)