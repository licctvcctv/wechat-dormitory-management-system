/**
 * ========================================
 * 图片加载辅助工具
 * ========================================
 * 
 * 解决真机调试时 HTTP 图片无法加载的问题
 * 
 * 使用方法：
 * import { getImageUrl, loadImages } from '@/utils/image-helper.js'
 * 
 * // 单张图片
 * const imageUrl = getImageUrl('upload/test.jpg')
 * 
 * // 多张图片
 * const images = await loadImages(['upload/1.jpg', 'upload/2.jpg'])
 * ========================================
 */

/**
 * 获取完整的图片 URL
 * @param {String} path - 图片路径（相对路径或完整URL）
 * @returns {String} 完整的图片 URL
 */
export function getImageUrl(path) {
  if (!path) return '';
  
  // 如果已经是完整 URL，直接返回
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  
  // 获取 baseURL
  const app = getApp();
  const baseURL = app && app.$base && app.$base.url ? app.$base.url : '';
  
  if (!baseURL) {
    console.error('[image-helper] 无法获取 baseURL');
    return path;
  }
  
  // 移除路径开头的斜杠
  const cleanPath = path.replace(/^\/+/, '');
  
  // 拼接完整 URL
  const fullUrl = baseURL.endsWith('/') 
    ? baseURL + cleanPath 
    : baseURL + '/' + cleanPath;
  
  return fullUrl;
}

/**
 * 批量获取图片 URL
 * @param {Array|String} paths - 图片路径数组或逗号分隔的字符串
 * @returns {Array} 完整的图片 URL 数组
 */
export function getImageUrls(paths) {
  if (!paths) return [];
  
  // 如果是字符串，按逗号分割
  const pathArray = typeof paths === 'string' 
    ? paths.split(',').map(p => p.trim()).filter(p => p)
    : paths;
  
  // 转换为完整 URL
  return pathArray.map(path => getImageUrl(path));
}

/**
 * 下载图片到本地临时路径（用于 HTTP 图片）
 * @param {String} url - 图片 URL
 * @returns {Promise<String>} 本地临时路径
 */
export function downloadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      return reject(new Error('图片 URL 不能为空'));
    }
    
    // 如果是 HTTPS，直接返回原 URL
    if (url.startsWith('https://')) {
      return resolve(url);
    }
    
    // HTTP 图片，通过 downloadFile 下载
    wx.downloadFile({
      url: url,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath);
        } else {
          console.error('[image-helper] 下载失败:', url, res.statusCode);
          reject(new Error(`下载失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        console.error('[image-helper] 下载失败:', url, err);
        reject(err);
      }
    });
  });
}

/**
 * 批量下载图片
 * @param {Array|String} paths - 图片路径数组或逗号分隔的字符串
 * @returns {Promise<Array>} 本地临时路径数组
 */
export function loadImages(paths) {
  const urls = getImageUrls(paths);
  return Promise.all(urls.map(url => downloadImage(url)));
}

/**
 * 处理富文本中的图片路径
 * @param {String} html - 富文本 HTML
 * @returns {String} 处理后的 HTML
 */
export function fixRichTextImages(html) {
  if (!html) return '';
  
  const app = getApp();
  const baseURL = app && app.$base && app.$base.url ? app.$base.url : '';
  
  if (!baseURL) {
    console.error('[image-helper] 无法获取 baseURL');
    return html;
  }
  
  // 替换相对路径为完整 URL
  let result = html;
  
  // 匹配 <img src="upload/xxx.jpg">
  result = result.replace(
    /<img([^>]*?)src=["'](?!https?:\/\/)([^"']+)["']/gi,
    (match, attrs, src) => {
      const fullUrl = getImageUrl(src);
      return `<img${attrs}src="${fullUrl}"`;
    }
  );
  
  // 添加图片样式（宽度100%）
  result = result.replace(/img src/gi, 'img style="width:100%;max-width:100%;" src');
  
  return result;
}

/**
 * 检查是否需要使用图片下载（HTTP 环境）
 * @returns {Boolean}
 */
export function needImageDownload() {
  const app = getApp();
  const baseURL = app && app.$base && app.$base.url ? app.$base.url : '';
  
  // 如果是 HTTP，返回 true
  return baseURL.startsWith('http://');
}

export default {
  getImageUrl,
  getImageUrls,
  downloadImage,
  loadImages,
  fixRichTextImages,
  needImageDownload
};

