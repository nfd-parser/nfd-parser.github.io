<template>
  <div class="config-manager">
    <h3>🔧 交互式配置管理工具</h3>
    
    <div class="config-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
        class="tab-button"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="config-content">
      <!-- 配置编辑器 -->
      <div v-if="activeTab === 'editor'" class="config-editor">
        <div class="editor-controls">
          <button @click="loadDefaultConfig" class="btn btn-secondary">
            加载默认配置
          </button>
          <button @click="validateCurrentConfig" class="btn btn-primary">
            验证配置
          </button>
          <button @click="downloadConfig" class="btn btn-success">
            下载配置
          </button>
        </div>
        
        <div class="editor-wrapper">
          <textarea
            v-model="configText"
            class="config-textarea"
            placeholder="请输入 YAML 配置内容..."
            rows="20"
          ></textarea>
        </div>
        
        <div v-if="validationResult" class="validation-result">
          <div v-if="validationResult.success" class="success">
            ✅ 配置验证通过！
          </div>
          <div v-else class="error">
            <h4>❌ 配置验证失败：</h4>
            <ul>
              <li v-for="error in validationResult.errors" :key="error">
                {{ error }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 配置模板 -->
      <div v-if="activeTab === 'templates'" class="config-templates">
        <div class="template-grid">
          <div class="template-card" @click="loadTemplate('main')">
            <h4>📄 主服务配置</h4>
            <p>包含服务器、数据库、缓存等核心配置</p>
          </div>
          
          <div class="template-card" @click="loadTemplate('proxy')">
            <h4>🔗 代理服务配置</h4>
            <p>反向代理和静态文件服务配置</p>
          </div>
          
          <div class="template-card" @click="loadTemplate('production')">
            <h4>🚀 生产环境配置</h4>
            <p>优化的生产环境配置模板</p>
          </div>
        </div>
      </div>

      <!-- 配置说明 -->
      <div v-if="activeTab === 'help'" class="config-help">
        <div class="help-section">
          <h4>📖 配置文件说明</h4>
          <ul>
            <li><strong>server.port</strong>: 服务监听端口，默认 6400</li>
            <li><strong>server.domainName</strong>: 服务域名，用于生成二维码链接</li>
            <li><strong>rateLimit.enable</strong>: 是否启用限流功能</li>
            <li><strong>cache.defaultDuration</strong>: 默认缓存时长（分钟）</li>
            <li><strong>dataSource.jdbcUrl</strong>: 数据库连接地址</li>
          </ul>
        </div>
        
        <div class="help-section">
          <h4>⚠️ 注意事项</h4>
          <ul>
            <li>修改端口后需要重启服务</li>
            <li>数据库密码建议使用环境变量</li>
            <li>缓存时长不宜设置过大</li>
            <li>代理配置路径支持正则表达式</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const activeTab = ref('editor')
const configText = ref('')
const validationResult = ref(null)

const tabs = [
  { key: 'editor', label: '配置编辑器' },
  { key: 'templates', label: '配置模板' },
  { key: 'help', label: '使用说明' }
]

// 默认配置模板
const defaultMainConfig = `# NFD Parser 主配置文件
server:
  port: 6400
  contextPath: /
  enableDatabase: true
  domainName: http://127.0.0.1:6401
  previewURL: https://nfd-parser.github.io/nfd-preview/preview.html?src=

# 反向代理服务器配置路径
proxyConf: server-proxy

# vertx核心线程配置
vertx:
  eventLoopPoolSize: 0
  workerPoolSize: 0

# vertx-service配置
custom:
  asyncServiceInstances: 4
  baseLocations: cn.qaiu.lz
  routeTimeOut: 15000
  ignoresReg:
    - .*/test.*$
  entityPackagesReg:
    - ^cn\\.qaiu\\.lz\\.web\\.model\\..*

# 限流配置
rateLimit:
  enable: true
  limit: 10
  timeWindow: 10
  pathReg: ^/v2/.*

# 数据源配置
dataSource:
  jdbcUrl: jdbc:h2:file:./db/nfdData;MODE=MySQL;DATABASE_TO_UPPER=FALSE
  username: root
  password: '123456'

# 直链缓存配置
cache:
  type: h2db
  defaultDuration: 59
  duration:
    ce: 5
    cow: 5
    ec: 5
    fj: 20
    iz: 20
    le: 2879
    lz: 20
    qq: 9999999
    qqw: 30
    ws: 10
    ye: -1
    mne: 30
    mqq: 30
    mkg: 30
    p115: 30
    ct: 30

# HTTP代理配置
proxy: []`

const defaultProxyConfig = `# 反向代理配置
server-name: Vert.x-proxy-server(v4.1.2)

proxy:
  - listen: 6401
    page404: webroot/err/404.html
    static:
      path: /
      add-headers:
        x-token: ABC
      root: webroot/nfd-front/
    location:
      - path: ~^/(json/|v2/|d/|parser|ye/|lz/|cow/|ec/|fj/|fc/|le/|qq/|ws/|iz/|ce/).*
        origin: 127.0.0.1:6400
      - path: /n1/
        origin: 127.0.0.1:6400/v2/
    ssl:
      enable: false
      ssl_protocols: TLSv1.2
      ssl_certificate: ssl/server.pem
      ssl_certificate_key: ssl/privkey.key`

const productionConfig = `# 生产环境配置
server:
  port: 80
  contextPath: /
  enableDatabase: true
  domainName: https://your-domain.com
  previewURL: https://your-domain.com/preview/preview.html?src=

proxyConf: server-proxy

vertx:
  eventLoopPoolSize: 8
  workerPoolSize: 40

custom:
  asyncServiceInstances: 8
  baseLocations: cn.qaiu.lz
  routeTimeOut: 30000
  ignoresReg:
    - .*/test.*$
  entityPackagesReg:
    - ^cn\\.qaiu\\.lz\\.web\\.model\\..*

rateLimit:
  enable: true
  limit: 100
  timeWindow: 60
  pathReg: ^/v2/.*

dataSource:
  jdbcUrl: jdbc:mysql://localhost:3306/nfddata?useUnicode=true&characterEncoding=utf-8&allowMultiQueries=true&serverTimezone=GMT%2B8&useSSL=true
  username: \${DB_USERNAME:nfd_user}
  password: \${DB_PASSWORD:your_secure_password}

cache:
  type: redis
  defaultDuration: 120
  redis:
    host: localhost
    port: 6379
    password: \${REDIS_PASSWORD:}
  duration:
    ce: 10
    cow: 10
    ec: 10
    fj: 30
    iz: 30
    le: 480
    lz: 30
    qq: 1440
    qqw: 60
    ws: 20
    ye: 60
    mne: 60
    mqq: 60
    mkg: 60
    p115: 60
    ct: 60

proxy: []`

const loadDefaultConfig = () => {
  configText.value = defaultMainConfig
  validationResult.value = null
}

const loadTemplate = (type) => {
  activeTab.value = 'editor'
  switch (type) {
    case 'main':
      configText.value = defaultMainConfig
      break
    case 'proxy':
      configText.value = defaultProxyConfig
      break
    case 'production':
      configText.value = productionConfig
      break
  }
  validationResult.value = null
}

const validateCurrentConfig = () => {
  if (!configText.value.trim()) {
    validationResult.value = {
      success: false,
      errors: ['配置内容不能为空']
    }
    return
  }

  try {
    // 简单的 YAML 语法检查
    const lines = configText.value.split('\n')
    const errors = []
    
    // 检查缩进
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim() && !line.startsWith('#')) {
        const spaces = line.match(/^ */)[0].length
        if (spaces % 2 !== 0) {
          errors.push(`第 ${i + 1} 行缩进不正确（应为2的倍数）`)
        }
      }
    }
    
    // 检查必需的配置项
    const requiredSections = ['server', 'dataSource']
    for (const section of requiredSections) {
      if (!configText.value.includes(`${section}:`)) {
        errors.push(`缺少必需的配置节：${section}`)
      }
    }
    
    // 检查端口号
    const portMatch = configText.value.match(/port:\s*(\d+)/)
    if (portMatch) {
      const port = parseInt(portMatch[1])
      if (port < 1 || port > 65535) {
        errors.push(`端口号无效：${port}（应在 1-65535 范围内）`)
      }
    }
    
    validationResult.value = {
      success: errors.length === 0,
      errors
    }
  } catch (error) {
    validationResult.value = {
      success: false,
      errors: [`配置解析错误：${error.message}`]
    }
  }
}

