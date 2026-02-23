# 快速开始

欢迎使用 NFD Parser! 这是一个将网盘分享下载链接转化为直链的云解析服务。

## 命令行下载

最简单的使用方式——命令行直接下载分享文件：

```bash
# 使用 curl 下载（自动获取文件名）
curl -LOJ "https://lz0.qaiu.top/parser?url=https://share.feijipan.com/s/nQOaNRPW&pwd=1234"

# 使用 wget 下载
wget -O bilibili.mp4 "https://lz0.qaiu.top/parser?url=https://share.feijipan.com/s/nQOaNRPW&pwd=1234"
```

或者浏览器直接访问：
```
https://lz0.qaiu.top/parser?url=https://share.feijipan.com/s/nQOaNRPW&pwd=1234
```

预览地址：
```
https://nfd-parser.github.io/nfd-preview/preview.html?src=https%3A%2F%2Flz0.qaiu.top%2Fparser%3Furl%3Dhttps%3A%2F%2Fshare.feijipan.com%2Fs%2FnQOaNRPW&name=bilibili.mp4&ext=mp4
```

## 在线演示

尝试解析一个网盘分享链接，体验 NFD Parser 的功能：

<ClientOnly>
  <DemoParser />
</ClientOnly>

## API 基本用法

### 1. 解析分享链接获取直链

```bash
# 解析蓝奏云优享分享链接（JSON 格式）
curl "https://lz0.qaiu.top/json/parser?url=https://www.ilanzou.com/s/Wch0DGj8"

# 解析带密码的分享链接
curl "https://lz0.qaiu.top/json/parser?url=https://www.ilanzou.com/s/lGFndCM&pwd=KMnv"
```

### 2. 使用短链格式

```bash
# 短链格式（无密码）
curl "https://lz0.qaiu.top/json/iz/LEBZySxF"

# 短链格式（有密码，用@连接）
curl "https://lz0.qaiu.top/json/iz/lGFndCM@KMnv"
```

### 3. 直接跳转下载

```bash
# 302 跳转下载
curl -L "https://lz0.qaiu.top/parser?url=https://www.ilanzou.com/s/Wch0DGj8"

# 短链跳转下载
curl -L "https://lz0.qaiu.top/d/iz/LEBZySxF"
```

### 4. 获取分享链接详情

```bash
curl "https://lz0.qaiu.top/v2/linkInfo?url=https://www.ilanzou.com/s/Wch0DGj8"
```

## 接口说明

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/parser?url=分享链接&pwd=密码` | 解析并自动跳转下载 |
| GET | `/json/parser?url=分享链接&pwd=密码` | 获取解析后的直链(JSON) |
| GET | `/d/{网盘标识}/{分享key}@{密码}` | 短链跳转下载 |
| GET | `/json/{网盘标识}/{分享key}@{密码}` | 短链获取 JSON |
| GET | `/v2/linkInfo?url=分享链接` | 获取分享链接详情 |
| GET | `/v2/getFileList?url=分享链接&pwd=密码` | 文件夹解析 |
| GET | `/v2/statisticsInfo` | 解析统计信息 |

## 响应格式

```json
{
  "code": 200,
  "msg": "success",
  "success": true,
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

## 支持的网盘

- **蓝奏云** (lz) / **蓝奏云优享** (iz)
- **奶牛快传** (cow) / **文叔叔** (ws)
- **移动云云空间** (ec) / **小飞机网盘** (fj)
- **亿方云** (fc) / **123云盘** (ye)
- **城通网盘** (ct) / **Cloudreve** (ce)
- **夸克网盘** (qk) / **UC网盘** (uc) — 专属版
- 更多请查看 [支持的网盘](/guide/supported-platforms)

## 下一步

- 查看 [API 参考](/api) 了解完整的接口文档和认证参数
- 浏览 [使用示例](/examples) 学习各种编程语言的使用方法
- 阅读 [部署指南](/deployment) 自行搭建服务

<script setup>
import DemoParser from '../.vitepress/components/DemoParser.vue'
</script>
