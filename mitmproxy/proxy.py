from mitmproxy import http
import re

# 正则规则：匹配 index-任意字符.css / file_icon-任意字符.css
pattern = re.compile(r"(index|file_icon)-[\w]+\.css(\?.*)?$", re.IGNORECASE)
append_css = """\n.size14, .size14 * {
    font-size: 16px!important; 
}

#app .dom-prettier {
    font-size: 16px!important;
} 

.detail-main__smart-info {
    font-size: 16px!important;
}

.detail-title {
    font-size: 16px!important;
}"""

def response(flow: http.HTTPFlow) -> None:
    url = flow.request.pretty_url
    # 匹配url末尾文件名
    if pattern.search(url):
        # print(f"\n[MITM] 匹配请求 url={url}")
        # 仅处理文本css响应
        if flow.response.content and flow.response.headers.get("Content-Type", "").startswith("text/css"):
            original = flow.response.text
            flow.response.text = original + append_css





