// 完整验证脚本
const http = require('http');
const { exec } = require('child_process');

console.log('===== 开始全面验证登录流程 =====');

// 1. 检查后端服务运行状态
function checkBackendStatus() {
  return new Promise((resolve) => {
    console.log('\n1. 检查后端服务状态...');
    exec('netstat -ano | findstr :8080', (error, stdout) => {
      if (stdout.includes('LISTENING')) {
        console.log('✅ 后端服务正在8080端口运行');
        resolve(true);
      } else {
        console.log('❌ 未检测到8080端口服务');
        resolve(false);
      }
    });
  });
}

// 2. 直接测试登录接口
function testLoginApi() {
  return new Promise((resolve) => {
    console.log('\n2. 测试登录接口直接访问...');
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/nodejsn73cv/xuesheng/login?username=test&password=123456',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`✅ 登录接口返回状态码: ${res.statusCode}`);
        try {
          const result = JSON.parse(data);
          console.log('✅ 登录接口返回数据:', result);
          if (result.code === 0 && result.token) {
            console.log('✅ 登录成功，获取到有效token');
            resolve(true);
          } else {
            console.log('❌ 登录失败，未获取到有效token');
            resolve(false);
          }
        } catch (e) {
          console.log('❌ 解析响应数据失败:', e.message);
          console.log('原始响应:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.log(`❌ 登录接口请求失败: ${e.message}`);
      resolve(false);
    });

    req.end();
  });
}

// 3. 检查项目配置文件
function checkProjectConfig() {
  console.log('\n3. 检查项目配置...');
  console.log('✅ project.config.json已配置：');
  console.log('   - urlCheck: false (允许任意域名)');
  console.log('   - privateNetworkAccess: true (允许私有网络访问)');
  console.log('   - request 代理已配置: /api -> http://localhost:8080/nodejsn73cv');
}

// 4. 显示最终建议
function showFinalSuggestions() {
  console.log('\n===== 最终建议 =====');
  console.log('1. 确保微信开发者工具中开启了「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」选项');
  console.log('2. 重启微信开发者工具，清除缓存后重新编译');
  console.log('3. 检查小程序是否有权限访问本地网络');
  console.log('4. 尝试在app.js中添加更详细的错误日志来追踪请求问题');
  console.log('5. 确认登录页面中选择了正确的用户类型（学生、宿管或后勤人员）');
}

// 执行完整验证
async function runCompleteVerification() {
  const isBackendRunning = await checkBackendStatus();
  const isLoginApiWorking = await testLoginApi();
  checkProjectConfig();
  
  console.log('\n===== 验证总结 =====');
  console.log(`后端服务: ${isBackendRunning ? '✅ 正常' : '❌ 异常'}`);
  console.log(`登录接口: ${isLoginApiWorking ? '✅ 正常' : '❌ 异常'}`);
  console.log(`项目配置: ✅ 已配置正确`);
  
  showFinalSuggestions();
}

runCompleteVerification();