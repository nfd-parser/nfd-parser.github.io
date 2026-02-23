# 使用示例

本页面提供了 NFD Parser 的详细使用示例和代码演示。

## 在线演示

在学习编程示例之前，先试试我们的在线演示工具：

<ClientOnly>
  <DemoParser />
</ClientOnly>

## 快速开始

### 基本解析示例

```bash
# 解析蓝奏云分享链接
curl "http://your_host:6400/json/lz/ia2cntg"

# 解析带密码的分享链接
curl "http://your_host:6400/json/fc/e5079007dc31226096628870c7@QAIU"

# 使用通用接口
curl "http://your_host:6400/json/parser?url=https://lanzoux.com/ia2cntg"
```

## 编程语言示例

### 基础封装类

::: code-group

```javascript [JavaScript]
class NFDParser {
    constructor(baseUrl = 'http://localhost:6400') {
        this.baseUrl = baseUrl;
    }

    async parseLink(shareUrl, password = '') {
        const params = new URLSearchParams({ url: shareUrl });
        if (password) params.append('pwd', password);

        const response = await fetch(`${this.baseUrl}/json/parser?${params}`);
        const result = await response.json();

        if (result.success) return result.data;
        throw new Error(result.msg);
    }

    getDirectUrl(shareUrl, password = '') {
        const params = new URLSearchParams({ url: shareUrl });
        if (password) params.append('pwd', password);
        return `${this.baseUrl}/parser?${params}`;
    }

    async getFileList(shareUrl, password = '') {
        const params = new URLSearchParams({ url: shareUrl });
        if (password) params.append('pwd', password);

        const response = await fetch(`${this.baseUrl}/v2/getFileList?${params}`);
        const result = await response.json();

        if (result.success) return result.data;
        throw new Error(result.msg);
    }
}
```

```python [Python]
import requests
from urllib.parse import urlencode
from typing import Dict, List, Any

class NFDParser:
    def __init__(self, base_url: str = 'http://localhost:6400'):
        self.base_url = base_url
        self.session = requests.Session()

    def parse_link(self, share_url: str, password: str = '') -> Dict[str, Any]:
        params = {'url': share_url}
        if password:
            params['pwd'] = password

        response = self.session.get(
            f'{self.base_url}/json/parser', params=params, timeout=30
        )
        response.raise_for_status()
        result = response.json()

        if result.get('success'):
            return result['data']
        raise Exception(result.get('msg', '解析失败'))

    def get_direct_url(self, share_url: str, password: str = '') -> str:
        params = {'url': share_url}
        if password:
            params['pwd'] = password
        return f"{self.base_url}/parser?{urlencode(params)}"

    def get_file_list(self, share_url: str, password: str = '') -> List[Dict]:
        params = {'url': share_url}
        if password:
            params['pwd'] = password

        response = self.session.get(
            f'{self.base_url}/v2/getFileList', params=params, timeout=30
        )
        response.raise_for_status()
        result = response.json()

        if result.get('success'):
            return result['data']
        raise Exception(result.get('msg', '获取文件列表失败'))
```

```php [PHP]
<?php
class NFDParser {
    private $baseUrl;

    public function __construct($baseUrl = 'http://localhost:6400') {
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    public function parseLink($shareUrl, $password = '') {
        $params = ['url' => $shareUrl];
        if (!empty($password)) $params['pwd'] = $password;

        $url = $this->baseUrl . '/json/parser?' . http_build_query($params);
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200)
            throw new Exception("HTTP请求失败: $httpCode");

        $result = json_decode($response, true);
        if ($result['success']) return $result['data'];
        throw new Exception($result['msg'] ?? '解析失败');
    }

    public function getDirectUrl($shareUrl, $password = '') {
        $params = ['url' => $shareUrl];
        if (!empty($password)) $params['pwd'] = $password;
        return $this->baseUrl . '/parser?' . http_build_query($params);
    }

    public function getFileList($shareUrl, $password = '') {
        $params = ['url' => $shareUrl];
        if (!empty($password)) $params['pwd'] = $password;

        $url = $this->baseUrl . '/v2/getFileList?' . http_build_query($params);
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
        ]);
        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);
        if ($result['success']) return $result['data'];
        throw new Exception($result['msg'] ?? '获取文件列表失败');
    }
}
?>
```

