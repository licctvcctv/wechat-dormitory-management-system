/**
 * API 基础配置
 *
 * 注意：此文件用于 uni-app 编译
 * 在微信小程序中，实际的 URL 会被 mini_fix.js 拦截并替换
 *
 * 环境说明：
 * - 开发环境：使用 localhost
 * - 真机调试：mini_fix.js 会自动替换为配置的局域网 IP
 * - 生产环境：mini_fix.js 会自动替换为生产服务器地址
 */

// 获取基础 URL
function getBaseUrl() {
  // 在微信小程序环境中
  if (typeof wx !== 'undefined') {
    try {
      // 尝试从 App 实例获取配置
      const app = getApp();
      if (app && app.$base && app.$base.url) {
        return app.$base.url;
      }
    } catch (e) {
      console.log('获取 App 配置失败，使用默认配置');
    }
  }

  // 默认使用 localhost（会被 mini_fix.js 拦截处理）
  return "http://localhost:8080/nodejsn73cv/";
}

const base = {
  url: getBaseUrl()
}

export default base
