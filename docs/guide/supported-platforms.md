# 支持的网盘

NFD Parser 支持多款主流网盘平台，以下是详细的支持列表。

## 开源版支持的网盘

### 文件分享网盘

| 网盘名称 | 标识 | 官网 | 免登陆下载 | 加密分享 | 单文件大小限制 |
|---------|------|------|-----------|----------|---------------|
| **蓝奏云** | `lz` | [woozooo.com](https://pc.woozooo.com/) | ✅ | ✅ | 100M |
| **蓝奏云优享** | `iz` | [ilanzou.com](https://www.ilanzou.com/) | ✅ | ✅ | - |
| **奶牛快传** | `cow` | [cowtransfer.com](https://cowtransfer.com/) | ✅ | ❌ | 不限 |
| **移动云云空间** | `ec` | [ecpan.cn](https://www.ecpan.cn/web) | ✅ | ✅(密码可忽略) | 不限 |
| **小飞机网盘** | `fj` | [feijipan.com](https://www.feijipan.com/) | ✅ | ✅(密码可忽略) | 不限 |
| **亿方云** | `fc` | [fangcloud.com](https://www.fangcloud.com/) | ✅ | ✅(密码可忽略) | 不限 |
| **123云盘** | `ye` | [123pan.com](https://www.123pan.com/) | ✅ | ✅ | 100G* |
| **文叔叔** | `ws` | [wenshushu.cn](https://www.wenshushu.cn/) | ✅ | ✅ | 5GB |
| **联想乐云** | `le` | [lecloud.lenovo.com](https://lecloud.lenovo.com/) | ✅ | ✅ | 不限 |
| **QQ邮箱云盘** | `qqw` | [mail.qq.com](https://mail.qq.com/) | ✅ | ❌ | 不限 |
| **QQ闪传** | `qqsc` | - | ✅ | - | - |
| **城通网盘** | `ct` | [ctfile.com](https://www.ctfile.com) | ✅ | ✅ | 不限 |
| **Cloudreve** | `ce` | [Cloudreve](https://github.com/cloudreve/Cloudreve) | ✅ | ✅ | 不限 |
| **超星云盘** | `pcx` | [pan-yz.chaoxing.com](https://pan-yz.chaoxing.com) | ✅ | - | - |
| **WPS云文档** | `pwps` | [wps.cn](https://www.wps.cn/) | ✅ | ❌ | 10M(免费)/2G(会员) |

*123云盘大文件(>100MB)需要登录

### 国际网盘

| 网盘名称 | 标识 | 说明 |
|---------|------|------|
| **Google Drive** | `pgd` | 需要配置代理 |
| **OneDrive** | `pod` | 需要配置代理 |
| **Dropbox** | `pdp` | 需要配置代理 |
| **iCloud** | `pic` | 需要配置代理 |

### 音乐分享链接

| 平台名称 | 标识 | 官网 |
|---------|------|------|
| **网易云音乐** | `mnes` | [music.163.com](https://music.163.com) |
| **酷狗音乐** | `mkgs` | [kugou.com](https://www.kugou.com) |
| **酷我音乐** | `mkws` | [kuwo.cn](https://kuwo.cn) |
| **QQ音乐** | `mqqs` | [y.qq.com](https://y.qq.com) |
| **汽水音乐** | `qishui_music` | - |
| **咪咕音乐** | `migu` | - |

### 其他

| 平台名称 | 标识 | 说明 |
|---------|------|------|
| **一刻相册** | `baidu_photo` | 百度一刻相册 |

## 专属版支持的网盘

以下网盘需要专属版本才能支持：

| 网盘名称 | 标识 | 官网 | 说明 |
|---------|------|------|------|
| **夸克网盘** | `qk` | [pan.quark.cn](https://pan.quark.cn/) | 必须配置 Cookie |
| **UC网盘** | `uc` | [drive.uc.cn](https://drive.uc.cn/) | 必须配置 Cookie |
| **移动云盘** | `p139` | [yun.139.com](https://yun.139.com/) | - |
| **联通云盘** | `pwo` | [pan.wo.cn](https://pan.wo.cn/) | - |
| **天翼云盘** | `p189` | [cloud.189.cn](https://cloud.189.cn/) | - |

## 注意事项

1. **小飞机网盘**: 解析有IP限制，多数云服务商的大陆IP会被拦截，建议配置代理
2. **奶牛快传**: 直链需要加入请求头 `Referer: https://cowtransfer.com/`
3. **123云盘**: 解析大文件(>100MB)需要登录
4. **夸克/UC网盘**: 必须提供 Cookie 才能解析，参考 [认证参数](/api#认证参数-v0-2-1)
5. **国际网盘**: 需要配置代理才能正常访问
6. **超星云盘**: 需要 referer: `https://pan-yz.chaoxing.com`

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

## 使用建议

1. **推荐使用**: 蓝奏云、亿方云（稳定性较好）
2. **大文件分享**: 建议使用123云盘、小飞机网盘
3. **国际用户**: 可考虑 Google Drive、OneDrive 等国际网盘
4. **临时分享**: 文叔叔、奶牛快传适合临时文件分享
5. **需要登录**: 夸克/UC网盘功能强大但需要配置认证信息

## 添加新网盘支持

如果您需要支持新的网盘平台，可以：

1. 在 [GitHub](https://github.com/qaiu/netdisk-fast-download) 提交 Issue
2. 参考 [JavaScript解析器开发指南](https://github.com/qaiu/netdisk-fast-download) 编写自定义解析器
3. 参与开发贡献代码

---

*支持列表会根据网盘平台政策变化而更新，部分网盘可能会临时不可用。*
