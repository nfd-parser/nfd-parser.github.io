# 使用示例

本页面提供了 NFD Parser 的详细使用示例和代码演示。

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

### JavaScript / Node.js

#### 基础封装类
```javascript
class NFDParser {
    constructor(baseUrl = 'http://localhost:6400') {
        this.baseUrl = baseUrl;
    }
    
    /**
     * 解析分享链接
     * @param {string} shareUrl - 分享链接
     * @param {string} password - 分享密码（可选）
     * @returns {Promise<Object>} 解析结果
     */
    async parseLink(shareUrl, password = '') {
        const params = new URLSearchParams({ url: shareUrl });
        if (password) {
            params.append('pwd', password);
        }
        
        try {
            const response = await fetch(`${this.baseUrl}/json/parser?${params}`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.msg);
            }
        } catch (error) {
            console.error('解析失败:', error);
            throw error;
        }
    }
    
    /**
     * 获取直链（自动跳转）
     * @param {string} shareUrl - 分享链接
     * @param {string} password - 分享密码（可选）
     * @returns {string} 重定向URL
     */
    getDirectUrl(shareUrl, password = '') {
        const params = new URLSearchParams({ url: shareUrl });
        if (password) {
            params.append('pwd', password);
        }
        return `${this.baseUrl}/parser?${params}`;
    }
    
    /**
     * 获取文件夹列表
     * @param {string} shareUrl - 文件夹分享链接
     * @param {string} password - 分享密码（可选）
     * @returns {Promise<Array>} 文件列表
     */
    async getFileList(shareUrl, password = '') {
        const params = new URLSearchParams({ url: shareUrl });
        if (password) {
            params.append('pwd', password);
        }
        
        const response = await fetch(`${this.baseUrl}/v2/getFileList?${params}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.msg);
        }
    }
    
    /**
     * 获取统计信息
     * @returns {Promise<Object>} 统计数据
     */
    async getStatistics() {
        const response = await fetch(`${this.baseUrl}/v2/statisticsInfo`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.msg);
        }
    }
}

// 使用示例
const parser = new NFDParser('http://localhost:6400');

// 解析单个文件
parser.parseLink('https://lanzoux.com/ia2cntg')
    .then(data => {
        console.log('直链:', data.directLink);
        console.log('缓存命中:', data.cacheHit);
        console.log('过期时间:', data.expires);
    })
    .catch(error => {
        console.error('解析失败:', error.message);
    });

// 解析文件夹
parser.getFileList('https://lanzoux.com/folder_link')
    .then(files => {
        files.forEach(file => {
            console.log(`文件: ${file.fileName}, 大小: ${file.sizeStr}`);
        });
    })
    .catch(error => {
        console.error('获取文件列表失败:', error.message);
    });
```

#### Express.js 中间件示例
```javascript
const express = require('express');
const app = express();