```java [Java]
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.http.*;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public class NFDParser {
    private final String baseUrl;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public NFDParser(String baseUrl) {
        this.baseUrl = baseUrl.endsWith("/")
            ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    public NFDParser() { this("http://localhost:6400"); }

    @SuppressWarnings("unchecked")
    public Map<String, Object> parseLink(String shareUrl, String password)
            throws Exception {
        String url = baseUrl + "/json/parser?url="
            + URLEncoder.encode(shareUrl, StandardCharsets.UTF_8);
        if (password != null && !password.isEmpty())
            url += "&pwd=" + URLEncoder.encode(password, StandardCharsets.UTF_8);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url)).GET().build();
        HttpResponse<String> response = httpClient.send(
                request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200)
            throw new RuntimeException("HTTP " + response.statusCode());

        Map<String, Object> result = objectMapper.readValue(
                response.body(), Map.class);
        if (Boolean.TRUE.equals(result.get("success")))
            return (Map<String, Object>) result.get("data");
        throw new RuntimeException((String) result.get("msg"));
    }

    public String getDirectUrl(String shareUrl, String password) {
        String url = baseUrl + "/parser?url="
            + URLEncoder.encode(shareUrl, StandardCharsets.UTF_8);
        if (password != null && !password.isEmpty())
            url += "&pwd=" + URLEncoder.encode(password, StandardCharsets.UTF_8);
        return url;
    }
}
```

```lua [Lua]
local http = require("socket.http")
local ltn12 = require("ltn12")
local json = require("cjson")

local NFDParser = {}
NFDParser.__index = NFDParser

function NFDParser.new(baseUrl)
    local self = setmetatable({}, NFDParser)
    self.baseUrl = baseUrl or "http://localhost:6400"
    return self
end

function NFDParser:parseLink(shareUrl, password)
    local url = self.baseUrl .. "/json/parser?url=" .. self:urlEncode(shareUrl)
    if password and password ~= "" then
        url = url .. "&pwd=" .. self:urlEncode(password)
    end

    local respBody = {}
    local _, code = http.request{
        url = url,
        sink = ltn12.sink.table(respBody),
    }

    if code ~= 200 then
        error("HTTP请求失败: " .. tostring(code))
    end

    local result = json.decode(table.concat(respBody))
    if result.success then
        return result.data
    end
    error(result.msg or "解析失败")
end

function NFDParser:getDirectUrl(shareUrl, password)
    local url = self.baseUrl .. "/parser?url=" .. self:urlEncode(shareUrl)
    if password and password ~= "" then
        url = url .. "&pwd=" .. self:urlEncode(password)
    end
    return url
end

function NFDParser:getFileList(shareUrl, password)
    local url = self.baseUrl .. "/v2/getFileList?url=" .. self:urlEncode(shareUrl)
    if password and password ~= "" then
        url = url .. "&pwd=" .. self:urlEncode(password)
    end

    local respBody = {}
    local _, code = http.request{
        url = url,
        sink = ltn12.sink.table(respBody),
    }

    if code ~= 200 then
        error("HTTP请求失败: " .. tostring(code))
    end

    local result = json.decode(table.concat(respBody))
    if result.success then
        return result.data
    end
    error(result.msg or "获取文件列表失败")
end

function NFDParser:urlEncode(str)
    return (str:gsub("([^%w%-%.%_%~])", function(c)
        return string.format("%%%02X", string.byte(c))
    end))
end

return NFDParser
```

