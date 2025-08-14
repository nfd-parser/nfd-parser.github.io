# 批量处理

当需要处理大量分享链接时，批量处理功能可以显著提高效率。

## 批量解析策略

### 1. 并发控制

不要同时发送过多请求，建议：
- 并发数量：3-5个
- 请求间隔：200-500ms
- 超时时间：30秒

### 2. 错误处理

- 单个链接失败不应影响其他链接
- 记录失败原因便于后续处理
- 实现重试机制处理临时失败

### 3. 频率限制

为避免触发API限制：
- 控制请求频率
- 使用指数退避重试
- 监控响应状态码

## Python 实现

### 基础批量处理

```python
import asyncio
import httpx
import time
from typing import List, Dict, Optional

class NFDBatchParser:
    def __init__(self, base_url: str = "https://api.example.com", 
                 concurrent_limit: int = 3, delay: float = 0.2):
        self.base_url = base_url
        self.concurrent_limit = concurrent_limit
        self.delay = delay
        self.semaphore = asyncio.Semaphore(concurrent_limit)
    
    async def parse_single(self, client: httpx.AsyncClient, 
                          url: str, password: str = "") -> Dict:
        """解析单个链接"""
        async with self.semaphore:
            params = {'url': url}
            if password:
                params['pwd'] = password
            
            try:
                response = await client.get(
                    f"{self.base_url}/json/parser",
                    params=params,
                    timeout=30
                )
                data = response.json()
                
                result = {
                    'url': url,
                    'success': data.get('success', False),
                    'direct_link': None,
                    'error': None,
                    'cache_hit': False
                }
                
                if data.get('success'):
                    result['direct_link'] = data['data']['directLink']
                    result['cache_hit'] = data['data'].get('cacheHit', False)
                else:
                    result['error'] = data.get('msg', '未知错误')
                
                return result
                
            except Exception as e:
                return {
                    'url': url,
                    'success': False,
                    'direct_link': None,
                    'error': str(e),
                    'cache_hit': False
                }
            finally:
                # 添加延迟避免频率限制
                await asyncio.sleep(self.delay)
    
    async def batch_parse(self, links: List[Dict[str, str]]) -> List[Dict]:
        """批量解析链接"""
        async with httpx.AsyncClient() as client:
            tasks = [
                self.parse_single(
                    client, 
                    link['url'], 
                    link.get('password', '')
                )
                for link in links
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # 处理异常结果
            processed_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    processed_results.append({
                        'url': links[i]['url'],
                        'success': False,
                        'direct_link': None,
                        'error': str(result),
                        'cache_hit': False
                    })
                else:
                    processed_results.append(result)
            
            return processed_results

# 使用示例
async def main():
    parser = NFDBatchParser(concurrent_limit=3, delay=0.3)
    
    links = [
        {'url': 'https://lanzoux.com/abc123', 'password': ''},
        {'url': 'https://lanzoux.com/def456', 'password': '123456'},
        {'url': 'https://pan.baidu.com/s/xyz789', 'password': 'abcd'},
        # ... 更多链接
    ]
    
    print(f"开始批量解析 {len(links)} 个链接...")
    start_time = time.time()
    
    results = await parser.batch_parse(links)
    
    end_time = time.time()
    
    # 统计结果
    success_count = sum(1 for r in results if r['success'])
    cache_hits = sum(1 for r in results if r['cache_hit'])
    
    print(f"解析完成，耗时: {end_time - start_time:.2f}秒")
    print(f"成功: {success_count}/{len(links)}")
    print(f"缓存命中: {cache_hits}")
    
    # 显示结果
    for result in results:
        if result['success']:
            cache_status = " (缓存)" if result['cache_hit'] else ""
            print(f"✓ {result['url']}{cache_status}")
            print(f"  -> {result['direct_link']}")
        else:
            print(f"✗ {result['url']}")
            print(f"  -> 错误: {result['error']}")

# 运行批量处理
if __name__ == "__main__":
    asyncio.run(main())
```

### 带重试机制的版本

