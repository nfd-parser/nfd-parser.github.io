# 响应格式说明

NFD Parser API 的所有响应都遵循统一的 JSON 格式。

## 基本响应结构

所有 API 响应都包含以下字段：

```json
{
  "code": 200,
  "msg": "success",
  "success": true,
  "count": 0,
  "data": {},
  "timestamp": 1726637151902
}
```

### 字段说明

| 字段 | 类型 | 描述 |
|------|------|------|
| code | number | HTTP状态码 |
| msg | string | 响应消息 |
| success | boolean | 请求是否成功 |
| count | number | 数据项数量（用于列表响应） |
| data | object/array | 响应数据 |
| timestamp | number | 响应时间戳 |

## 文件解析响应

### 成功响应

```json
{
  "code": 200,
  "msg": "success",
  "success": true,
  "count": 0,
  "data": {
    "shareKey": "lz:abc123",
    "directLink": "https://example.com/download/file.zip",
    "cacheHit": true,
    "expires": "2024-09-18 01:48:02",
    "expiration": 1726638482825
  },
  "timestamp": 1726637151902
}
```

### 数据字段说明

| 字段 | 类型 | 描述 |
|------|------|------|
| shareKey | string | 分享链接的唯一标识 |
| directLink | string | 解析后的直链地址 |
| cacheHit | boolean | 是否命中缓存 |
| expires | string | 链接过期时间（人类可读） |
| expiration | number | 链接过期时间戳 |

## 文件夹解析响应

```json
{
  "code": 200,
  "msg": "success",
  "success": true,
  "data": [
    {
      "fileName": "document.pdf",
      "fileId": "abc123",
      "fileIcon": null,
      "size": 1048576,
      "sizeStr": "1 MB",
      "fileType": "file",
      "filePath": "/folder/document.pdf",
      "createTime": "2小时前",
      "updateTime": null,
      "createBy": null,
      "description": null,
      "downloadCount": "10",
      "panType": "lz",
      "parserUrl": "https://api.example.com/d/lz/abc123",
      "extParameters": null
    }
  ]
}
```

### 文件对象字段说明

| 字段 | 类型 | 描述 |
|------|------|------|
| fileName | string | 文件名 |
| fileId | string | 文件ID |
| fileIcon | string | 文件图标URL |
| size | number | 文件大小（字节） |
| sizeStr | string | 文件大小（人类可读） |
| fileType | string | 文件类型（file/folder） |
| filePath | string | 文件路径 |
| createTime | string | 创建时间 |
| updateTime | string | 更新时间 |
| downloadCount | string | 下载次数 |
| panType | string | 网盘类型标识 |
| parserUrl | string | 解析URL |

## 链接详情响应

```json
{
  "code": 200,
  "msg": "success",
  "success": true,
  "data": {
    "downLink": "https://api.example.com/d/lz/abc123",
    "apiLink": "https://api.example.com/json/lz/abc123",
    "cacheHitTotal": 15,
    "parserTotal": 3,
    "sumTotal": 18,
    "shareLinkInfo": {
      "shareKey": "abc123",
      "panName": "蓝奏云",
      "type": "lz",
      "sharePassword": "",
      "shareUrl": "https://lanzoux.com/abc123",
      "standardUrl": "https://lanzoux.com/abc123",
      "otherParam": {
        "UA": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      "cacheKey": "lz:abc123"
    }
  }
}
```

## 错误响应

```json
{
  "code": 400,
  "msg": "无效的分享链接",
  "success": false,
  "timestamp": 1726637151902
}
```

### 常见错误消息

- `无效的分享链接` - 提供的链接格式不正确
- `分享链接不存在或已过期` - 链接无效或过期  
- `密码错误` - 提供的密码不正确
- `请求过于频繁` - 触发了频率限制
- `服务器内部错误` - 服务器处理出错