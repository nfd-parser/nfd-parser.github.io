# 配置管理

本指南提供 NFD Parser 服务的配置说明和交互式管理工具。

## 交互式配置工具

<ConfigManager />

## 配置文件概述

NFD Parser 使用 YAML 格式的配置文件：

- `app-dev.yml` - 主要服务配置
- `server-proxy.yml` - 可选的反向代理配置

## 主配置文件 (app-dev.yml)

### 服务配置

```yaml
# 服务配置
server:
  port: 6400
  contextPath: /
  enableDatabase: true
  domainName: http://127.0.0.1:6401
  previewURL: https://nfd-parser.github.io/nfd-preview/preview.html?src=
```

### Vertx 核心配置

```yaml
# vertx核心线程配置(一般无需改动)
vertx:
  eventLoopPoolSize: 0  # 0表示使用默认配置(CPU核心*2)
  workerPoolSize: 0     # 0表示使用默认20

# vertx-service配置
custom:
  asyncServiceInstances: 4
  baseLocations: cn.qaiu.lz
  routeTimeOut: 15000
  ignoresReg:
    - .*/test.*$
  entityPackagesReg:
    - ^cn\.qaiu\.lz\.web\.model\..*
```

### 限流配置

```yaml
# 限流配置
rateLimit:
  enable: true
  limit: 10          # 限流请求数
  timeWindow: 10     # 时间窗口(秒)
  pathReg: ^/v2/.*   # 路径匹配规则
```

### 数据源配置

```yaml
# 数据源配置
dataSource:
  # 默认使用内置H2数据库
  jdbcUrl: jdbc:h2:file:./db/nfdData;MODE=MySQL;DATABASE_TO_UPPER=FALSE
  username: root
  password: '123456'
  
  # 可选: 使用MySQL
  # jdbcUrl: jdbc:mysql://127.0.0.1:3306/nfddata?useUnicode=true&characterEncoding=utf-8&serverTimezone=GMT%2B8&useSSL=false
  
  # 可选: 使用PostgreSQL
  # jdbcUrl: jdbc:postgresql://localhost:5432/nfddata
```

### 缓存配置

```yaml
# 直链缓存配置
cache:
  type: h2db
  defaultDuration: 59  # 默认缓存时长(分钟)
  # 各网盘的缓存时长配置
  duration:
    ce: 5      # 城通网盘
    cow: 5     # 奶牛快传
    ec: 5      # 移动云
    fj: 20     # 小飞机
    iz: 20     # 蓝奏云(iz)
    le: 2879   # 乐易
    lz: 20     # 蓝奏云
    qq: 9999999 # QQ微云
    qqw: 30    # QQ微云(备用)
    ws: 10     # 文叔叔
    ye: -1     # 123云盘
    mne: 30    # 米奈
    mqq: 30    # 米QQ
    mkg: 30    # 米酷
    p115: 30   # 115网盘
    ct: 30     # 城通
```

### 代理配置

```yaml
# HTTP代理配置(可选)
proxy:
  - panTypes: pgd,pdb,pod  # 适用的网盘类型
    type: http             # 代理类型: http/socks4/socks5
    host: 127.0.0.1
    port: 7890
    username:              # 可选
    password:              # 可选
```

## 反向代理配置 (server-proxy.yml)

可选配置文件，用于提供前端静态资源和API反向代理。如果使用Nginx等外部代理，可以忽略此配置。

```yaml
server-name: Vert.x-proxy-server(v4.1.2)

proxy:
  - listen: 6401
    page404: webroot/err/404.html
    static:
      path: /
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
2. **数据库路径** - H2数据库文件路径相对于应用启动目录
3. **缓存时长** - 根据网盘特性调整缓存时间，避免过期失效
4. **代理设置** - 部分网盘API可能需要代理访问

<script setup>
import ConfigManager from '../.vitepress/components/ConfigManager.vue'
</script>