```python
import asyncio
import httpx
import random
from typing import List, Dict

class NFDBatchParserWithRetry:
    def __init__(self, base_url: str = "https://api.example.com",
                 concurrent_limit: int = 3, max_retries: int = 3):
        self.base_url = base_url
        self.concurrent_limit = concurrent_limit
        self.max_retries = max_retries
        self.semaphore = asyncio.Semaphore(concurrent_limit)
    
    async def parse_with_retry(self, client: httpx.AsyncClient,
                              url: str, password: str = "") -> Dict:
        """带重试的解析"""
        last_error = None
        
        for attempt in range(self.max_retries + 1):
            try:
                async with self.semaphore:
                    params = {'url': url}
                    if password:
                        params['pwd'] = password
                    
                    response = await client.get(
                        f"{self.base_url}/json/parser",
                        params=params,
                        timeout=30
                    )
                    
                    # 检查状态码
                    if response.status_code == 429:  # 频率限制
                        if attempt < self.max_retries:
                            wait_time = (2 ** attempt) + random.uniform(0, 1)
                            await asyncio.sleep(wait_time)
                            continue
                    
                    data = response.json()
                    
                    if data.get('success'):
                        return {
                            'url': url,
                            'success': True,
                            'direct_link': data['data']['directLink'],
                            'error': None,
                            'attempts': attempt + 1
                        }
                    else:
                        return {
                            'url': url,
                            'success': False,
                            'direct_link': None,
                            'error': data.get('msg', '未知错误'),
                            'attempts': attempt + 1
                        }
            
            except Exception as e:
                last_error = e
                if attempt < self.max_retries:
                    wait_time = (2 ** attempt) + random.uniform(0, 1)
                    await asyncio.sleep(wait_time)
        
        return {
            'url': url,
            'success': False,
            'direct_link': None,
            'error': f'重试{self.max_retries}次后仍失败: {last_error}',
            'attempts': self.max_retries + 1
        }
```

## Node.js 实现

```javascript
const axios = require('axios');

class NFDBatchParser {
    constructor(options = {}) {
        this.baseURL = options.baseURL || 'https://api.example.com';
        this.concurrentLimit = options.concurrentLimit || 3;
        this.delay = options.delay || 200;
        this.maxRetries = options.maxRetries || 3;
    }
    
    async parseSingle(url, password = '') {
        const params = { url };
        if (password) params.pwd = password;
        
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await axios.get(`${this.baseURL}/json/parser`, {
                    params,
                    timeout: 30000
                });
                
                const data = response.data;
                
                if (data.success) {
                    return {
                        url,
                        success: true,
                        directLink: data.data.directLink,
                        error: null,
                        attempts: attempt + 1
                    };
                } else {
                    return {
                        url,
                        success: false,
                        directLink: null,
                        error: data.msg || '未知错误',
                        attempts: attempt + 1
                    };
                }
            } catch (error) {
                if (attempt < this.maxRetries) {
                    const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }
                
                return {
                    url,
                    success: false,
                    directLink: null,
                    error: error.message,
                    attempts: attempt + 1
                };
            }
        }
    }
    
    async batchParse(links) {
        const results = [];
        const chunks = this.chunkArray(links, this.concurrentLimit);
        
        for (const chunk of chunks) {
            const promises = chunk.map(link => 
                this.parseSingle(link.url, link.password || '')
            );
            
            const chunkResults = await Promise.all(promises);
            results.push(...chunkResults);
            
            // 在批次之间添加延迟
            if (chunks.indexOf(chunk) < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, this.delay));
            }
        }
        
        return results;
    }
    
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
}

// 使用示例
async function main() {
    const parser = new NFDBatchParser({
        concurrentLimit: 3,
        delay: 300,
        maxRetries: 2
    });
    
    const links = [
        { url: 'https://lanzoux.com/abc123', password: '' },
        { url: 'https://lanzoux.com/def456', password: '123456' },
        // ... 更多链接
    ];
    
    console.log(`开始批量解析 ${links.length} 个链接...`);
    const startTime = Date.now();
    
    const results = await parser.batchParse(links);
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // 统计结果
    const successCount = results.filter(r => r.success).length;
    
    console.log(`解析完成，耗时: ${duration.toFixed(2)}秒`);
    console.log(`成功: ${successCount}/${links.length}`);
    
    // 显示结果
    results.forEach(result => {
        if (result.success) {
            console.log(`✓ ${result.url} (${result.attempts}次尝试)`);
            console.log(`  -> ${result.directLink}`);
        } else {
            console.log(`✗ ${result.url} (${result.attempts}次尝试)`);
            console.log(`  -> 错误: ${result.error}`);
        }
    });
}

main().catch(console.error);
```

