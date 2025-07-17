---
layout: home

hero:
  name: "NFD Parser"
  text: "网盘分享链接云解析服务"
  tagline: 将网盘分享下载链接转化为直链的云解析服务
  image:
    src: https://lz.qaiu.top/img/lanzou111.403f7881.png
    alt: NFD Parser
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples

features:
  - icon: 🚀
    title: 高性能解析
    details: 基于 Vert.x 构建，支持高并发请求处理
  - icon: 🔗
    title: 多网盘支持
    details: 支持蓝奏云、奶牛快传、移动云空间等多款主流网盘
  - icon: ⚙️
    title: 灵活配置
    details: 支持缓存配置、限流控制、代理设置等多项配置
  - icon: 🔒
    title: 加密分享
    details: 支持加密分享链接以及部分网盘文件夹分享
---

# NFD Parser - 网盘分享链接云解析服务参考文档

这是基于 [netdisk-fast-download](https://github.com/qaiu/netdisk-fast-download) 项目的参考文档。

## 📚 文档导航

- **[API 接口文档](api)** - 详细的 API 接口说明和参数
- **[使用示例](examples)** - 多种编程语言的使用示例
- **[部署指南](deployment)** - Docker、Linux、Windows 部署教程
- **[配置管理](configuration)** - 详细的配置文件说明和管理工具

## 项目简介

NFD Parser (netdisk-fast-download网盘直链云解析) 是一个能够将网盘分享下载链接转化为直链的云解析服务。支持多款云盘，包括蓝奏云、奶牛快传、移动云空间、小飞机盘、亿方云、123云盘、Cloudreve等，支持加密分享以及部分网盘文件夹分享。

## 支持的网盘

### 免费版支持的网盘
- **蓝奏云 (lz)** - [https://pc.woozooo.com/](https://pc.woozooo.com/)
- **蓝奏云优享 (iz)** - [https://www.ilanzou.com/](https://www.ilanzou.com/)
- **奶牛快传 (cow)** - [https://cowtransfer.com/](https://cowtransfer.com/)
- **移动云云空间 (ec)** - [https://www.ecpan.cn/web](https://www.ecpan.cn/web)
- **小飞机网盘 (fj)** - [https://www.feijipan.com/](https://www.feijipan.com/)
- **亿方云 (fc)** - [https://www.fangcloud.com/](https://www.fangcloud.com/)
- **123云盘 (ye)** - [https://www.123pan.com/](https://www.123pan.com/)
- **文叔叔 (ws)** - [https://www.wenshushu.cn/](https://www.wenshushu.cn/)
- **联想乐云 (le)** - [https://lecloud.lenovo.com/](https://lecloud.lenovo.com/)
- **QQ邮箱文件中转站 (qq)** - [https://mail.qq.com/](https://mail.qq.com/)
- **城通网盘 (ct)** - [https://www.ctfile.com](https://www.ctfile.com)
- **Cloudreve自建网盘 (ce)** - [https://github.com/cloudreve/Cloudreve](https://github.com/cloudreve/Cloudreve)
- **超星云盘 (pcx)** - [https://pan-yz.chaoxing.com](https://pan-yz.chaoxing.com) (需要referer)
- **Google云盘 (pgd)**
- **Onedrive (pod)**
- **Dropbox (pdp)**
- **iCloud (pic)**

### 音乐分享链接支持
- **网易云音乐 (mnes)** - [https://music.163.com](https://music.163.com)
- **酷狗音乐 (mkgs)** - [https://www.kugou.com](https://www.kugou.com)
- **酷我音乐 (mkws)** - [https://kuwo.cn](https://kuwo.cn)
- **QQ音乐 (mqqs)** - [https://y.qq.com](https://y.qq.com)

### 专属版支持的网盘
- **移动云盘 (p139)** - [https://yun.139.com/](https://yun.139.com/)
- **联通云盘 (pwo)** - [https://pan.wo.cn/](https://pan.wo.cn/)
- **天翼云盘 (p189)** - [https://cloud.189.cn/](https://cloud.189.cn/)

## API 接口文档

### 基本格式
- `your_host` 指的是您的域名或者IP地址
- 默认端口为 6400 (可以使用nginx代理)
- 支持两种接口形式：通用接口和标志短链

### 1. 解析并自动跳转下载

#### 通用接口
```
GET /parser?url=分享链接&pwd=密码
```

#### 标志短链
```
GET /d/网盘标识/分享key@密码
```

### 2. 获取解析后的直链 (JSON格式)

#### 通用接口
```
GET /json/parser?url=分享链接&pwd=密码
```

#### 标志短链
```
GET /json/网盘标识/分享key@密码
```

### 3. 文件夹解析
```
GET /json/getFileList?url=分享链接&pwd=密码
```

### 4. 分享链接详情
```
GET /v2/linkInfo?url=分享链接
```

### 5. 解析统计信息
```
GET /v2/statisticsInfo
```

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

### 分享链接详情响应
```json
{
    "code": 200,
    "msg": "success",
    "success": true,
    "count": 0,
    "data": {
        "downLink": "https://lz.qaiu.top/d/fj/xx",
        "apiLink": "https://lz.qaiu.top/json/fj/xx",
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
                "UA": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
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

## 使用示例

### cURL 示例

#### 解析蓝奏云分享链接
```bash
# 获取直链JSON
curl "http://your_host/json/lz/ia2cntg"

# 直接跳转下载
curl -L "http://your_host/d/lz/ia2cntg"
```

#### 解析加密分享链接
```bash
# 360亿方云加密分享
curl "http://your_host/json/fc/e5079007dc31226096628870c7@QAIU"
```

#### 通用接口示例
```bash
# URL编码的分享链接
curl "http://your_host/json/parser?url=https%3A//lanzoux.com/ia2cntg"

# 带密码的分享链接
curl "http://your_host/json/parser?url=https://v2.fangcloud.com/sharing/e5079007dc31226096628870c7&pwd=QAIU"
```

### JavaScript 示例

```javascript
// 解析分享链接
async function parseShareLink(shareUrl, password = '') {
    const params = new URLSearchParams({
        url: shareUrl
    });
    
    if (password) {
        params.append('pwd', password);
    }
    
    const response = await fetch(`http://your_host/json/parser?${params}`);
    const result = await response.json();
    
    if (result.success) {
        return result.data.directLink;
    } else {
        throw new Error(result.msg);
    }
}

// 使用示例
parseShareLink('https://lanzoux.com/ia2cntg')
    .then(directLink => {
        console.log('直链:', directLink);
    })
    .catch(error => {
        console.error('解析失败:', error);
    });
```

## 网盘对比

| 网盘名称 | 免登陆下载分享 | 加密分享 | 初始网盘空间 | 单文件大小限制 |
|---------|--------------|----------|-------------|---------------|
| 蓝奏云 | ✅ | ✅ | 不限空间 | 100M |
| 奶牛快传 | ✅ | ❌ | 10G | 不限大小 |
| 移动云云空间(个人版) | ✅ | ✅(密码可忽略) | 5G(个人) | 不限大小 |
| 小飞机网盘 | ✅ | ✅(密码可忽略) | 10G | 不限大小 |
| 360亿方云 | ✅ | ✅(密码可忽略) | 100G(须实名) | 不限大小 |
| 123云盘 | ✅ | ✅ | 2T | 100G（>100M需要登录） |
| 文叔叔 | ✅ | ✅ | 10G | 5GB |

## 注意事项

### 重要提醒
- **不要过度依赖公共解析服务**，建议本地搭建或云服务器自行搭建
- **解析次数过多IP会被部分网盘厂商限制**，不推荐做公共解析
- **小飞机解析有IP限制**，多数云服务商的大陆IP会被拦截（可配置代理）

### 已知限制
- 奶牛云直链需要加入请求头：`Referer: https://cowtransfer.com/`
- 123云盘解析大文件(>100MB)需要登录
- UC网盘解析需要登录

## 技术栈

- **Java版本**: JDK 17 (提供JDK 11分支)
- **框架**: Vert.x 4.5.6
- **架构**: 类似Spring的注解式路由API

## 项目来源

本文档基于 [qaiu/netdisk-fast-download](https://github.com/qaiu/netdisk-fast-download) 项目编写。

### 原项目信息
- **作者**: qaiu
- **许可证**: 请查看原项目许可证
- **QQ群**: 1017480890
- **预览地址**: 
  - [https://lz.qaiu.top](https://lz.qaiu.top)
  - [http://www.722shop.top:6401](http://www.722shop.top:6401)

## 免责声明

- 用户在使用本项目时，应自行承担风险，并确保其行为符合当地法律法规及网盘服务提供商的使用条款
- 开发者不对用户因使用本项目而导致的任何后果负责，包括但不限于数据丢失、隐私泄露、账号封禁或其他任何形式的损害

---

*本文档为参考文档，具体实现和部署请参考原项目：[netdisk-fast-download](https://github.com/qaiu/netdisk-fast-download)*