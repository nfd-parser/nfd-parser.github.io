# 错误处理

在使用 NFD Parser API 时，正确的错误处理可以提高应用的稳定性和用户体验。

## 错误类型

### 1. HTTP 状态码错误

| 状态码 | 含义 | 处理方式 |
|--------|------|----------|
| 200 | 成功 | 正常处理响应数据 |
| 400 | 请求参数错误 | 检查URL和密码参数 |
| 404 | 资源不存在 | 分享链接无效或已过期 |
| 429 | 请求过于频繁 | 实现指数退避重试 |
| 500 | 服务器内部错误 | 重试或联系技术支持 |
| 502/503 | 服务不可用 | 等待后重试 |

### 2. API 响应错误

即使HTTP状态码为200，API也可能返回错误：

```json
{
  "code": 400,
  "msg": "无效的分享链接",
  "success": false,
  "timestamp": 1726637151902
}
```

### 3. 网络错误

- 连接超时
- DNS解析失败
- 网络中断
- SSL证书错误

## 错误处理策略

### 1. 基本错误处理

```python
import requests
import time
from typing import Optional, Dict, Any

class NFDParserError(Exception):
    """NFD Parser 基础异常类"""
    pass

class APIError(NFDParserError):
    """API 响应错误"""
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
        super().__init__(f"API错误 {code}: {message}")

class NetworkError(NFDParserError):
    """网络请求错误"""
    pass

class NFDParser:
    def __init__(self, base_url: str = "https://api.example.com"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def parse_share_link(self, url: str, password: str = "") -> Optional[str]:
        """
        解析分享链接，包含完整的错误处理
        
        Args:
            url: 分享链接
            password: 密码
            
        Returns:
            直链地址或None
            
        Raises:
            APIError: API响应错误
            NetworkError: 网络请求错误
        """
        params = {'url': url}
        if password:
            params['pwd'] = password
        
        try:
            response = self.session.get(
                f"{self.base_url}/json/parser",
                params=params,
                timeout=30
            )
            
            # 检查HTTP状态码
            if response.status_code != 200:
                raise NetworkError(f"HTTP {response.status_code}: {response.reason}")
            
            # 解析JSON响应
            try:
                data = response.json()
            except ValueError as e:
                raise NetworkError(f"响应格式无效: {e}")
            
            # 检查API响应状态
            if not data.get('success', False):
                raise APIError(
                    data.get('code', -1),
                    data.get('msg', '未知错误')
                )
            
            # 提取直链
            direct_link = data.get('data', {}).get('directLink')
            if not direct_link:
                raise APIError(-1, "响应中没有直链数据")
            
            return direct_link
            
        except requests.exceptions.Timeout:
            raise NetworkError("请求超时")
        except requests.exceptions.ConnectionError:
            raise NetworkError("连接失败")
        except requests.exceptions.RequestException as e:
            raise NetworkError(f"网络请求错误: {e}")

# 使用示例
def safe_parse_example():
    parser = NFDParser()
    
    try:
        direct_link = parser.parse_share_link(
            "https://lanzoux.com/abc123",
            "password"
        )
        print(f"解析成功: {direct_link}")
        
    except APIError as e:
        if e.code == 404:
            print("分享链接不存在或已过期")
        elif e.code == 400:
            print("分享链接格式错误")
        else:
            print(f"API错误: {e}")
            
    except NetworkError as e:
        print(f"网络错误: {e}")
        
    except Exception as e:
        print(f"未知错误: {e}")
```

### 2. 重试机制

```python
import time
import random
from functools import wraps

def retry_on_error(max_retries: int = 3, backoff_factor: float = 1.0):
    """
    重试装饰器
    
    Args:
        max_retries: 最大重试次数
        backoff_factor: 退避因子
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                    
                except (NetworkError, APIError) as e:
                    last_exception = e
                    
                    # 对于某些错误不重试
                    if isinstance(e, APIError) and e.code in [400, 404]:
                        raise
                    
                    if attempt < max_retries:
                        # 指数退避 + 随机抖动
                        delay = backoff_factor * (2 ** attempt) + random.uniform(0, 1)
                        print(f"第 {attempt + 1} 次尝试失败，{delay:.2f}秒后重试...")
                        time.sleep(delay)
                    else:
                        raise
                        
                except Exception:
                    # 对于非预期错误，不重试
                    raise
            
            raise last_exception
            
        return wrapper
    return decorator

class NFDParserWithRetry(NFDParser):
    @retry_on_error(max_retries=3, backoff_factor=1.0)
    def parse_share_link(self, url: str, password: str = "") -> Optional[str]:
        return super().parse_share_link(url, password)
```

### 3. 批量处理的错误处理