```e [易语言]
.版本 2
.支持库 spec

.程序集 NFD解析器

.子程序 解析链接, 文本型, 公开, 解析网盘分享链接，返回JSON结果
.参数 服务地址, 文本型, , 如 "http://localhost:6400"
.参数 分享链接, 文本型, , 分享链接地址
.参数 分享密码, 文本型, 可空, 提取码（可选）
.局部变量 请求地址, 文本型
.局部变量 返回数据, 文本型

请求地址 ＝ 服务地址 ＋ "/json/parser?url=" ＋ 编码_URL编码 (分享链接)
.如果 (分享密码 ≠ "")
    请求地址 ＝ 请求地址 ＋ "&pwd=" ＋ 编码_URL编码 (分享密码)
.如果结束
返回数据 ＝ 网页_访问_对象 (请求地址, 0, , , , , , , , , , , , )
返回 (返回数据)

.子程序 取直链地址, 文本型, 公开, 获取302重定向直链URL
.参数 服务地址, 文本型
.参数 分享链接, 文本型
.参数 分享密码, 文本型, 可空
.局部变量 请求地址, 文本型

请求地址 ＝ 服务地址 ＋ "/parser?url=" ＋ 编码_URL编码 (分享链接)
.如果 (分享密码 ≠ "")
    请求地址 ＝ 请求地址 ＋ "&pwd=" ＋ 编码_URL编码 (分享密码)
.如果结束
返回 (请求地址)

.子程序 取文件列表, 文本型, 公开, 获取文件夹文件列表JSON
.参数 服务地址, 文本型
.参数 分享链接, 文本型
.参数 分享密码, 文本型, 可空
.局部变量 请求地址, 文本型
.局部变量 返回数据, 文本型

请求地址 ＝ 服务地址 ＋ "/v2/getFileList?url=" ＋ 编码_URL编码 (分享链接)
.如果 (分享密码 ≠ "")
    请求地址 ＝ 请求地址 ＋ "&pwd=" ＋ 编码_URL编码 (分享密码)
.如果结束
返回数据 ＝ 网页_访问_对象 (请求地址, 0, , , , , , , , , , , , )
返回 (返回数据)

' ---- 使用示例 ----
.子程序 使用示例
.局部变量 结果, 文本型

结果 ＝ 解析链接 ("http://localhost:6400", "https://lanzoux.com/ia2cntg", "")
调试输出 ("解析结果: " ＋ 结果)

结果 ＝ 取直链地址 ("http://localhost:6400", "https://lanzoux.com/ia2cntg", "")
调试输出 ("直链地址: " ＋ 结果)
```

:::

### 使用示例

::: code-group

```javascript [JavaScript]
const parser = new NFDParser('http://localhost:6400');

// 解析单个文件
parser.parseLink('https://lanzoux.com/ia2cntg')
    .then(data => {
        console.log('直链:', data.directLink);
        console.log('缓存命中:', data.cacheHit);
    })
    .catch(error => console.error('解析失败:', error.message));

// 获取文件列表
parser.getFileList('https://lanzoux.com/folder_link')
    .then(files => {
        files.forEach(f => console.log(`${f.fileName} - ${f.sizeStr}`));
    });
```

```python [Python]
parser = NFDParser('http://localhost:6400')

try:
    result = parser.parse_link('https://lanzoux.com/ia2cntg')
    print(f"直链: {result['directLink']}")
    print(f"缓存命中: {result['cacheHit']}")

    files = parser.get_file_list('https://lanzoux.com/folder_link')
    for f in files:
        print(f"{f['fileName']} - {f['sizeStr']}")
except Exception as e:
    print(f"错误: {e}")
```

```php [PHP]
<?php
$parser = new NFDParser('http://localhost:6400');

try {
    $result = $parser->parseLink('https://lanzoux.com/ia2cntg');
    echo "直链: " . $result['directLink'] . "\n";
    echo "缓存命中: " . ($result['cacheHit'] ? '是' : '否') . "\n";

    $files = $parser->getFileList('https://lanzoux.com/folder_link');
    foreach ($files as $file) {
        echo $file['fileName'] . " - " . $file['sizeStr'] . "\n";
    }
} catch (Exception $e) {
    echo "错误: " . $e->getMessage() . "\n";
}
?>
```

```java [Java]
public static void main(String[] args) {
    try {
        NFDParser parser = new NFDParser("http://localhost:6400");

        Map<String, Object> result = parser.parseLink(
            "https://lanzoux.com/ia2cntg", "");
        System.out.println("直链: " + result.get("directLink"));
        System.out.println("缓存命中: " + result.get("cacheHit"));

    } catch (Exception e) {
        System.err.println("错误: " + e.getMessage());
    }
}
```

```lua [Lua]
local NFDParser = require("nfd_parser")
local parser = NFDParser.new("http://localhost:6400")

-- 解析单个文件
local ok, result = pcall(parser.parseLink, parser, "https://lanzoux.com/ia2cntg")
if ok then
    print("直链: " .. result.directLink)
    print("缓存命中: " .. tostring(result.cacheHit))
else
    print("解析失败: " .. result)
end

-- 获取文件列表
local ok2, files = pcall(parser.getFileList, parser, "https://lanzoux.com/folder_link")
if ok2 then
    for _, f in ipairs(files) do
        print(f.fileName .. " - " .. f.sizeStr)
    end
end
```

