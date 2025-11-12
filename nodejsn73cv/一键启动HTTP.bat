@echo off
chcp 65001 >nul
title 学生宿舍管理系统 - HTTP 服务器

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

REM 运行 Node.js 启动脚本
node start-http.js

REM 如果脚本异常退出，暂停以便查看错误信息
if %errorlevel% neq 0 (
    echo.
    echo 按任意键退出...
    pause >nul
)

