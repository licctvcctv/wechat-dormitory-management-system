/**
 * HTTP 服务器一键启动脚本
 * 功能：
 * 1. 检查 Node.js 环境
 * 2. 清理占用的端口
 * 3. 安装依赖
 * 4. 检测本机 IP
 * 5. 启动 HTTP 服务器
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 配置
const HTTP_PORT = 8080;

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log('========================================', 'cyan');
  log(title, 'bright');
  log('========================================', 'cyan');
}

// 检查端口是否被占用
function checkPort(port) {
  try {
    const isWin = process.platform === 'win32';
    if (isWin) {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      return result.trim().length > 0;
    } else {
      const result = execSync(`lsof -i :${port}`, { encoding: 'utf8' });
      return result.trim().length > 0;
    }
  } catch (err) {
    return false;
  }
}

// 清理端口
function killPort(port) {
  try {
    const isWin = process.platform === 'win32';
    log(`正在清理端口 ${port}...`, 'yellow');
    
    if (isWin) {
      const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = result.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') {
          pids.add(pid);
        }
      });
      
      pids.forEach(pid => {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          log(`✅ 已终止进程 PID: ${pid}`, 'green');
        } catch (err) {
          // 忽略错误
        }
      });
    } else {
      execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: 'ignore' });
    }
    
    log(`✅ 端口 ${port} 已清理`, 'green');
    return true;
  } catch (err) {
    return false;
  }
}

// 检查并安装依赖
function checkDependencies() {
  logSection('📦 检查项目依赖');
  
  if (!fs.existsSync('node_modules')) {
    log('首次运行，正在安装依赖...', 'yellow');
    log('这可能需要几分钟，请耐心等待...', 'yellow');
    console.log('');
    
    try {
      execSync('npm install', { stdio: 'inherit' });
      console.log('');
      log('✅ 依赖安装完成', 'green');
    } catch (err) {
      log('❌ 依赖安装失败', 'red');
      log('请检查网络连接或尝试切换 npm 镜像源:', 'yellow');
      log('  npm config set registry https://registry.npmmirror.com', 'cyan');
      process.exit(1);
    }
  } else {
    log('✅ 依赖已安装', 'green');
  }
}

// 检测 IP 并更新配置
function setupIP() {
  logSection('🌐 配置本机 IP 地址');
  
  try {
    execSync('node scripts/setup-ip.js', { stdio: 'inherit' });
  } catch (err) {
    log('⚠️  IP 配置失败，将使用默认配置', 'yellow');
  }
}

// 启动服务器
function startServer() {
  logSection('🚀 启动 HTTP 服务器');
  
  // 清理端口
  if (checkPort(HTTP_PORT)) {
    log(`⚠️  端口 ${HTTP_PORT} 已被占用`, 'yellow');
    killPort(HTTP_PORT);
  }
  
  console.log('');
  log('⚠️  注意: HTTP 模式仅适用于开发环境', 'yellow');
  log('💡 真机调试建议使用 HTTPS 模式 (运行 start-https.js)', 'cyan');
  console.log('');
  log('正在启动服务器...', 'yellow');
  console.log('');
  
  try {
    // 先构建
    log('📝 编译项目...', 'yellow');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('');
    
    // 启动服务器
    const serverProcess = spawn('node', ['./dist/index.js'], {
      stdio: 'inherit'
    });
    
    serverProcess.on('error', (err) => {
      log('❌ 服务器启动失败', 'red');
      console.error(err);
      process.exit(1);
    });
    
    serverProcess.on('exit', (code) => {
      if (code !== 0) {
        log(`\n服务器已停止 (退出码: ${code})`, 'yellow');
      }
    });
    
    // 处理 Ctrl+C
    process.on('SIGINT', () => {
      log('\n\n正在关闭服务器...', 'yellow');
      serverProcess.kill('SIGINT');
      setTimeout(() => {
        process.exit(0);
      }, 1000);
    });
    
  } catch (err) {
    log('❌ 服务器启动失败', 'red');
    console.error(err);
    process.exit(1);
  }
}

// 主函数
async function main() {
  console.clear();
  
  logSection('🏠 学生宿舍管理系统 - HTTP 服务器');
  
  log(`Node.js 版本: ${process.version}`, 'cyan');
  log(`操作系统: ${os.platform()} ${os.arch()}`, 'cyan');
  console.log('');
  
  // 执行步骤
  checkDependencies();
  setupIP();
  startServer();
}

// 运行
main().catch(err => {
  log('\n❌ 启动失败', 'red');
  console.error(err);
  process.exit(1);
});