```e [易语言]
.子程序 _按钮_解析_被单击

.局部变量 结果, 文本型
.局部变量 json, 类_json

结果 ＝ 解析链接 ("http://localhost:6400", 编辑框_链接.内容, 编辑框_密码.内容)

json.解析 (结果)
.如果 (json.取通用属性 ("success") ＝ "true")
    编辑框_结果.内容 ＝ "直链: " ＋ json.取通用属性 ("data.directLink")
.否则
    编辑框_结果.内容 ＝ "解析失败: " ＋ json.取通用属性 ("msg")
.如果结束
```

:::

### 框架集成

::: code-group

```javascript [Express.js]
const express = require('express');
const app = express();

async function parseNetdiskMiddleware(req, res, next) {
    const { url, password } = req.query;
    if (!url) return res.status(400).json({ error: '缺少分享链接参数' });

    try {
        const parser = new NFDParser();
        req.parsedResult = await parser.parseLink(url, password);
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

app.get('/parse', parseNetdiskMiddleware, (req, res) => {
    res.json({ success: true, data: req.parsedResult });
});

app.listen(3000);
```

```python [Django]
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
@require_http_methods(["POST"])
def parse_netdisk_view(request):
    try:
        data = json.loads(request.body)
        share_url = data.get('url')
        password = data.get('password', '')

        if not share_url:
            return JsonResponse(
                {'success': False, 'error': '缺少分享链接参数'}, status=400)

        parser = NFDParser()
        result = parser.parse_link(share_url, password)
        return JsonResponse({'success': True, 'data': result})

    except Exception as e:
        return JsonResponse(
            {'success': False, 'error': str(e)}, status=500)
```

```lua [OpenResty]
local http = require("resty.http")
local cjson = require("cjson")

local _M = {}

function _M.parse_handler(self)
    local args = ngx.req.get_uri_args()
    local share_url = args.url
    if not share_url then
        ngx.status = 400
        ngx.say(cjson.encode({success = false, error = "缺少分享链接参数"}))
        return
    end

    local httpc = http.new()
    local api_url = "http://127.0.0.1:6400/json/parser?url="
        .. ngx.escape_uri(share_url)
    if args.pwd then
        api_url = api_url .. "&pwd=" .. ngx.escape_uri(args.pwd)
    end

    local res, err = httpc:request_uri(api_url, {method = "GET"})
    if not res then
        ngx.status = 500
        ngx.say(cjson.encode({success = false, error = err}))
        return
    end

    ngx.header.content_type = "application/json"
    ngx.say(res.body)
end

return _M
```

:::

## 前端集成示例

### React 组件

```jsx
import React, { useState } from 'react';
import axios from 'axios';

const NetdiskParser = () => {
    const [shareUrl, setShareUrl] = useState('');
    const [password, setPassword] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const parseLink = async () => {
        if (!shareUrl.trim()) {
            setError('请输入分享链接');
            return;
        }
        
        setLoading(true);
        setError('');
        setResult(null);
        
        try {
            const response = await axios.get('/api/parse', {
                params: {
                    url: shareUrl,
                    pwd: password
                }
            });
            
            setResult(response.data.data);
        } catch (err) {
            setError(err.response?.data?.msg || '解析失败');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="netdisk-parser">
            <h2>网盘链接解析</h2>
            
            <div className="form-group">
                <input
                    type="text"
                    placeholder="请输入分享链接"
                    value={shareUrl}
                    onChange={(e) => setShareUrl(e.target.value)}
                    className="form-control"
                />
            </div>
            
            <div className="form-group">
                <input
                    type="text"
                    placeholder="分享密码（可选）"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                />
            </div>
            
            <button 
                onClick={parseLink}
                disabled={loading}
                className="btn btn-primary"
            >
                {loading ? '解析中...' : '解析链接'}
            </button>
            
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}
            
            {result && (
                <div className="result">
                    <h3>解析结果</h3>
                    <p><strong>直链:</strong> 
                        <a href={result.directLink} target="_blank" rel="noopener noreferrer">
                            {result.directLink}
                        </a>
                    </p>
                    <p><strong>缓存命中:</strong> {result.cacheHit ? '是' : '否'}</p>
                    <p><strong>过期时间:</strong> {result.expires}</p>
                </div>
            )}
        </div>
    );
};

export default NetdiskParser;
```

