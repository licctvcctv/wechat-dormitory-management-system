# 📸 图片 URL 处理使用指南

## 🎯 问题背景

微信小程序在真机调试时，图片 URL 需要使用完整的地址（包含协议、IP、端口），否则会导致图片无法显示。

**错误示例**：
```html
<!-- ❌ 相对路径，真机无法加载 -->
<image src="upload/test.jpg"></image>
```

**正确示例**：
```html
<!-- ✅ 完整 URL，真机可以加载 -->
<image src="http://172.20.10.3:8080/nodejsn73cv/upload/test.jpg"></image>
```

---

## ✅ 解决方案

我们已经在 `app.js` 和 `mini_fix.js` 中添加了全局图片 URL 处理函数，可以自动将相对路径转换为完整 URL。

---

## 📝 使用方法

### 方法 1：在 WXML 中使用（推荐）

**单张图片**：

```html
<!-- 在 WXML 中 -->
<image src="{{getImageUrl(detail.fengmian)}}"></image>
```

```javascript
// 在 JS 中
Page({
  data: {
    detail: {
      fengmian: 'upload/test.jpg'
    }
  },
  
  // 添加图片处理方法
  getImageUrl(path) {
    return getApp().getImageUrl(path);
  }
})
```

**轮播图列表**：

```html
<!-- 在 WXML 中 -->
<swiper>
  <swiper-item wx:for="{{swiperList}}" wx:key="index">
    <image src="{{item}}"></image>
  </swiper-item>
</swiper>
```

```javascript
// 在 JS 中
Page({
  data: {
    swiperList: []
  },
  
  async init() {
    const res = await this.$api.info('xunwuqishi', this.id);
    this.detail = res.data;
    
    // ✅ 使用全局方法处理图片列表
    const images = this.detail.wupintupian || '';
    this.setData({
      swiperList: getApp().getImageUrls(images)
    });
  }
})
```

---

### 方法 2：处理富文本图片

```javascript
Page({
  data: {
    richTextHtml: ''
  },
  
  async init() {
    const res = await this.$api.info('xunwuqishi', this.id);
    this.detail = res.data;
    
    // ✅ 使用全局方法处理富文本中的图片
    this.setData({
      richTextHtml: getApp().fixRichTextImages(this.detail.xiangxiqingkuang)
    });
  }
})
```

---

### 方法 3：在 computed 中使用（Vue 风格）

如果你的页面使用了 computed 属性：

```javascript
Page({
  data: {
    detail: {}
  },
  
  computed: {
    // ✅ 计算属性自动处理图片 URL
    swiperList() {
      const images = this.detail.wupintupian || '';
      return getApp().getImageUrls(images);
    },
    
    richTextHtml() {
      return getApp().fixRichTextImages(this.detail.xiangxiqingkuang || '');
    }
  }
})
```

---

## 🔧 API 参考

### `getApp().getImageUrl(path)`

**功能**：将相对路径转换为完整 URL

**参数**：
- `path` (String): 图片路径，可以是相对路径或完整 URL

**返回值**：
- (String): 完整的图片 URL

**示例**：
```javascript
getApp().getImageUrl('upload/test.jpg')
// 返回: 'http://172.20.10.3:8080/nodejsn73cv/upload/test.jpg'

getApp().getImageUrl('http://example.com/test.jpg')
// 返回: 'http://example.com/test.jpg' (已经是完整 URL，直接返回)
```

---

### `getApp().getImageUrls(paths)`

**功能**：批量处理图片路径

**参数**：
- `paths` (String | Array): 图片路径，可以是逗号分隔的字符串或数组

**返回值**：
- (Array): 完整的图片 URL 数组

**示例**：
```javascript
// 字符串形式
getApp().getImageUrls('upload/1.jpg,upload/2.jpg,upload/3.jpg')
// 返回: ['http://172.20.10.3:8080/nodejsn73cv/upload/1.jpg', ...]

// 数组形式
getApp().getImageUrls(['upload/1.jpg', 'upload/2.jpg'])
// 返回: ['http://172.20.10.3:8080/nodejsn73cv/upload/1.jpg', ...]
```

---

### `getApp().fixRichTextImages(html)`

**功能**：处理富文本中的图片路径

**参数**：
- `html` (String): 富文本 HTML 字符串

**返回值**：
- (String): 处理后的 HTML 字符串

**示例**：
```javascript
const html = '<p>测试</p><img src="upload/test.jpg">';
getApp().fixRichTextImages(html)
// 返回: '<p>测试</p><img style="width:100%;max-width:100%;" src="http://172.20.10.3:8080/nodejsn73cv/upload/test.jpg">'
```

---

## 📋 完整示例

### 示例页面：detail.js

```javascript
Page({
  data: {
    id: '',
    detail: {},
    swiperList: [],
    richTextHtml: ''
  },
  
  onLoad(options) {
    this.id = options.id;
    this.init();
  },
  
  async init() {
    // 获取详情数据
    const res = await this.$api.info('xunwuqishi', this.id);
    this.detail = res.data;
    
    // ✅ 处理轮播图
    const images = this.detail.wupintupian || '';
    const swiperList = getApp().getImageUrls(images);
    
    // ✅ 处理富文本
    const richTextHtml = getApp().fixRichTextImages(this.detail.xiangxiqingkuang || '');
    
    // 更新数据
    this.setData({
      detail: this.detail,
      swiperList: swiperList,
      richTextHtml: richTextHtml
    });
  }
})
```

### 示例页面：detail.wxml

```html
<!-- 轮播图 -->
<swiper autoplay="{{true}}" interval="5000" circular="{{true}}">
  <swiper-item wx:for="{{swiperList}}" wx:key="index">
    <image src="{{item}}" mode="aspectFill"></image>
  </swiper-item>
</swiper>

<!-- 富文本 -->
<rich-text nodes="{{richTextHtml}}"></rich-text>
```

---

## ⚠️ 注意事项

1. **必须在 onLoad 或 onShow 之后调用**
   - 确保 `getApp()` 已经初始化完成

2. **处理空值**
   - 图片路径可能为空，使用 `||` 提供默认值

3. **性能优化**
   - 如果图片列表很长，考虑使用虚拟列表或懒加载

4. **HTTPS vs HTTP**
   - 开发环境可以使用 HTTP
   - 生产环境必须使用 HTTPS

---

## 🐛 故障排查

### 问题 1：图片仍然无法显示

**检查清单**：
- [ ] 确认后端服务正常运行
- [ ] 确认 `config.env.js` 中的 IP 地址正确
- [ ] 确认图片文件确实存在于服务器
- [ ] 在浏览器中直接访问图片 URL 测试
- [ ] 查看小程序控制台的错误信息

### 问题 2：getApp() 返回 undefined

**原因**：在 App 初始化之前调用了 `getApp()`

**解决方案**：
```javascript
// ❌ 错误：在 data 中直接调用
data: {
  baseUrl: getApp().getApiBaseUrl()  // 此时 App 可能还未初始化
}

// ✅ 正确：在 onLoad 中调用
onLoad() {
  const baseUrl = getApp().getApiBaseUrl();
  this.setData({ baseUrl });
}
```

---

**创建时间**：2025-11-12  
**适用版本**：微信小程序所有版本

