/**
 * 自动获取本机 IP 并更新小程序配置
 * 适用于 Windows/macOS/Linux
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// 获取本机局域网 IP
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部和非 IPv4 地址
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({
          name: name,
          address: iface.address
        });
      }
    }
  }
  
  return ips;
}

// 更新小程序配置文件
function updateMiniProgramConfig(ip) {
  const configPath = path.join(__dirname, '../../mp-weixin/config.env.js');
  
  if (!fs.existsSync(configPath)) {
    console.error(`❌ 配置文件不存在: ${configPath}`);
    return false;
  }
  
  let content = fs.readFileSync(configPath, 'utf8');
  
  // 替换 testing 环境的 IP
  const httpPattern = /baseURL:\s*['"]http:\/\/YOUR_LOCAL_IP:8080\/nodejsn73cv\/['"]/;
  const httpsPattern = /\/\/\s*baseURL:\s*['"]https:\/\/YOUR_LOCAL_IP:8443\/nodejsn73cv\/['"]/;
  
  if (httpPattern.test(content)) {
    content = content.replace(
      httpPattern,
      `baseURL: 'http://${ip}:8080/nodejsn73cv/'`
    );
    console.log(`✅ 已更新 HTTP 配置: http://${ip}:8080/nodejsn73cv/`);
  }
  
  if (httpsPattern.test(content)) {
    content = content.replace(
      httpsPattern,
      `// baseURL: 'https://${ip}:8443/nodejsn73cv/'`
    );
    console.log(`✅ 已更新 HTTPS 配置: https://${ip}:8443/nodejsn73cv/`);
  }
  
  fs.writeFileSync(configPath, content, 'utf8');
  return true;
}

// 创建 IP 配置文件
function createIPConfig(ip) {
  const configDir = path.join(__dirname, '../config');
  const configPath = path.join(configDir, 'local-ip.json');
  
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  const config = {
    ip: ip,
    updatedAt: new Date().toISOString(),
    urls: {
      http: `http://${ip}:8080/nodejsn73cv/`,
      https: `https://${ip}:8443/nodejsn73cv/`
    }
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  console.log(`✅ IP 配置已保存: ${configPath}`);
}

// 主函数
function main() {
  console.log('========================================');
  console.log('🌐 检测本机 IP 地址');
  console.log('========================================');
  
  const ips = getLocalIP();
  
  if (ips.length === 0) {
    console.error('❌ 未检测到局域网 IP 地址');
    console.error('请检查网络连接');
    process.exit(1);
  }
  
  console.log('检测到以下网络接口:');
  ips.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.name}: ${item.address}`);
  });
  console.log('');
  
  let selectedIP;
  
  if (ips.length === 1) {
    selectedIP = ips[0].address;
    console.log(`✅ 自动选择: ${selectedIP}`);
  } else {
    // 优先选择以 192.168 开头的 IP
    const preferred = ips.find(item => item.address.startsWith('192.168'));
    if (preferred) {
      selectedIP = preferred.address;
      console.log(`✅ 自动选择: ${selectedIP} (推荐)`);
    } else {
      selectedIP = ips[0].address;
      console.log(`✅ 自动选择: ${selectedIP}`);
    }
  }
  
  console.log('========================================');
  console.log('📝 更新配置文件');
  console.log('========================================');
  
  // 更新小程序配置
  updateMiniProgramConfig(selectedIP);
  
  // 创建 IP 配置文件
  createIPConfig(selectedIP);
  
  console.log('========================================');
  console.log('✅ 配置完成！');
  console.log('========================================');
  console.log('');
  console.log('📱 小程序访问地址:');
  console.log(`   HTTP:  http://${selectedIP}:8080/nodejsn73cv/`);
  console.log(`   HTTPS: https://${selectedIP}:8443/nodejsn73cv/`);
  console.log('');
  console.log('💡 下一步:');
  console.log('   1. 运行 npm run start:https 启动 HTTPS 服务器');
  console.log('   2. 在微信开发者工具中打开小程序项目');
  console.log('   3. 真机调试时确保手机和电脑在同一局域网');
  console.log('========================================');
}

// 运行
main();

