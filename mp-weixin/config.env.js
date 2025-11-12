/**
 * ========================================
 * 微信小程序环境配置文件
 * ========================================
 *
 * 统一管理开发 / 测试 / 生产环境 API 地址，并提供：
 * 1. 更稳健的运行环境识别
 * 2. 真机调试强制使用测试环境
 * 3. 可通过 storage 或全局变量手动覆盖
 * ========================================
 */

const globalRef = typeof globalThis !== 'undefined'
  ? globalThis
  : (typeof global !== 'undefined'
      ? global
      : (typeof window !== 'undefined' ? window : {}));

const STORAGE_KEYS = {
  FORCE_ENV: '__MP_FORCE_ENV__',
  TESTING_BASE_URL: '__MP_TESTING_BASE_URL__',
  PRODUCTION_BASE_URL: '__MP_PROD_BASE_URL__'
};

const ENV_ALIAS = {
  development: 'development',
  develop: 'development',
  dev: 'development',
  testing: 'testing',
  test: 'testing',
  trial: 'testing',
  debug: 'testing',
  production: 'production',
  prod: 'production',
  release: 'production'
};

const ENV_CONFIG = {
  /**
   * 开发环境：本地开发者工具 / 模拟器
   */
  development: {
    baseURL: 'http://localhost:8080/nodejsn73cv/',
    apiRoot: 'nodejsn73cv/',
    description: '开发环境 - 微信开发者工具'
  },

  /**
   * 测试环境 / 真机调试：在设备上运行，需要可访问的服务器
   *
   * ⚠️ 重要提示：
   * 1. 真机调试时，微信小程序要求图片等资源必须使用 HTTPS
   * 2. 开发阶段可以在"微信开发者工具 -> 详情 -> 本地设置"中勾选"不校验合法域名"
   * 3. 生产环境必须配置 HTTPS 服务器
   *
   * 配置选项：
   * - HTTP（开发）：http://YOUR_LOCAL_IP:8080/nodejsn73cv/
   * - HTTPS（生产）：https://YOUR_DOMAIN:8443/nodejsn73cv/
   */
  testing: {
    baseURL: 'http://YOUR_LOCAL_IP:8080/nodejsn73cv/',
    // 如果已配置 HTTPS，取消下面的注释并注释掉上面的 HTTP 地址
    // baseURL: 'https://YOUR_LOCAL_IP:8443/nodejsn73cv/',
    apiRoot: 'nodejsn73cv/',
    description: '测试环境 - 真机调试 / 预览，请配置服务器地址'
  },

  /**
   * 生产环境：正式发布
   *
   * ⚠️ 必须使用 HTTPS！
   * 微信小程序要求生产环境必须使用 HTTPS 协议
   */
  production: {
    baseURL: 'https://your-domain.com/nodejsn73cv/',
    apiRoot: 'nodejsn73cv/',
    description: '生产环境 - 正式服务器（必须 HTTPS）'
  }
};

// 兼容旧逻辑：保留 debug 别名
ENV_CONFIG.debug = ENV_CONFIG.testing;

let envLogPrinted = false;

function normalizeEnvName(name) {
  if (name === undefined || name === null) {
    return '';
  }
  const key = String(name).trim().toLowerCase();
  return ENV_ALIAS[key] || '';
}

function safeCall(fn, fallback) {
  try {
    return fn();
  } catch (error) {
    return fallback;
  }
}

function getSystemInfo() {
  return safeCall(() => {
    if (typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function') {
      return wx.getSystemInfoSync();
    }
    return {};
  }, {}) || {};
}

function getAccountInfo() {
  return safeCall(() => {
    if (typeof wx !== 'undefined' && typeof wx.getAccountInfoSync === 'function') {
      return wx.getAccountInfoSync();
    }
    return {};
  }, {}) || {};
}

function ensureCache() {
  if (!globalRef) {
    return null;
  }
  if (!globalRef.__MP_ENV_CACHE__) {
    Object.defineProperty(globalRef, '__MP_ENV_CACHE__', {
      value: {},
      writable: true,
      enumerable: false,
      configurable: true
    });
  }
  return globalRef.__MP_ENV_CACHE__;
}

function readPersistent(key) {
  let value;
  if (typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function') {
    value = safeCall(() => wx.getStorageSync(key), undefined);
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  const cache = ensureCache();
  if (cache && Object.prototype.hasOwnProperty.call(cache, key)) {
    return cache[key];
  }
  return undefined;
}

function writePersistent(key, value) {
  if (typeof wx !== 'undefined' && typeof wx.setStorageSync === 'function') {
    if (value === undefined || value === null || value === '') {
      if (typeof wx.removeStorageSync === 'function') {
        safeCall(() => wx.removeStorageSync(key));
      } else {
        safeCall(() => wx.setStorageSync(key, ''));
      }
    } else {
      safeCall(() => wx.setStorageSync(key, value));
    }
  }
  const cache = ensureCache();
  if (cache) {
    if (value === undefined || value === null || value === '') {
      delete cache[key];
    } else {
      cache[key] = value;
    }
  }
}

function sanitizeBaseUrl(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }
  let trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = 'http://' + trimmed;
  }
  const match = trimmed.match(/^(https?:\/\/)(.*)$/i);
  if (match) {
    const protocol = match[1];
    const rest = match[2].replace(/\/{2,}/g, '/');
    trimmed = protocol + rest;
  }
  if (!/\/$/.test(trimmed)) {
    trimmed += '/';
  }
  return trimmed;
}

function getRuntimeBaseOverride(envName) {
  let key = null;
  if (envName === 'testing') {
    key = STORAGE_KEYS.TESTING_BASE_URL;
  } else if (envName === 'production') {
    key = STORAGE_KEYS.PRODUCTION_BASE_URL;
  }
  if (!key) {
    return '';
  }
  const stored = readPersistent(key);
  return sanitizeBaseUrl(stored);
}

function cloneConfig(source) {
  const target = {};
  if (!source) {
    return target;
  }
  Object.keys(source).forEach((key) => {
    target[key] = source[key];
  });
  return target;
}

function applyOverrides(envName, baseConfig, overrideBase) {
  const config = cloneConfig(baseConfig);
  config.env = envName;
  if (overrideBase) {
    config.baseURL = overrideBase;
  }
  return config;
}

function hasPlaceholder(baseUrl) {
  if (!baseUrl) {
    return true;
  }
  return baseUrl.indexOf('YOUR_LOCAL_IP') !== -1 || baseUrl.indexOf('your-domain.com') !== -1;
}

function warnPlaceholder(envName, baseUrl) {
  console.error('========================================');
  console.error('⚠️ 未完成的环境配置');
  console.error('========================================');
  console.error('环境:', envName);
  console.error('当前 API 地址:', baseUrl);
  if (envName === 'testing') {
    console.error('请通过 setEnvironmentBaseURL("testing", "192.168.x.x:8080/nodejsn73cv/") 或直接修改 config.env.js');
  } else {
    console.error('请将 production.baseURL 修改为线上服务器域名。');
  }
  console.error('========================================');
}

function getManualEnv() {
  return normalizeEnvName(readPersistent(STORAGE_KEYS.FORCE_ENV));
}

function resolveEnvironment(isProduction) {
  if (isProduction === true) {
    return 'production';
  }

  const manualEnv = getManualEnv();
  if (manualEnv) {
    return manualEnv;
  }

  const accountInfo = getAccountInfo();
  const miniProgramInfo = accountInfo && accountInfo.miniProgram ? accountInfo.miniProgram : {};
  const envVersion = (miniProgramInfo.envVersion || '').toLowerCase();

  const systemInfo = getSystemInfo();
  const platform = (systemInfo.platform || '').toLowerCase();
  const environment = (systemInfo.environment || '').toLowerCase();

  if (envVersion === 'release') {
    return 'production';
  }
  if (envVersion === 'trial') {
    return 'testing';
  }
  if (envVersion === 'develop') {
    if (platform && platform !== 'devtools') {
      return 'testing';
    }
    return 'development';
  }

  if (platform && platform !== 'devtools') {
    return 'testing';
  }
  if (environment && environment !== 'wxdevtools') {
    return 'testing';
  }

  return 'development';
}

function logEnvironment(config, envName, context) {
  console.log('========================================');
  console.log('环境配置信息');
  console.log('========================================');
  console.log('当前环境:', envName + (context.forced ? ' (手动指定)' : ''));
  if (context.envVersion) {
    console.log('小程序版本通道:', context.envVersion);
  }
  console.log('环境描述:', config.description);
  console.log('API 地址:', config.baseURL);
  console.log('平台信息:', context.systemInfo.platform || 'unknown');
  if (context.overrideApplied) {
    console.log('已使用自定义 baseURL 覆盖');
  }
  console.log('========================================');
}

function getEnvConfig(isProduction) {
  const manualEnv = getManualEnv();
  const systemInfo = getSystemInfo();
  const accountInfo = getAccountInfo();
  const envVersion = accountInfo && accountInfo.miniProgram ? accountInfo.miniProgram.envVersion : '';

  const currentEnv = resolveEnvironment(isProduction);
  const baseConfig = ENV_CONFIG[currentEnv] || ENV_CONFIG.development;
  const overrideBase = getRuntimeBaseOverride(currentEnv);
  const config = applyOverrides(currentEnv, baseConfig, overrideBase);

  if (!envLogPrinted) {
    logEnvironment(config, currentEnv, {
      forced: !!manualEnv,
      systemInfo,
      envVersion,
      overrideApplied: !!overrideBase
    });
    envLogPrinted = true;
  }

  if ((currentEnv === 'testing' || currentEnv === 'production') && hasPlaceholder(config.baseURL)) {
    warnPlaceholder(currentEnv, config.baseURL);
  }

  return config;
}

function getBaseURL(isProduction) {
  return getEnvConfig(isProduction).baseURL;
}

function getApiRoot(isProduction) {
  return getEnvConfig(isProduction).apiRoot;
}

function setManualEnvironment(envName) {
  const normalized = normalizeEnvName(envName);
  if (!normalized) {
    throw new Error('[env] 无效的环境名称: ' + envName);
  }
  writePersistent(STORAGE_KEYS.FORCE_ENV, normalized);
  envLogPrinted = false;
  console.log('[env] 手动指定运行环境 ->', normalized);
  return normalized;
}

function clearManualEnvironment() {
  writePersistent(STORAGE_KEYS.FORCE_ENV, '');
  envLogPrinted = false;
  console.log('[env] 已取消手动环境覆盖');
}

function setEnvironmentBaseURL(envName, baseUrl) {
  const normalized = normalizeEnvName(envName);
  if (!normalized || normalized === 'development') {
    throw new Error('[env] 仅支持 testing / production 环境覆盖');
  }
  const sanitized = sanitizeBaseUrl(baseUrl);
  if (!sanitized) {
    throw new Error('[env] 无效的地址: ' + baseUrl);
  }
  const key = normalized === 'production'
    ? STORAGE_KEYS.PRODUCTION_BASE_URL
    : STORAGE_KEYS.TESTING_BASE_URL;
  writePersistent(key, sanitized);
  envLogPrinted = false;
  console.log('[env] 已更新 ' + normalized + ' baseURL -> ' + sanitized);
  return sanitized;
}

function clearEnvironmentBaseURL(envName) {
  const normalized = normalizeEnvName(envName);
  if (!normalized || normalized === 'development') {
    return;
  }
  const key = normalized === 'production'
    ? STORAGE_KEYS.PRODUCTION_BASE_URL
    : STORAGE_KEYS.TESTING_BASE_URL;
  writePersistent(key, '');
  envLogPrinted = false;
  console.log('[env] 已清除 ' + normalized + ' baseURL 自定义配置');
}

function getRuntimeSnapshot(isProduction) {
  const accountInfo = getAccountInfo();
  const systemInfo = getSystemInfo();
  return {
    env: resolveEnvironment(isProduction),
    manualEnv: getManualEnv(),
    envVersion: accountInfo && accountInfo.miniProgram ? accountInfo.miniProgram.envVersion : '',
    platform: systemInfo.platform || '',
    overrides: {
      testingBaseURL: readPersistent(STORAGE_KEYS.TESTING_BASE_URL) || '',
      productionBaseURL: readPersistent(STORAGE_KEYS.PRODUCTION_BASE_URL) || ''
    }
  };
}

module.exports = {
  ENV_CONFIG,
  getEnvConfig,
  getBaseURL,
  getApiRoot,
  resolveEnvironment,
  setManualEnvironment,
  clearManualEnvironment,
  setEnvironmentBaseURL,
  clearEnvironmentBaseURL,
  getRuntimeSnapshot
};
