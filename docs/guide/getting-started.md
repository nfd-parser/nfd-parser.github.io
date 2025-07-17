# 快速开始

欢迎使用 NFD Parser! 这是一个将网盘分享下载链接转化为直链的云解析服务。

## 在线演示

尝试解析一个网盘分享链接，体验 NFD Parser 的功能：

<ClientOnly>
  <DemoParser />
</ClientOnly>

## 基本用法

### 1. 解析分享链接获取直链

```bash
# 解析蓝奏云分享链接
curl "https://your-api-domain.com/json/parser?url=https://www.ilanzou.com/s/Wch0DGj8"

# 解析带密码的分享链接
curl "https://your-api-domain.com/json/parser?url=https://www.ilanzou.com/s/Wch0DGj8&pwd=密码"
```

### 2. 直接跳转下载

```bash
# 直接获取下载链接（会重定向）
curl -L "https://your-api-domain.com/parser?url=https://www.ilanzou.com/s/Wch0DGj8"
```

### 3. 获取分享链接详情

```bash
# 获取链接信息和统计数据
curl "https://your-api-domain.com/v2/linkInfo?url=https://www.ilanzou.com/s/Wch0DGj8&pwd="
```

## 接口说明

### 解析接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/parser?url=分享链接&pwd=密码` | 解析并自动跳转下载 |
| GET | `/json/parser?url=分享链接&pwd=密码` | 获取解析后的直链(JSON格式) |
| GET | `/v2/linkInfo?url=分享链接&pwd=密码` | 获取分享链接详情 |

### 响应格式

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

- **蓝奏云** (lz) - https://www.lanzou.com/
- **蓝奏云优享** (iz) - https://www.ilanzou.com/
- **奶牛快传** (cow) - https://cowtransfer.com/
- **移动云** (ec) - https://www.ecpan.cn/
- **小飞机网盘** (fj) - https://www.feijipan.com/
- **123云盘** (ye) - https://www.123pan.com/
- **文叔叔** (ws) - https://www.wenshushu.cn/
- **城通网盘** (ct) - https://www.ctfile.com/

更多支持的网盘请查看 [支持的网盘](/guide/supported-platforms) 页面。

## 下一步

- 查看 [API 参考](/api) 了解完整的接口文档
- 浏览 [使用示例](/examples) 学习各种编程语言的使用方法
- 阅读 [部署指南](/deployment) 自行搭建服务

<script setup>
import DemoParser from '../../.vitepress/components/DemoParser.vue'
</script>