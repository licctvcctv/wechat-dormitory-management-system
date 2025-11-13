/**
 * ========================================
 * 环境调试工具
 * ========================================
 * 
 * 用于诊断环境识别问题
 * 
 * 使用方法：
 * 在小程序控制台输入：
 * require('./utils/debug-env.js').checkEnv()
 * ========================================
 */

const envConfig = require('../config.env.js');

/**
 * 检查当前环境配置
 */
function checkEnv() {
  console.log('========================================');
  console.log('🔍 环境诊断工具');
  console.log('========================================');
  
  // 1. 获取系统信息
  let systemInfo = {};
  try {
    systemInfo = wx.getSystemInfoSync();
    console.log('📱 系统信息:');
    console.log('  - platform:', systemInfo.platform);
    console.log('  - environment:', systemInfo.environment);
    console.log('  - version:', systemInfo.version);
    console.log('  - SDKVersion:', systemInfo.SDKVersion);
  } catch (err) {
    console.error('❌ 无法获取系统信息:', err);
  }
  
  // 2. 获取账号信息
  let accountInfo = {};
  try {
    accountInfo = wx.getAccountInfoSync();
    console.log('📦 账号信息:');
    console.log('  - envVersion:', accountInfo.miniProgram?.envVersion);
    console.log('  - appId:', accountInfo.miniProgram?.appId);
  } catch (err) {
    console.error('❌ 无法获取账号信息:', err);
  }
  
  // 3. 获取环境配置
  const IS_PRODUCTION = false; // 从 app.js 读取
  const config = envConfig.getEnvConfig(IS_PRODUCTION);
  const snapshot = envConfig.getRuntimeSnapshot(IS_PRODUCTION);
  
  console.log('⚙️ 环境配置:');
  console.log('  - 当前环境:', snapshot.env);
  console.log('  - 手动指定:', snapshot.manualEnv || '无');
  console.log('  - baseURL:', config.baseURL);
  console.log('  - 环境描述:', config.description);
  
  // 4. 检查缓存覆盖
  console.log('💾 缓存覆盖:');
  console.log('  - testing baseURL:', snapshot.overrides.testingBaseURL || '无');
  console.log('  - production baseURL:', snapshot.overrides.productionBaseURL || '无');
  
  // 5. 检查 App 实例
  try {
    const app = getApp();
    console.log('🏠 App 实例:');
    console.log('  - $base.url:', app.$base?.url);
    console.log('  - $base.env:', app.$base?.env);
    console.log('  - $base.isProduction:', app.$base?.isProduction);
  } catch (err) {
    console.error('❌ 无法获取 App 实例:', err);
  }
  
  // 6. 环境判断逻辑
  console.log('🔍 环境判断逻辑:');
  const platform = (systemInfo.platform || '').toLowerCase();
  const envVersion = (accountInfo.miniProgram?.envVersion || '').toLowerCase();
  
  console.log('  - platform:', platform);
  console.log('  - envVersion:', envVersion);
  
  if (envVersion === 'release') {
    console.log('  ✅ 应该是 production（正式版）');
  } else if (envVersion === 'trial') {
    console.log('  ✅ 应该是 testing（体验版）');
  } else if (envVersion === 'develop') {
    if (platform && platform !== 'devtools') {
      console.log('  ✅ 应该是 testing（真机调试）');
    } else {
      console.log('  ✅ 应该是 development（开发者工具）');
    }
  } else {
    if (platform && platform !== 'devtools') {
      console.log('  ✅ 应该是 testing（真机环境）');
    } else {
      console.log('  ✅ 应该是 development（开发者工具）');
    }
  }
  
  // 7. 问题诊断
  console.log('========================================');
  console.log('🩺 问题诊断:');
  
  if (platform !== 'devtools' && config.baseURL.includes('localhost')) {
    console.error('❌ 问题：真机环境使用了 localhost 地址！');
    console.error('   当前环境被识别为:', snapshot.env);
    console.error('   应该识别为: testing');
    console.error('   解决方案:');
    console.error('   1. 检查 config.env.js 中的 testing.baseURL');
    console.error('   2. 清除缓存: wx.clearStorageSync()');
    console.error('   3. 手动设置环境: envConfig.setManualEnvironment("testing")');
  } else if (platform === 'devtools' && !config.baseURL.includes('localhost')) {
    console.warn('⚠️  开发者工具使用了非 localhost 地址');
    console.warn('   这可能导致开发不便');
  } else {
    console.log('✅ 环境配置正常');
  }
  
  console.log('========================================');
  
  return {
    systemInfo,
    accountInfo,
    config,
    snapshot
  };
}

/**
 * 清除所有环境缓存
 */
function clearEnvCache() {
  console.log('🧹 清除环境缓存...');
  
  try {
    wx.removeStorageSync('__MP_FORCE_ENV__');
    wx.removeStorageSync('__MP_TESTING_BASE_URL__');
    wx.removeStorageSync('__MP_PROD_BASE_URL__');
    console.log('✅ 缓存已清除');
    console.log('💡 请重新启动小程序');
  } catch (err) {
    console.error('❌ 清除缓存失败:', err);
  }
}

/**
 * 强制设置为真机调试环境
 */
function forceTestingEnv(ip) {
  console.log('🔧 强制设置为真机调试环境...');
  
  try {
    envConfig.setManualEnvironment('testing');
    
    if (ip) {
      const baseURL = `http://${ip}:8080/nodejsn73cv/`;
      envConfig.setEnvironmentBaseURL('testing', baseURL);
      console.log('✅ 已设置 testing baseURL:', baseURL);
    }
    
    console.log('✅ 环境已设置为 testing');
    console.log('💡 请重新启动小程序');
  } catch (err) {
    console.error('❌ 设置失败:', err);
  }
}

module.exports = {
  checkEnv,
  clearEnvCache,
  forceTestingEnv
};

