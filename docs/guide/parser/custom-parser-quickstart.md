# 自定义解析器快速开始

5 分钟快速集成指南。

::: tip 提示
除了 Java 自定义解析器，本项目还支持使用 JavaScript 编写解析器，无需编译即可使用。查看 [JavaScript 解析器开发指南](./javascript-parser)。
:::

## 步骤 1: 添加依赖

```xml
<dependency>
    <groupId>cn.qaiu</groupId>
    <artifactId>parser</artifactId>
    <version>10.1.17</version>
</dependency>
```

## 步骤 2: 实现解析器

### 创建解析工具类

```java
package com.example.parser;

import cn.qaiu.entity.ShareLinkInfo;
import cn.qaiu.parser.IPanTool;
import io.vertx.core.Future;
import io.vertx.core.Promise;

public class MyPanTool implements IPanTool {
    private final ShareLinkInfo shareLinkInfo;

    public MyPanTool(ShareLinkInfo shareLinkInfo) {
        this.shareLinkInfo = shareLinkInfo;
    }

    @Override
    public Future<String> parse() {
        Promise<String> promise = Promise.promise();
        String shareKey = shareLinkInfo.getShareKey();
        String downloadUrl = "https://mypan.com/download/" + shareKey;
        promise.complete(downloadUrl);
        return promise.future();
    }
}
```

### 创建注册器

```java
import cn.qaiu.parser.custom.CustomParserConfig;
import cn.qaiu.parser.custom.CustomParserRegistry;

public class ParserRegistry {
    public static void init() {
        CustomParserConfig config = CustomParserConfig.builder()
                .type("mypan")
                .displayName("我的网盘")
                .toolClass(MyPanTool.class)
                .build();
        CustomParserRegistry.register(config);
    }
}
```

### 在应用启动时注册

```java
import cn.qaiu.WebClientVertxInit;
import io.vertx.core.Vertx;

public class Application {
    public static void main(String[] args) {
        Vertx vertx = Vertx.vertx();
        WebClientVertxInit.init(vertx);
        ParserRegistry.init();
    }
}
```

## 步骤 3: 使用解析器

```java
import cn.qaiu.parser.ParserCreate;
import cn.qaiu.parser.IPanTool;

IPanTool tool = ParserCreate.fromType("mypan")
        .shareKey("abc123")
        .setShareLinkInfoPwd("password")
        .createTool();

String downloadUrl = tool.parseSync();
```

::: warning 注意
自定义解析器只能通过 `fromType` 方法创建，不支持从分享链接自动识别。
:::

## 常见问题

| 问题 | 原因 | 解决方法 |
|------|------|---------|
| 未找到类型为 'xxx' 的解析器 | 忘记注册 | 确保调用 `CustomParserRegistry.register()` |
| toolClass必须有ShareLinkInfo单参构造器 | 构造器写错 | 添加 `public MyTool(ShareLinkInfo info)` |
| 从分享链接无法识别 | 不支持自动识别 | 使用 `ParserCreate.fromType()` |

## 相关文档

- [自定义解析器扩展完整指南](./custom-parser-guide)
- [JavaScript 解析器开发指南](./javascript-parser)
- [解析器模块概述](./)
