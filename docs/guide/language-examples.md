# 编程语言示例

本页面提供多种编程语言使用 NFD Parser API 的示例代码。

## JavaScript/Node.js

### 使用 fetch API

```javascript
async function parseShareLink(shareUrl, password = '') {
    const params = new URLSearchParams({
        url: shareUrl
    });
    
    if (password) {
        params.append('pwd', password);
    }
    
    try {
        const response = await fetch(`https://api.example.com/json/parser?${params}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data.directLink;
        } else {
            throw new Error(result.msg);
        }
    } catch (error) {
        console.error('解析失败:', error);
        throw error;
    }
}

// 使用示例
parseShareLink('https://lanzoux.com/abc123')
    .then(directLink => {
        console.log('直链:', directLink);
    })
    .catch(error => {
        console.error('错误:', error);
    });
```

### 使用 axios

```javascript
const axios = require('axios');

async function parseWithAxios(shareUrl, password = '') {
    try {
        const response = await axios.get('https://api.example.com/json/parser', {
            params: {
                url: shareUrl,
                pwd: password
            }
        });
        
        if (response.data.success) {
            return response.data.data.directLink;
        } else {
            throw new Error(response.data.msg);
        }
    } catch (error) {
        throw new Error(`请求失败: ${error.message}`);
    }
}
```

## Python

### 使用 requests

```python
import requests
from urllib.parse import urlencode

def parse_share_link(share_url, password=''):
    """
    解析网盘分享链接
    
    Args:
        share_url (str): 分享链接
        password (str): 密码（可选）
    
    Returns:
        str: 直链地址
    """
    params = {'url': share_url}
    if password:
        params['pwd'] = password
    
    try:
        response = requests.get(
            'https://api.example.com/json/parser',
            params=params,
            timeout=30
        )
        response.raise_for_status()
        
        data = response.json()
        if data['success']:
            return data['data']['directLink']
        else:
            raise Exception(data['msg'])
            
    except requests.RequestException as e:
        raise Exception(f'请求失败: {e}')

# 使用示例
try:
    direct_link = parse_share_link('https://lanzoux.com/abc123')
    print(f'直链: {direct_link}')
except Exception as e:
    print(f'错误: {e}')
```

### 使用 httpx (异步)

```python
import httpx
import asyncio

async def parse_async(share_url, password=''):
    params = {'url': share_url}
    if password:
        params['pwd'] = password
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                'https://api.example.com/json/parser',
                params=params,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            if data['success']:
                return data['data']['directLink']
            else:
                raise Exception(data['msg'])
                
        except httpx.RequestError as e:
            raise Exception(f'请求失败: {e}')

# 使用示例
async def main():
    try:
        direct_link = await parse_async('https://lanzoux.com/abc123')
        print(f'直链: {direct_link}')
    except Exception as e:
        print(f'错误: {e}')

# 运行异步函数
asyncio.run(main())
```

## Java

### 使用 OkHttp

```java
import okhttp3.*;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import java.io.IOException;

public class NFDParser {
    private static final OkHttpClient client = new OkHttpClient();
    private static final Gson gson = new Gson();
    
    public static String parseShareLink(String shareUrl, String password) throws IOException {
        HttpUrl.Builder urlBuilder = HttpUrl.parse("https://api.example.com/json/parser")
                .newBuilder()
                .addQueryParameter("url", shareUrl);
        
        if (password != null && !password.isEmpty()) {
            urlBuilder.addQueryParameter("pwd", password);
        }
        
        Request request = new Request.Builder()
                .url(urlBuilder.build())
                .build();
        
        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("请求失败: " + response);
            }
            
            String responseBody = response.body().string();
            JsonObject jsonObject = gson.fromJson(responseBody, JsonObject.class);
            
            if (jsonObject.get("success").getAsBoolean()) {
                return jsonObject.getAsJsonObject("data")
                        .get("directLink").getAsString();
            } else {
                throw new RuntimeException(jsonObject.get("msg").getAsString());
            }
        }
    }
    
    // 使用示例
    public static void main(String[] args) {
        try {
            String directLink = parseShareLink("https://lanzoux.com/abc123", "");
            System.out.println("直链: " + directLink);
        } catch (Exception e) {
            System.err.println("错误: " + e.getMessage());
        }
    }
}
```

## PHP

```php
<?php

