# 部署指南

本指南基于 [netdisk-fast-download](https://github.com/qaiu/netdisk-fast-download) 项目的部署文档。

## 环境要求

- **Java**: JDK 17 或更高版本 (提供 JDK 11 分支 main-jdk11)
- **Maven**: 用于构建项目
- **内存**: 至少 512MB RAM
- **存储**: 至少 1GB 可用磁盘空间

## 服务端口

- **6400**: API 服务端口（建议使用 Nginx 代理）
- **6401**: 内置 Web 解析工具（个人使用可直接开放此端口）

## JDK 下载

推荐使用阿里 Dragonwell JDK 17:

- [Dragonwell17-windows-x86](https://github.com/alibaba/dragonwell17/releases)
- [Dragonwell17-linux-x86](https://github.com/alibaba/dragonwell17/releases)
- [Dragonwell17-linux-aarch64](https://github.com/alibaba/dragonwell17/releases)

## 开发和打包

```bash
# 环境要求: JDK 17 + Maven
git clone https://github.com/qaiu/netdisk-fast-download.git
cd netdisk-fast-download

mvn clean
mvn package -DskipTests
```

打包好的文件位于 `web-service/target/netdisk-fast-download-bin.zip`

## 快速部署

[通过雨云一键部署](https://www.rainyun.com/)

## Docker 部署

### 海外服务器部署

```bash
# 创建目录
mkdir -p netdisk-fast-download
cd netdisk-fast-download

# 拉取镜像
docker pull ghcr.io/qaiu/netdisk-fast-download:latest

# 复制配置文件（或下载仓库 web-service/src/main/resources）
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

# 反代6401端口

# 升级容器
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower --cleanup --run-once netdisk-fast-download
```

### 国内服务器部署

```bash
# 创建目录
mkdir -p netdisk-fast-download
cd netdisk-fast-download

# 拉取镜像（使用国内镜像源）
docker pull ghcr.nju.edu.cn/qaiu/netdisk-fast-download:latest

# 复制配置文件（或下载仓库 web-service/src/main/resources）
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

# 反代6401端口

# 升级容器
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower --cleanup --run-once netdisk-fast-download
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
```

## Linux 系统服务部署

### 自动部署脚本

```bash
cd ~
wget -O netdisk-fast-download.zip \
  https://github.com/qaiu/netdisk-fast-download/releases/download/v0.1.9b7/netdisk-fast-download-bin.zip
unzip netdisk-fast-download-bin.zip
cd netdisk-fast-download
bash service-install.sh
```

::: warning 注意
netdisk-fast-download.service 中的 ExecStart 的路径需改为实际路径
:::

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

# 停止开机自启
systemctl disable netdisk-fast-download.service
```

## Windows 部署

### 系统服务部署

1. 下载并解压 releases 版本 `netdisk-fast-download-bin.zip`
2. 进入 `netdisk-fast-download` 下的 `bin` 目录
3. 使用管理员权限运行 `nfd-service-install.bat`

### 直接运行

如果不想使用系统服务，可以直接运行 `run.bat`

::: warning 注意
如果 JDK 环境变量的 Java 版本不是 17，请修改 `nfd-service-template.xml` 中的 Java 命令路径为实际路径。
:::

## 宝塔面板部署

详细的宝塔部署教程请参考: [宝塔部署教程](https://blog.qaiu.top/archives/netdisk-fast-download-bao-ta-an-zhuang-jiao-cheng)

### 基本步骤

1. 安装 Java 环境
2. 上传项目文件到服务器
3. 在宝塔面板中配置端口访问
4. 创建守护进程
5. 配置反向代理

## 配置文件说明

### 目录结构
```
resources/
├── app-dev.yml          # 服务配置
├── server-proxy.yml     # 代理服务配置
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
- SSL 配置

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

nfd-proxy 搭建 http 代理服务器参考: [nfd-proxy](https://github.com/nfd-parser/nfd-proxy)

### 认证信息配置

部分网盘（如123）解析大文件时需要登录认证，可以在配置文件中添加认证信息。

修改 `app-dev.yml`:

```yaml
### 解析认证相关
auths:
  # 123：配置用户名密码
  ye:
    username: 你的用户名
    password: 你的密码
```

::: info 注意
目前仅支持 123（ye）的认证配置。夸克/UC 等网盘的认证通过 `auth` 参数传递，参考 [认证参数文档](/api#认证参数-v0-2-1)。
:::

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

## 性能优化

### JVM 参数优化

```bash
# 对于 2GB 内存的服务器
java -Xms512m -Xmx1024m -jar app.jar

# 对于 4GB 内存的服务器
java -Xms1024m -Xmx2048m -jar app.jar
```

## 监控和日志

### 日志文件

日志文件通常位于 `logs/` 目录下。

### 健康检查

```bash
# 检查服务状态
curl http://localhost:6400/v2/statisticsInfo
```

## 故障排除

### 端口被占用

```bash
# 查看端口占用
netstat -tulpn | grep 6400
```

### 内存不足

调整 JVM 参数或减少缓存配置。

### 权限问题

```bash
chmod +x run.sh
```

## 专属版

专属版提供以下额外功能：
- 小飞机、蓝奏优享大文件解析支持
- 天翼云盘、移动云盘、联通云盘解析支持
- 功能定制开发
- 托管服务：包含部署服务和云服务器环境

### 联系方式

- QQ: 197575894
- 微信: imcoding_
