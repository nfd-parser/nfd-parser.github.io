# API 接口详细文档

## 概述

NFD Parser 提供 RESTful API 接口，支持解析多种网盘分享链接并获取直链。

## 基础信息

- **Base URL**: `http://your_host:6400`
- **默认端口**: 6400
- **响应格式**: JSON
- **字符编码**: UTF-8

## 接口认证

目前所有接口均为公开接口，无需认证。

## 接口列表

### 1. 文件解析接口

#### 1.1 通用解析接口
**接口地址**: `/parser`  
**请求方法**: GET  
**接口描述**: 解析分享链接并自动跳转到下载地址

**请求参数**:
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| url | string | 是 | 分享链接(建议URL编码) |
| pwd | string | 否 | 分享密码 |

**响应**: 302重定向到下载链接

**示例**:
```
GET /parser?url=https%3A//lanzoux.com/ia2cntg
GET /parser?url=https://v2.fangcloud.com/sharing/e5079007dc31226096628870c7&pwd=QAIU
```

#### 1.2 JSON解析接口
**接口地址**: `/json/parser`  
**请求方法**: GET  
**接口描述**: 解析分享链接并返回JSON格式的直链信息

**请求参数**:
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| url | string | 是 | 分享链接 |
| pwd | string | 否 | 分享密码 |

**响应参数**:
| 参数名 | 类型 | 描述 |
|--------|------|------|
| code | number | 状态码，200为成功 |
| msg | string | 响应消息 |
| success | boolean | 是否成功 |
| data | object | 解析结果数据 |
| data.shareKey | string | 全局分享key |
| data.directLink | string | 下载直链 |
| data.cacheHit | boolean | 是否为缓存链接 |
| data.expires | string | 缓存到期时间 |
| data.expiration | number | 到期时间戳 |
| timestamp | number | 响应时间戳 |

**示例**:
```
GET /json/parser?url=https://lanzoux.com/ia2cntg
```

### 2. 短链接口

#### 2.1 短链跳转
**接口地址**: `/d/{panType}/{shareKey}[@password]`  
**请求方法**: GET  
**接口描述**: 使用网盘标识和分享key的短链格式直接跳转下载

**路径参数**:
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| panType | string | 是 | 网盘标识(如lz、cow、fc等) |
| shareKey | string | 是 | 分享key |
| password | string | 否 | 分享密码(用@连接) |

**响应**: 302重定向到下载链接

**示例**:
```
GET /d/lz/ia2cntg
GET /d/fc/e5079007dc31226096628870c7@QAIU
```

#### 2.2 短链JSON
**接口地址**: `/json/{panType}/{shareKey}[@password]`  
**请求方法**: GET  
**接口描述**: 使用短链格式返回JSON解析结果

**参数**: 同短链跳转接口

**响应**: 同JSON解析接口

**示例**:
```
GET /json/lz/ia2cntg
GET /json/fc/e5079007dc31226096628870c7@QAIU
```

### 3. 文件夹解析接口

#### 3.1 获取文件列表 (v1)
**接口地址**: `/json/getFileList`  
**请求方法**: GET  
**接口描述**: 解析文件夹分享链接，获取文件列表(仅支持蓝奏云/蓝奏优享/小飞机网盘)

**请求参数**:
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| url | string | 是 | 文件夹分享链接 |
| pwd | string | 否 | 分享密码 |

#### 3.2 获取文件列表 (v2)
**接口地址**: `/v2/getFileList`  
**请求方法**: GET  
**接口描述**: 获取文件夹列表(v2版本)

**响应参数**:
| 参数名 | 类型 | 描述 |
|--------|------|------|
| code | number | 状态码 |
| msg | string | 响应消息 |
| success | boolean | 是否成功 |
| data | array | 文件列表 |
| data[].fileName | string | 文件名 |
| data[].fileId | string | 文件ID |
| data[].size | number | 文件大小(字节) |
| data[].sizeStr | string | 文件大小(格式化) |
| data[].fileType | string | 文件类型(file/folder) |
| data[].createTime | string | 创建时间 |
| data[].downloadCount | number | 下载次数 |
| data[].panType | string | 网盘类型 |
| data[].parserUrl | string | 解析URL |

### 4. 信息查询接口

