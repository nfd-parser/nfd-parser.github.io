# API 接口文档

## 概述

NFD Parser 提供 RESTful API 接口，支持解析多种网盘分享链接并获取直链。

## 基础信息

- **默认端口**: 
  - `6400` — API 服务端口（建议使用 Nginx 代理）
  - `6401` — 内置 Web 解析工具（个人使用可直接开放此端口）
- **响应格式**: JSON
- **字符编码**: UTF-8

## 接口列表

### 1. 302 自动跳转下载

#### 通用接口

```
GET /parser?url={分享链接}&pwd={密码}
```

#### 标志短链

```
GET /d/{网盘标识}/{分享key}@{密码}
```

### 2. 获取直链 JSON

#### 通用接口

```
GET /json/parser?url={分享链接}&pwd={密码}
```

#### 标志短链

```
GET /json/{网盘标识}/{分享key}@{密码}
```

### 3. 文件夹解析（v0.1.8fixed3+）

```
GET /json/getFileList?url={分享链接}&pwd={密码}
```

v2 版本：

```
GET /v2/getFileList?url={分享链接}&pwd={密码}
```

### 4. 分享链接详情

```
GET /v2/linkInfo?url={分享链接}
```

### 5. 解析统计信息

```
GET /v2/statisticsInfo
```

## 使用规则

- `{分享链接}` 建议使用 URL 编码
- `{密码}` 无密码时省略 `&pwd=` 或 `@密码` 部分
- `{网盘标识}` 参考下方支持的网盘列表
- `your_host` 替换为您的域名或 IP

## 认证参数（v0.2.1+）

部分网盘（如夸克、UC）需要登录后的 Cookie 才能解析和下载。可通过 `auth` 参数传递认证信息。

### 参数格式

`auth` 参数值为 AES 加密后的 JSON 字符串，经过 Base64 编码和 URL 编码。

### 加密方式

- **算法**: AES/ECB/PKCS5Padding
- **密钥**: `nfd_auth_key2026`（16字节）
- **流程**: JSON → AES加密 → Base64 → URL编码

### JSON 结构

```json
{
  "authType": "cookie",
  "token": "your_cookie_here",
  "username": "",
  "password": "",
  "ext1": "",
  "ext2": ""
}
```

| 字段 | 说明 |
|------|------|
| `authType` | 认证类型: `cookie` / `accesstoken` / `authorization` / `password` / `custom` |
| `token` | Cookie 或 Token 内容 |
| `username` | 用户名（`password` 类型时使用） |
| `password` | 密码（`password` 类型时使用） |
| `ext1` | 扩展字段1（`custom` 类型时使用） |
| `ext2` | 扩展字段2（`custom` 类型时使用） |

### 网盘认证要求

| 网盘 | 认证要求 | 说明 |
|------|---------|------|
| 夸克网盘(QK) | **必须** | 必须配置 Cookie 才能解析 |
| UC网盘(UC) | **必须** | 必须配置 Cookie 才能解析 |
| 小飞机网盘(FJ) | 可选 | 大文件（>100MB）需要认证 |
| 蓝奏优享(IZ) | 可选 | 大文件需要认证 |

### 使用示例

```
GET /parser?url={分享链接}&pwd={密码}&auth={加密后的认证参数}
```

::: tip 提示
Web 界面已内置认证配置功能，可自动处理加密过程，无需手动构造参数。
:::

## 密钥说明

### `server.authEncryptKey`
- **作用**: 用于 `auth` 参数的 AES 加解密
- **要求**: 16位（AES-128）

### `server.donatedAccountFailureTokenSignKey`
- **作用**: 用于"捐赠账号失败计数 token"的 HMAC 签名/验签
- **目的**: 防止客户端伪造失败计数请求
- **建议**: 使用高强度随机字符串，且不要与 `authEncryptKey` 相同

## JSON 响应格式

### 文件解析响应

```json
{
  "code": 200,
  "msg": "success",
  "success": true,
  "count": 0,
  "data": {
    "shareKey": "lz:xxx",
    "directLink": "下载直链",
    "cacheHit": true,
    "expires": "2024-09-18 01:48:02",
    "expiration": 1726638482825
  },
  "timestamp": 1726637151902
}
```

| 参数名 | 类型 | 描述 |
|--------|------|------|
| code | number | 状态码，200为成功 |
| msg | string | 响应消息 |
| success | boolean | 是否成功 |
| data.shareKey | string | 全局分享key |
| data.directLink | string | 下载直链 |
| data.cacheHit | boolean | 是否为缓存链接 |
| data.expires | string | 缓存到期时间 |
| data.expiration | number | 到期时间戳 |

