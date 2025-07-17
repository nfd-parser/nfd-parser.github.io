# 部署指南

本指南基于 [netdisk-fast-download](https://github.com/qaiu/netdisk-fast-download) 项目的部署文档。

## 环境要求

- **Java**: JDK 17 或更高版本 (提供 JDK 11 分支)
- **Maven**: 用于构建项目
- **内存**: 至少 512MB RAM
- **存储**: 至少 1GB 可用磁盘空间

## JDK 下载

推荐使用阿里 Dragonwell JDK 17:

- [Windows x86](https://github.com/alibaba/dragonwell17/releases) - 从官方 GitHub 获取
- [Linux x86](https://github.com/alibaba/dragonwell17/releases) - 从官方 GitHub 获取
- [Linux aarch64](https://github.com/alibaba/dragonwell17/releases) - 从官方 GitHub 获取

## 构建项目

```bash
# 克隆项目
git clone https://github.com/qaiu/netdisk-fast-download.git
cd netdisk-fast-download

# 环境要求: JDK 17 + Maven
mvn clean
mvn package
```

构建完成后，打包文件位于 `web-service/target/netdisk-fast-download-bin.zip`

## Docker 部署

### 海外服务器部署

```bash
# 创建目录
mkdir -p netdisk-fast-download
cd netdisk-fast-download

# 拉取镜像
docker pull ghcr.io/qaiu/netdisk-fast-download:latest

# 复制配置文件
docker create --name netdisk-fast-download ghcr.io/qaiu/netdisk-fast-download:latest
docker cp netdisk-fast-download:/app/resources ./resources
docker rm netdisk-fast-download

# 启动容器
docker run -d -it --name netdisk-fast-download \
  -p 6401:6401 \
  --restart unless-stopped \
  -e TZ=Asia/Shanghai \
  -v ./resources:/app/resources \
  -v ./db:/app/db \
  -v ./logs:/app/logs \
  ghcr.io/qaiu/netdisk-fast-download:latest
```

### 国内服务器部署

```bash
# 创建目录
mkdir -p netdisk-fast-download
cd netdisk-fast-download

# 拉取镜像（使用国内镜像源）
docker pull ghcr.nju.edu.cn/qaiu/netdisk-fast-download:latest

# 复制配置文件
docker create --name netdisk-fast-download ghcr.nju.edu.cn/qaiu/netdisk-fast-download:latest
docker cp netdisk-fast-download:/app/resources ./resources
docker rm netdisk-fast-download

# 启动容器
docker run -d -it --name netdisk-fast-download \
  -p 6401:6401 \
  --restart unless-stopped \
  -e TZ=Asia/Shanghai \
  -v ./resources:/app/resources \
  -v ./db:/app/db \
  -v ./logs:/app/logs \
  ghcr.nju.edu.cn/qaiu/netdisk-fast-download:latest
```

### Docker 容器管理

```bash
# 查看容器状态
docker ps

# 查看日志
docker logs netdisk-fast-download

# 停止容器
docker stop netdisk-fast-download

# 启动容器
docker start netdisk-fast-download

# 重启容器
docker restart netdisk-fast-download

# 升级容器
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower --cleanup --run-once netdisk-fast-download
```

## Linux 系统服务部署

### 自动部署脚本

```bash
cd ~
wget -O netdisk-fast-download.zip \
  https://github.com/qaiu/netdisk-fast-download/releases/download/0.1.8-release-fixed2/netdisk-fast-download-bin-fixed2.zip
unzip netdisk-fast-download-bin.zip
cd netdisk-fast-download
bash service-install.sh
```

### 手动部署

1. **下载并解压**:
```bash
wget -O netdisk-fast-download.zip [下载链接]
unzip netdisk-fast-download-bin.zip
cd netdisk-fast-download
```

2. **配置系统服务**:
```bash
# 编辑服务文件，修改ExecStart路径为实际路径
sudo nano /etc/systemd/system/netdisk-fast-download.service

# 重新加载systemd
sudo systemctl daemon-reload

# 启用服务
sudo systemctl enable netdisk-fast-download.service
```

### 服务管理命令

```bash
# 查看服务状态
systemctl status netdisk-fast-download.service

# 启动服务
systemctl start netdisk-fast-download.service

# 重启服务
systemctl restart netdisk-fast-download.service

# 停止服务
systemctl stop netdisk-fast-download.service

# 开机自启
systemctl enable netdisk-fast-download.service

# 禁用开机自启
systemctl disable netdisk-fast-download.service
```

## Windows 部署

### 系统服务部署

1. **下载解压**: 下载并解压 `netdisk-fast-download-bin.zip`
2. **进入目录**: 进入 `netdisk-fast-download/bin` 目录
3. **安装服务**: 使用管理员权限运行 `nfd-service-install.bat`

### 直接运行

如果不想使用系统服务，可以直接运行 `run.bat`

### 注意事项

如果 JDK 环境变量的 Java 版本不是 17，请修改 `nfd-service-template.xml` 中的 Java 命令路径为实际路径。

## 配置文件说明

### 目录结构
```
resources/
├── app-dev.yml          # 服务配置
├── server-proxy.yml     # 代理配置
└── ...                  # 其他配置文件
```

### 主要配置文件

#### app-dev.yml
主要服务配置，包括：
- 服务端口
- 域名设置
- 缓存配置
- 代理设置

#### server-proxy.yml
代理服务配置，包括：
- 前端反向代理端口
- 路径配置
- 其他代理相关设置

### IP 代理配置

当解析量很大，IP 容易被封时，可以配置代理服务器。

修改 `app-dev.yml`:

```yaml
proxy:
  - panTypes: pgd,pdb,pod     # 网盘标识
    type: http                # 支持 http/socks4/socks5
    host: 127.0.0.1           # 代理IP
    port: 7890                # 端口
    username:                 # 用户名
    password:                 # 密码
```

## Nginx 反向代理

### 基本配置

```nginx
server {
    listen 80;
    server_name your_domain.com;
    
    location / {
        proxy_pass http://127.0.0.1:6400;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name your_domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/cert.key;
    
    location / {
        proxy_pass http://127.0.0.1:6400;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 宝塔面板部署

详细的宝塔部署教程请参考: [宝塔部署教程](https://blog.qaiu.top/archives/netdisk-fast-download-bao-ta-an-zhuang-jiao-cheng)

### 基本步骤

1. **环境准备**: 安装 Java 环境
2. **文件上传**: 上传项目文件到服务器
3. **配置端口**: 在宝塔面板中配置端口访问
4. **启动服务**: 创建守护进程
5. **域名绑定**: 配置反向代理

## 性能优化

### JVM 参数优化

```bash
# 对于 2GB 内存的服务器
java -Xms512m -Xmx1024m -jar app.jar

# 对于 4GB 内存的服务器
java -Xms1024m -Xmx2048m -jar app.jar
```

### 缓存优化

在配置文件中调整缓存相关参数：
- 缓存时长
- 缓存大小
- 清理策略

### 数据库优化

- 定期清理过期数据
- 优化查询索引
- 配置连接池

## 监控和日志

### 日志配置

日志文件通常位于 `logs/` 目录下：
- `app.log`: 应用日志
- `error.log`: 错误日志
- `access.log`: 访问日志

### 健康检查

```bash
# 检查服务状态
curl http://localhost:6400/v2/statisticsInfo

# 检查进程
ps aux | grep netdisk-fast-download
```

## 故障排除

### 常见问题

1. **端口被占用**:
```bash
# 查看端口占用
netstat -tulpn | grep 6400

# 杀死占用进程
kill -9 [PID]
```

2. **内存不足**:
```bash
# 查看内存使用
free -h

# 调整 JVM 参数
```

3. **权限问题**:
```bash
# 检查文件权限
ls -la

# 修改权限
chmod +x run.sh
```

### 日志分析

```bash
# 查看实时日志
tail -f logs/app.log

# 查看错误日志
grep -i error logs/app.log

# 查看最近的日志
tail -n 100 logs/app.log
```

## 安全注意事项

1. **防火墙配置**: 只开放必要的端口
2. **访问限制**: 配置 IP 白名单或限流
3. **定期更新**: 及时更新到最新版本
4. **备份数据**: 定期备份配置和数据
5. **监控异常**: 设置异常监控和告警

## 扩展和定制

### 专属版功能

专属版提供以下额外功能：
- 小飞机、蓝奏优享大文件解析支持
- 天翼云盘、移动云盘、联通云盘解析支持
- 功能定制开发
- 部署服务和首页定制

### 联系方式

- QQ: 197575894
- 微信: imcoding_
- 价格: 99元起