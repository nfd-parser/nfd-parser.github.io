# 客户端下载链接生成器

将解析得到的直链转换为各种下载客户端可识别的格式。

## 支持的客户端

| 客户端 | 代码 | 说明 | 输出格式 |
|--------|------|------|---------|
| cURL | `CURL` | 命令行工具 | curl 命令 |
| wget | `WGET` | 命令行工具 | wget 命令 |
| Aria2 | `ARIA2` | 命令行/RPC | aria2c 命令 |
| IDM | `IDM` | Windows 下载管理器 | `idm://` 协议 |
| 迅雷 | `THUNDER` | 国内主流下载工具 | `thunder://` 协议 |
| 比特彗星 | `BITCOMET` | BT 下载工具 | `bitcomet://` 协议 |
| Motrix | `MOTRIX` | 跨平台下载工具 | JSON 格式 |
| FDM | `FDM` | Free Download Manager | 文本格式 |
| PowerShell | `POWERSHELL` | Windows PowerShell | PS 命令 |

## 快速开始

### 基本使用

```java
IPanTool tool = ParserCreate.fromShareUrl("https://example.com/share/abc123")
    .createTool();
String directLink = tool.parseSync();
ShareLinkInfo info = tool.getShareLinkInfo();

Map<ClientLinkType, String> clientLinks = ClientLinkGeneratorFactory.generateAll(info);
String curlCommand = clientLinks.get(ClientLinkType.CURL);
String thunderLink = clientLinks.get(ClientLinkType.THUNDER);
```

### 一步完成（推荐）

```java
Map<ClientLinkType, String> clientLinks = tool.parseWithClientLinksSync();
```

### 生成特定类型

```java
String curlCommand = ClientLinkGeneratorFactory.generate(info, ClientLinkType.CURL);
String thunderLink = ClientLinkGeneratorFactory.generate(info, ClientLinkType.THUNDER);
```

### 便捷工具类

```java
String curlCommand = ClientLinkUtils.generateCurlCommand(info);
String wgetCommand = ClientLinkUtils.generateWgetCommand(info);
String thunderLink = ClientLinkUtils.generateThunderLink(info);
String psCommand = ClientLinkUtils.generatePowerShellCommand(info);
```

## 输出示例

### curl

```bash
curl -L "https://example.com/file.zip" \
  -H "User-Agent: Mozilla/5.0 ..." \
  -H "Referer: https://example.com/share/abc123" \
  -o "file.zip"
```

### wget

```bash
wget --header="User-Agent: Mozilla/5.0 ..." \
     --header="Referer: https://example.com/share/abc123" \
     -O "file.zip" \
     "https://example.com/file.zip"
```

### aria2

```bash
aria2c --header="User-Agent: Mozilla/5.0 ..." \
       --header="Referer: https://example.com/share/abc123" \
       --out="file.zip" \
       --continue --max-tries=3 --retry-wait=5 \
       "https://example.com/file.zip"
```

### 迅雷

```
thunder://QUFodHRwczovL2V4YW1wbGUuY29tL2ZpbGUuemlwWlo=
```

## 解析器集成

在解析器实现中使用 `completeWithMeta` 方法存储下载元数据：

```java
public class MyPanTool extends PanBase {
    @Override
    public Future<String> parse() {
        String downloadUrl = "https://example.com/file.zip";

        Map<String, String> headers = new HashMap<>();
        headers.put("User-Agent", "Mozilla/5.0 ...");
        headers.put("Referer", shareLinkInfo.getShareUrl());
        headers.put("Cookie", "session=abc123");

        completeWithMeta(downloadUrl, headers);
        return future();
    }
}
```

## 自定义生成器

实现 `ClientLinkGenerator` 接口：

```java
public class MyGenerator implements ClientLinkGenerator {
    @Override
    public String generate(DownloadLinkMeta meta) {
        return "myapp://download?url=" + meta.getUrl();
    }

    @Override
    public ClientLinkType getType() {
        return ClientLinkType.CURL;
    }
}

ClientLinkGeneratorFactory.register(new MyGenerator());
```

## 注意事项

1. **防盗链**: 不同网盘策略不同，需在元数据中完整保存 headers
2. **URL 编码**: 注意正确的 Base64、URLEncode 编码
3. **可选特性**: 元数据存储和链接生成不影响现有解析器功能
4. **线程安全**: 工厂类使用 `ConcurrentHashMap`