### 分享链接详情响应

```json
{
    "code": 200,
    "msg": "success",
    "success": true,
    "count": 0,
    "data": {
        "downLink": "https://lz0.qaiu.top/d/fj/xx",
        "apiLink": "https://lz0.qaiu.top/json/fj/xx",
        "cacheHitTotal": 5,
        "parserTotal": 2,
        "sumTotal": 7,
        "shareLinkInfo": {
            "shareKey": "xx",
            "panName": "小飞机网盘",
            "type": "fj",
            "sharePassword": "",
            "shareUrl": "https://share.feijipan.com/s/xx",
            "standardUrl": "https://www.feijix.com/s/xx",
            "otherParam": {
                "UA": "Mozilla/5.0 ..."
            },
            "cacheKey": "fj:xx"
        }
    },
    "timestamp": 1736489219402
}
```

### 文件夹解析响应

```json
{
  "code": 200,
  "msg": "success",
  "success": true,
  "data": [
    {
      "fileName": "xxx",
      "fileId": "xxx",
      "fileIcon": null,
      "size": 999,
      "sizeStr": "999 M",
      "fileType": "file/folder",
      "filePath": null,
      "createTime": "17 小时前",
      "updateTime": null,
      "createBy": null,
      "description": null,
      "downloadCount": "下载次数",
      "panType": "lz",
      "parserUrl": "下载链接/文件夹链接",
      "extParameters": null
    }
  ]
}
```

### 统计信息响应

```json
{
    "code": 200,
    "msg": "success",
    "success": true,
    "count": 0,
    "data": {
        "parserTotal": 320508,
        "cacheTotal": 5957910,
        "total": 6278418
    },
    "timestamp": 1736489378770
}
```

## 调用示例

### 302 跳转（通用接口 - 有密码）
```
http://your_host/parser?url=https%3A%2F%2Fwww.ilanzou.com%2Fs%2FlGFndCM&pwd=KMnv
```

### 302 跳转（标志短链 - 有密码）
```
http://your_host/d/iz/lGFndCM@KMnv
```

### 获取 JSON（通用接口 - 无密码）
```
http://your_host/json/parser?url=https%3A%2F%2Fwww.ilanzou.com%2Fs%2FLEBZySxF
```

### 获取 JSON（标志短链 - 无密码）
```
http://your_host/json/iz/LEBZySxF
```

## 错误码说明

| 错误码 | 描述 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 404 | 资源未找到 |
| 500 | 服务器内部错误 |

## 网盘标识对照表

### 文件网盘

| 网盘名称 | 标识 |
|----------|------|
| 蓝奏云 | `lz` |
| 蓝奏云优享 | `iz` |
| 奶牛快传 | `cow` |
| 移动云云空间 | `ec` |
| 小飞机网盘 | `fj` |
| 亿方云 | `fc` |
| 123云盘 | `ye` |
| 文叔叔 | `ws` |
| 联想乐云 | `le` |
| QQ邮箱云盘 | `qqw` |
| QQ闪传 | `qqsc` |
| 城通网盘 | `ct` |
| Cloudreve自建网盘 | `ce` |
| 超星云盘 | `pcx` |
| WPS云文档 | `pwps` |
| Google云盘 | `pgd` |
| Onedrive | `pod` |
| Dropbox | `pdp` |
| iCloud | `pic` |

### 音乐分享

| 平台名称 | 标识 |
|----------|------|
| 网易云音乐 | `mnes` |
| 酷狗音乐 | `mkgs` |
| 酷我音乐 | `mkws` |
| QQ音乐 | `mqqs` |
| 汽水音乐 | `qishui_music` |
| 咪咕音乐 | `migu` |

### 其他

| 平台名称 | 标识 |
|----------|------|
| 一刻相册 | `baidu_photo` |

### 专属版

| 网盘名称 | 标识 |
|----------|------|
| 夸克云盘 | `qk` |
| UC云盘 | `uc` |
| 移动云盘 | `p139` |
| 联通云盘 | `pwo` |
| 天翼云盘 | `p189` |

## 特殊说明

- 移动云云空间的 `分享key` 取分享链接中的 `data` 参数值
- 移动云云空间、小飞机网盘的加密分享可忽略密码参数
- 超星云盘需要 referer: `https://pan-yz.chaoxing.com`

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

## 使用限制

1. **请求频率**: 建议不要过于频繁请求，避免IP被封
2. **文件大小**: 部分网盘对大文件有限制（需认证）
3. **登录要求**: 夸克、UC 必须提供 Cookie，123 大文件需要登录
4. **地域限制**: 部分网盘对IP有地域限制，可配置代理
