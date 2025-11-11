/**
 * ========================================
 * 微信小程序入口文件
 * ========================================
 */

// ========================================
// 环境配置
// ========================================
// ⚠️ 发布生产版本时，请将此值改为 true
const IS_PRODUCTION = false;

// ========================================
// 引入核心模块（顺序很重要！）
// ========================================

// 1. 引入环境配置
const envConfig = require('./config.env.js');

// 2. 引入网络请求拦截器（必须第一个加载）
const miniFix = require('./mini_fix.js');
console.log('【核心模块】网络请求拦截器已加载');

// 3. 设置生产环境标志
if (miniFix && miniFix.setProduction) {
  miniFix.setProduction(IS_PRODUCTION);
}

// 4. 引入 uni-app 编译后的文件
require('./common/runtime.js')
require('./common/vendor.js')
require('./common/main.js')

// 5. 为了兼容 uni-app 代码，创建全局 uni 对象映射到 wx
if (!global.uni) {
  global.uni = wx;
  console.log('创建全局 uni 对象映射到 wx');
}

// ========================================
// App 实例配置
// ========================================
App({
  onLaunch: function() {
    console.log('========================================');
    console.log('App 启动');
    console.log('========================================');

    // 创建全局 $base 对象
    this.$base = this.$base || {};

    // 从环境配置获取 API 地址
    const config = envConfig.getEnvConfig(IS_PRODUCTION);
    this.$base.url = config.baseURL;
    this.$base.env = config.env;
    this.$base.isProduction = IS_PRODUCTION;

    console.log('环境配置已加载:');
    console.log('- 当前环境:', config.env);
    console.log('- 环境描述:', config.description);
    console.log('- API 地址:', this.$base.url);
    console.log('========================================');

    // 验证配置
    if (this.$base.url.includes('YOUR_LOCAL_IP')) {
      console.error('========================================');
      console.error('⚠️ 配置错误提醒');
      console.error('========================================');
      console.error('检测到您正在使用真机调试，但尚未配置本机 IP 地址');
      console.error('请按以下步骤操作：');
      console.error('1. 打开文件：config.env.js');
      console.error('2. 找到 debug.baseURL 配置项');
      console.error('3. 将 YOUR_LOCAL_IP 替换为您电脑的局域网 IP');
      console.error('4. 保存文件并重新编译');
      console.error('========================================');
    }
  },

  /**
   * 获取 API 基础地址
   * @returns {string} API 基础地址
   */
  getApiBaseUrl: function() {
    this.$base = this.$base || {};
    if (!this.$base.url) {
      const config = envConfig.getEnvConfig(IS_PRODUCTION);
      this.$base.url = config.baseURL;
      this.$base.env = config.env;
      this.$base.isProduction = IS_PRODUCTION;
    }
    return this.$base.url;
  }
});