function parseShareLink($shareUrl, $password = '') {
    $params = ['url' => $shareUrl];
    if (!empty($password)) {
        $params['pwd'] = $password;
    }
    
    $url = 'https://api.example.com/json/parser?' . http_build_query($params);
    
    $context = stream_context_create([
        'http' => [
            'timeout' => 30,
            'method' => 'GET',
            'header' => 'User-Agent: NFD-Parser-PHP/1.0'
        ]
    ]);
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        throw new Exception('请求失败');
    }
    
    $data = json_decode($response, true);
    
    if ($data === null) {
        throw new Exception('响应解析失败');
    }
    
    if ($data['success']) {
        return $data['data']['directLink'];
    } else {
        throw new Exception($data['msg']);
    }
}

// 使用示例
try {
    $directLink = parseShareLink('https://lanzoux.com/abc123');
    echo "直链: " . $directLink . "\n";
} catch (Exception $e) {
    echo "错误: " . $e->getMessage() . "\n";
}
?>
```

## Go

```go
package main

import (
    "encoding/json"
    "fmt"
    "io/ioutil"
    "net/http"
    "net/url"
    "time"
)

type APIResponse struct {
    Code      int    `json:"code"`
    Message   string `json:"msg"`
    Success   bool   `json:"success"`
    Data      struct {
        DirectLink string `json:"directLink"`
        ShareKey   string `json:"shareKey"`
    } `json:"data"`
    Timestamp int64 `json:"timestamp"`
}

func parseShareLink(shareURL, password string) (string, error) {
    baseURL := "https://api.example.com/json/parser"
    
    params := url.Values{}
    params.Add("url", shareURL)
    if password != "" {
        params.Add("pwd", password)
    }
    
    fullURL := baseURL + "?" + params.Encode()
    
    client := &http.Client{Timeout: 30 * time.Second}
    resp, err := client.Get(fullURL)
    if err != nil {
        return "", fmt.Errorf("请求失败: %v", err)
    }
    defer resp.Body.Close()
    
    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return "", fmt.Errorf("读取响应失败: %v", err)
    }
    
    var apiResp APIResponse
    if err := json.Unmarshal(body, &apiResp); err != nil {
        return "", fmt.Errorf("解析响应失败: %v", err)
    }
    
    if !apiResp.Success {
        return "", fmt.Errorf("API错误: %s", apiResp.Message)
    }
    
    return apiResp.Data.DirectLink, nil
}

func main() {
    directLink, err := parseShareLink("https://lanzoux.com/abc123", "")
    if err != nil {
        fmt.Printf("错误: %v\n", err)
        return
    }
    
    fmt.Printf("直链: %s\n", directLink)
}
```

## 批量处理示例

### Python 批量处理

```python
import asyncio
import httpx
from typing import List, Dict

async def batch_parse(links: List[Dict[str, str]]) -> List[Dict]:
    """
    批量解析多个分享链接
    
    Args:
        links: [{"url": "链接", "password": "密码"}, ...]
    
    Returns:
        解析结果列表
    """
    async def parse_single(client, link_info):
        params = {'url': link_info['url']}
        if link_info.get('password'):
            params['pwd'] = link_info['password']
        
        try:
            response = await client.get(
                'https://api.example.com/json/parser',
                params=params
            )
            data = response.json()
            return {
                'url': link_info['url'],
                'success': data.get('success', False),
                'direct_link': data.get('data', {}).get('directLink'),
                'error': None if data.get('success') else data.get('msg')
            }
        except Exception as e:
            return {
                'url': link_info['url'],
                'success': False,
                'direct_link': None,
                'error': str(e)
            }
    
    async with httpx.AsyncClient() as client:
        tasks = [parse_single(client, link) for link in links]
        results = await asyncio.gather(*tasks)
        return results

# 使用示例
links = [
    {"url": "https://lanzoux.com/abc123", "password": ""},
    {"url": "https://lanzoux.com/def456", "password": "123456"},
]

results = asyncio.run(batch_parse(links))
for result in results:
    if result['success']:
        print(f"✓ {result['url']} -> {result['direct_link']}")
    else:
        print(f"✗ {result['url']} -> 错误: {result['error']}")
```