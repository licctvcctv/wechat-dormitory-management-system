/**
 * ========================================
 * mini_fix.js - 网络请求拦截器
 * ========================================
 *
 * 作用：
 * 1. 拦截所有网络请求（wx.request, uni.request, axios）
 * 2. 自动根据环境切换 API 地址
 * 3. 锁定 wx.request，防止被其他代码覆盖
 *
 * 必须第一个被加载！
 * ========================================
 */

// 引入环境配置
const envModule = require('./config.env.js');

const globalRoot = typeof globalThis !== 'undefined'
  ? globalThis
  : (typeof global !== 'undefined'
      ? global
      : (typeof wx !== 'undefined' ? wx : {}));

const debugFlag = (() => {
  let flag = false;
  try {
    if (typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function') {
      flag = !!wx.getStorageSync('__MP_DEBUG_MINI_FIX__');
    }
  } catch (err) {
    // ignore storage errors
  }
  if (!flag && globalRoot && globalRoot.__MP_DEBUG_MINI_FIX__ !== undefined) {
    flag = !!globalRoot.__MP_DEBUG_MINI_FIX__;
  }
  return flag;
})();

const debugLog = (...args) => {
  if (!debugFlag) {
    return;
  }
  console.log('[mini_fix][debug]', ...args);
};

try {
  const moduleKeys = envModule ? Object.keys(envModule) : [];
  const defaultKeys = envModule && envModule.default ? Object.keys(envModule.default || {}) : [];
  console.log('[mini_fix] config.env 模块 keys:', moduleKeys, 'default keys:', defaultKeys);
} catch (err) {
  console.warn('[mini_fix] 无法打印 config.env 模块信息:', err);
}

function unwrapEnvModule(mod, depth = 0) {
  if (!mod || depth > 5) {
    return {};
  }
  if (typeof mod.getEnvConfig === 'function' && typeof mod.getBaseURL === 'function') {
    return mod;
  }
  if (mod.default) {
    return unwrapEnvModule(mod.default, depth + 1);
  }
  return mod;
}

let envConfig = unwrapEnvModule(envModule);

function getEnvTools() {
  if (envConfig && typeof envConfig.getEnvConfig === 'function') {
    return envConfig;
  }
  const fallback = globalRoot.__MP_ENV_TOOLS__ || (typeof wx !== 'undefined' ? wx.__MP_ENV_TOOLS__ : null);
  if (fallback && typeof fallback.getEnvConfig === 'function') {
    envConfig = fallback;
    return envConfig;
  }
  const keys = envModule ? Object.keys(envModule) : [];
  console.error('[mini_fix] config.env.js 导出异常，当前 keys:', keys);
  throw new Error('[mini_fix] 无法加载 config.env.js，请检查编译产物');
}

// 防重复：若已打过补丁，直接退出
if (typeof wx !== 'undefined' && wx.__miniPatched__) {
  console.log('[mini_fix] 已启用，跳过重复加载');
} else {
  // 获取当前环境的基础 URL（从 app.js 传入的 isProduction 参数）
  let IS_PRODUCTION = false; // 默认非生产环境，app.js 会更新此值

  const getBaseURL = () => {
    return getEnvTools().getBaseURL(IS_PRODUCTION);
  };

  const getApiRoot = () => {
    return getEnvTools().getApiRoot(IS_PRODUCTION);
  };

  /**
   * 修复 URL 中的 localhost 为实际环境地址
   */
  const fixHost = (u) => {
    if (!u) return '';
    const baseURL = getBaseURL();
    // 将 localhost 或 127.0.0.1 替换为当前环境的基础地址
    const result = u.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\//i, baseURL.replace(/nodejsn73cv\/$/, ''));
    debugLog('fixHost', { input: u, baseURL, output: result });
    return result;
  };

  const sanitizePathValue = (value) => {
    if (value === undefined || value === null) {
      return '';
    }
    return String(value)
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim()
      .replace(/^["'\[\]]+/, '')
      .replace(/["'\[\]]+$/, '')
      .trim();
  };

  const pickAbsoluteUrl = (value) => {
    if (!value) {
      return '';
    }
    const match = value.match(/https?:\/\/[^\s]+/i);
    return match ? match[0] : '';
  };

  const reportUrlNormalization = (reason, detail) => {
    try {
      console.warn('[mini_fix][url]', reason, detail);
    } catch (_) {
      // ignore console errors
    }
  };

  /**
   * 拼接 base 和 path
   */
  const join = (base, path) => {
    const normalizedPath = sanitizePathValue(path);
    const normalizedBase = sanitizePathValue(base);
    if (!normalizedPath) {
      return normalizedBase;
    }
    const absolute = pickAbsoluteUrl(normalizedPath);
    if (absolute) {
      reportUrlNormalization('join(): 发现响应已经包含完整 URL，跳过二次拼接', {
        base: normalizedBase,
        path: normalizedPath,
        absolute,
      });
      debugLog('join absolute', { base: normalizedBase, path: normalizedPath, absolute });
      return fixHost(absolute);
    }
    const b = normalizedBase
      ? (normalizedBase.endsWith('/') ? normalizedBase : normalizedBase + '/')
      : '';
    const joined = b + normalizedPath.replace(/^\//, '');
    if (/https?:\/\/.+https?:\/\//i.test(joined)) {
      reportUrlNormalization('join(): 拼接结果仍含重复协议，请检查返回数据', {
        base: normalizedBase,
        path: normalizedPath,
        joined,
      });
    }
    debugLog('join relative', {
      base: normalizedBase,
      path: normalizedPath,
      result: joined,
    });
    return joined;
  };

  /**
   * 获取基础地址
   */
  const getBase = () => {
    try {
      const app = (typeof getApp === 'function') ? getApp() : null;
      if (app && app.$base && app.$base.url) return fixHost(app.$base.url);
    } catch (_) {}
    return getBaseURL();
  };

  const IMAGE_KEY_PATTERN = /(img|image|photo|pic|avatar|icon|logo|cover|banner|thumb|tupian|fengmian|wupintupian|fengmiantupian|touxiang|poster|background|bg|url)$/i;
  const IMAGE_EXT_PATTERN = /\.(jpe?g|png|gif|bmp|webp|svg)(?:\?.*)?$/i;
  const UPLOAD_SEGMENT_PATTERN = /(upload|static|images?|imgs?|file|avatar|logo|pic|photo)/i;
  const PLACEHOLDER_HOST_PATTERN = /^https?:\/\/(?:localhost|127\.0\.0\.1|YOUR_LOCAL_IP|your-domain\.com)/i;

  const isFullUrl = (value) => {
    if (!value) {
      return false;
    }
    const str = sanitizePathValue(value);
    return /^https?:\/\//i.test(str) || /^data:/i.test(str);
  };

  const buildFullImageUrl = (value) => {
    if (!value) return '';
    const normalized = sanitizePathValue(value);
    if (!normalized) return '';
    const absolute = pickAbsoluteUrl(normalized);
    if (absolute) {
      const result = fixHost(absolute);
      reportUrlNormalization('buildFullImageUrl(): 使用内嵌绝对地址', {
        input: value,
        normalized,
        absolute,
        result,
      });
      debugLog('buildFullImageUrl absolute', { input: value, normalized, absolute, result });
      return result;
    }
    if (isFullUrl(normalized)) {
      const result = fixHost(normalized);
      reportUrlNormalization('buildFullImageUrl(): 输入本身是完整 URL', {
        input: value,
        normalized,
        result,
      });
      debugLog('buildFullImageUrl full', { input: value, normalized, result });
      return result;
    }
    const result = join(getBase(), normalized);
    reportUrlNormalization('buildFullImageUrl(): 基于 base 拼接相对路径', {
      input: value,
      normalized,
      base: getBase(),
      result,
    });
    debugLog('buildFullImageUrl relative', { input: value, normalized, result });
    return result;
  };

  const shouldConvertString = (key, value) => {
    if (!value || typeof value !== 'string') return false;
    const trimmed = sanitizePathValue(value);
    if (!trimmed) return false;
    const absolute = pickAbsoluteUrl(trimmed);
    if (absolute) {
      return PLACEHOLDER_HOST_PATTERN.test(absolute);
    }
    const head = trimmed.split(/[?#]/)[0];
    if (IMAGE_EXT_PATTERN.test(head)) return true;
    if (trimmed.indexOf('upload/') !== -1) return true;
    if (UPLOAD_SEGMENT_PATTERN.test(head.split(/[\/]/)[0])) return true;
    return IMAGE_KEY_PATTERN.test(key || '');
  };

  const normalizeImageString = (str) => {
    if (!str) return str;
    const parts = str
      .split(',')
      .map((part) => sanitizePathValue(part))
      .filter(Boolean);
    debugLog('normalizeImageString', { original: str, parts });
    if (!parts.length) {
      return buildFullImageUrl(str);
    }
    if (parts.length === 1) {
      return buildFullImageUrl(parts[0]);
    }
    return parts.map((part) => buildFullImageUrl(part)).join(',');
  };

  const transformMediaValue = (value, key) => {
    if (Array.isArray(value)) {
      return value.map((item) => transformMediaValue(item, key));
    }
    if (value && typeof value === 'object') {
      traverseResponseMedia(value);
      return value;
    }
    if (typeof value === 'string' && shouldConvertString(key, value)) {
      return normalizeImageString(value);
    }
    return value;
  };

  const traverseResponseMedia = (target) => {
    if (!target || typeof target !== 'object') {
      return;
    }
    if (Array.isArray(target)) {
      for (let i = 0; i < target.length; i += 1) {
        target[i] = transformMediaValue(target[i], '');
      }
      return;
    }
    Object.keys(target).forEach((key) => {
      target[key] = transformMediaValue(target[key], key);
    });
  };
  /**
   * 包装请求函数
   */
  const wrapRequest = (fn) => (opts = {}) => {
    const o = { ...opts };
    // 优先使用调用方的 baseUrl，其次读取 App 基础地址
    const base = fixHost(o.baseUrl || getBase());
    // 统一拼接 + 二次兜底替换
    const joined = join(base, o.url || '');
    o.url = fixHost(joined);
    debugLog('wrapRequest', {
      originalUrl: o.url,
      requestUrl: opts.url,
      base,
      joined,
      final: o.url,
    });

    // 调试日志
    if (o.url.includes('YOUR_LOCAL_IP')) {
      console.error('[mini_fix] ⚠️ 检测到未配置的 IP 地址，请修改 config.env.js');
    }

    if (typeof o.success === 'function') {
      const userSuccess = o.success;
      o.success = function patchedSuccess(res) {
        try {
          if (res && res.data) {
            traverseResponseMedia(res.data);
          }
        } catch (err) {
          console.warn('[mini_fix] 响应图片字段处理失败:', err);
        }
        return userSuccess(res);
      };
    }

    return fn(o);
  };

  // 1) wx.request：包裹并“锁死”属性，防止被其他脚本覆盖
  if (typeof wx !== 'undefined' && typeof wx.request === 'function') {
    const rawReq = wx.request.bind(wx);
    const patchedReq = wrapRequest(rawReq);
    Object.defineProperty(wx, 'request', {
      value: patchedReq,
      writable: false,        // 锁住，禁止后续覆盖
      configurable: false,
      enumerable: true,
    });

    // 常见文件相关接口也做同样处理
    ['uploadFile', 'downloadFile'].forEach((name) => {
      if (typeof wx[name] === 'function') {
        wx[name] = wrapRequest(wx[name].bind(wx));
      }
    });

    // 打标记：已补丁
    Object.defineProperty(wx, '__miniPatched__', {
      value: true, writable: false, enumerable: false,
    });

    console.log('[mini_fix] wx.request 已拦截并锁定');
    console.log('[mini_fix] 当前 API 地址:', getBaseURL());
  }

  // 2) uni.request（如果存在）也拦截
  if (typeof uni !== 'undefined' && typeof uni.request === 'function') {
    const rawUni = uni.request.bind(uni);
    uni.request = (opts = {}) => {
      const base = fixHost(opts.baseUrl || getBase());
      opts.url = fixHost(join(base, opts.url || ''));
      if (typeof opts.success === 'function') {
        const userSuccess = opts.success;
        opts.success = function patchedUniSuccess(res) {
          try {
            if (res && res.data) {
              traverseResponseMedia(res.data);
            }
          } catch (err) {
            console.warn('[mini_fix] uni.request 响应图片字段处理失败:', err);
          }
          return userSuccess(res);
        };
      }
      return rawUni(opts);
    };
    console.log('[mini_fix] uni.request 已拦截');
  }

  // 3) axios（如果存在）设置 baseURL 与请求拦截器
  const attachAxiosInterceptor = (instance) => {
    if (!instance || instance.__mpEnvPatched) {
      return;
    }
    try {
      instance.defaults.baseURL = getBase();
      instance.interceptors.request.use((cfg) => {
        const base = fixHost(cfg.baseURL || getBase());
        cfg.url = join(base, cfg.url || '');
        return cfg;
      });
      if (instance.interceptors && typeof instance.interceptors.response === 'object' && typeof instance.interceptors.response.use === 'function') {
        instance.interceptors.response.use((response) => {
          try {
            if (response && response.data) {
              traverseResponseMedia(response.data);
            }
          } catch (err) {
            console.warn('[mini_fix] axios 响应图片字段处理失败:', err);
          }
          return response;
        }, (error) => Promise.reject(error));
      }
      instance.__mpEnvPatched = true;
      console.log('[mini_fix] axios 已设置 baseURL 与拦截器');
    } catch (err) {
      console.warn('[mini_fix] axios 拦截器安装失败:', err);
    }
  };

  if (typeof axios !== 'undefined') {
    attachAxiosInterceptor(axios);
  } else {
    try {
      if (!globalRoot.__MP_AXIOS_SETTER__) {
        Object.defineProperty(globalRoot, '__MP_AXIOS_SETTER__', {
          value: true,
          writable: false,
          configurable: true,
          enumerable: false
        });
        Object.defineProperty(globalRoot, 'axios', {
          configurable: true,
          enumerable: true,
          get() {
            return undefined;
          },
          set(value) {
            delete globalRoot.axios;
            globalRoot.axios = value;
            attachAxiosInterceptor(value);
          }
        });
      }
    } catch (err) {
      // 兜底：如果无法劫持属性，则使用轮询方式等待 axios 出现
      let attempts = 20;
      const waitForAxios = () => {
        if (typeof globalRoot.axios !== 'undefined' && globalRoot.axios) {
          attachAxiosInterceptor(globalRoot.axios);
          return;
        }
        if (attempts <= 0) {
          return;
        }
        attempts -= 1;
        setTimeout(waitForAxios, 200);
      };
      waitForAxios();
    }
  }

  // 导出设置生产环境的方法，供 app.js 调用
  if (typeof module !== 'undefined' && module.exports) {
    module.exports.setProduction = function(isProduction) {
      IS_PRODUCTION = isProduction;
      console.log('[mini_fix] 环境模式已更新:', isProduction ? '生产环境' : '开发/调试环境');
    };

    // 导出图片 URL 处理函数
    module.exports.getImageUrl = function(path) {
      if (!path) return '';
      if (/^https?:\/\//i.test(path)) return fixHost(path);
      return join(getBase(), path);
    };

    module.exports.getImageUrls = function(paths) {
      if (!paths) return [];
      const pathArray = typeof paths === 'string'
        ? paths.split(',').map(p => p.trim()).filter(p => p)
        : paths;
      return pathArray.map(path => module.exports.getImageUrl(path));
    };
  }
}
