/**
 * ========================================
 * 图片处理 Mixin
 * ========================================
 * 
 * 自动处理页面中的图片 URL，解决真机调试图片无法显示的问题
 * 
 * 使用方法：
 * import imageMixin from '@/mixins/image-mixin.js'
 * 
 * export default {
 *   mixins: [imageMixin],
 *   // ...
 * }
 * ========================================
 */

const miniFix = require('../mini_fix.js');

export default {
  data() {
    return {
      // 图片 URL 处理函数
      $getImageUrl: null,
      $getImageUrls: null,
    };
  },
  
  onLoad() {
    // 初始化图片处理函数
    this.$getImageUrl = miniFix.getImageUrl || this._getImageUrl;
    this.$getImageUrls = miniFix.getImageUrls || this._getImageUrls;
  },
  
  methods: {
    /**
     * 获取完整的图片 URL（备用方法）
     */
    _getImageUrl(path) {
      if (!path) return '';
      if (/^https?:\/\//i.test(path)) return path;
      
      const app = getApp();
      const baseURL = app && app.$base && app.$base.url ? app.$base.url : '';
      const cleanPath = path.replace(/^\/+/, '');
      
      return baseURL.endsWith('/') 
        ? baseURL + cleanPath 
        : baseURL + '/' + cleanPath;
    },
    
    /**
     * 批量获取图片 URL（备用方法）
     */
    _getImageUrls(paths) {
      if (!paths) return [];
      const pathArray = typeof paths === 'string' 
        ? paths.split(',').map(p => p.trim()).filter(p => p)
        : paths;
      return pathArray.map(path => this._getImageUrl(path));
    },
    
    /**
     * 处理富文本中的图片
     */
    fixRichTextImages(html) {
      if (!html) return '';
      
      let result = html;
      
      // 替换相对路径为完整 URL
      result = result.replace(
        /<img([^>]*?)src=["'](?!https?:\/\/)([^"']+)["']/gi,
        (match, attrs, src) => {
          const fullUrl = this.$getImageUrl ? this.$getImageUrl(src) : this._getImageUrl(src);
          return `<img${attrs}src="${fullUrl}"`;
        }
      );
      
      // 添加图片样式
      result = result.replace(/img src/gi, 'img style="width:100%;max-width:100%;" src');
      
      return result;
    },
    
    /**
     * 处理轮播图列表
     */
    processSwiperList(imageString) {
      if (!imageString) return [];
      
      const images = imageString.split(',').map(img => img.trim()).filter(img => img);
      
      // 返回完整 URL 数组
      return images.map(img => {
        return this.$getImageUrl ? this.$getImageUrl(img) : this._getImageUrl(img);
      });
    }
  }
};

