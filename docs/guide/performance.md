# 性能优化

优化 NFD Parser API 的使用性能，提高解析速度和系统稳定性。

## 缓存策略

### 1. 本地缓存

使用本地缓存减少重复请求：

```python
import time
import hashlib
import json
from typing import Dict, Optional, Any
from pathlib import Path

class LocalCache:
    def __init__(self, cache_dir: str = ".cache", 
                 default_ttl: int = 3600):  # 1小时
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.default_ttl = default_ttl
    
    def _get_cache_key(self, url: str, password: str = "") -> str:
        """生成缓存键"""
        content = f"{url}#{password}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def _get_cache_file(self, cache_key: str) -> Path:
        return self.cache_dir / f"{cache_key}.json"
    
    def get(self, url: str, password: str = "") -> Optional[Dict[str, Any]]:
        """获取缓存"""
        cache_key = self._get_cache_key(url, password)
        cache_file = self._get_cache_file(cache_key)
        
        if not cache_file.exists():
            return None
        
        try:
            data = json.loads(cache_file.read_text())
            
            # 检查过期时间
            if data.get('expires_at', 0) < time.time():
                cache_file.unlink(missing_ok=True)
                return None
            
            return data['value']
            
        except (json.JSONDecodeError, KeyError):
            cache_file.unlink(missing_ok=True)
            return None
    
    def set(self, url: str, value: Dict[str, Any], 
            password: str = "", ttl: Optional[int] = None) -> None:
        """设置缓存"""
        cache_key = self._get_cache_key(url, password)
        cache_file = self._get_cache_file(cache_key)
        
        expires_at = time.time() + (ttl or self.default_ttl)
        
        cache_data = {
            'value': value,
            'expires_at': expires_at,
            'created_at': time.time()
        }
        
        cache_file.write_text(json.dumps(cache_data))
    
    def clear_expired(self):
        """清理过期缓存"""
        current_time = time.time()
        
        for cache_file in self.cache_dir.glob("*.json"):
            try:
                data = json.loads(cache_file.read_text())
                if data.get('expires_at', 0) < current_time:
                    cache_file.unlink()
            except:
                cache_file.unlink(missing_ok=True)

class CachedNFDParser:
    def __init__(self, base_url: str = "https://api.example.com"):
        self.base_url = base_url
        self.cache = LocalCache()
        self.session = requests.Session()
    
    def parse_share_link(self, url: str, password: str = "") -> Optional[str]:
        # 检查缓存
        cached_result = self.cache.get(url, password)
        if cached_result:
            print(f"缓存命中: {url}")
            return cached_result['direct_link']
        
        # 请求API
        try:
            params = {'url': url}
            if password:
                params['pwd'] = password
            
            response = self.session.get(
                f"{self.base_url}/json/parser",
                params=params,
                timeout=30
            )
            
            data = response.json()
            
            if data.get('success'):
                result = {
                    'direct_link': data['data']['directLink'],
                    'share_key': data['data']['shareKey'],
                    'expires': data['data']['expires']
                }
                
                # 缓存结果
                self.cache.set(url, result, password)
                
                return result['direct_link']
            else:
                raise Exception(data.get('msg', '解析失败'))
                
        except Exception as e:
            print(f"解析失败: {e}")
            return None
```

### 2. Redis 缓存

对于分布式环境，使用 Redis 缓存：

