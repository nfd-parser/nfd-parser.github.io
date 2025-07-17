# 配置指南

NFD Parser 使用 YAML 格式的配置文件，主配置文件为 `app-dev.yml`，位于 `resources` 目录下。

## 主配置文件 (app-dev.yml)

### 基本服务配置

```yaml
server:
  # 服务端口
  port: 6400
  # 绑定地址
  host: "0.0.0.0"

# 应用配置
app:
  # 服务名称
  name: "NFD Parser"
  # 版本
  version: "1.0.0"
  # 域名配置
  domain: "your-domain.com"
  # 是否启用HTTPS
  ssl: false
```

### 缓存配置

```yaml
cache:
  # 缓存类型: memory, redis
  type: "memory"
  # 默认缓存时间（秒）
  default_ttl: 3600
  # 最大缓存条目数
  max_entries: 10000
  
  # Redis配置 (当type为redis时)
  redis:
    host: "localhost"
    port: 6379
    password: ""
    database: 0
```

### 网盘配置

```yaml
netdisk:
  # 各网盘的缓存时间配置（秒）
  cache_ttl:
    lz: 3600      # 蓝奏云
    cow: 1800     # 奶牛快传
    ec: 7200      # 移动云云空间
    fj: 3600      # 小飞机网盘
    fc: 3600      # 亿方云
    ye: 1800      # 123云盘
    ws: 3600      # 文叔叔
    
  # 请求超时配置（秒）
  timeout:
    connect: 30
    read: 60
    
  # 用户代理配置
  user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
```

### 代理配置

```yaml
proxy:
  # 代理配置列表
  - panTypes: "pgd,pdb,pod"    # 适用的网盘类型
    type: "http"               # 代理类型: http, socks4, socks5
    host: "127.0.0.1"         # 代理主机
    port: 7890                # 代理端口
    username: ""              # 用户名（可选）
    password: ""              # 密码（可选）
```

### 日志配置

```yaml
logging:
  # 日志级别: TRACE, DEBUG, INFO, WARN, ERROR
  level: "INFO"
  # 日志输出目录
  path: "logs"
  # 控制台输出
  console:
    enabled: true
```

## 多环境配置

### 开发环境配置示例

```yaml
# 开发环境 - 适用于本地调试
server:
  port: 6400
  host: "127.0.0.1"

cache:
  type: "memory"
  default_ttl: 600
  max_entries: 1000

logging:
  level: "DEBUG"
  console:
    enabled: true
```

### 生产环境配置示例

```yaml
# 生产环境 - 适用于正式部署
server:
  port: 6400
  host: "0.0.0.0"

cache:
  type: "redis"
  default_ttl: 3600
  redis:
    host: "redis-server"
    port: 6379

logging:
  level: "INFO"
  console:
    enabled: false
```

## 环境变量配置

可以通过环境变量覆盖配置文件中的设置：

```bash
# 服务端口
export NFD_SERVER_PORT=6400

# 服务主机
export NFD_SERVER_HOST=0.0.0.0

# 缓存类型
export NFD_CACHE_TYPE=redis

# Redis配置
export NFD_REDIS_HOST=localhost
export NFD_REDIS_PORT=6379

# 日志级别
export NFD_LOG_LEVEL=INFO
```

## 安全建议

### 访问控制
- 建议在生产环境中启用限流功能
- 根据需要配置IP白名单或黑名单
- 使用反向代理（如Nginx）提供额外的安全层

### 配置文件安全
- 确保配置文件权限设置正确（建议 600 或 644）
- 敏感信息（如密码）建议使用环境变量
- 定期检查和更新配置

### 基本安全配置示例

```yaml
security:
  # 基本限流配置
  rate_limit:
    enabled: true
    requests_per_minute: 60
    requests_per_hour: 1000
```

## 热更新

服务支持部分配置的热更新，无需重启服务：

- 缓存配置
- 日志级别
- 网盘超时配置

更新配置文件后，配置会在下一次请求时自动生效。对于需要重启的配置项：

- 服务端口
- 服务绑定地址
- 数据库连接配置

## 常见配置问题

### 端口冲突
**问题**: 服务启动失败，提示端口已被占用

**解决方案**:
```bash
# 查找占用端口的进程
netstat -tlnp | grep :6400

# 修改配置文件中的端口或停止占用端口的进程
```

### 内存不足
**问题**: 服务运行一段时间后出现内存溢出

**解决方案**:
```yaml
# 调整缓存配置
cache:
  max_entries: 5000  # 减少缓存条目数
```

### 代理配置错误
**问题**: 代理服务无法访问外部API

**解决方案**:
```bash
# 测试代理连接
curl --proxy http://proxy_host:proxy_port http://www.baidu.com

# 检查代理配置格式，确保网盘类型标识正确
```