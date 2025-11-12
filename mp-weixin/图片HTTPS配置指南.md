# 📷 微信小程序图片 HTTPS 配置指南

## 🔍 问题说明

微信小程序在**真机调试**和**正式发布**时，要求所有网络资源（包括图片）必须使用 **HTTPS 协议**。

### 为什么会出现这个问题？

1. **开发环境**：使用 `http://localhost:8080`，在开发者工具中可以正常访问
2. **真机调试**：使用 `http://192.168.x.x:8080`，微信会拦截 HTTP 请求
3. **图片加载失败**：控制台提示 "不在以下 request 合法域名列表中"

---

## ✅ 解决方案

### 方案 1：开发阶段 - 关闭域名校验 ⭐ 推荐

这是**最简单**的开发阶段解决方案，无需配置 HTTPS。

#### 步骤：

1. **打开微信开发者工具**
2. 点击右上角 **"详情"**
3. 选择 **"本地设置"** 标签
4. 勾选以下选项：
   - ✅ **不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书**
   - ✅ **不校验安全域名、TLS 版本以及 HTTPS 证书**

#### 效果：

- ✅ 开发者工具中可以使用 HTTP
- ✅ 真机调试时可以使用 HTTP
- ⚠️ **仅在开发阶段有效**，正式发布时必须使用 HTTPS

#### 注意事项：

```
⚠️ 此方法仅适用于开发和测试阶段！
正式发布时，微信会强制要求 HTTPS，无法绕过。
```

---

### 方案 2：配置 HTTPS 服务器（生产环境必须）

正式发布时，必须配置 HTTPS 服务器。

#### 选项 A：使用云服务器（推荐）

1. **购买云服务器**（阿里云、腾讯云、华为云等）
2. **申请 SSL 证书**（免费证书：Let's Encrypt、阿里云免费证书）
3. **配置 Nginx/Apache**

**Nginx HTTPS 配置示例**：

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    # SSL 证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # 反向代理到 Node.js 后端
    location /nodejsn73cv/ {
        proxy_pass http://localhost:8080/nodejsn73cv/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

4. **修改小程序配置**

编辑 `mp-weixin/config.env.js`：

```javascript
production: {
  baseURL: 'https://your-domain.com/nodejsn73cv/',
  apiRoot: 'nodejsn73cv/',
  description: '生产环境 - 正式服务器（必须 HTTPS）'
}
```

5. **在微信公众平台配置服务器域名**

登录 [微信公众平台](https://mp.weixin.qq.com/)：
- 开发 -> 开发管理 -> 开发设置 -> 服务器域名
- 添加 `https://your-domain.com`

#### 选项 B：本地开发使用自签名证书

⚠️ **仅用于本地测试**，真机可能不信任自签名证书。

1. **生成自签名证书**

```bash
# 安装 mkcert（macOS）
brew install mkcert
mkcert -install

# 生成证书
mkcert localhost 192.168.1.100
```

2. **配置 Node.js 使用 HTTPS**

修改 `nodejsn73cv/src/index.js`：

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
};

https.createServer(options, app).listen(8443, () => {
  console.log('HTTPS Server running on port 8443');
});
```

3. **修改测试环境配置**

```javascript
testing: {
  baseURL: 'https://192.168.1.100:8443/nodejsn73cv/',
  apiRoot: 'nodejsn73cv/',
  description: '测试环境 - HTTPS'
}
```

---

### 方案 3：使用内网穿透工具（临时方案）

适合没有服务器的情况，可以快速获得 HTTPS 域名。

#### 推荐工具：

1. **花生壳** - https://hsk.oray.com/
2. **ngrok** - https://ngrok.com/
3. **frp** - https://github.com/fatedier/frp

#### 使用 ngrok 示例：

```bash
# 1. 下载并安装 ngrok
# 2. 启动内网穿透
ngrok http 8080

# 3. 获得 HTTPS 地址
# 示例：https://abc123.ngrok.io
```

#### 配置小程序：

```javascript
testing: {
  baseURL: 'https://abc123.ngrok.io/nodejsn73cv/',
  apiRoot: 'nodejsn73cv/',
  description: '测试环境 - ngrok'
}
```

#### 优缺点：

✅ 优点：
- 快速获得 HTTPS 域名
- 无需购买服务器
- 自动配置 SSL 证书

❌ 缺点：
- 免费版域名会变化
- 网络速度可能较慢
- 不适合生产环境

---

## 🎯 推荐配置方案

### 开发阶段（本地开发 + 真机调试）

```
1. 使用方案 1：关闭域名校验
2. 配置文件使用 HTTP 地址
3. 快速开发，无需配置 HTTPS
```

### 测试阶段（团队协作）

```
1. 使用方案 3：内网穿透（临时）
2. 或使用方案 2B：自签名证书（需要设备信任）
```

### 生产环境（正式发布）

```
1. 必须使用方案 2A：云服务器 + SSL 证书
2. 在微信公众平台配置服务器域名
3. 修改 config.env.js 中的 production 配置
```

---

## 📝 快速操作步骤

### 立即解决真机调试图片问题：

**步骤 1**：打开微信开发者工具

**步骤 2**：详情 -> 本地设置 -> 勾选"不校验合法域名"

**步骤 3**：重新编译小程序

**步骤 4**：真机调试，图片可以正常显示 ✅

---

## ⚠️ 常见问题

### Q1: 勾选了"不校验合法域名"，真机还是无法加载图片？

**A**: 检查以下几点：
1. 确保手机和电脑在同一局域网
2. 检查 `config.env.js` 中的 IP 地址是否正确
3. 检查后端服务是否正常运行
4. 查看控制台是否有其他错误

### Q2: 正式发布时如何配置？

**A**: 
1. 购买云服务器和域名
2. 申请 SSL 证书（免费或付费）
3. 配置 Nginx/Apache HTTPS
4. 修改 `config.env.js` 的 production 配置
5. 在微信公众平台添加服务器域名

### Q3: 可以使用 IP 地址 + HTTPS 吗？

**A**: 
- 开发阶段：可以（需要自签名证书）
- 生产环境：不可以，微信要求必须使用域名

---

## 📚 相关文档

- [微信小程序网络请求文档](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)
- [微信小程序服务器域名配置](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html#%E6%9C%8D%E5%8A%A1%E5%99%A8%E5%9F%9F%E5%90%8D%E9%85%8D%E7%BD%AE)
- [Let's Encrypt 免费证书](https://letsencrypt.org/)

---

**创建时间**：2025-11-11  
**适用版本**：微信小程序所有版本