### Vue.js 组件

```vue
<template>
  <div class="netdisk-parser">
    <h2>网盘链接解析</h2>
    
    <el-form @submit.prevent="parseLink">
      <el-form-item>
        <el-input
          v-model="shareUrl"
          placeholder="请输入分享链接"
          clearable
        />
      </el-form-item>
      
      <el-form-item>
        <el-input
          v-model="password"
          placeholder="分享密码（可选）"
          clearable
        />
      </el-form-item>
      
      <el-form-item>
        <el-button 
          type="primary" 
          :loading="loading"
          @click="parseLink"
        >
          解析链接
        </el-button>
      </el-form-item>
    </el-form>
    
    <el-alert
      v-if="error"
      :title="error"
      type="error"
      :closable="false"
    />
    
    <el-card v-if="result" class="result-card">
      <h3>解析结果</h3>
      <p><strong>直链:</strong> 
        <a :href="result.directLink" target="_blank">
          {{ result.directLink }}
        </a>
      </p>
      <p><strong>缓存命中:</strong> {{ result.cacheHit ? '是' : '否' }}</p>
      <p><strong>过期时间:</strong> {{ result.expires }}</p>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'NetdiskParser',
  data() {
    return {
      shareUrl: '',
      password: '',
      result: null,
      loading: false,
      error: ''
    };
  },
  methods: {
    async parseLink() {
      if (!this.shareUrl.trim()) {
        this.error = '请输入分享链接';
        return;
      }
      
      this.loading = true;
      this.error = '';
      this.result = null;
      
      try {
        const response = await axios.get('/api/parse', {
          params: {
            url: this.shareUrl,
            pwd: this.password
          }
        });
        
        this.result = response.data.data;
      } catch (err) {
        this.error = err.response?.data?.msg || '解析失败';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
```

## 命令行工具示例

### Bash 脚本

```bash
#!/bin/bash

# NFD Parser 命令行工具
NFD_HOST="http://localhost:6400"

usage() {
    echo "用法: $0 [选项] <分享链接>"
    echo "选项:"
    echo "  -p, --password <密码>    分享密码"
    echo "  -h, --help              显示此帮助信息"
    echo "  -j, --json              输出JSON格式"
    echo "  -s, --stats             显示统计信息"
    echo ""
    echo "示例:"
    echo "  $0 https://lanzoux.com/ia2cntg"
    echo "  $0 -p QAIU https://v2.fangcloud.com/sharing/xxx"
    echo "  $0 -j https://lanzoux.com/ia2cntg"
    echo "  $0 -s"
}

parse_link() {
    local url="$1"
    local password="$2"
    local json_output="$3"
    
    if [ -z "$url" ]; then
        echo "错误: 缺少分享链接"
        exit 1
    fi
    
    local api_url="${NFD_HOST}/json/parser?url=$(urlencode "$url")"
    if [ -n "$password" ]; then
        api_url="${api_url}&pwd=$(urlencode "$password")"
    fi
    
    local response=$(curl -s "$api_url")
    local success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" = "true" ]; then
        if [ "$json_output" = "true" ]; then
            echo "$response"
        else
            local direct_link=$(echo "$response" | jq -r '.data.directLink')
            local cache_hit=$(echo "$response" | jq -r '.data.cacheHit')
            local expires=$(echo "$response" | jq -r '.data.expires')
            
            echo "解析成功!"
            echo "直链: $direct_link"
            echo "缓存命中: $cache_hit"
            echo "过期时间: $expires"
        fi
    else
        local msg=$(echo "$response" | jq -r '.msg')
        echo "解析失败: $msg"
        exit 1
    fi
}

show_stats() {
    local response=$(curl -s "${NFD_HOST}/v2/statisticsInfo")
    local success=$(echo "$response" | jq -r '.success')
    
    if [ "$success" = "true" ]; then
        local parser_total=$(echo "$response" | jq -r '.data.parserTotal')
        local cache_total=$(echo "$response" | jq -r '.data.cacheTotal')
        local total=$(echo "$response" | jq -r '.data.total')
        
        echo "解析统计信息:"
        echo "解析总数: $parser_total"
        echo "缓存总数: $cache_total"
        echo "总计: $total"
    else
        echo "获取统计信息失败"
        exit 1
    fi
}

urlencode() {
    echo "$1" | sed 's/:/%3A/g; s/\//%2F/g; s/?/%3F/g; s/#/%23/g; s/\[/%5B/g; s/\]/%5D/g; s/@/%40/g; s/!/%21/g; s/\$/%24/g; s/&/%26/g; s/'\''/%27/g; s/(/%28/g; s/)/%29/g; s/\*/%2A/g; s/+/%2B/g; s/,/%2C/g; s/;/%3B/g; s/=/%3D/g; s/ /%20/g'
}

# 解析命令行参数
password=""
json_output=false
show_statistics=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--password)
            password="$2"
            shift 2
            ;;
        -j|--json)
            json_output=true
            shift
            ;;
        -s|--stats)
            show_statistics=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            share_url="$1"
            shift
            ;;
    esac
done

# 执行相应操作
if [ "$show_statistics" = "true" ]; then
    show_stats
else
    parse_link "$share_url" "$password" "$json_output"
fi
```

