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
const envConfig = require('./config.env.js');

// 防重复：若已打过补丁，直接退出
if (typeof wx !== 'undefined' && wx.__miniPatched__) {
  console.log('[mini_fix] 已启用，跳过重复加载');
} else {
  // 获取当前环境的基础 URL（从 app.js 传入的 isProduction 参数）
  let IS_PRODUCTION = false; // 默认非生产环境，app.js 会更新此值

  const getBaseURL = () => {
    return envConfig.getBaseURL(IS_PRODUCTION);
  };

  const getApiRoot = () => {
    return envConfig.getApiRoot(IS_PRODUCTION);
  };

  /**
   * 修复 URL 中的 localhost 为实际环境地址
   */
  const fixHost = (u) => {
    if (!u) return '';
    const baseURL = getBaseURL();
    // 将 localhost 或 127.0.0.1 替换为当前环境的基础地址
    return u.replace(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\//i, baseURL.replace(/nodejsn73cv\/$/, ''));
  };

  /**
   * 拼接 base 和 path
   */
  const join = (base, path) => {
    if (!path) return base || '';
    if (/^https?:\/\//i.test(path)) return fixHost(path);
    const b = (base || '').endsWith('/') ? base : (base || '') + '/';
    return b + String(path).replace(/^\//, '');
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

  /**
   * 包装请求函数
   */
  const wrapRequest = (fn) => (opts = {}) => {
    const o = { ...opts };
    // 优先使用调用方的 baseUrl，其次读取 App 基础地址
    const base = fixHost(o.baseUrl || getBase());
    // 统一拼接 + 二次兜底替换
    o.url = fixHost(join(base, o.url || ''));

    // 调试日志
    if (o.url.includes('YOUR_LOCAL_IP')) {
      console.error('[mini_fix] ⚠️ 检测到未配置的 IP 地址，请修改 config.env.js');
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
      return rawUni(opts);
    };
    console.log('[mini_fix] uni.request 已拦截');
  }

  // 3) axios（如果存在）设置 baseURL 与请求拦截器
  if (typeof axios !== 'undefined') {
    try {
      axios.defaults.baseURL = getBase();
      axios.interceptors.request.use((cfg) => {
        const base = fixHost(cfg.baseURL || getBase());
        cfg.url = join(base, cfg.url || '');
        return cfg;
      });
      console.log('[mini_fix] axios 已设置 baseURL 与拦截器');
    } catch (_) {}
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