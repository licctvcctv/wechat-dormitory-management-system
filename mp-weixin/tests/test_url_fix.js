const envTools = require('../config.env.js');

// ===== URL修复器测试文件 =====
console.log('===== URL修复器测试开始 =====');

const snapshot = envTools.getRuntimeSnapshot(false);
const isDevelopment = snapshot.env === 'development';
const baseUrl = envTools.getBaseURL(false);
console.log('当前环境:', snapshot.env + (snapshot.manualEnv ? ' (手动覆盖)' : ''));
console.log('使用的 API 基础地址:', baseUrl);

function normalizeUrl(url) {
  if (!url) {
    return baseUrl;
  }
  if (/^https?:\/\//i.test(url)) {
    if (!isDevelopment && url.indexOf('localhost') !== -1) {
      return url.replace(/https?:\/\/localhost(?::\d+)?\//i, baseUrl);
    }
    return url;
  }
  return baseUrl.replace(/\/$/, '/') + String(url).replace(/^\//, '');
}

console.log('\n[测试1] 测试wx.request覆盖情况');
try {
  const mockOptions = {
    url: 'http://localhost:8080/nodejsn73cv/xuesheng/login',
    data: { username: '2', password: '1' },
    method: 'GET',
    success(res) {
      console.log('测试请求成功:', res);
    },
    fail(err) {
      console.log('测试请求失败:', err);
      console.log('最终使用的URL:', mockOptions.url);
    }
  };

  console.log('原始URL:', mockOptions.url);
  wx.request(mockOptions);
} catch (e) {
  console.error('测试过程中出错:', e);
}

console.log('\n[测试2] 手动执行URL替换逻辑');
const testUrl = 'http://localhost:8080/nodejsn73cv/xuesheng/login';
const fixedUrl = normalizeUrl(testUrl);
console.log('原始URL:', testUrl);
console.log('修复后URL:', fixedUrl);

console.log('\n===== URL修复器测试完成 =====');
