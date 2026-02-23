# 配置文件

本文档提供 NFD Parser 服务的配置文件说明。

## 配置文件概述

NFD Parser 使用 YAML 格式的配置文件，位于 `resources` 目录下：

- `app-dev.yml` - 主要服务配置文件
- `server-proxy.yml` - 代理服务配置文件

## 主配置文件 (app-dev.yml)

### 基础服务配置

```yaml
server:
  port: 6400                    # API 服务监听端口
  contextPath: /                # 应用上下文路径
  enableDatabase: true          # 是否启用数据库
  domainName: http://127.0.0.1:6400  # 服务域名
  previewURL: https://nfd-parser.github.io/nfd-preview/preview.html?src=
  authEncryptKey: nfd_auth_key2026    # auth参数AES加解密密钥（16位）
  donatedAccountFailureTokenSignKey: your_random_key  # HMAC签名密钥
```

### 密钥配置说明

#### `server.authEncryptKey`
- **作用**: 用于 `auth` 参数的 AES 加解密
- **要求**: 16位（AES-128）
- **默认值**: `nfd_auth_key2026`

#### `server.donatedAccountFailureTokenSignKey`
- **作用**: 用于"捐赠账号失败计数 token"的 HMAC 签名/验签
- **目的**: 防止客户端伪造失败计数请求
- **建议**: 使用高强度随机字符串，且不要与 `authEncryptKey` 相同

### Vert.x 核心线程配置

```yaml
vertx:
  eventLoopPoolSize: 0          # 0 表示自动
  workerPoolSize: 0             # 0 表示自动

custom:
  asyncServiceInstances: 4
  baseLocations: cn.qaiu.lz
  routeTimeOut: 15000
  ignoresReg:
    - .*/test.*$
  entityPackagesReg:
    - ^cn\\.qaiu\\.lz\\.web\\.model\\..*
```

### 缓存配置

```yaml
cache:
  type: h2db                    # 缓存类型: h2db / redis
  defaultDuration: 59           # 默认缓存时长(分钟)
  duration:                     # 各网盘的缓存时长配置
    lz: 20                      # 蓝奏云
    iz: 20                      # 蓝奏云优享
    cow: 5                      # 奶牛快传
    ec: 5                       # 移动云
    fj: 20                      # 小飞机
    fc: 20                      # 亿方云
    ye: -1                      # 123云盘
    ws: 10                      # 文叔叔
    le: 2879                    # 联想乐云
    qq: 9999999                 # QQ微云
    qqw: 30                     # QQ邮箱云盘
    ct: 30                      # 城通网盘
    ce: 5                       # Cloudreve
    mne: 30                     # 网易云音乐
    mqq: 30                     # QQ音乐
    mkg: 30                     # 酷狗/酷我
    p115: 30                    # 115网盘
```

### 数据库配置

```yaml
dataSource:
  # 默认使用 H2 数据库
  jdbcUrl: jdbc:h2:file:./db/nfdData;MODE=MySQL;DATABASE_TO_UPPER=FALSE
  username: root
  password: '123456'
```

### 限流配置

```yaml
rateLimit:
  enable: true                  # 是否启用限流
  limit: 10                     # 限流请求数
  timeWindow: 10                # 时间窗口(秒)
  pathReg: ^/v2/.*             # 路径匹配规则
```

### 代理配置

```yaml
proxy:
  - panTypes: pgd,pdb,pod       # 适用的网盘类型
    type: http                  # 代理类型: http/socks4/socks5
    host: 127.0.0.1
    port: 7890
    username:                   # 可选
    password:                   # 可选
```

### 解析认证配置

```yaml
auths:
  # 123云盘：配置用户名密码
  ye:
    username: 你的用户名
    password: 你的密码
```

::: info 说明
目前配置文件中仅支持 123（ye）的认证配置。夸克/UC 等网盘的认证通过 API 的 `auth` 参数传递，参考 [认证参数文档](/api#认证参数-v0-2-1)。
:::

## 代理服务配置 (server-proxy.yml)

```yaml
server-name: Vert.x-proxy-server(v4.1.2)

proxy:
  - listen: 6401
    page404: webroot/err/404.html
    static:
      path: /
      add-headers:
        x-token: ABC
      root: webroot/nfd-front/
    location:
      - path: ~^/(json/|v2/|d/|parser|ye/|lz/|cow/|ec/|fj/|fc/|le/|qq/|ws/|iz/|ce/).*
        origin: 127.0.0.1:6400
      - path: /n1/
        origin: 127.0.0.1:6400/v2/
    ssl:
      enable: false
      ssl_protocols: TLSv1.2
      ssl_certificate: ssl/server.pem
      ssl_certificate_key: ssl/privkey.key
```

## 配置注意事项

1. **端口配置** - 确保配置的端口未被其他服务占用
2. **缓存时长** - 根据网盘特性调整缓存时间，`-1` 表示不缓存
3. **数据库** - 默认使用 H2 内置数据库，生产环境可配置 MySQL
4. **代理设置** - 部分国外网盘 API 可能需要代理访问
5. **密钥安全** - 生产环境中请修改默认的加密密钥

## 交互式配置工具

<ConfigManager />

<script setup>
import ConfigManager from './.vitepress/components/ConfigManager.vue'
</script>