// NFD Parser 中间件
async function parseNetdiskMiddleware(req, res, next) {
    const { url, password } = req.query;
    
    if (!url) {
        return res.status(400).json({ error: '缺少分享链接参数' });
    }
    
    try {
        const parser = new NFDParser();
        const result = await parser.parseLink(url, password);
        req.parsedResult = result;
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 使用中间件
app.get('/parse', parseNetdiskMiddleware, (req, res) => {
    res.json({
        success: true,
        data: req.parsedResult
    });
});

app.listen(3000, () => {
    console.log('服务启动在端口 3000');
});
```

### Python

#### 基础封装类
```python
import requests
from urllib.parse import urlencode
from typing import Optional, Dict, List, Any

class NFDParser:
    def __init__(self, base_url: str = 'http://localhost:6400'):
        self.base_url = base_url
        self.session = requests.Session()
    
    def parse_link(self, share_url: str, password: str = '') -> Dict[str, Any]:
        """
        解析分享链接
        
        Args:
            share_url: 分享链接
            password: 分享密码（可选）
            
        Returns:
            解析结果字典
        """
        params = {'url': share_url}
        if password:
            params['pwd'] = password
        
        try:
            response = self.session.get(
                f'{self.base_url}/json/parser',
                params=params,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            if result.get('success'):
                return result['data']
            else:
                raise Exception(result.get('msg', '解析失败'))
                
        except requests.RequestException as e:
            raise Exception(f'请求失败: {str(e)}')
    
    def get_direct_url(self, share_url: str, password: str = '') -> str:
        """
        获取直链（重定向URL）
        
        Args:
            share_url: 分享链接
            password: 分享密码（可选）
            
        Returns:
            重定向URL
        """
        params = {'url': share_url}
        if password:
            params['pwd'] = password
        
        return f"{self.base_url}/parser?{urlencode(params)}"
    
    def get_file_list(self, share_url: str, password: str = '') -> List[Dict[str, Any]]:
        """
        获取文件夹列表
        
        Args:
            share_url: 文件夹分享链接
            password: 分享密码（可选）
            
        Returns:
            文件列表
        """
        params = {'url': share_url}
        if password:
            params['pwd'] = password
        
        response = self.session.get(
            f'{self.base_url}/v2/getFileList',
            params=params,
            timeout=30
        )
        response.raise_for_status()
        
        result = response.json()
        if result.get('success'):
            return result['data']
        else:
            raise Exception(result.get('msg', '获取文件列表失败'))
    
    def get_statistics(self) -> Dict[str, Any]:
        """获取统计信息"""
        response = self.session.get(f'{self.base_url}/v2/statisticsInfo')
        response.raise_for_status()
        
        result = response.json()
        if result.get('success'):
            return result['data']
        else:
            raise Exception(result.get('msg', '获取统计信息失败'))

# 使用示例
if __name__ == '__main__':
    parser = NFDParser('http://localhost:6400')
    
    try:
        # 解析单个文件
        result = parser.parse_link('https://lanzoux.com/ia2cntg')
        print(f"直链: {result['directLink']}")
        print(f"缓存命中: {result['cacheHit']}")
        print(f"过期时间: {result['expires']}")
        
        # 获取统计信息
        stats = parser.get_statistics()
        print(f"解析总数: {stats['parserTotal']}")
        print(f"缓存总数: {stats['cacheTotal']}")
        
    except Exception as e:
        print(f"错误: {e}")
```

#### Django 视图示例
```python
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
            return JsonResponse({
                'success': False,
                'error': '缺少分享链接参数'
            }, status=400)
        
        parser = NFDParser()
        result = parser.parse_link(share_url, password)
        
        return JsonResponse({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
```

### PHP

```php
<?php
class NFDParser {
    private $baseUrl;
    
    public function __construct($baseUrl = 'http://localhost:6400') {
        $this->baseUrl = rtrim($baseUrl, '/');
    }
    
    /**
     * 解析分享链接
     */
    public function parseLink($shareUrl, $password = '') {
        $params = ['url' => $shareUrl];
        if (!empty($password)) {
            $params['pwd'] = $password;
        }
        
        $url = $this->baseUrl . '/json/parser?' . http_build_query($params);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("HTTP请求失败: $httpCode");
        }
        
        $result = json_decode($response, true);
        if ($result['success']) {
            return $result['data'];
        } else {
            throw new Exception($result['msg'] ?? '解析失败');
        }
    }
    
    /**
     * 获取直链URL
     */
    public function getDirectUrl($shareUrl, $password = '') {
        $params = ['url' => $shareUrl];
        if (!empty($password)) {
            $params['pwd'] = $password;
        }
        
        return $this->baseUrl . '/parser?' . http_build_query($params);
    }
    
    /**
     * 获取文件列表
     */
    public function getFileList($shareUrl, $password = '') {
        $params = ['url' => $shareUrl];
        if (!empty($password)) {
            $params['pwd'] = $password;
        }
        
        $url = $this->baseUrl . '/v2/getFileList?' . http_build_query($params);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        $result = json_decode($response, true);
        if ($result['success']) {
            return $result['data'];
        } else {
            throw new Exception($result['msg'] ?? '获取文件列表失败');
        }
    }
}

// 使用示例
try {
    $parser = new NFDParser('http://localhost:6400');
    
    // 解析链接
    $result = $parser->parseLink('https://lanzoux.com/ia2cntg');
    echo "直链: " . $result['directLink'] . "\n";
    echo "缓存命中: " . ($result['cacheHit'] ? '是' : '否') . "\n";
    
} catch (Exception $e) {
    echo "错误: " . $e->getMessage() . "\n";
}
?>
```

### Java

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.util.Map;
import java.util.HashMap;

public class NFDParser {
    private final String baseUrl;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    public NFDParser(String baseUrl) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = new ObjectMapper();
    }
    
    public NFDParser() {
        this("http://localhost:6400");
    }
    
    /**
     * 解析分享链接
     */
    public Map<String, Object> parseLink(String shareUrl, String password) throws Exception {
        StringBuilder urlBuilder = new StringBuilder(baseUrl + "/json/parser?url=" + shareUrl);
        if (password != null && !password.isEmpty()) {
            urlBuilder.append("&pwd=").append(password);
        }
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(urlBuilder.toString()))
                .GET()
                .build();
        
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            throw new RuntimeException("HTTP请求失败: " + response.statusCode());
        }
        
        Map<String, Object> result = objectMapper.readValue(response.body(), Map.class);
        Boolean success = (Boolean) result.get("success");
        
        if (success) {
            return (Map<String, Object>) result.get("data");
        } else {
            throw new RuntimeException((String) result.get("msg"));
        }
    }
    
    /**
     * 获取直链URL
     */
    public String getDirectUrl(String shareUrl, String password) {
        StringBuilder urlBuilder = new StringBuilder(baseUrl + "/parser?url=" + shareUrl);
        if (password != null && !password.isEmpty()) {
            urlBuilder.append("&pwd=").append(password);
        }
        return urlBuilder.toString();
    }
    
    // 使用示例
    public static void main(String[] args) {
        try {
            NFDParser parser = new NFDParser("http://localhost:6400");
            
            Map<String, Object> result = parser.parseLink("https://lanzoux.com/ia2cntg", "");
            System.out.println("直链: " + result.get("directLink"));
            System.out.println("缓存命中: " + result.get("cacheHit"));
            System.out.println("过期时间: " + result.get("expires"));
            
        } catch (Exception e) {
            System.err.println("错误: " + e.getMessage());
        }
    }
}
```

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