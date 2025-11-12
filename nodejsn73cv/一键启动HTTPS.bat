@echo off
chcp 65001 >nul
title 学生宿舍管理系统 - HTTPS 服务器

echo ========================================
echo 🚀 学生宿舍管理系统 - HTTPS 服务器
echo ========================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 Node.js
    echo.
    echo 请先安装 Node.js:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js 已安装
node --version
echo.

REM 检查是否已安装依赖
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo.
    echo ✅ 依赖安装完成
    echo.
)

REM 检测本机 IP 并更新配置
echo 🌐 检测本机 IP 地址...
call node scripts/setup-ip.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ IP 配置失败
    pause
    exit /b 1
)
echo.

REM 生成 SSL 证书
if not exist "ssl\cert.pem" (
    echo 🔐 生成 SSL 证书...
    call node scripts/generate-cert.js
    if %errorlevel% neq 0 (
        echo.
        echo ❌ 证书生成失败
        pause
        exit /b 1
    )
    echo.
) else (
    echo ✅ SSL 证书已存在
    echo.
)

REM 启动 HTTPS 服务器
echo ========================================
echo 🚀 启动 HTTPS 服务器...
echo ========================================
echo.

set USE_HTTPS=true
set HTTPS_PORT=8443

call npm run start:https

pause

