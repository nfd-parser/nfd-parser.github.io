# API 接口详情

本页面详细说明了 NFD Parser 的各种 API 接口的使用方法和参数。

## 通用解析接口

### 基本语法

```
GET /json/parser?url={分享链接}&pwd={密码}
```

### 参数说明

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| url | string | 是 | 需要解析的网盘分享链接（需要URL编码） |
| pwd | string | 否 | 分享链接的密码（如果有） |

### 响应示例

```json
{
  "code": 200,
  "msg": "success",
  "success": true,
  "data": {
    "shareKey": "lz:xxx",
    "directLink": "https://example.com/download/file.zip",
    "cacheHit": true,
    "expires": "2024-09-18 01:48:02",
    "expiration": 1726638482825
  },
  "timestamp": 1726637151902
}
```

## 短链接接口

### 基本语法

```
GET /json/{网盘标识}/{分享key}@{密码}
```

### 网盘标识列表

| 网盘 | 标识 |
|------|------|
| 蓝奏云 | lz |
| 蓝奏云优享 | iz |
| 奶牛快传 | cow |
| 移动云 | ec |
| 小飞机网盘 | fj |

### 使用示例

```bash
# 蓝奏云文件解析
curl "https://api.example.com/json/lz/abc123"

# 带密码的分享
curl "https://api.example.com/json/lz/abc123@password"
```

## 错误响应

当请求失败时，API会返回错误信息：

```json
{
  "code": 400,
  "msg": "无效的分享链接",
  "success": false,
  "timestamp": 1726637151902
}
```

### 常见错误码

| 错误码 | 描述 |
|--------|------|
| 400 | 请求参数错误 |
| 404 | 分享链接不存在或已过期 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |