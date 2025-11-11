const envTools = require('../config.env.js');
const globalObj = typeof global !== 'undefined'
  ? global
  : (typeof globalThis !== 'undefined' ? globalThis : {});

// ===== 全局API请求诊断工具 =====
console.log('===== API诊断工具已加载 =====');

function ensureTrailingSlash(url) {
  if (!url) {
    return '';
  }
  return url.endsWith('/') ? url : url + '/';
}

function normalizeRequestUrl(rawUrl, baseUrl, envName) {
  const normalizedBase = ensureTrailingSlash(baseUrl);
  if (!rawUrl) {
    return normalizedBase;
  }
  if (/^https?:\/\//i.test(rawUrl)) {
    if (envName !== 'development' && normalizedBase && rawUrl.indexOf('localhost') !== -1) {
      return rawUrl.replace(/https?:\/\/localhost(?::\d+)?\//i, normalizedBase);
    }
    return rawUrl;
  }
  const cleanPath = String(rawUrl).replace(/^\//, '');
  return normalizedBase + cleanPath;
}

// 1. 全局环境信息检测
function detectEnvironment() {
  console.log('\n===== 1. 环境信息检测 =====');
  try {
    const snapshot = envTools.getRuntimeSnapshot(false);
    const config = envTools.getEnvConfig(false);
    const sysInfo = wx.getSystemInfoSync();
    console.log('系统信息:', sysInfo);
    console.log('判定环境:', snapshot.env + (snapshot.manualEnv ? ' (手动覆盖)' : ''));
    console.log('运行平台:', snapshot.platform || sysInfo.platform);
    console.log('小程序通道:', snapshot.envVersion || 'unknown');

    wx.getNetworkType({
      success(res) {
        console.log('网络类型:', res.networkType);
      },
      fail(err) {
        console.error('获取网络状态失败:', err);
      }
    });

    if (snapshot.env !== 'development' && config.baseURL.indexOf('localhost') !== -1) {
      console.error('⚠️ 真机环境仍使用 localhost，建议执行 setEnvironmentBaseURL("testing", "192.168.x.x:8080/nodejsn73cv/")');
    }

    return snapshot.env === 'development';
  } catch (e) {
    console.error('环境检测异常:', e);
    return true;
  }
}

// 2. 全局变量检查
function checkGlobalVariables() {
  console.log('\n===== 2. 全局变量检查 =====');

  console.log('global对象存在:', typeof global !== 'undefined');
  if (typeof global !== 'undefined') {
    console.log('global.__httpBaseUrl:', global.__httpBaseUrl);
    console.log('global.__baseModule:', global.__baseModule);
  }

  console.log('window对象存在:', typeof window !== 'undefined');
  if (typeof window !== 'undefined') {
    console.log('window.__fixUrl:', typeof window.__fixUrl === 'function' ? '已定义' : '未定义');
  }

  try {
    const app = getApp();
    const isProd = !!(app && app.$base && app.$base.isProduction);
    const config = envTools.getEnvConfig(isProd);
    console.log('App实例存在:', !!app);
    if (app) {
      console.log('app.$base:', app.$base);
      console.log('app.$base.url:', app.$base && app.$base.url);
      console.log('当前 API 基础地址:', config.baseURL);
    }
  } catch (e) {
    console.error('获取App实例失败:', e);
  }
}

// 3. 深度拦截wx.request
function deepInterceptRequest() {
  console.log('\n===== 3. 深度拦截wx.request =====');

  if (typeof wx === 'undefined' || typeof wx.request !== 'function') {
    console.error('wx.request不可用');
    return;
  }

  if (!globalObj.__originalWxRequest) {
    globalObj.__originalWxRequest = wx.request;
    console.log('已保存原始wx.request方法');
  }

  wx.request = function(options = {}) {
    console.log('\n===== 深度拦截 - 请求开始 =====');
    console.log('原始请求配置:', JSON.stringify(options));

    const app = (typeof getApp === 'function') ? getApp() : null;
    const isProd = !!(app && app.$base && app.$base.isProduction);
    const envName = envTools.resolveEnvironment(isProd);
    const baseUrl = envTools.getBaseURL(isProd);
    console.log('深度拦截 - 当前环境:', envName);

    options.url = normalizeRequestUrl(options.url || '', baseUrl, envName);
    console.log('深度拦截 - 归一化URL:', options.url);

    if (options.baseUrl) {
      const normalizedBase = normalizeRequestUrl('', options.baseUrl, envName);
      if (normalizedBase !== options.baseUrl) {
        console.log('深度拦截 - 修正 baseUrl:', normalizedBase);
      }
      options.baseUrl = normalizedBase;
    }

    if (options.url.indexOf('YOUR_LOCAL_IP') !== -1 && envName !== 'development') {
      console.error('[diagnostic] 检测到占位符 YOUR_LOCAL_IP，真机请求将失败');
    }

    const originalSuccess = options.success;
    const originalFail = options.fail;
    const originalComplete = options.complete;

    options.success = function(res) {
      console.log('深度拦截 - 请求成功:', res.statusCode, res.errMsg);
      if (originalSuccess) {
        originalSuccess.call(this, res);
      }
    };

    options.fail = function(err) {
      console.log('深度拦截 - 请求失败:', err);
      if (originalFail) {
        originalFail.call(this, err);
      }
    };

    options.complete = function(res) {
      console.log('深度拦截 - 请求完成');
      if (originalComplete) {
        originalComplete.call(this, res);
      }
    };

    return globalObj.__originalWxRequest.call(this, options);
  };

  console.log('深度拦截已部署，将捕获所有wx.request调用');
}

// 4. 监控全局$base对象的变化
function monitorBaseObject() {
  console.log('\n===== 4. 监控全局$base对象 =====');
  try {
    const app = getApp();
    if (!app) {
      console.warn('无法获取App实例');
      return;
    }
    const originalBase = app.$base || {};
    const proxy = new Proxy(originalBase, {
      get(target, prop) {
        console.log(`监控 - 读取$base.${prop}:`, target[prop]);
        return target[prop];
      },
      set(target, prop, value) {
        console.log(`监控 - 设置$base.${prop}:`, value);
        target[prop] = value;
        return true;
      }
    });
    app.$base = proxy;
    console.log('已为app.$base创建监控代理');
  } catch (e) {
    console.error('监控$base对象失败:', e);
  }
}

// 5. 诊断测试请求
function testRequest() {
  console.log('\n===== 5. 诊断测试请求 =====');
  const app = (typeof getApp === 'function') ? getApp() : null;
  const isProd = !!(app && app.$base && app.$base.isProduction);
  const config = envTools.getEnvConfig(isProd);
  console.log('即将使用 API 地址:', config.baseURL);

  wx.request({
    url: 'xuesheng/test',
    method: 'GET',
    data: { test: true },
    success(res) {
      console.log('测试请求成功:', res.statusCode, res.errMsg);
    },
    fail(err) {
      console.log('测试请求失败（接口可能不存在，但用于验证 URL 拼接）:', err);
    }
  });
}

function runDiagnostics() {
  console.log('\n\n===== 开始API请求诊断 =====', new Date().toLocaleString());
  detectEnvironment();
  checkGlobalVariables();
  deepInterceptRequest();
  monitorBaseObject();
  setTimeout(testRequest, 1000);
  console.log('\n===== 诊断工具初始化完成 =====');
}

if (typeof wx !== 'undefined') {
  runDiagnostics();
} else {
  console.error('诊断工具无法运行：wx对象不可用');
}

module.exports = {
  runDiagnostics,
  detectEnvironment,
  checkGlobalVariables,
  deepInterceptRequest
};
