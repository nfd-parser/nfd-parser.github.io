# 配置指南

本指南基于 [netdisk-fast-download](https://github.com/qaiu/netdisk-fast-download) 项目的配置文档。

## 配置文件概述

NFD Parser 使用 YAML 格式的配置文件，主要配置文件位于 `resources` 目录下：

- `app-dev.yml` - 主要服务配置
- `server-proxy.yml` - 代理服务配置
- 其他配置文件

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
    # 连接池配置
    pool:
      max_active: 20
      max_idle: 10
      min_idle: 5
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
    
  # 可以配置多个代理
  - panTypes: "fj"
    type: "socks5"
    host: "proxy.example.com"
    port: 1080
```

### 数据库配置

```yaml
database:
  # 数据库类型: sqlite, mysql, postgresql
  type: "sqlite"
  
  # SQLite配置
  sqlite:
    file: "db/nfd.db"
    
  # MySQL配置
  mysql:
    host: "localhost"
    port: 3306
    database: "nfd"
    username: "root"
    password: "password"
    charset: "utf8mb4"
    
  # PostgreSQL配置
  postgresql:
    host: "localhost"
    port: 5432
    database: "nfd"
    username: "postgres"
    password: "password"
```

### 日志配置

```yaml
logging:
  # 日志级别: TRACE, DEBUG, INFO, WARN, ERROR
  level: "INFO"
  
  # 日志输出目录
  path: "logs"
  
  # 日志文件配置
  file:
    # 单个日志文件最大大小
    max_size: "100MB"
    # 保留的日志文件数量
    max_files: 10
    # 是否压缩旧日志
    compress: true
    
  # 控制台输出
  console:
    enabled: true
    pattern: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

### 安全配置

```yaml
security:
  # 访问限制
  rate_limit:
    # 是否启用限流
    enabled: true
    # 每个IP每分钟最大请求数
    requests_per_minute: 60
    # 每个IP每小时最大请求数
    requests_per_hour: 1000
    
  # IP白名单
  whitelist:
    enabled: false
    ips:
      - "127.0.0.1"
      - "192.168.1.0/24"
      
  # IP黑名单
  blacklist:
    enabled: false
    ips:
      - "1.2.3.4"
      
  # API密钥
  api_key:
    enabled: false
    key: "your-secret-api-key"
```

## 代理服务配置 (server-proxy.yml)

```yaml
proxy_server:
  # 前端代理端口
  port: 8080
  
  # 静态文件配置
  static:
    # 静态文件目录
    path: "static"
    # 是否启用压缩
    compression: true
    # 缓存时间（秒）
    cache_time: 86400
    
  # 反向代理配置
  upstream:
    # 后端服务地址
    backend: "http://127.0.0.1:6400"
    # 健康检查
    health_check:
      enabled: true
      interval: 30
      timeout: 5
      path: "/v2/statisticsInfo"
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

# Redis主机
export NFD_REDIS_HOST=localhost

# Redis端口
export NFD_REDIS_PORT=6379

# 数据库类型
export NFD_DATABASE_TYPE=mysql

# MySQL连接信息
export NFD_MYSQL_HOST=localhost
export NFD_MYSQL_PORT=3306
export NFD_MYSQL_DATABASE=nfd
export NFD_MYSQL_USERNAME=root
export NFD_MYSQL_PASSWORD=password

# 日志级别
export NFD_LOG_LEVEL=INFO
```

## Docker 环境配置

### docker-compose.yml

```yaml
version: '3.8'

services:
  nfd-parser:
    image: ghcr.io/qaiu/netdisk-fast-download:latest
    ports:
      - "6401:6401"
    environment:
      - TZ=Asia/Shanghai
      - NFD_SERVER_PORT=6401
      - NFD_CACHE_TYPE=redis
      - NFD_REDIS_HOST=redis
    volumes:
      - ./resources:/app/resources
      - ./db:/app/db
      - ./logs:/app/logs
    depends_on:
      - redis
    restart: unless-stopped
    
  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - nfd-parser
    restart: unless-stopped

volumes:
  redis_data:
```

### Nginx 配置 (nginx.conf)

```nginx
events {
    worker_connections 1024;
}

http {
    upstream nfd_backend {
        server nfd-parser:6401;
    }
    
    # 限流配置
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        listen 80;
        server_name your-domain.com;
        
        # 重定向到HTTPS
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name your-domain.com;
        
        # SSL配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        
        # 应用限流
        limit_req zone=api burst=20 nodelay;
        
        # 代理配置
        location / {
            proxy_pass http://nfd_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # 超时配置
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
        
        # 静态文件缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## 性能优化配置

### JVM 参数优化

```bash
# 2GB内存服务器
JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# 4GB内存服务器
JAVA_OPTS="-Xms1024m -Xmx2048m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# 8GB内存服务器
JAVA_OPTS="-Xms2048m -Xmx4096m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

### 数据库优化

#### SQLite 优化

```yaml
database:
  sqlite:
    file: "db/nfd.db"
    # SQLite特定配置
    options:
      journal_mode: "WAL"
      synchronous: "NORMAL"
      cache_size: 10000
      temp_store: "MEMORY"
```

#### MySQL 优化

```yaml
database:
  mysql:
    # 连接池配置
    pool:
      initial_size: 5
      max_active: 20
      max_idle: 10
      min_idle: 5
      max_wait: 60000
      
    # MySQL特定配置
    options:
      useSSL: false
      useUnicode: true
      characterEncoding: "utf8mb4"
      autoReconnect: true
      failOverReadOnly: false
      maxReconnects: 3
```

## 监控配置

### 健康检查配置

```yaml
health:
  # 健康检查端点
  endpoint: "/health"
  
  # 检查项目
  checks:
    database: true
    cache: true
    external_apis: true
    
  # 检查超时（秒）
  timeout: 10
```

### 指标收集配置

```yaml
metrics:
  # 是否启用指标收集
  enabled: true
  
  # 指标端点
  endpoint: "/metrics"
  
  # 收集的指标
  include:
    - "jvm"
    - "system"
    - "http"
    - "cache"
    - "database"
```

## 配置验证

### 配置检查脚本

```bash
#!/bin/bash

CONFIG_DIR="resources"

echo "检查配置文件..."

# 检查配置文件是否存在
if [ ! -f "$CONFIG_DIR/app-dev.yml" ]; then
    echo "错误: 缺少主配置文件 app-dev.yml"
    exit 1
fi

# 验证YAML语法
python3 -c "
import yaml
import sys

try:
    with open('$CONFIG_DIR/app-dev.yml', 'r') as f:
        yaml.safe_load(f)
    print('✓ app-dev.yml 语法正确')
except yaml.YAMLError as e:
    print(f'✗ app-dev.yml 语法错误: {e}')
    sys.exit(1)
"

# 检查端口是否被占用
PORT=$(grep -E "^\s*port:\s*[0-9]+" "$CONFIG_DIR/app-dev.yml" | awk '{print $2}')
if netstat -tlnp | grep ":$PORT " > /dev/null; then
    echo "警告: 端口 $PORT 已被占用"
else
    echo "✓ 端口 $PORT 可用"
fi

echo "配置检查完成"
```

## 常见配置问题

### 1. 端口冲突

**问题**: 服务启动失败，提示端口已被占用

**解决方案**:
```bash
# 查找占用端口的进程
netstat -tlnp | grep :6400

# 修改配置文件中的端口
# 或者停止占用端口的进程
kill -9 [PID]
```

### 2. 内存不足

**问题**: 服务运行一段时间后出现内存溢出

**解决方案**:
```yaml
# 调整缓存配置
cache:
  max_entries: 5000  # 减少缓存条目
  
# 或者增加JVM内存
# -Xmx2048m
```

### 3. 数据库连接失败

**问题**: 无法连接到数据库

**解决方案**:
```bash
# 检查数据库服务状态
systemctl status mysql

# 检查网络连接
telnet database_host 3306

# 验证用户名和密码
mysql -h host -u user -p
```

### 4. 代理配置错误

**问题**: 代理服务无法访问外部API

**解决方案**:
```bash
# 测试代理连接
curl --proxy http://proxy_host:proxy_port http://www.baidu.com

# 检查代理配置格式
# 确保网盘类型标识正确
```

## 配置模板

### 开发环境配置

```yaml
# 开发环境配置模板
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

security:
  rate_limit:
    enabled: false
```

### 生产环境配置

```yaml
# 生产环境配置模板
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

security:
  rate_limit:
    enabled: true
    requests_per_minute: 60
```

通过合理配置这些参数，可以让 NFD Parser 在不同环境下稳定高效地运行。