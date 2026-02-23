# 自定义解析器扩展指南

本模块支持用户自定义解析器扩展。依赖本项目的 Maven 坐标后，可以实现自己的网盘解析器并注册到系统中使用。

::: tip 提示
除了 Java 自定义解析器，还支持使用 [JavaScript 编写解析器](./javascript-parser)，无需编译即可使用。
:::

## 核心组件

| 组件 | 说明 |
|------|------|
| `CustomParserConfig` | 自定义解析器配置类 |
| `CustomParserRegistry` | 自定义解析器注册中心 |
| `ParserCreate` | 解析器工厂类（已增强支持自定义解析器） |

## 使用步骤

### 步骤 1: 添加 Maven 依赖

```xml
<dependency>
    <groupId>cn.qaiu</groupId>
    <artifactId>parser</artifactId>
    <version>10.1.17</version>
</dependency>
```

### 步骤 2: 继承 PanBase 抽象类

```java
package com.example.parser;

import cn.qaiu.entity.ShareLinkInfo;
import cn.qaiu.parser.PanBase;
import io.vertx.core.Future;

public class MyCustomPanTool extends PanBase {

    public MyCustomPanTool(ShareLinkInfo shareLinkInfo) {
        super(shareLinkInfo);
    }

    @Override
    public Future<String> parse() {
        String shareKey = shareLinkInfo.getShareKey();

        client.getAbs("https://your-pan-domain.com/api/share/" + shareKey)
            .send()
            .onSuccess(res -> {
                var json = asJson(res);
                String downloadUrl = json.getString("download_url");
                complete(downloadUrl);
            })
            .onFailure(handleFail("请求下载链接失败"));

        return future();
    }
}
```

### PanBase 提供的核心方法

#### HTTP 客户端
- **`client`**: 标准 WebClient，支持自动重定向
- **`clientSession`**: 带会话管理的 WebClient，自动处理 Cookie
- **`clientNoRedirects`**: 不自动重定向的 WebClient

#### 响应处理
- **`asJson(HttpResponse)`**: HTTP 响应转 JsonObject，自动处理 gzip
- **`asText(HttpResponse)`**: HTTP 响应转文本

#### Promise 管理
- **`complete(String)`**: 完成 Promise 并返回结果
- **`future()`**: 获取 Promise 的 Future 对象
- **`fail(String, Object...)`**: Promise 失败
- **`handleFail(String)`**: 生成失败处理器

### 步骤 3: 注册自定义解析器

```java
CustomParserConfig config = CustomParserConfig.builder()
        .type("mypan")
        .displayName("我的网盘")
        .toolClass(MyCustomPanTool.class)
        .standardUrlTemplate("https://mypan.com/s/{shareKey}")
        .panDomain("https://mypan.com")
        .build();

CustomParserRegistry.register(config);
```

### 步骤 4: 使用解析器

```java
IPanTool tool = ParserCreate.fromType("mypan")
        .shareKey("abc123")
        .setShareLinkInfoPwd("1234")
        .createTool();

// 同步方法
String downloadUrl = tool.parseSync();
List<FileInfo> files = tool.parseFileListSync();
String fileUrl = tool.parseByIdSync();

// 异步方法
tool.parse().onSuccess(url -> { ... });
```

## API 参考

### CustomParserConfig.Builder

| 方法 | 说明 | 必填 |
|------|------|------|
| `type(String)` | 类型标识（唯一） | 是 |
| `displayName(String)` | 显示名称 | 是 |
| `toolClass(Class)` | 解析工具类 | 是 |
| `standardUrlTemplate(String)` | 标准 URL 模板 | 否 |
| `panDomain(String)` | 网盘域名 | 否 |

### CustomParserRegistry

| 方法 | 说明 |
|------|------|
| `register(config)` | 注册解析器 |
| `unregister(type)` | 注销解析器 |
| `get(type)` | 获取配置 |
| `contains(type)` | 检查是否已注册 |
| `clear()` | 清空所有自定义解析器 |
| `getAll()` | 获取所有配置 |

## 注意事项

1. **类型标识**: 必须唯一，建议小写英文，不能与内置解析器冲突
2. **构造器**: 必须有 `ShareLinkInfo` 单参构造器并调用 `super(shareLinkInfo)`
3. **创建方式**: 仅支持 `ParserCreate.fromType()`，不支持 `fromShareUrl()` 自动识别
4. **线程安全**: `CustomParserRegistry` 使用 `ConcurrentHashMap`

## 相关文档

- [JavaScript 解析器开发指南](./javascript-parser)
- [自定义解析器快速开始](./custom-parser-quickstart)
- [解析器模块概述](./)
