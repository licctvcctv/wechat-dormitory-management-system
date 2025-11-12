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
  },

  /**
   * 获取完整的图片 URL
   * @param {string} path - 图片路径（相对路径或完整URL）
   * @returns {string} 完整的图片 URL
   */
  getImageUrl: function(path) {
    if (!path) return '';

    // 如果已经是完整 URL，直接返回
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    // 使用 mini_fix 的方法（如果可用）
    if (miniFix && miniFix.getImageUrl) {
      return miniFix.getImageUrl(path);
    }

    // 备用方法：手动拼接
    const baseURL = this.getApiBaseUrl();
    const cleanPath = path.replace(/^\/+/, '');
    return baseURL.endsWith('/')
      ? baseURL + cleanPath
      : baseURL + '/' + cleanPath;
  },

  /**
   * 批量获取图片 URL
   * @param {Array|String} paths - 图片路径数组或逗号分隔的字符串
   * @returns {Array} 完整的图片 URL 数组
   */
  getImageUrls: function(paths) {
    if (!paths) return [];

    // 使用 mini_fix 的方法（如果可用）
    if (miniFix && miniFix.getImageUrls) {
      return miniFix.getImageUrls(paths);
    }

    // 备用方法
    const pathArray = typeof paths === 'string'
      ? paths.split(',').map(p => p.trim()).filter(p => p)
      : paths;

    return pathArray.map(path => this.getImageUrl(path));
  },

  /**
   * 处理富文本中的图片
   * @param {string} html - 富文本 HTML
   * @returns {string} 处理后的 HTML
   */
  fixRichTextImages: function(html) {
    if (!html) return '';

    let result = html;
    const self = this;

    // 替换相对路径为完整 URL
    result = result.replace(
      /<img([^>]*?)src=["'](?!https?:\/\/)([^"']+)["']/gi,
      function(match, attrs, src) {
        const fullUrl = self.getImageUrl(src);
        return '<img' + attrs + 'src="' + fullUrl + '"';
      }
    );

    // 添加图片样式
    result = result.replace(/img src/gi, 'img style="width:100%;max-width:100%;" src');

    return result;
  }
});
