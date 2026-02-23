# 解析器 API 使用指南

当你部署或在演练场发布解析器后，可以通过以下 API 端点使用。

## 302 重定向（直接下载）

**端点**: `GET /parser`

返回 302 重定向到实际下载地址，适合浏览器直接访问。

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `url` | string | 是 | 分享链接（需 URL 编码） |
| `pwd` | string | 否 | 分享密码 |
| `auth` | string | 否 | 认证参数（AES 加密后的 JSON） |

```bash
# 基本请求
curl -L "http://localhost:6400/parser?url=https://lanzoui.com/i7Aq12ab3cd"

# 带密码
curl -L "http://localhost:6400/parser?url=https://lanzoui.com/i7Aq12ab3cd&pwd=1234"
```

## JSON 响应（获取解析结果）

**端点**: `GET /json/parser`

返回 JSON 格式的解析结果。

```bash
curl "http://localhost:6400/json/parser?url=https://lanzoui.com/i7Aq12ab3cd"
```

**响应格式**:

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "url": "https://download-server.com/file/xxx",
    "fileName": "example.zip",
    "fileSize": "10MB",
    "parseTime": 1234
  }
}
```

## 认证参数（v0.2.1+）

部分网盘需要 Cookie 才能解析，`auth` 参数用于传递认证信息。

- **算法**: AES/ECB/PKCS5Padding
- **密钥**: `nfd_auth_key2026`（16字节）
- **流程**: JSON → AES 加密 → Base64 → URL 编码

```json
{
  "authType": "cookie",
  "token": "your_cookie_here"
}
```

| 网盘 | 认证要求 |
|------|---------|
| 夸克网盘(QK) | **必须** |
| UC网盘(UC) | **必须** |
| 小飞机网盘(FJ) | 大文件需要 |
| 蓝奏优享(IZ) | 大文件需要 |

## 使用场景

### 浏览器直接下载

```html
<a href="http://localhost:6400/parser?url=https://lanzoui.com/i7Aq12ab3cd">
  点击下载
</a>
```

### JavaScript 获取链接

```javascript
fetch('http://localhost:6400/json/parser?url=' + encodeURIComponent(shareUrl))
  .then(res => res.json())
  .then(data => {
    console.log('下载链接:', data.data.url);
  });
```

### Python 脚本

```python
import requests

response = requests.get(
    'http://localhost:6400/json/parser',
    params={'url': 'https://lanzoui.com/i7Aq12ab3cd', 'pwd': '1234'}
)
result = response.json()
if result['code'] == 200:
    print(f'下载链接: {result["data"]["url"]}')
```

## 高级用法

### 获取文件列表

```bash
GET http://localhost:6400/json/parser/list?url=https://example.com/s/abc
```

### 按文件 ID 下载

```bash
GET http://localhost:6400/json/parser/file?url=https://example.com/s/abc&fileId=123
```

## 错误处理

| 错误码 | 说明 | 解决方法 |
|--------|------|---------|
| 400 | 参数错误 | 检查 url 参数是否正确编码 |
| 404 | 未找到解析器 | 确认链接格式是否匹配 |
| 500 | 解析失败 | 查看日志 |
| 503 | 服务不可用 | 稍后重试 |

## 最佳实践

1. **URL 编码**: 始终对分享链接进行 `encodeURIComponent`
2. **错误重试**: 实现指数退避重试策略
3. **超时设置**: 建议设置 30 秒超时
4. **速率限制**: 避免频繁请求
