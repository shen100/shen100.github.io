def response(flow):
    if flow.request.pretty_host == "api.tushare.pro":
        flow.request.scheme = "http"
        flow.request.port = 80

        # 强制添加CORS头到响应
        flow.response.headers["Access-Control-Allow-Origin"] = "*"
        flow.response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        flow.response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        flow.response.headers["Access-Control-Allow-Credentials"] = "true"
        
        # 处理预检请求（OPTIONS）
        if flow.request.method == "OPTIONS":
            flow.response.status_code = 200
            flow.response.content = b""