## 性能优化建议

### 1. 连接池配置

```python
# 使用连接池优化性能
async with httpx.AsyncClient(
    limits=httpx.Limits(
        max_keepalive_connections=10,
        max_connections=20
    ),
    timeout=httpx.Timeout(30.0)
) as client:
    # 批量处理逻辑
    pass
```

### 2. 结果缓存

```python
import json
from pathlib import Path

class CachedBatchParser(NFDBatchParser):
    def __init__(self, cache_file: str = "parse_cache.json", **kwargs):
        super().__init__(**kwargs)
        self.cache_file = Path(cache_file)
        self.cache = self.load_cache()
    
    def load_cache(self) -> Dict:
        if self.cache_file.exists():
            return json.loads(self.cache_file.read_text())
        return {}
    
    def save_cache(self):
        self.cache_file.write_text(json.dumps(self.cache, indent=2))
    
    def get_cache_key(self, url: str, password: str) -> str:
        return f"{url}#{password}"
    
    async def parse_single(self, client, url, password=""):
        cache_key = self.get_cache_key(url, password)
        
        # 检查缓存
        if cache_key in self.cache:
            cached = self.cache[cache_key]
            if cached['success']:
                return {**cached, 'from_cache': True}
        
        # 解析并缓存结果
        result = await super().parse_single(client, url, password)
        result['from_cache'] = False
        
        if result['success']:
            self.cache[cache_key] = result
            self.save_cache()
        
        return result
```

### 3. 进度监控

```python
from tqdm.asyncio import tqdm

async def batch_parse_with_progress(self, links):
    """带进度条的批量解析"""
    async with httpx.AsyncClient() as client:
        tasks = [
            self.parse_single(client, link['url'], link.get('password', ''))
            for link in links
        ]
        
        results = []
        for task in tqdm.as_completed(tasks, total=len(tasks), desc="解析中"):
            result = await task
            results.append(result)
        
        return results
```

## 监控和日志

```python
import logging
from datetime import datetime

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'batch_parse_{datetime.now().strftime("%Y%m%d")}.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class MonitoredBatchParser(NFDBatchParser):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.stats = {
            'total': 0,
            'success': 0,
            'failed': 0,
            'cache_hits': 0,
            'start_time': None,
            'end_time': None
        }
    
    async def parse_single(self, client, url, password=""):
        self.stats['total'] += 1
        
        try:
            result = await super().parse_single(client, url, password)
            
            if result['success']:
                self.stats['success'] += 1
                if result.get('cache_hit'):
                    self.stats['cache_hits'] += 1
                logger.info(f"✓ 成功解析: {url}")
            else:
                self.stats['failed'] += 1
                logger.warning(f"✗ 解析失败: {url} - {result['error']}")
            
            return result
            
        except Exception as e:
            self.stats['failed'] += 1
            logger.error(f"✗ 解析异常: {url} - {e}")
            raise
    
    def print_stats(self):
        """打印统计信息"""
        if self.stats['start_time'] and self.stats['end_time']:
            duration = self.stats['end_time'] - self.stats['start_time']
            rate = self.stats['total'] / duration if duration > 0 else 0
        else:
            duration = 0
            rate = 0
        
        logger.info("="*50)
        logger.info("批量解析统计:")
        logger.info(f"总数: {self.stats['total']}")
        logger.info(f"成功: {self.stats['success']}")
        logger.info(f"失败: {self.stats['failed']}")
        logger.info(f"缓存命中: {self.stats['cache_hits']}")
        logger.info(f"耗时: {duration:.2f}秒")
        logger.info(f"速率: {rate:.2f} 链接/秒")
        logger.info("="*50)
```