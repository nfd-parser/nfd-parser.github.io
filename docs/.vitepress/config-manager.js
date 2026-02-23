/**
 * NFD Parser 配置管理工具
 * 用于验证和管理 YAML 配置文件
 */

import yaml from 'js-yaml'

// 默认配置模板
export const defaultConfig = {
  server: {
    port: 6400,
    contextPath: '/',
    enableDatabase: true,
    domainName: 'http://127.0.0.1:6401',
    previewURL: 'https://nfd-parser.github.io/nfd-preview/preview.html?src='
  },
  vertx: {
    eventLoopPoolSize: 0,
    workerPoolSize: 0
  },
  custom: {
    asyncServiceInstances: 4,
    baseLocations: 'cn.qaiu.lz',
    routeTimeOut: 15000,
    ignoresReg: ['.*/test.*$'],
    entityPackagesReg: ['^cn\\.qaiu\\.lz\\.web\\.model\\..*']
  },
  rateLimit: {
    enable: true,
    limit: 10,
    timeWindow: 10,
    pathReg: '^/v2/.*'
  },
  dataSource: {
    jdbcUrl: 'jdbc:h2:file:./db/nfdData;MODE=MySQL;DATABASE_TO_UPPER=FALSE',
    username: 'root',
    password: '123456'
  },
  cache: {
    type: 'h2db',
    defaultDuration: 59,
    duration: {
      ce: 5,
      cow: 5,
      ec: 5,
      fj: 20,
      iz: 20,
      le: 2879,
      lz: 20,
      qq: 9999999,
      qqw: 30,
      ws: 10,
      ye: -1,
      mne: 30,
      mqq: 30,
      mkg: 30,
      p115: 30,
      ct: 30
    }
  },
  proxy: []
}

// 代理服务器配置模板
export const defaultProxyConfig = {
  'server-name': 'Vert.x-proxy-server(v4.1.2)',
  proxy: [{
    listen: 6401,
    page404: 'webroot/err/404.html',
    static: {
      path: '/',
      'add-headers': {
        'x-token': 'ABC'
      },
      root: 'webroot/nfd-front/'
    },
    location: [
      {
        path: '~^/(json/|v2/|d/|parser|ye/|lz/|cow/|ec/|fj/|fc/|le/|qq/|ws/|iz/|ce/).*',
        origin: '127.0.0.1:6400'
      },
      {
        path: '/n1/',
        origin: '127.0.0.1:6400/v2/'
      }
    ],
    ssl: {
      enable: false,
      ssl_protocols: 'TLSv1.2',
      ssl_certificate: 'ssl/server.pem',
      ssl_certificate_key: 'ssl/privkey.key'
    }
  }]
}

/**
 * 配置验证规则
 */
const validationRules = {
  server: {
    port: { type: 'number', required: true, min: 1, max: 65535 },
    contextPath: { type: 'string', required: true },
    enableDatabase: { type: 'boolean', required: true },
    domainName: { type: 'string', required: true },
    previewURL: { type: 'string', required: false }
  },
  rateLimit: {
    enable: { type: 'boolean', required: true },
    limit: { type: 'number', required: true, min: 1 },
    timeWindow: { type: 'number', required: true, min: 1 },
    pathReg: { type: 'string', required: true }
  },
  dataSource: {
    jdbcUrl: { type: 'string', required: true },
    username: { type: 'string', required: true },
    password: { type: 'string', required: true }
  }
}

/**
 * 验证配置对象
 * @param {Object} config - 配置对象
 * @param {Object} rules - 验证规则
 * @returns {Array} 验证错误列表
 */
export function validateConfig(config, rules = validationRules) {
  const errors = []

  function validateSection(sectionName, sectionConfig, sectionRules) {
    if (!sectionConfig) {
      errors.push(`Missing required section: ${sectionName}`)
      return
    }

    Object.keys(sectionRules).forEach(key => {
      const rule = sectionRules[key]
      const value = sectionConfig[key]

      if (rule.required && (value === undefined || value === null)) {
        errors.push(`Missing required field: ${sectionName}.${key}`)
        return
      }

      if (value !== undefined && value !== null) {
        // 类型检查
        if (rule.type === 'number' && typeof value !== 'number') {
          errors.push(`Invalid type for ${sectionName}.${key}: expected number, got ${typeof value}`)
        } else if (rule.type === 'string' && typeof value !== 'string') {
          errors.push(`Invalid type for ${sectionName}.${key}: expected string, got ${typeof value}`)
        } else if (rule.type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`Invalid type for ${sectionName}.${key}: expected boolean, got ${typeof value}`)
        }

        // 数值范围检查
        if (rule.type === 'number' && typeof value === 'number') {
          if (rule.min !== undefined && value < rule.min) {
            errors.push(`Value too small for ${sectionName}.${key}: ${value} < ${rule.min}`)
          }
          if (rule.max !== undefined && value > rule.max) {
            errors.push(`Value too large for ${sectionName}.${key}: ${value} > ${rule.max}`)
          }
        }
      }
    })
  }

  Object.keys(rules).forEach(sectionName => {
    validateSection(sectionName, config[sectionName], rules[sectionName])
  })

  return errors
}

/**
 * 解析 YAML 配置文件
 * @param {string} yamlString - YAML 字符串
 * @returns {Object} 解析结果
 */
export function parseYamlConfig(yamlString) {
  try {
    const config = yaml.load(yamlString)
    const errors = validateConfig(config)
    
    return {
      success: errors.length === 0,
      config,
      errors
    }
  } catch (error) {
    return {
      success: false,
      config: null,
      errors: [`YAML parsing error: ${error.message}`]
    }
  }
}

/**
 * 生成配置文件 YAML 字符串
 * @param {Object} config - 配置对象
 * @returns {string} YAML 字符串
 */
export function generateYamlConfig(config) {
  return yaml.dump(config, {
    indent: 2,
    lineWidth: -1,
    noRefs: true,
    sortKeys: false
  })
}

/**
 * 合并配置对象
 * @param {Object} baseConfig - 基础配置
 * @param {Object} userConfig - 用户配置
 * @returns {Object} 合并后的配置
 */
export function mergeConfig(baseConfig, userConfig) {
  const merged = JSON.parse(JSON.stringify(baseConfig))
  
  function mergeObjects(target, source) {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        target[key] = target[key] || {}
        mergeObjects(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    })
  }
  
  mergeObjects(merged, userConfig)
  return merged
}