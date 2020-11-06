1. 构建后台虚拟环境
	python -m venv ai_certificates
2. 激活虚拟环境
3. 安装python fastapi框架
	Fatal error in launcher:
	// 在(ai_certificates) C:\Users\陈小坚\Desktop\python_env\ai_certificates\Scripts> 执行命令，注意先要激活虚拟环境
	python -m pip install fastapi
	python -m pip install uvicorn
	python -m pip list
	python -m pip install python-jose 
	python -m pip install python-multipart  // 上传文件的依赖

4. 创建server.py作为全局控制器
5. 设置服务器图片上传服务器（这个例子是使用本地作为服务器）
	在code文件夹中使用 python -m http.server 7777

6.需要优化的地方：
	- 应该考虑将美颜，背景，服装这些参数存放在本地缓存中，或者app.js中  // 懒得重写了
	