```python
import asyncio
import httpx
from typing import List, Dict, Union
from dataclasses import dataclass

@dataclass
class ParseResult:
    """解析结果"""
    url: str
    success: bool
    direct_link: Optional[str] = None
    error: Optional[str] = None
    error_code: Optional[int] = None
    attempts: int = 1

class BatchParser:
    def __init__(self, base_url: str = "https://api.example.com",
                 max_retries: int = 2, concurrent_limit: int = 3):
        self.base_url = base_url
        self.max_retries = max_retries
        self.semaphore = asyncio.Semaphore(concurrent_limit)
    
    async def parse_single_with_retry(self, client: httpx.AsyncClient,
                                    url: str, password: str = "") -> ParseResult:
        """带重试的单链接解析"""
        last_error = None
        attempts = 0
        
        for attempt in range(self.max_retries + 1):
            attempts += 1
            
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
                    if response.status_code == 429:
                        # 频率限制，需要等待
                        if attempt < self.max_retries:
                            wait_time = (2 ** attempt) + random.uniform(0, 1)
                            await asyncio.sleep(wait_time)
                            continue
                        else:
                            return ParseResult(
                                url=url,
                                success=False,
                                error="请求过于频繁",
                                error_code=429,
                                attempts=attempts
                            )
                    
                    if response.status_code != 200:
                        if attempt < self.max_retries:
                            await asyncio.sleep(1)
                            continue
                        else:
                            return ParseResult(
                                url=url,
                                success=False,
                                error=f"HTTP {response.status_code}",
                                error_code=response.status_code,
                                attempts=attempts
                            )
                    
                    data = response.json()
                    
                    if data.get('success'):
                        return ParseResult(
                            url=url,
                            success=True,
                            direct_link=data['data']['directLink'],
                            attempts=attempts
                        )
                    else:
                        error_code = data.get('code', -1)
                        
                        # 对于某些错误不重试
                        if error_code in [400, 404]:  # 客户端错误
                            return ParseResult(
                                url=url,
                                success=False,
                                error=data.get('msg', '未知错误'),
                                error_code=error_code,
                                attempts=attempts
                            )
                        
                        # 其他错误可以重试
                        if attempt < self.max_retries:
                            await asyncio.sleep(1)
                            continue
                        else:
                            return ParseResult(
                                url=url,
                                success=False,
                                error=data.get('msg', '未知错误'),
                                error_code=error_code,
                                attempts=attempts
                            )
            
            except Exception as e:
                last_error = str(e)
                if attempt < self.max_retries:
                    wait_time = (2 ** attempt) + random.uniform(0, 1)
                    await asyncio.sleep(wait_time)
        
        return ParseResult(
            url=url,
            success=False,
            error=f"重试{self.max_retries}次后仍失败: {last_error}",
            attempts=attempts
        )
    
    async def batch_parse_safe(self, links: List[Dict[str, str]]) -> List[ParseResult]:
        """安全的批量解析"""
        async with httpx.AsyncClient() as client:
            tasks = [
                self.parse_single_with_retry(
                    client,
                    link['url'],
                    link.get('password', '')
                )
                for link in links
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # 处理异常
            processed_results = []
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    processed_results.append(ParseResult(
                        url=links[i]['url'],
                        success=False,
                        error=f"异常: {result}",
                        attempts=1
                    ))
                else:
                    processed_results.append(result)
            
            return processed_results

# 使用示例
async def batch_parse_example():
    parser = BatchParser(max_retries=2, concurrent_limit=3)
    
    links = [
        {'url': 'https://lanzoux.com/abc123', 'password': ''},
        {'url': 'https://invalid-link.com/xyz', 'password': ''},  # 无效链接
        # 更多链接...
    ]
    
    results = await parser.batch_parse_safe(links)
    
    # 分类统计
    success_results = [r for r in results if r.success]
    failed_results = [r for r in results if not r.success]
    
    print(f"成功: {len(success_results)}")
    print(f"失败: {len(failed_results)}")
    
    # 按错误类型分组
    error_groups = {}
    for result in failed_results:
        error_type = f"{result.error_code or 'NETWORK'}"
        if error_type not in error_groups:
            error_groups[error_type] = []
        error_groups[error_type].append(result)
    
    print("\n错误分布:")
    for error_type, errors in error_groups.items():
        print(f"  {error_type}: {len(errors)} 个")
        if error_type == "404":
            print("    建议：检查链接是否已过期")
        elif error_type == "429":
            print("    建议：降低并发数或增加延迟")
        elif error_type == "NETWORK":
            print("    建议：检查网络连接")

if __name__ == "__main__":
    asyncio.run(batch_parse_example())
```

## 日志和监控

