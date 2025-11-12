# 📦 Git 仓库使用说明

## ✅ 仓库已创建

本地 Git 仓库已成功创建并完成初始提交！

---

## 📊 当前状态

```bash
✅ Git 仓库已初始化
✅ 所有文件已添加到暂存区
✅ 初始提交已完成
📝 提交信息：🎉 Initial commit: 学生宿舍管理系统
🔖 当前分支：main
📌 提交 ID：65e56d5
```

---

## 🚀 推送到远程仓库

### 方法 1：推送到 GitHub

#### 步骤 1：在 GitHub 创建仓库

1. 访问 [GitHub](https://github.com/)
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - **Repository name**: `dormitory-management-system`（或其他名称）
   - **Description**: 基于微信小程序的学生宿舍管理系统
   - **Public/Private**: 根据需要选择
   - ⚠️ **不要**勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

#### 步骤 2：推送代码

```bash
# 进入项目目录
cd "基于微信小程序的学生宿舍管理系统"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/dormitory-management-system.git

# 推送代码到 GitHub
git push -u origin main
```

如果遇到认证问题，可能需要使用 Personal Access Token：
```bash
# 使用 token 推送
git push https://YOUR_TOKEN@github.com/YOUR_USERNAME/dormitory-management-system.git main
```

---

### 方法 2：推送到 Gitee（码云）

#### 步骤 1：在 Gitee 创建仓库

1. 访问 [Gitee](https://gitee.com/)
2. 点击右上角 "+" → "新建仓库"
3. 填写仓库信息：
   - **仓库名称**: `dormitory-management-system`
   - **仓库介绍**: 基于微信小程序的学生宿舍管理系统
   - **是否开源**: 根据需要选择
   - ⚠️ **不要**勾选 "使用 Readme 文件初始化这个仓库"
4. 点击 "创建"

#### 步骤 2：推送代码

```bash
# 进入项目目录
cd "基于微信小程序的学生宿舍管理系统"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 Gitee 用户名）
git remote add origin https://gitee.com/YOUR_USERNAME/dormitory-management-system.git

# 推送代码到 Gitee
git push -u origin main
```

---

## 📝 常用 Git 命令

### 查看状态

```bash
# 查看当前状态
git status

# 查看提交历史
git log

# 查看简洁的提交历史
git log --oneline

# 查看最近 5 次提交
git log --oneline -5
```

### 提交更改

```bash
# 查看修改的文件
git status

# 添加所有修改的文件
git add .

# 或者添加特定文件
git add 文件名

# 提交更改
git commit -m "提交说明"

# 推送到远程仓库
git push
```

### 分支管理

```bash
# 查看所有分支
git branch

# 创建新分支
git branch 分支名

# 切换分支
git checkout 分支名

# 创建并切换到新分支
git checkout -b 分支名

# 合并分支
git merge 分支名

# 删除分支
git branch -d 分支名
```

### 远程仓库

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin 仓库地址

# 修改远程仓库地址
git remote set-url origin 新地址

# 拉取远程更新
git pull

# 推送到远程
git push
```

---

## 🎯 推荐的仓库名称

根据项目特点，推荐以下仓库名称：

1. **dormitory-management-system** ⭐ 推荐
   - 清晰明了，符合国际惯例

2. **wechat-dormitory-manager**
   - 强调微信小程序特性

3. **student-dorm-system**
   - 简洁版本

4. **campus-dormitory-platform**
   - 强调校园平台属性

---

## 📋 .gitignore 说明

项目已包含 `.gitignore` 文件，以下文件/目录不会被提交：

- `node_modules/` - Node.js 依赖
- `*.log` - 日志文件
- `.DS_Store` - macOS 系统文件
- `project.private.config.json` - 私有配置
- `dist/`, `build/` - 编译输出
- IDE 配置文件（`.vscode/`, `.idea/` 等）

如需修改忽略规则，编辑 `.gitignore` 文件。

---

## 🔐 保护敏感信息

⚠️ **重要提醒**：

1. **数据库密码**：
   - 文件：`nodejsn73cv/src/config.json`
   - 建议：推送前修改为占位符，或添加到 `.gitignore`

2. **环境配置**：
   - 文件：`mp-weixin/config.env.js`
   - 建议：如果包含真实 IP，可以添加到 `.gitignore`

3. **小程序 AppID**：
   - 文件：`mp-weixin/project.config.json`
   - 建议：推送前检查是否包含真实 AppID

### 添加敏感文件到 .gitignore

```bash
# 编辑 .gitignore
echo "nodejsn73cv/src/config.json" >> .gitignore
echo "mp-weixin/config.env.js" >> .gitignore

# 如果文件已被跟踪，需要先移除
git rm --cached nodejsn73cv/src/config.json
git rm --cached mp-weixin/config.env.js

# 提交更改
git add .gitignore
git commit -m "🔒 添加敏感文件到 .gitignore"
```

---

## 📚 Git 学习资源

- [Git 官方文档](https://git-scm.com/doc)
- [GitHub 官方教程](https://docs.github.com/cn)
- [廖雪峰 Git 教程](https://www.liaoxuefeng.com/wiki/896043488029600)
- [Pro Git 中文版](https://git-scm.com/book/zh/v2)

---

## ❓ 常见问题

### Q1: 如何修改最后一次提交信息？

```bash
git commit --amend -m "新的提交信息"
```

### Q2: 如何撤销未提交的修改？

```bash
# 撤销所有修改
git checkout .

# 撤销特定文件的修改
git checkout 文件名
```

### Q3: 如何查看文件修改内容？

```bash
# 查看未暂存的修改
git diff

# 查看已暂存的修改
git diff --staged
```

### Q4: 推送时提示认证失败怎么办？

**GitHub**：
1. 创建 Personal Access Token
2. 使用 token 代替密码

**Gitee**：
1. 使用 SSH 密钥
2. 或使用账号密码

---

## 🎉 下一步

1. ✅ 创建远程仓库（GitHub/Gitee）
2. ✅ 推送代码到远程
3. ✅ 添加 README.md 徽章
4. ✅ 设置分支保护规则
5. ✅ 邀请团队成员协作

---

**创建时间**：2025-11-11  
**仓库状态**：✅ 已就绪，可以推送到远程

