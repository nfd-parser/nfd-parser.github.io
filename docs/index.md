---
layout: home

hero:
  name: "NFD Parser"
  text: "网盘分享链接云解析服务"
  tagline: 聚合多种主流网盘的直链解析下载服务，一键解析下载
  image:
    src: /nfd-logo.png
    alt: NFD Parser
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: API 参考
      link: /api
    - theme: alt
      text: GitHub
      link: https://github.com/qaiu/netdisk-fast-download

features:
  - icon: 🚀
    title: 高性能解析
    details: 基于 Vert.x 4 构建，Jdk17+注解式路由API，支持高并发请求处理
  - icon: 🔗
    title: 多网盘支持
    details: 已支持蓝奏云、夸克网盘、UC网盘、123云盘、小飞机盘、移动云、天翼云等多款网盘
  - icon: ⚙️
    title: 灵活配置
    details: 支持缓存配置、限流控制、代理设置、认证参数加密等多项配置
  - icon: 🔒
    title: 加密分享与认证
    details: 支持加密分享链接、文件夹分享解析、Cookie/Token 认证解析大文件
---

## 快速开始

命令行下载分享文件：

```bash
# 使用 curl 下载
curl -LOJ "https://lz0.qaiu.top/parser?url=https://share.feijipan.com/s/nQOaNRPW&pwd=1234"

# 使用 wget 下载
wget -O bilibili.mp4 "https://lz0.qaiu.top/parser?url=https://share.feijipan.com/s/nQOaNRPW&pwd=1234"
```

或者浏览器直接访问：
```
https://lz0.qaiu.top/parser?url=https://share.feijipan.com/s/nQOaNRPW&pwd=1234
```

## 文档导航

- **[快速开始](guide/getting-started)** - 立即体验 NFD Parser
- **[API 接口文档](api)** - 详细的 API 接口说明和参数
- **[使用示例](examples)** - 多种编程语言的使用示例
- **[部署指南](deployment)** - Docker、Linux、Windows 部署教程
- **[配置管理](configuration)** - 详细的配置文件说明和管理工具

## 支持的网盘

### 开源版支持

| 网盘名称 | 标识 | 免登陆下载 | 加密分享 | 单文件大小限制 |
|---------|------|-----------|----------|---------------|
| 蓝奏云 | `lz` | ✅ | ✅ | 100M |
| 蓝奏云优享 | `iz` | ✅ | ✅ | - |
| 奶牛快传 | `cow` | ✅ | ❌ | 不限 |
| 移动云云空间 | `ec` | ✅ | ✅ | 不限 |
| 小飞机网盘 | `fj` | ✅ | ✅ | 不限 |
| 亿方云 | `fc` | ✅ | ✅ | 不限 |
| 123云盘 | `ye` | ✅ | ✅ | 100G（>100M需登录） |
| 文叔叔 | `ws` | ✅ | ✅ | 5GB |
| 联想乐云 | `le` | ✅ | ✅ | 不限 |
| QQ邮箱云盘 | `qqw` | ✅ | ❌ | 不限 |
| QQ闪传 | `qqsc` | ✅ | - | - |
| 城通网盘 | `ct` | ✅ | ✅ | 不限 |
| Cloudreve | `ce` | ✅ | ✅ | 不限 |
| 超星云盘 | `pcx` | ✅ | - | - |
| WPS云文档 | `pwps` | ✅ | ❌ | 10M(免费)/2G(会员) |
| Google云盘 | `pgd` | ✅ | - | - |
| Onedrive | `pod` | ✅ | - | - |
| Dropbox | `pdp` | ✅ | - | - |
| iCloud | `pic` | ✅ | - | - |

### 音乐分享链接

| 平台 | 标识 |
|------|------|
| 网易云音乐 | `mnes` |
| 酷狗音乐 | `mkgs` |
| 酷我音乐 | `mkws` |
| QQ音乐 | `mqqs` |
| 汽水音乐 | `qishui_music` |
| 咪咕音乐 | `migu` |

### 其他

| 平台 | 标识 |
|------|------|
| 一刻相册 | `baidu_photo` |

### 专属版提供

| 网盘名称 | 标识 | 说明 |
|---------|------|------|
| 夸克网盘 | `qk` | 必须配置 Cookie |
| UC网盘 | `uc` | 必须配置 Cookie |
| 移动云盘 | `p139` | - |
| 联通云盘 | `pwo` | - |
| 天翼云盘 | `p189` | - |

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
| WPS云文档 | ✅ | ❌ | 5G(免费) | 10M(免费)/2G(会员) |
| 夸克网盘 | ❌ | ✅ | 10G | 不限大小 |
| UC网盘 | ❌ | ✅ | 10G | 不限大小 |

## 注意事项

::: warning 重要提醒
- **不要过度依赖公共解析服务**，建议本地搭建或云服务器自行搭建
- **解析次数过多IP会被部分网盘厂商限制**，不推荐做公共解析
- **小飞机解析有IP限制**，多数云服务商的大陆IP会被拦截（可配置代理）
:::

### 已知限制
- 奶牛云直链需要加入请求头：`Referer: https://cowtransfer.com/`
- 123云盘解析大文件(>100MB)需要登录
- UC网盘解析需要登录
- 夸克网盘解析需要登录

## 技术栈

- **Java**: JDK 17 (提供 JDK 11 分支 main-jdk11)
- **框架**: Vert.x 4
- **架构**: 类似 Spring 的注解式路由 API

## 项目信息

- **作者**: [qaiu](https://github.com/qaiu)
- **许可证**: MIT
- **QQ群**: 1017480890
- **GitHub**: [qaiu/netdisk-fast-download](https://github.com/qaiu/netdisk-fast-download)

## 免责声明

用户在使用本项目时，应自行承担风险，并确保其行为符合当地法律法规。开发者不对用户因使用本项目而导致的任何后果负责。