## 批量处理示例

### Python 批量解析脚本

```python
import csv
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from nfd_parser import NFDParser  # 假设上面的类保存为 nfd_parser.py

def parse_single_link(parser, link_data):
    """解析单个链接"""
    try:
        result = parser.parse_link(link_data['url'], link_data.get('password', ''))
        return {
            'original_url': link_data['url'],
            'direct_link': result['directLink'],
            'cache_hit': result['cacheHit'],
            'expires': result['expires'],
            'status': 'success',
            'error': None
        }
    except Exception as e:
        return {
            'original_url': link_data['url'],
            'direct_link': None,
            'cache_hit': None,
            'expires': None,
            'status': 'error',
            'error': str(e)
        }

def batch_parse_links(input_file, output_file, max_workers=5):
    """批量解析链接"""
    parser = NFDParser()
    links = []
    
    # 读取输入文件
    with open(input_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        links = list(reader)
    
    print(f"准备解析 {len(links)} 个链接...")
    
    results = []
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # 提交任务
        future_to_link = {
            executor.submit(parse_single_link, parser, link): link 
            for link in links
        }
        
        # 收集结果
        for future in as_completed(future_to_link):
            result = future.result()
            results.append(result)
            
            status = "✓" if result['status'] == 'success' else "✗"
            print(f"{status} {result['original_url']}")
            
            # 避免请求过于频繁
            time.sleep(0.1)
    
    # 写入结果文件
    with open(output_file, 'w', encoding='utf-8', newline='') as f:
        fieldnames = ['original_url', 'direct_link', 'cache_hit', 'expires', 'status', 'error']
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results)
    
    # 统计结果
    success_count = sum(1 for r in results if r['status'] == 'success')
    error_count = len(results) - success_count
    
    print(f"\n解析完成!")
    print(f"成功: {success_count}")
    print(f"失败: {error_count}")
    print(f"结果已保存到: {output_file}")

if __name__ == '__main__':
    # 输入文件格式: url,password
    batch_parse_links('input_links.csv', 'output_results.csv')
```

## 错误处理和重试机制

### JavaScript 重试示例

```javascript
class NFDParserWithRetry extends NFDParser {
    constructor(baseUrl, options = {}) {
        super(baseUrl);
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
    }
    
    async parseWithRetry(shareUrl, password = '') {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await this.parseLink(shareUrl, password);
            } catch (error) {
                lastError = error;
                console.warn(`解析失败 (尝试 ${attempt}/${this.maxRetries}): ${error.message}`);
                
                if (attempt < this.maxRetries) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }
        
        throw lastError;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 使用示例
const parser = new NFDParserWithRetry('http://localhost:6400', {
    maxRetries: 3,
    retryDelay: 2000
});

parser.parseWithRetry('https://lanzoux.com/ia2cntg')
    .then(result => console.log('解析成功:', result))
    .catch(error => console.error('最终失败:', error));
```

这些示例展示了如何在不同编程语言和场景中使用 NFD Parser API。您可以根据具体需求选择合适的示例进行修改和使用。

<script setup>
import DemoParser from './.vitepress/components/DemoParser.vue'
</script>