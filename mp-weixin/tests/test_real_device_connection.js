// 真机调试连接问题测试脚本
const http = require('http');
const os = require('os');

// 获取本机所有网络接口的IP地址
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  Object.keys(interfaces).forEach(interfaceName => {
    interfaces[interfaceName].forEach(iface => {
      // 跳过IPv6和内部回环地址
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({
          interface: interfaceName,
          address: iface.address
        });
      }
    });
  });
  
  return ips;
}

// 测试服务器连接
function testServerConnection(host, port, path, callback) {
  const options = {
    hostname: host,
    port: port,
    path: path,
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      callback(null, {
        statusCode: res.statusCode,
        responseLength: data.length,
        success: res.statusCode >= 200 && res.statusCode < 400
      });
    });
  });

  req.on('error', (error) => {
    callback(error);
  });

  req.on('timeout', () => {
    req.destroy();
    callback(new Error('连接超时'));
  });

  req.end();
}

// 运行完整测试
async function runConnectionTests() {
  console.log('=' * 70);
  console.log('微信小程序真机调试连接测试');
  console.log('=' * 70);
  
  // 1. 获取本机IP地址信息
  console.log('\n1. 本机网络接口信息：');
  const localIPs = getLocalIPs();
  console.log(`找到 ${localIPs.length} 个可用的网络接口：`);
  localIPs.forEach(ipInfo => {
    console.log(`  - ${ipInfo.interface}: ${ipInfo.address}`);
  });
  
  // 2. 测试localhost连接
  console.log('\n2. 测试本地连接（localhost）：');
  testServerConnection('localhost', 8080, '/nodejsn73cv/xuesheng/list', (err, result) => {
    if (err) {
      console.log(`  ❌ 连接失败: ${err.message}`);
    } else {
      console.log(`  ✅ 连接成功，状态码: ${result.statusCode}`);
    }
    
    // 3. 测试每个本地IP的连接
    console.log('\n3. 测试本机IP地址连接（真机调试需要）：');
    localIPs.forEach(ipInfo => {
      console.log(`\n  测试 ${ipInfo.interface} (${ipInfo.address})`);
      testServerConnection(ipInfo.address, 8080, '/nodejsn73cv/xuesheng/list', (err, result) => {
        if (err) {
          console.log(`    ❌ 连接失败: ${err.message}`);
          console.log(`    问题分析：真机调试时需要手机和电脑在同一网络，且服务器需允许外部访问`);
        } else {
          console.log(`    ✅ 连接成功，状态码: ${result.statusCode}`);
          console.log(`    建议：真机调试时请使用此IP地址: ${ipInfo.address}:8080/nodejsn73cv`);
        }
      });
    });
    
    // 4. 提供解决方案建议
    setTimeout(() => {
      console.log('\n' + '=' * 70);
      console.log('4. 真机调试连接解决方案：');
      console.log('=' * 70);
      console.log('  问题原因分析：');
      console.log('  1. 服务器可能只监听localhost，不允许外部IP访问');
      console.log('  2. 防火墙可能阻止了8080端口的外部访问');
      console.log('  3. 手机和电脑不在同一WiFi网络');
      console.log('  4. 小程序中的baseUrl配置不正确');
      console.log('');
      console.log('  解决步骤：');
      console.log('  1. 修改后端服务器监听地址：');
      console.log('     - 打开 nodejsn73cv/src/index.js');
      console.log('     - 修改 app.server.listen(8080, () => { ... })');
      console.log('     - 改为 app.server.listen(8080, "0.0.0.0", () => { ... })');
      console.log('  2. 确保手机和电脑连接同一WiFi网络');
      console.log('  3. 关闭电脑防火墙或将8080端口添加到例外');
      console.log('  4. 修改小程序中的baseUrl配置为：');
      console.log('     - http://[本机IP]:8080/nodejsn73cv/');
      console.log('  5. 重新启动后端服务');
      console.log('\n测试完成！请根据上述建议进行配置修改。');
    }, 2000);
  });
}

// 执行测试
runConnectionTests();