# 解析器模块文档

面向开发者的解析器实现说明：约定、数据映射、HTTP 调试与示例代码。

- **语言/构建**: Java 17 / Maven
- **关键接口**: `cn.qaiu.parser.IPanTool`（返回 `Future<String>`）
- **数据模型**: `cn.qaiu.entity.FileInfo`（统一对外文件项）
- **JavaScript解析器**: 支持使用 JavaScript 编写自定义解析器

## 快速调用示例

```java
import cn.qaiu.WebClientVertxInit;
import cn.qaiu.entity.FileInfo;
import cn.qaiu.parser.IPanTool;
import cn.qaiu.parser.ParserCreate;
import io.vertx.core.Vertx;
import java.util.List;

public class ParserQuickStart {
    public static void main(String[] args) {
        Vertx vertx = Vertx.vertx();
        WebClientVertxInit.init(vertx);

        String shareUrl = "https://www.ilanzou.com/s/xxxx";
        IPanTool tool = ParserCreate.fromShareUrl(shareUrl)
                .createTool();

        // 同步方法获取文件列表
        List<FileInfo> files = tool.parseFileListSync();
        for (FileInfo f : files) {
            System.out.printf("%s\t%s\t%s\n",
                f.getFileName(), f.getSizeStr(), f.getParserUrl());
        }

        // 同步方法获取下载链接
        String raw = tool.parseSync();
        System.out.println("raw: " + raw);

        vertx.close();
    }
}
```

等价用法：已知网盘类型 + shareKey 构造

```java
IPanTool tool = ParserCreate.fromType("lz")
        .shareKey("abcd12")
        .setShareLinkInfoPwd("1234")
        .createTool();

List<FileInfo> files = tool.parseFileListSync();
```

## 同步方法

| 方法 | 说明 |
|------|------|
| `parseSync()` | 解析单个文件下载链接 |
| `parseFileListSync()` | 解析文件列表 |
| `parseByIdSync()` | 根据文件ID获取下载链接 |

异步方法仍可用：`parse()`、`parseFileList()`、`parseById()` 返回 `Future` 对象。

## 解析器约定

- **输入**: 目标分享/目录页的上下文（shareKey、cookie、headers 等）
- **输出**: `Future<List<FileInfo>>`（文件/目录混合列表）
- **错误**: 失败场景通过 Future 失败或返回空列表
- **并发**: 使用 Vert.x Web Client 异步请求

### FileInfo 关键字段

| 字段 | 说明 |
|------|------|
| `fileId` | 唯一标识 |
| `fileName` | 展示名（建议带扩展名） |
| `fileType` | `file` / `folder` |
| `size` / `sizeStr` | 字节数 / 原始字符串 |
| `createTime` / `updateTime` | 时间格式 yyyy-MM-dd HH:mm:ss |
| `parserUrl` | 中间链接或协议占位 |
| `filePath` / `previewUrl` / `extParameters` | 按需补充 |

## 相关文档

- [JavaScript 解析器开发指南](./javascript-parser) — 使用 JS 编写解析器，无需编译
- [自定义解析器快速开始](./custom-parser-quickstart) — 5分钟快速集成
- [自定义解析器扩展指南](./custom-parser-guide) — Java 自定义解析器完整文档