```python
import redis
import json
import hashlib
from typing import Optional, Dict, Any

class RedisCache:
    def __init__(self, host: str = 'localhost', port: int = 6379, 
                 db: int = 0, default_ttl: int = 3600):
        self.redis_client = redis.Redis(
            host=host, port=port, db=db,
            decode_responses=True
        )
        self.default_ttl = default_ttl
    
    def _get_cache_key(self, url: str, password: str = "") -> str:
        content = f"nfd:{url}#{password}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def get(self, url: str, password: str = "") -> Optional[Dict[str, Any]]:
        cache_key = self._get_cache_key(url, password)
        
        try:
            cached_data = self.redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except (json.JSONDecodeError, redis.RedisError):
            pass
        
        return None
    
    def set(self, url: str, value: Dict[str, Any], 
            password: str = "", ttl: Optional[int] = None) -> None:
        cache_key = self._get_cache_key(url, password)
        
        try:
            self.redis_client.setex(
                cache_key,
                ttl or self.default_ttl,
                json.dumps(value)
            )
        except redis.RedisError:
            pass  # 缓存失败不影响主流程

class DistributedCachedParser:
    def __init__(self, base_url: str = "https://api.example.com"):
        self.base_url = base_url
        self.cache = RedisCache()
        self.session = requests.Session()
    
    def parse_share_link(self, url: str, password: str = "") -> Optional[str]:
        # 先尝试从缓存获取
        cached_result = self.cache.get(url, password)
        if cached_result:
            return cached_result['direct_link']
        
        # 缓存未命中，请求API
        return self._fetch_and_cache(url, password)
```

## 连接池优化

### 1. HTTP 会话复用

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

class OptimizedNFDParser:
    def __init__(self, base_url: str = "https://api.example.com"):
        self.base_url = base_url
        self.session = self._create_optimized_session()
    
    def _create_optimized_session(self) -> requests.Session:
        session = requests.Session()
        
        # 配置重试策略
        retry_strategy = Retry(
            total=3,
            status_forcelist=[429, 500, 502, 503, 504],
            backoff_factor=1,
            allowed_methods=["GET"]
        )
        
        # 配置适配器
        adapter = HTTPAdapter(
            max_retries=retry_strategy,
            pool_connections=10,  # 连接池大小
            pool_maxsize=20       # 最大连接数
        )
        
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # 设置默认超时和请求头
        session.timeout = 30
        session.headers.update({
            'User-Agent': 'NFD-Parser-Optimized/1.0',
            'Connection': 'keep-alive'
        })
        
        return session
```

### 2. 异步连接池

```python
import asyncio
import httpx
from typing import List, Dict, Optional

class AsyncNFDParser:
    def __init__(self, base_url: str = "https://api.example.com",
                 concurrent_limit: int = 10):
        self.base_url = base_url
        self.concurrent_limit = concurrent_limit
        
        # 配置连接限制
        self.limits = httpx.Limits(
            max_keepalive_connections=20,
            max_connections=50
        )
        
        self.timeout = httpx.Timeout(30.0, connect=10.0)
    
    async def parse_single(self, client: httpx.AsyncClient,
                          url: str, password: str = "") -> Optional[str]:
        params = {'url': url}
        if password:
            params['pwd'] = password
        
        try:
            response = await client.get(
                f"{self.base_url}/json/parser",
                params=params
            )
            
            data = response.json()
            
            if data.get('success'):
                return data['data']['directLink']
            else:
                return None
                
        except Exception:
            return None
    
    async def batch_parse(self, links: List[Dict[str, str]]) -> List[Optional[str]]:
        async with httpx.AsyncClient(
            limits=self.limits,
            timeout=self.timeout
        ) as client:
            # 使用信号量控制并发
            semaphore = asyncio.Semaphore(self.concurrent_limit)
            
            async def parse_with_limit(link):
                async with semaphore:
                    return await self.parse_single(
                        client,
                        link['url'],
                        link.get('password', '')
                    )
            
            tasks = [parse_with_limit(link) for link in links]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # 处理异常
            return [
                result if not isinstance(result, Exception) else None
                for result in results
            ]
