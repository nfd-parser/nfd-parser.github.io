<template>
  <div class="demo-parser">
    <div class="demo-header">
      <h3>🚀 在线解析演示</h3>
      <p>输入网盘分享链接，体验 NFD Parser 的解析功能</p>
    </div>

    <div class="demo-form">
      <div class="input-group">
        <div class="input-wrapper">
          <input
            v-model="shareUrl"
            type="text"
            placeholder="请输入网盘分享链接"
            class="url-input"
            @keydown.enter="parseLink"
          />
          <input
            v-model="password"
            type="text"
            placeholder="密码（可选）"
            class="password-input"
            @keydown.enter="parseLink"
          />
        </div>
        
        <div class="button-group">
          <button 
            @click="parseLink"
            :disabled="loading || !shareUrl.trim()"
            class="btn btn-primary"
          >
            <span v-if="loading">解析中...</span>
            <span v-else>🔍 解析文件</span>
          </button>
          
          <button 
            @click="previewLink"
            :disabled="loading || !shareUrl.trim()"
            class="btn btn-secondary"
          >
            <span v-if="loading">预览中...</span>
            <span v-else>👁️ 预览</span>
          </button>
        </div>
      </div>

      <div class="demo-examples">
        <span class="examples-label">示例链接：</span>
        <button 
          @click="useExample"
          class="example-link"
        >
          https://www.ilanzou.com/s/Wch0DGj8
        </button>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="error-message">
      <div class="error-content">
        <span class="error-icon">❌</span>
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- 解析结果 -->
    <div v-if="result" class="result-section">
      <div class="result-header">
        <h4>✅ 解析成功</h4>
      </div>
      
      <div class="result-content">
        <div class="result-item">
          <label>分享信息：</label>
          <div class="share-info">
            <span class="share-platform">{{ result.shareLinkInfo?.panName || '未知网盘' }}</span>
            <span class="share-key">{{ result.shareLinkInfo?.shareKey || 'N/A' }}</span>
          </div>
        </div>

        <div v-if="result.shareLinkInfo?.shareUrl" class="result-item">
          <label>原始链接：</label>
          <div class="link-item">
            <a :href="result.shareLinkInfo.shareUrl" target="_blank" rel="noopener noreferrer" class="result-link">
              {{ result.shareLinkInfo.shareUrl }}
            </a>
            <button @click="copyToClipboard(result.shareLinkInfo.shareUrl)" class="copy-btn">
              📋 复制
            </button>
          </div>
        </div>

        <div v-if="result.downLink" class="result-item">
          <label>下载链接：</label>
          <div class="link-item">
            <a :href="result.downLink" target="_blank" rel="noopener noreferrer" class="result-link">
              {{ result.downLink }}
            </a>
            <button @click="copyToClipboard(result.downLink)" class="copy-btn">
              📋 复制
            </button>
          </div>
        </div>

        <div v-if="result.apiLink" class="result-item">
          <label>API 链接：</label>
          <div class="link-item">
            <a :href="result.apiLink" target="_blank" rel="noopener noreferrer" class="result-link">
              {{ result.apiLink }}
            </a>
            <button @click="copyToClipboard(result.apiLink)" class="copy-btn">
              📋 复制
            </button>
          </div>
        </div>

        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-label">解析次数：</span>
            <span class="stat-value">{{ result.parserTotal || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">缓存命中：</span>
            <span class="stat-value">{{ result.cacheHitTotal || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">总计：</span>
            <span class="stat-value">{{ result.sumTotal || 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览结果 -->
    <div v-if="previewResult" class="preview-section">
      <div class="preview-header">
        <h4>👁️ 预览信息</h4>
      </div>
      
      <div class="preview-content">
        <div v-if="previewResult.data" class="preview-item">
          <label>预览链接：</label>
          <div class="link-item">
            <a :href="previewResult.data" target="_blank" rel="noopener noreferrer" class="result-link">
              {{ previewResult.data }}
            </a>
            <button @click="copyToClipboard(previewResult.data)" class="copy-btn">
              📋 复制
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const shareUrl = ref('https://www.ilanzou.com/s/Wch0DGj8')
const password = ref('')
const loading = ref(false)
const error = ref('')
const result = ref(null)
const previewResult = ref(null)

const useExample = () => {
  shareUrl.value = 'https://www.ilanzou.com/s/Wch0DGj8'
  password.value = ''
  error.value = ''
  result.value = null
  previewResult.value = null
}

const parseLink = async () => {
  if (!shareUrl.value.trim()) {
    error.value = '请输入分享链接'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null
  previewResult.value = null

  try {
    const params = new URLSearchParams({
      url: shareUrl.value,
      pwd: password.value || ''
    })
    
    const apiUrl = `https://lz0.qaiu.top/v2/linkInfo?${params}`
    const response = await fetch(apiUrl)
    const mockResponse = await response.json()
    
    if (mockResponse.success) {
      result.value = mockResponse.data
    } else {
      error.value = mockResponse.msg || '解析失败'
    }
  } catch (err) {
    error.value = '网络请求失败，请检查网络连接'
    console.error('Parse error:', err)
  } finally {
    loading.value = false
  }
}

const previewLink = async () => {
  if (!shareUrl.value.trim()) {
    error.value = '请输入分享链接'
    return
  }

  loading.value = true
  error.value = ''
  result.value = null
  previewResult.value = null

  try {
    const params = new URLSearchParams({
      url: shareUrl.value,
      pwd: password.value || ''
    })
    
    const previewUrl = `https://lz0.qaiu.top/v2/preview?${params}`
    
    // 设置预览结果
    previewResult.value = {
      success: true,
      data: previewUrl
    }
  } catch (err) {
    error.value = '网络请求失败，请检查网络连接'
    console.error('Preview error:', err)
  } finally {
    loading.value = false
  }
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // 简单的复制成功提示
    const btn = event.target
    const originalText = btn.textContent
    btn.textContent = '✓ 已复制'
    setTimeout(() => {
      btn.textContent = originalText
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>

<style scoped>
.demo-parser {
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  background: var(--vp-c-bg-alt);
}

.demo-header {
  text-align: center;
  margin-bottom: 24px;
}

.demo-header h3 {
  margin: 0 0 8px 0;
  color: var(--vp-c-text-1);
  font-size: 20px;
}

.demo-header p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.demo-form {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.url-input, .password-input {
  flex: 1;
  min-width: 200px;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 14px;
  transition: border-color 0.2s;
}

.url-input:focus, .password-input:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.password-input {
  max-width: 150px;
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 20px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

.btn-primary:hover:not(:disabled) {
  background: var(--vp-c-brand-dark);
  border-color: var(--vp-c-brand-dark);
  color: white;
}

.btn-secondary {
  background: var(--vp-c-bg-alt);
}

.demo-examples {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding: 12px;
  background: var(--vp-c-bg);
  border-radius: 6px;
  border: 1px solid var(--vp-c-border);
}

.examples-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.example-link {
  background: none;
  border: none;
  color: var(--vp-c-brand);
  cursor: pointer;
  font-size: 12px;
  text-decoration: underline;
  padding: 2px 4px;
}

.example-link:hover {
  color: var(--vp-c-brand-dark);
}

.error-message {
  margin: 16px 0;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  font-size: 16px;
}

.result-section, .preview-section {
  margin: 20px 0;
  padding: 20px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
}

.result-header, .preview-header {
  margin-bottom: 16px;
}

.result-header h4, .preview-header h4 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 16px;
}

.result-content, .preview-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item, .preview-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.result-item label, .preview-item label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  font-weight: 500;
}

.share-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.share-platform {
  background: var(--vp-c-brand);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.share-key {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-alt);
  padding: 2px 6px;
  border-radius: 4px;
}

.link-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.result-link {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-size: 14px;
  word-break: break-all;
  flex: 1;
  min-width: 0;
}

.result-link:hover {
  text-decoration: underline;
}

.copy-btn {
  padding: 4px 8px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
  transition: all 0.2s;
}

.copy-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.result-stats {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding: 12px;
  background: var(--vp-c-bg-alt);
  border-radius: 6px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-brand);
}

@media (max-width: 768px) {
  .input-wrapper {
    flex-direction: column;
  }
  
  .password-input {
    max-width: none;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .demo-examples {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .link-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .result-stats {
    flex-direction: column;
    align-items: center;
  }
  
  .stat-item {
    flex-direction: row;
    gap: 8px;
  }
}
</style>
