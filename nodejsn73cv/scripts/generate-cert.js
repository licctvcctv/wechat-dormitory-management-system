/**
 * 自动生成 SSL 证书脚本
 * 适用于 Windows/macOS/Linux
 * 使用 Node.js 的 selfsigned 库生成自签名证书
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

// 获取本机局域网 IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部和非 IPv4 地址
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ 创建目录: ${dir}`);
  }
}

// 生成证书
function generateCertificate() {
  const sslDir = path.join(__dirname, '../ssl');
  const certPath = path.join(sslDir, 'cert.pem');
  const keyPath = path.join(sslDir, 'key.pem');

  // 检查证书是否已存在
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    console.log('⚠️  SSL 证书已存在');
    console.log(`证书位置: ${certPath}`);
    console.log(`密钥位置: ${keyPath}`);
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('是否重新生成？(y/N): ', (answer) => {
      readline.close();
      if (answer.toLowerCase() === 'y') {
        doGenerate(sslDir, certPath, keyPath);
      } else {
        console.log('✅ 保留现有证书');
        process.exit(0);
      }
    });
  } else {
    doGenerate(sslDir, certPath, keyPath);
  }
}

function doGenerate(sslDir, certPath, keyPath) {
  ensureDir(sslDir);

  const localIP = getLocalIP();
  console.log('========================================');
  console.log('🔐 开始生成 SSL 证书');
  console.log('========================================');
  console.log(`本机 IP: ${localIP}`);
  console.log('证书有效期: 365 天');
  console.log('========================================');

  try {
    // 尝试使用 selfsigned 库
    const selfsigned = require('selfsigned');
    
    const attrs = [
      { name: 'commonName', value: localIP },
      { name: 'countryName', value: 'CN' },
      { name: 'stateOrProvinceName', value: 'Beijing' },
      { name: 'localityName', value: 'Beijing' },
      { name: 'organizationName', value: 'Development' }
    ];

    const options = {
      keySize: 2048,
      days: 365,
      algorithm: 'sha256',
      extensions: [
        {
          name: 'subjectAltName',
          altNames: [
            { type: 2, value: 'localhost' },
            { type: 2, value: localIP },
            { type: 7, ip: '127.0.0.1' },
            { type: 7, ip: localIP }
          ]
        }
      ]
    };

    console.log('📝 生成证书中...');
    const pems = selfsigned.generate(attrs, options);

    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);

    console.log('✅ SSL 证书生成成功！');
    console.log('========================================');
    console.log(`证书文件: ${certPath}`);
    console.log(`密钥文件: ${keyPath}`);
    console.log('========================================');
    console.log('💡 提示:');
    console.log(`   - 本机访问: https://localhost:8443`);
    console.log(`   - 局域网访问: https://${localIP}:8443`);
    console.log(`   - 浏览器可能提示"不安全"，这是正常的（自签名证书）`);
    console.log(`   - 微信小程序需要在开发者工具中勾选"不校验合法域名"`);
    console.log('========================================');

  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.log('⚠️  selfsigned 模块未安装，尝试使用 openssl...');
      generateWithOpenSSL(sslDir, certPath, keyPath, localIP);
    } else {
      throw err;
    }
  }
}

function generateWithOpenSSL(sslDir, certPath, keyPath, localIP) {
  try {
    // 检查 openssl 是否可用
    execSync('openssl version', { stdio: 'ignore' });
    
    console.log('📝 使用 OpenSSL 生成证书...');
    
    const cmd = `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 365 -nodes -subj "/C=CN/ST=Beijing/L=Beijing/O=Development/CN=${localIP}"`;
    
    execSync(cmd, { stdio: 'inherit' });
    
    console.log('✅ SSL 证书生成成功！');
    console.log('========================================');
    console.log(`证书文件: ${certPath}`);
    console.log(`密钥文件: ${keyPath}`);
    console.log('========================================');
    
  } catch (err) {
    console.error('❌ 证书生成失败！');
    console.error('');
    console.error('请手动安装 selfsigned 模块:');
    console.error('  npm install selfsigned --save-dev');
    console.error('');
    console.error('或者安装 OpenSSL:');
    console.error('  Windows: https://slproweb.com/products/Win32OpenSSL.html');
    console.error('  macOS: brew install openssl');
    console.error('  Linux: sudo apt-get install openssl');
    process.exit(1);
  }
}

// 运行
generateCertificate();