```

## 预热和预取

### 1. 连接预热

```python
class PrewarmedParser:
    def __init__(self, base_url: str = "https://api.example.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self._prewarm_connections()
    
    def _prewarm_connections(self):
        """预热连接"""
        try:
            # 发送一个轻量级请求预热连接
            response = self.session.get(
                f"{self.base_url}/v2/statisticsInfo",
                timeout=10
            )
            print(f"连接预热完成: {response.status_code}")
        except Exception as e:
            print(f"连接预热失败: {e}")
    
    def parse_share_link(self, url: str, password: str = "") -> Optional[str]:
        # 由于连接已预热，首次请求会更快
        return self._do_parse(url, password)
```

### 2. 智能预取

```python
import threading
from collections import deque
from typing import Set

class PrefetchingParser:
    def __init__(self, base_url: str = "https://api.example.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.cache = LocalCache()
        
        # 预取队列和已处理集合
        self.prefetch_queue = deque()
        self.processing_set: Set[str] = set()
        self.prefetch_thread = None
        
        self._start_prefetch_worker()
    
    def _start_prefetch_worker(self):
        """启动预取工作线程"""
        self.prefetch_thread = threading.Thread(
            target=self._prefetch_worker,
            daemon=True
        )
        self.prefetch_thread.start()
    
    def _prefetch_worker(self):
        """预取工作函数"""
        while True:
            try:
                if self.prefetch_queue:
                    url, password = self.prefetch_queue.popleft()
                    cache_key = f"{url}#{password}"
                    
                    if cache_key not in self.processing_set:
                        self.processing_set.add(cache_key)
                        self._fetch_and_cache(url, password)
                        self.processing_set.remove(cache_key)
                else:
                    threading.Event().wait(0.1)  # 短暂休眠
            except Exception:
                pass
    
    def add_to_prefetch(self, url: str, password: str = ""):
        """添加到预取队列"""
        cache_key = f"{url}#{password}"
        if cache_key not in self.processing_set:
            self.prefetch_queue.append((url, password))
    
    def parse_share_link(self, url: str, password: str = "") -> Optional[str]:
        # 检查缓存
        cached_result = self.cache.get(url, password)
        if cached_result:
            return cached_result['direct_link']
        
        # 缓存未命中，立即解析
        return self._fetch_and_cache(url, password)
```

## 批量优化

### 1. 分批处理

```python
def chunk_list(items: List, chunk_size: int) -> List[List]:
    """将列表分块"""
    return [items[i:i + chunk_size] for i in range(0, len(items), chunk_size)]

class BatchOptimizedParser:
    def __init__(self, base_url: str = "https://api.example.com",
                 batch_size: int = 50, concurrent_batches: int = 3):
        self.base_url = base_url
        self.batch_size = batch_size
        self.concurrent_batches = concurrent_batches
    
    async def parse_large_batch(self, links: List[Dict[str, str]]) -> List[Optional[str]]:
        """优化的大批量解析"""
        # 将大列表分成小批次
        batches = chunk_list(links, self.batch_size)
        
        # 并发处理多个批次
        semaphore = asyncio.Semaphore(self.concurrent_batches)
        
        async def process_batch(batch):
            async with semaphore:
                return await self._process_single_batch(batch)
        
        batch_tasks = [process_batch(batch) for batch in batches]
        batch_results = await asyncio.gather(*batch_tasks)
        
        # 合并结果
        results = []
        for batch_result in batch_results:
            results.extend(batch_result)
        
        return results
    
    async def _process_single_batch(self, batch: List[Dict[str, str]]) -> List[Optional[str]]:
        """处理单个批次"""
        # 实现单批次的并发处理
        pass
```

### 2. 流式处理

```python
import asyncio
from typing import AsyncGenerator

class StreamingParser:
    def __init__(self, base_url: str = "https://api.example.com"):
        self.base_url = base_url
    
    async def parse_stream(self, links: List[Dict[str, str]], 
                          callback=None) -> AsyncGenerator[Dict, None]:
        """流式解析，逐个返回结果"""
        async with httpx.AsyncClient() as client:
            for link in links:
                try:
                    result = await self._parse_single(
                        client, link['url'], link.get('password', '')
                    )
                    
                    result_data = {
                        'url': link['url'],
                        'success': result is not None,
                        'direct_link': result,
                        'timestamp': time.time()
                    }
                    
                    if callback:
                        await callback(result_data)
                    
                    yield result_data
                    
                except Exception as e:
                    error_data = {
                        'url': link['url'],
                        'success': False,
                        'error': str(e),
                        'timestamp': time.time()
                    }
                    
                    if callback:
                        await callback(error_data)
                    
                    yield error_data

# 使用流式处理
async def stream_example():
    parser = StreamingParser()
    
    links = [
        {'url': 'https://lanzoux.com/abc123'},
        # ... 更多链接
    ]
    
    async def progress_callback(result):
        if result['success']:
            print(f"✓ {result['url']}")
        else:
            print(f"✗ {result['url']}: {result.get('error', '未知错误')}")
    
    results = []
    async for result in parser.parse_stream(links, progress_callback):
        results.append(result)
        
        # 可以在这里做实时处理，如保存到数据库
        if len(results) % 100 == 0:
            print(f"已处理 {len(results)} 个链接")
```

## 内存优化

### 1. 大数据处理

```python
import gc
from typing import Iterator

class MemoryEfficientParser:
    def __init__(self, base_url: str = "https://api.example.com"):
        self.base_url = base_url
    
    def parse_file_batch(self, file_path: str, 
                        batch_size: int = 1000) -> Iterator[List[Dict]]:
        """从文件批量读取并解析"""
        with open(file_path, 'r') as f:
            batch = []
            
            for line in f:
                try:
                    link_data = json.loads(line.strip())
                    batch.append(link_data)
                    
                    if len(batch) >= batch_size:
                        # 处理当前批次
                        results = self._process_batch_sync(batch)
                        yield results
                        
                        # 清理内存
                        batch.clear()
                        gc.collect()
                        
                except json.JSONDecodeError:
                    continue
            
            # 处理最后一批
            if batch:
                results = self._process_batch_sync(batch)
                yield results
    
    def _process_batch_sync(self, batch: List[Dict]) -> List[Dict]:
        """同步处理批次（适用于大数据场景）"""
        results = []
        
        for link_data in batch:
            try:
                result = self._parse_single_sync(
                    link_data['url'], 
                    link_data.get('password', '')
                )
                results.append(result)
                
            except Exception as e:
                results.append({
                    'url': link_data['url'],
                    'success': False,
                    'error': str(e)
                })
        
        return results
```

### 2. 结果流式写入

```python
import csv
import json
from pathlib import Path

class StreamingResultWriter:
    def __init__(self, output_file: str, format: str = 'jsonl'):
        self.output_file = Path(output_file)
        self.format = format
        self.file_handle = None
        self.csv_writer = None
    
    def __enter__(self):
        self.file_handle = open(self.output_file, 'w', encoding='utf-8')
        
        if self.format == 'csv':
            self.csv_writer = csv.DictWriter(
                self.file_handle,
                fieldnames=['url', 'success', 'direct_link', 'error', 'timestamp']
            )
            self.csv_writer.writeheader()
        
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.file_handle:
            self.file_handle.close()
    
    def write_result(self, result: Dict):
        """写入单个结果"""
        if self.format == 'jsonl':
            json.dump(result, self.file_handle, ensure_ascii=False)
            self.file_handle.write('\n')
        elif self.format == 'csv':
            self.csv_writer.writerow(result)
        
        self.file_handle.flush()

# 结合流式解析和写入
async def memory_efficient_batch_parse(links_file: str, output_file: str):
    parser = StreamingParser()
    
    with StreamingResultWriter(output_file, 'jsonl') as writer:
        # 逐行读取链接文件
        with open(links_file, 'r') as f:
            async for result in parser.parse_stream([
                json.loads(line.strip()) for line in f
            ]):
                writer.write_result(result)
                
                # 每处理100个结果，强制垃圾回收
                if result.get('index', 0) % 100 == 0:
                    gc.collect()
```

## 监控和分析

### 1. 性能监控

```python
import time
import psutil
from dataclasses import dataclass, field
from typing import List

@dataclass
class PerformanceMetrics:
    start_time: float = field(default_factory=time.time)
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    cache_hits: int = 0
    total_response_time: float = 0.0
    peak_memory_mb: float = 0.0
    
    def add_request(self, success: bool, response_time: float, from_cache: bool = False):
        self.total_requests += 1
        self.total_response_time += response_time
        
        if success:
            self.successful_requests += 1
        else:
            self.failed_requests += 1
        
        if from_cache:
            self.cache_hits += 1
        
        # 更新内存峰值
        current_memory = psutil.Process().memory_info().rss / 1024 / 1024
        self.peak_memory_mb = max(self.peak_memory_mb, current_memory)
    
    def get_report(self) -> Dict[str, Any]:
        elapsed_time = time.time() - self.start_time
        avg_response_time = (
            self.total_response_time / self.total_requests 
            if self.total_requests > 0 else 0
        )
        
        return {
            'total_time': elapsed_time,
            'total_requests': self.total_requests,
            'success_rate': self.successful_requests / max(self.total_requests, 1),
            'cache_hit_rate': self.cache_hits / max(self.total_requests, 1),
            'requests_per_second': self.total_requests / max(elapsed_time, 1),
            'avg_response_time': avg_response_time,
            'peak_memory_mb': self.peak_memory_mb
        }

class MonitoredParser:
    def __init__(self, base_url: str = "https://api.example.com"):
        self.base_url = base_url
        self.session = requests.Session()
        self.cache = LocalCache()
        self.metrics = PerformanceMetrics()
    
    def parse_share_link(self, url: str, password: str = "") -> Optional[str]:
        start_time = time.time()
        from_cache = False
        
        try:
            # 检查缓存
            cached_result = self.cache.get(url, password)
            if cached_result:
                from_cache = True
                response_time = time.time() - start_time
                self.metrics.add_request(True, response_time, from_cache)
                return cached_result['direct_link']
            
            # 发起请求
            params = {'url': url}
            if password:
                params['pwd'] = password
            
            response = self.session.get(
                f"{self.base_url}/json/parser",
                params=params,
                timeout=30
            )
            
            data = response.json()
            response_time = time.time() - start_time
            
            if data.get('success'):
                result = {
                    'direct_link': data['data']['directLink'],
                    'share_key': data['data']['shareKey']
                }
                
                # 缓存结果
                self.cache.set(url, result, password)
                
                self.metrics.add_request(True, response_time, from_cache)
                return result['direct_link']
            else:
                self.metrics.add_request(False, response_time, from_cache)
                return None
                
        except Exception:
            response_time = time.time() - start_time
            self.metrics.add_request(False, response_time, from_cache)
            return None
    
    def get_performance_report(self) -> Dict[str, Any]:
        return self.metrics.get_report()

# 使用示例
def performance_test():
    parser = MonitoredParser()
    
    test_links = [
        'https://lanzoux.com/abc123',
        'https://lanzoux.com/def456',
        # ... 更多测试链接
    ]
    
    print("开始性能测试...")
    
    for url in test_links:
        result = parser.parse_share_link(url)
        if result:
            print(f"✓ {url}")
        else:
            print(f"✗ {url}")
    
    # 输出性能报告
    report = parser.get_performance_report()
    print("\n性能报告:")
    print(f"总耗时: {report['total_time']:.2f}秒")
    print(f"总请求数: {report['total_requests']}")
    print(f"成功率: {report['success_rate']:.2%}")
    print(f"缓存命中率: {report['cache_hit_rate']:.2%}")
    print(f"请求速率: {report['requests_per_second']:.2f} req/s")
    print(f"平均响应时间: {report['avg_response_time']:.3f}秒")
    print(f"内存峰值: {report['peak_memory_mb']:.1f}MB")
```

## 最佳实践总结

1. **使用缓存**：实施多层缓存策略减少重复请求
2. **连接复用**：使用会话和连接池避免重复建立连接
3. **并发控制**：合理控制并发数避免过载
4. **批量处理**：对大量链接使用批量处理策略
5. **流式处理**：对超大数据集使用流式处理减少内存占用
6. **性能监控**：实时监控性能指标，及时发现问题
7. **错误处理**：完善的错误处理和重试机制
8. **资源管理**：及时释放资源，避免内存泄漏

通过这些优化策略，可以显著提升 NFD Parser 的使用性能和稳定性。