const downloadConfig = () => {
  if (!configText.value.trim()) {
    alert('配置内容为空，无法下载')
    return
  }
  
  const blob = new Blob([configText.value], { type: 'text/yaml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'app-dev.yml'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

onMounted(() => {
  loadDefaultConfig()
})
</script>

<style scoped>
.config-manager {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.config-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--vp-c-border);
}

.tab-button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-button:hover {
  color: var(--vp-c-text-1);
}

.tab-button.active {
  color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
}

.config-content {
  min-height: 400px;
}

.config-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  border-color: var(--vp-c-brand);
}

.btn-primary {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}

.btn-secondary {
  background: var(--vp-c-bg-alt);
}

.btn-success {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.editor-wrapper {
  position: relative;
}

.config-textarea {
  width: 100%;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 16px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-1);
  resize: vertical;
}

.config-textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.validation-result {
  padding: 16px;
  border-radius: 4px;
  margin-top: 16px;
}

.validation-result.success,
.success {
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #7dd3fc;
}

.validation-result.error,
.error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.error h4 {
  margin: 0 0 8px 0;
}

.error ul {
  margin: 0;
  padding-left: 20px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.template-card {
  padding: 20px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--vp-c-bg-alt);
}

.template-card:hover {
  border-color: var(--vp-c-brand);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-card h4 {
  margin: 0 0 8px 0;
  color: var(--vp-c-text-1);
}

.template-card p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.config-help {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.help-section {
  padding: 20px;
  background: var(--vp-c-bg-alt);
  border-radius: 8px;
}

.help-section h4 {
  margin: 0 0 12px 0;
  color: var(--vp-c-text-1);
}

.help-section ul {
  margin: 0;
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .config-tabs {
    flex-wrap: wrap;
  }
  
  .editor-controls {
    flex-direction: column;
  }
  
  .template-grid {
    grid-template-columns: 1fr;
  }
}
</style>