# 🪟 Windows 环境使用指南

## 📋 目录

- [系统要求](#系统要求)
- [快速开始](#快速开始)
- [详细步骤](#详细步骤)
- [常见问题](#常见问题)
- [故障排除](#故障排除)

---

## 💻 系统要求

### 必需软件

1. **Node.js** (v14 或更高版本)
   - 下载地址: https://nodejs.org/
   - 推荐下载 LTS 版本
   - 安装时勾选 "Add to PATH"

2. **微信开发者工具**
   - 下载地址: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

3. **MySQL 数据库** (v5.7 或更高版本)
   - 下载地址: https://dev.mysql.com/downloads/mysql/
   - 或使用 phpStudy、XAMPP 等集成环境

### 可选软件

- **Git** - 用于版本控制
- **VS Code** - 代码编辑器

---

## 🚀 快速开始（3 步搞定）

### 步骤 1：导入数据库

1. 打开 MySQL 数据库管理工具（Navicat、phpMyAdmin 等）
2. 创建新数据库，名称：`nodejsn73cv`
3. 导入 SQL 文件：`nodejsn73cv/db/nodejsn73cv.sql`

### 步骤 2：启动后端服务器（HTTPS）

1. 进入 `nodejsn73cv` 目录
2. **双击运行** `一键启动HTTPS.bat`
3. 等待自动完成：
   - ✅ 安装依赖
   - ✅ 检测本机 IP
   - ✅ 生成 SSL 证书
   - ✅ 启动 HTTPS 服务器

### 步骤 3：打开小程序

1. 打开微信开发者工具
2. 导入项目，选择 `mp-weixin` 目录
3. 点击"详情" -> "本地设置" -> 勾选"不校验合法域名"
4. 真机调试（手机和电脑需在同一 WiFi）

**完成！** 🎉

---

## 📖 详细步骤

### 一、环境准备

#### 1.1 安装 Node.js

1. 访问 https://nodejs.org/
2. 下载 Windows 安装包（推荐 LTS 版本）
3. 运行安装程序
4. **重要**: 勾选 "Add to PATH"
5. 安装完成后，打开命令提示符（CMD）验证：

```cmd
node --version
npm --version
```

如果显示版本号，说明安装成功。

#### 1.2 安装 MySQL

**方法 A：使用 phpStudy（推荐新手）**

1. 下载 phpStudy: https://www.xp.cn/
2. 安装并启动 MySQL 服务
3. 默认账号：root，密码：root

**方法 B：独立安装 MySQL**

1. 下载 MySQL: https://dev.mysql.com/downloads/mysql/
2. 安装时记住设置的 root 密码
3. 启动 MySQL 服务

#### 1.3 配置数据库连接

编辑 `nodejsn73cv/src/config.json`：

```json
{
  "db": {
    "database": "nodejsn73cv",
    "username": "root",
    "password": "你的MySQL密码",
    "host": "localhost",
    "port": 3306,
    "dialect": "mysql"
  }
}
```

---

### 二、后端配置与启动

#### 2.1 使用一键启动脚本（推荐）

**HTTPS 模式（真机调试推荐）**：

1. 进入 `nodejsn73cv` 目录
2. 双击 `一键启动HTTPS.bat`
3. 脚本会自动：
   - 检查 Node.js 环境
   - 安装项目依赖（首次运行）
   - 检测本机局域网 IP
   - 更新小程序配置文件
   - 生成 SSL 证书
   - 启动 HTTPS 服务器（端口 8443）

**HTTP 模式（开发环境）**：

1. 进入 `nodejsn73cv` 目录
2. 双击 `一键启动HTTP.bat`
3. 启动 HTTP 服务器（端口 8080）

#### 2.2 手动启动（高级用户）

```cmd
cd nodejsn73cv

# 首次运行：安装依赖
npm install

# 配置 IP 和生成证书
npm run setup

# 启动 HTTPS 服务器
npm run start:https

# 或启动 HTTP 服务器
npm start
```

---

### 三、小程序配置

#### 3.1 自动配置（推荐）

运行一键启动脚本后，IP 地址会自动配置到 `mp-weixin/config.env.js`。

#### 3.2 手动配置

如果需要手动修改，编辑 `mp-weixin/config.env.js`：

```javascript
testing: {
  baseURL: 'https://你的IP:8443/nodejsn73cv/',
  // 例如: baseURL: 'https://192.168.1.100:8443/nodejsn73cv/',
  apiRoot: 'nodejsn73cv/',
  description: '测试环境 - HTTPS'
}
```

#### 3.3 查看本机 IP

**方法 1：通过启动脚本**
- 运行一键启动脚本时会自动显示

**方法 2：手动查看**
```cmd
ipconfig
```
找到 "无线局域网适配器 WLAN" 或 "以太网适配器" 下的 IPv4 地址

---

### 四、微信开发者工具配置

#### 4.1 导入项目

1. 打开微信开发者工具
2. 点击 "+" 导入项目
3. 选择 `mp-weixin` 目录
4. AppID 选择"测试号"或填写你的 AppID

#### 4.2 关闭域名校验

1. 点击右上角 "详情"
2. 选择 "本地设置" 标签
3. 勾选以下选项：
   - ✅ 不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书
   - ✅ 不校验安全域名、TLS 版本以及 HTTPS 证书

#### 4.3 真机调试

1. 点击工具栏 "真机调试"
2. 使用微信扫码
3. **确保手机和电脑连接同一个 WiFi**
4. 等待编译完成

---

## ❓ 常见问题

### Q1: 双击 bat 文件闪退？

**A**: 右键点击 bat 文件 -> "以管理员身份运行"

或者：
1. 按 Win+R
2. 输入 `cmd` 回车
3. 拖动 bat 文件到命令窗口
4. 按回车运行

### Q2: 提示"npm 不是内部或外部命令"？

**A**: Node.js 未正确安装或未添加到 PATH

解决方法：
1. 重新安装 Node.js
2. 安装时勾选 "Add to PATH"
3. 重启电脑

### Q3: 依赖安装失败？

**A**: 网络问题，切换 npm 镜像源

```cmd
npm config set registry https://registry.npmmirror.com
npm install
```

### Q4: 真机调试时图片无法加载？

**A**: 检查以下几点：
1. 手机和电脑是否在同一 WiFi
2. 是否使用 HTTPS 模式启动
3. 是否勾选"不校验合法域名"
4. 防火墙是否阻止了端口 8443

### Q5: 数据库连接失败？

**A**: 检查 `nodejsn73cv/src/config.json` 中的数据库配置：
- 用户名和密码是否正确
- MySQL 服务是否启动
- 数据库名称是否正确

### Q6: 如何修改端口？

**A**: 编辑 `nodejsn73cv/src/index.js`：

```javascript
const HTTPS_PORT = process.env.HTTPS_PORT || 8443  // 改为你想要的端口
const HTTP_PORT = process.env.HTTP_PORT || 8080
```

---

## 🔧 故障排除

### 服务器无法启动

1. 检查端口是否被占用：
```cmd
netstat -ano | findstr "8443"
```

2. 如果端口被占用，结束进程：
```cmd
taskkill /PID 进程ID /F
```

### SSL 证书问题

如果证书生成失败，手动重新生成：

```cmd
cd nodejsn73cv
node scripts/generate-cert.js
```

### IP 配置问题

手动更新 IP 配置：

```cmd
cd nodejsn73cv
node scripts/setup-ip.js
```

---

## 📞 技术支持

如果遇到问题：

1. 查看控制台错误信息
2. 检查 `nodejsn73cv/config/local-ip.json` 文件
3. 查看服务器启动日志

---

## 🎯 下一步

- ✅ 后端服务器已启动
- ✅ 小程序已配置
- ✅ 真机调试成功

现在可以：
1. 开始开发和测试
2. 修改代码实现自定义功能
3. 准备部署到生产环境

---

**创建时间**: 2025-11-11  
**适用系统**: Windows 10/11  
**Node.js 版本**: v14+

