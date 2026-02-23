# JavaScript 解析器开发指南

## 概述

本指南介绍如何使用 JavaScript 编写自定义网盘解析器，无需编写 Java 代码。

## 快速开始

### 1. 创建 JavaScript 脚本

在 `./custom-parsers/` 目录下创建 `.js` 文件：

```javascript
// ==UserScript==
// @name         我的解析器
// @type         my_parser
// @displayName  我的网盘
// @description  使用JavaScript实现的网盘解析器
// @match        https?://example\.com/s/(?<KEY>\w+)
// @author       yourname
// @version      1.0.0
// ==/UserScript==

var types = require('./types');
/** @typedef {types.ShareLinkInfo} ShareLinkInfo */
/** @typedef {types.JsHttpClient} JsHttpClient */
/** @typedef {types.JsLogger} JsLogger */

/**
 * 解析单个文件下载链接
 * @param {ShareLinkInfo} shareLinkInfo - 分享链接信息
 * @param {JsHttpClient} http - HTTP客户端
 * @param {JsLogger} logger - 日志对象
 * @returns {string} 下载链接
 */
function parse(shareLinkInfo, http, logger) {
    var url = shareLinkInfo.getShareUrl();
    var response = http.get(url);
    return response.body();
}
```

### 2. 解析器加载路径

**内置解析器（jar包内）**:
- 位置: `parser/src/main/resources/custom-parsers/`

**外部解析器（用户自定义）**，优先级从高到低：
1. 系统属性: `-Dparser.custom-parsers.path=/path/to/parsers`
2. 环境变量: `PARSER_CUSTOM_PARSERS_PATH=/path/to/parsers`
3. 默认路径: `./custom-parsers/`

### 3. 重启应用

重启应用后，JavaScript 解析器会自动加载并注册。

## 元数据格式

### 必填字段

| 字段 | 说明 |
|------|------|
| `@name` | 脚本名称 |
| `@type` | 解析器类型标识（唯一） |
| `@displayName` | 显示名称 |
| `@match` | URL匹配正则（必须包含 `(?<KEY>...)` 命名捕获组） |

### 可选字段

| 字段 | 说明 |
|------|------|
| `@description` | 描述信息 |
| `@author` | 作者 |
| `@version` | 版本号 |

## API 参考

### ShareLinkInfo 对象

```javascript
var shareUrl = shareLinkInfo.getShareUrl();       // 分享URL
var shareKey = shareLinkInfo.getShareKey();        // 分享Key
var password = shareLinkInfo.getSharePassword();   // 分享密码
var type = shareLinkInfo.getType();                // 网盘类型
var panName = shareLinkInfo.getPanName();          // 网盘名称
var dirId = shareLinkInfo.getOtherParam("dirId");  // 其他参数
```

### JsHttpClient 对象

```javascript
// GET 请求
var response = http.get("https://api.example.com/data");

// GET - 跟随重定向
var response = http.getWithRedirect("https://api.example.com/redirect");

// GET - 不跟随重定向（用于获取 Location 头）
var response = http.getNoRedirect("https://api.example.com/redirect");

// POST 请求
var response = http.post("https://api.example.com/submit", { key: "value" });

// PUT / DELETE / PATCH
var response = http.put(url, body);
var response = http.delete(url);
var response = http.patch(url, body);

// 设置请求头
http.putHeader("User-Agent", "MyBot/1.0");
http.putHeaders({ "User-Agent": "MyBot/1.0", "Accept": "application/json" });
http.removeHeader("Authorization");
http.clearHeaders();

// 设置超时
http.setTimeout(60);

// URL 编码/解码
var encoded = JsHttpClient.urlEncode("hello world");
var decoded = JsHttpClient.urlDecode("hello%20world");
```

### JsHttpResponse 对象

```javascript
var body = response.body();           // 响应体字符串
var data = response.json();           // 解析 JSON
var status = response.statusCode();   // 状态码
var header = response.header("Content-Type");  // 响应头
var success = response.isSuccess();   // 是否成功
var size = response.bodySize();       // 响应体大小
```

### JsLogger 对象

```javascript
logger.debug("调试信息");
logger.info("用户 {} 访问了 {}", username, url);
logger.warn("警告信息");
logger.error("错误信息");
```

## 实现方法

### parse 方法（必填）

解析单个文件下载链接：

```javascript
function parse(shareLinkInfo, http, logger) {
    var shareUrl = shareLinkInfo.getShareUrl();
    var response = http.get(shareUrl);
    var html = response.body();

    var regex = /downloadUrl["']:\s*["']([^"']+)["']/;
    var match = html.match(regex);

    if (match) {
        return match[1];
    } else {
        throw new Error("无法解析下载链接");
    }
}
```

### parseFileList 方法（可选）

解析文件列表（目录）：

```javascript
function parseFileList(shareLinkInfo, http, logger) {
    var response = http.get("/api/list?dirId=0");
    var data = response.json();

    var fileList = [];
    for (var i = 0; i < data.files.length; i++) {
        var file = data.files[i];
        fileList.push({
            fileName: file.name,
            fileId: file.id,
            fileType: file.isDir ? "folder" : "file",
            size: file.size,
            sizeStr: formatSize(file.size),
            createTime: file.createTime,
            parserUrl: "/v2/redirectUrl/my_parser/" + file.id
        });
    }
    return fileList;
}
```

### parseById 方法（可选）

根据文件ID获取下载链接：

```javascript
function parseById(shareLinkInfo, http, logger) {
    var paramJson = shareLinkInfo.getOtherParam("paramJson");
    var response = http.get("/api/download?fileId=" + paramJson.fileId);
    return response.json().downloadUrl;
}
```

## 重定向处理

```javascript
function getRealDownloadUrl(downloadUrl, http, logger) {
    var response = http.getNoRedirect(downloadUrl);
    if (response.statusCode() >= 300 && response.statusCode() < 400) {
        var location = response.header("Location");
        if (location) return location;
    }
    return downloadUrl;
}
```

## 示例脚本

项目内置示例：
- `custom-parsers/example-demo.js` — 完整演示解析器
- `custom-parsers/baidu-photo.js` — 百度相册（一刻相册）
- `custom-parsers/migu-music.js` — 咪咕音乐
- `custom-parsers/qishui-music.js` — 汽水音乐

## 限制说明

1. **JavaScript 版本**: 仅支持 ES5.1 语法（Nashorn 引擎限制）
2. **同步执行**: 所有 HTTP 请求都是同步的
3. **安全限制**: 无法访问文件系统或执行系统命令

## 相关文档

- [解析器模块概述](./)
- [自定义解析器快速开始](./custom-parser-quickstart)
- [自定义解析器扩展指南](./custom-parser-guide)
