# 配置文件

本文档提供 NFD Parser 服务的配置文件说明。

## 配置文件概述

NFD Parser 使用 YAML 格式的配置文件：

- `app-dev.yml` - 主要服务配置文件

## 主配置文件 (app-dev.yml)

### 基础服务配置

```yaml
# 服务配置
server:
  port: 6400                    # 服务监听端口
  contextPath: /                # 应用上下文路径
  enableDatabase: true          # 是否启用数据库
  domainName: http://127.0.0.1:6400  # 服务域名
```

### 缓存配置

```yaml
# 直链缓存配置
cache:
  type: h2db                    # 缓存类型 (h2db/redis)
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
    ct: 30                      # 城通网盘
    ce: 5                       # Cloudreve
```

### 数据库配置

```yaml
# 数据源配置
dataSource:
  # 默认使用H2数据库
  jdbcUrl: jdbc:h2:file:./db/nfdData;MODE=MySQL;DATABASE_TO_UPPER=FALSE
  username: root
  password: '123456'
```

### 限流配置

```yaml
# 限流配置
rateLimit:
  enable: true                  # 是否启用限流
  limit: 10                     # 限流请求数
  timeWindow: 10                # 时间窗口(秒)
  pathReg: ^/v2/.*             # 路径匹配规则
```

### 代理配置（可选）

```yaml
# HTTP代理配置，部分网盘可能需要代理访问
proxy:
  - panTypes: pgd,pdb,pod       # 适用的网盘类型
    type: http                  # 代理类型: http/socks4/socks5
    host: 127.0.0.1
    port: 7890
    username:                   # 可选
    password:                   # 可选
```

## 配置注意事项

1. **端口配置** - 确保配置的端口未被其他服务占用
2. **缓存时长** - 根据网盘特性调整缓存时间，避免频繁失效
3. **数据库** - 默认使用H2内置数据库，生产环境建议使用MySQL
4. **代理设置** - 部分国外网盘API可能需要代理访问

## 交互式配置工具

<ConfigManager />

<script setup>
import ConfigManager from '../.vitepress/components/ConfigManager.vue'
</script>