```python
import logging
import json
from datetime import datetime
from pathlib import Path

class ErrorLogger:
    def __init__(self, log_dir: str = "logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        
        # 配置日志格式
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(
                    self.log_dir / f"nfd_parser_{datetime.now().strftime('%Y%m%d')}.log"
                ),
                logging.StreamHandler()
            ]
        )
        
        self.logger = logging.getLogger('NFDParser')
        self.error_log = []
    
    def log_error(self, url: str, error: str, error_code: int = None):
        """记录错误"""
        error_entry = {
            'timestamp': datetime.now().isoformat(),
            'url': url,
            'error': error,
            'error_code': error_code
        }
        
        self.error_log.append(error_entry)
        self.logger.error(f"解析失败 - {url}: {error}")
    
    def log_success(self, url: str, direct_link: str, attempts: int = 1):
        """记录成功"""
        self.logger.info(f"解析成功 - {url} ({attempts}次尝试)")
    
    def save_error_report(self):
        """保存错误报告"""
        if not self.error_log:
            return
        
        report_file = self.log_dir / f"error_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.error_log, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"错误报告已保存: {report_file}")
    
    def get_error_summary(self) -> Dict[str, int]:
        """获取错误摘要"""
        summary = {}
        for error in self.error_log:
            error_type = str(error.get('error_code', 'UNKNOWN'))
            summary[error_type] = summary.get(error_type, 0) + 1
        return summary

# 集成到解析器中
class LoggingBatchParser(BatchParser):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.error_logger = ErrorLogger()
    
    async def parse_single_with_retry(self, client, url, password=""):
        result = await super().parse_single_with_retry(client, url, password)
        
        if result.success:
            self.error_logger.log_success(url, result.direct_link, result.attempts)
        else:
            self.error_logger.log_error(url, result.error, result.error_code)
        
        return result
    
    def finalize(self):
        """完成处理，保存报告"""
        error_summary = self.error_logger.get_error_summary()
        if error_summary:
            print("\n错误统计:")
            for error_type, count in error_summary.items():
                print(f"  {error_type}: {count}")
        
        self.error_logger.save_error_report()
```

## 最佳实践

### 1. 优雅降级

```python
def parse_with_fallback(url: str, password: str = "") -> Optional[str]:
    """带降级策略的解析"""
    parsers = [
        NFDParser("https://api1.example.com"),
        NFDParser("https://api2.example.com"),
        NFDParser("https://backup.example.com")
    ]
    
    for i, parser in enumerate(parsers):
        try:
            result = parser.parse_share_link(url, password)
            if i > 0:
                print(f"使用备用API#{i+1}解析成功")
            return result
            
        except Exception as e:
            print(f"API#{i+1}失败: {e}")
            if i == len(parsers) - 1:  # 最后一个API也失败
                raise
            continue
    
    return None
```

### 2. 熔断器模式

```python
import time
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"      # 正常状态
    OPEN = "open"          # 熔断状态
    HALF_OPEN = "half_open"  # 半开状态

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 5, 
                 recovery_timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = CircuitState.CLOSED
    
    def call(self, func, *args, **kwargs):
        """通过熔断器调用函数"""
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
            else:
                raise Exception("服务熔断中，请稍后重试")
        
        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
            
        except Exception as e:
            self._on_failure()
            raise
    
    def _should_attempt_reset(self) -> bool:
        return (time.time() - self.last_failure_time) >= self.recovery_timeout
    
    def _on_success(self):
        self.failure_count = 0
        self.state = CircuitState.CLOSED
    
    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN

# 使用熔断器
class ResilientNFDParser(NFDParser):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.circuit_breaker = CircuitBreaker()
    
    def parse_share_link(self, url: str, password: str = "") -> Optional[str]:
        return self.circuit_breaker.call(
            super().parse_share_link,
            url, password
        )
```

### 3. 错误恢复策略

```python
def intelligent_retry(url: str, password: str = "") -> Optional[str]:
    """智能重试策略"""
    
    # 策略1: 直接解析
    try:
        return simple_parse(url, password)
    except APIError as e:
        if e.code == 404:
            # 尝试清理URL
            cleaned_url = clean_url(url)
            if cleaned_url != url:
                try:
                    return simple_parse(cleaned_url, password)
                except:
                    pass
        elif e.code == 400:
            # 尝试不同的URL格式
            alternative_urls = generate_alternative_urls(url)
            for alt_url in alternative_urls:
                try:
                    return simple_parse(alt_url, password)
                except:
                    continue
    
    # 策略2: 使用备用API
    return parse_with_fallback(url, password)

def clean_url(url: str) -> str:
    """清理URL格式"""
    # 移除追踪参数
    # 标准化域名
    # 修复常见错误
    pass

def generate_alternative_urls(url: str) -> List[str]:
    """生成可能的替代URL"""
    # 基于常见的URL模式生成替代方案
    pass
```

通过实施这些错误处理策略，可以显著提高应用的稳定性和用户体验。记住在生产环境中始终要有适当的监控和报警机制。