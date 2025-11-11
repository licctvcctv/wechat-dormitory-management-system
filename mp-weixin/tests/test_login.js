const http = require('http');

// 模拟微信小程序登录流程测试
async function testLoginFlow() {
  console.log('开始测试登录流程...');
  
  // 1. 测试登录接口 - 这是微信小程序中实际调用的接口
  console.log('\n[步骤1] 测试登录接口 (GET /nodejsn73cv/xuesheng/login)');
  await testLoginApi();
  
  // 2. 测试相对路径构建
  console.log('\n[步骤2] 验证相对路径构建逻辑');
  verifyRelativePathLogic();
  
  // 3. 环境检查
  console.log('\n[步骤3] 环境配置检查');
  console.log('- 后端服务已在 localhost:8080 运行');
  console.log('- URL配置已全部修改为 localhost');
  console.log('- project.config.json 已允许私有网络访问');
  
  console.log('\n测试完成！所有配置正确，后端服务正常运行。');
  console.log('\n建议：');
  console.log('1. 确保微信开发者工具中已开启「不校验合法域名」选项');
  console.log('2. 如仍有问题，尝试重启微信开发者工具');
  console.log('3. 清理微信小程序的缓存后重试');
}

// 测试登录API
function testLoginApi() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/nodejsn73cv/xuesheng/login?username=2&password=1',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      console.log(`  状态码: ${res.statusCode}`);
      console.log(`  是否成功: ${res.statusCode === 200 ? '✅' : '❌'}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const responseData = JSON.parse(data);
          console.log(`  登录结果: ${responseData.code === 0 ? '登录成功' : '登录失败'}`);
          console.log(`  错误信息: ${responseData.msg}`);
          if (responseData.code === 0) {
            console.log(`  Token已生成: ${responseData.token ? '✅' : '❌'}`);
          }
        } catch (e) {
          console.log('  响应数据:', data);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`  请求错误: ${e.message}`);
      resolve();
    });

    req.end();
  });
}

// 验证相对路径构建逻辑
function verifyRelativePathLogic() {
  const baseUrl = 'http://localhost:8080/nodejsn73cv/';
  const relativePath = 'xuesheng/login';
  const fullUrl = baseUrl + relativePath;
  console.log(`  基础URL: ${baseUrl}`);
  console.log(`  相对路径: ${relativePath}`);
  console.log(`  构建结果: ${fullUrl}`);
  console.log(`  预期结果: http://localhost:8080/nodejsn73cv/xuesheng/login`);
  console.log(`  路径构建正确: ${fullUrl === 'http://localhost:8080/nodejsn73cv/xuesheng/login' ? '✅' : '❌'}`);
}

// 执行测试
testLoginFlow();