#### 4.1 分享链接详情
**接口地址**: `/v2/linkInfo`  
**请求方法**: GET  
**接口描述**: 获取分享链接的详细信息和统计数据

**请求参数**:
| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| url | string | 是 | 分享链接 |

**响应参数**:
| 参数名 | 类型 | 描述 |
|--------|------|------|
| code | number | 状态码 |
| msg | string | 响应消息 |
| success | boolean | 是否成功 |
| data | object | 链接信息 |
| data.downLink | string | 下载短链 |
| data.apiLink | string | API短链 |
| data.cacheHitTotal | number | 缓存命中总数 |
| data.parserTotal | number | 解析总数 |
| data.sumTotal | number | 总计数 |
| data.shareLinkInfo | object | 分享链接详情 |

#### 4.2 统计信息
**接口地址**: `/v2/statisticsInfo`  
**请求方法**: GET  
**接口描述**: 获取系统解析统计信息

**响应参数**:
| 参数名 | 类型 | 描述 |
|--------|------|------|
| code | number | 状态码 |
| msg | string | 响应消息 |
| success | boolean | 是否成功 |
| data | object | 统计数据 |
| data.parserTotal | number | 解析总数 |
| data.cacheTotal | number | 缓存总数 |
| data.total | number | 总计 |

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |

## 网盘标识对照表

| 网盘名称 | 标识 |
|----------|------|
| 蓝奏云 | lz |
| 蓝奏云优享 | iz |
| 奶牛快传 | cow |
| 移动云云空间 | ec |
| 小飞机网盘 | fj |
| 亿方云 | fc |
| 123云盘 | ye |
| 文叔叔 | ws |
| 联想乐云 | le |
| QQ邮箱文件中转站 | qq |
| 城通网盘 | ct |
| 网易云音乐 | mnes |
| 酷狗音乐 | mkgs |
| 酷我音乐 | mkws |
| QQ音乐 | mqqs |
| Cloudreve | ce |
| 超星云盘 | pcx |
| Google云盘 | pgd |
| Onedrive | pod |
| Dropbox | pdp |
| iCloud | pic |

## 使用限制

1. **请求频率**: 建议不要过于频繁请求，避免IP被封
2. **文件大小**: 部分网盘对大文件有限制
3. **登录要求**: 某些网盘的大文件需要登录
4. **地域限制**: 部分网盘对IP有地域限制

## SDK 示例

### JavaScript/Node.js
```javascript
class NFDParser {
    constructor(baseUrl = 'http://localhost:6400') {
        this.baseUrl = baseUrl;
    }
    
    async parseLink(shareUrl, password = '') {
        const params = new URLSearchParams({ url: shareUrl });
        if (password) params.append('pwd', password);
        
        const response = await fetch(`${this.baseUrl}/json/parser?${params}`);
        return await response.json();
    }
    
    async getFileList(shareUrl, password = '') {
        const params = new URLSearchParams({ url: shareUrl });
        if (password) params.append('pwd', password);
        
        const response = await fetch(`${this.baseUrl}/v2/getFileList?${params}`);
        return await response.json();
    }
    
    async getStatistics() {
        const response = await fetch(`${this.baseUrl}/v2/statisticsInfo`);
        return await response.json();
    }
}
```

### Python
```python
import requests
from urllib.parse import urlencode

class NFDParser:
    def __init__(self, base_url='http://localhost:6400'):
        self.base_url = base_url
    
    def parse_link(self, share_url, password=''):
        params = {'url': share_url}
        if password:
            params['pwd'] = password
        
        response = requests.get(f'{self.base_url}/json/parser', params=params)
        return response.json()
    
    def get_file_list(self, share_url, password=''):
        params = {'url': share_url}
        if password:
            params['pwd'] = password
        
        response = requests.get(f'{self.base_url}/v2/getFileList', params=params)
        return response.json()
    
    def get_statistics(self):
        response = requests.get(f'{self.base_url}/v2/statisticsInfo')
        return response.json()
```

## 注意事项

1. 建议对分享链接进行URL编码
2. 密码参数为可选，无密码时不传该参数
3. 某些网盘需要特定的请求头（如奶牛快传需要Referer）
4. 解析结果可能有缓存，注意expires字段
5. 移动云空间的分享key取分享链接中的data参数