// 学生账号登录测试脚本
const http = require('http');

// 测试账号信息
const testAccounts = [
  { username: '学号1', password: '123456' },
  { username: '学号2', password: '123456' },
  { username: '学号3', password: '123456' },
  { username: '学号4', password: '123456' },
  { username: '学号5', password: '123456' },
  { username: '学号6', password: '123456' }
];

// 测试登录接口
function testLogin(account) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: `/nodejsn73cv/xuesheng/login?username=${encodeURIComponent(account.username)}&password=${encodeURIComponent(account.password)}`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            account: account,
            statusCode: res.statusCode,
            response: result
          });
        } catch (error) {
          resolve({
            account: account,
            statusCode: res.statusCode,
            response: data,
            error: '解析响应失败'
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        account: account,
        error: error.message
      });
    });

    req.end();
  });
}

// 运行所有测试
async function runAllTests() {
  console.log('开始测试学生账号登录...');
  console.log('=' * 60);
  
  const results = [];
  let successCount = 0;
  let failedCount = 0;

  for (const account of testAccounts) {
    try {
      console.log(`\n测试账号: ${account.username} / ${account.password}`);
      const result = await testLogin(account);
      
      console.log(`状态码: ${result.statusCode}`);
      console.log('响应:', result.response);
      
      // 判断登录是否成功（假设有token或特定code表示成功）
      const isSuccess = result.statusCode === 200 && 
                      (result.response.code === 1 || 
                       result.response.token || 
                       result.response.msg?.includes('成功'));
      
      if (isSuccess) {
        successCount++;
        console.log('✅ 登录成功');
      } else {
        failedCount++;
        console.log('❌ 登录失败');
      }
      
      results.push({ ...result, success: isSuccess });
    } catch (error) {
      failedCount++;
      console.log(`❌ 测试失败: ${error.message}`);
      results.push({
        account: account,
        error: error.message,
        success: false
      });
    }
  }

  console.log('\n' + '=' * 60);
  console.log('测试结果汇总:');
  console.log(`总测试账号: ${testAccounts.length}`);
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${failedCount}`);
  
  // 输出详细建议
  console.log('\n建议操作:');
  if (failedCount === testAccounts.length) {
    console.log('1. 请确认后端服务正在运行且8080端口可访问');
    console.log('2. 检查数据库是否已正确初始化');
    console.log('3. 在微信开发者工具中开启"不校验合法域名"选项');
    console.log('4. 清理微信开发者工具缓存后重试');
  } else if (successCount > 0) {
    console.log('1. 在登录页面使用成功的账号密码组合');
    console.log('2. 确保选择了正确的用户类型（学生）');
    console.log('3. 如仍有问题，请检查前端登录页面的请求逻辑');
  }
}

// 执行测试
runAllTests().then(() => {
  console.log('\n测试完成！');
});