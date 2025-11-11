const http = require('http');

// 测试连接后端服务
const testConnection = () => {
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
    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应头: ${JSON.stringify(res.headers)}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('响应数据:', data);
    });
  });

  req.on('error', (e) => {
    console.error(`请求错误: ${e.message}`);
  });

  req.end();
};

// 执行测试
testConnection();