const http = require('http');

// 测试8080端口是否可访问
const testUrl = 'http://localhost:8080/nodejsn73cv/xuesheng/register';

console.log('测试访问:', testUrl);

// 使用HTTP请求测试端口
http.get('http://localhost:8080', (res) => {
  console.log('连接成功! 状态码:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers));
  
  res.on('data', (chunk) => {
    console.log('响应数据:', chunk.toString().substring(0, 200));
  });
}).on('error', (e) => {
  console.error('连接错误:', e.message);
});

// 同时检查8080端口是否真的被占用
const net = require('net');
const socket = new net.Socket();

socket.on('connect', () => {
  console.log('8080端口确实被占用，服务正在运行');
  socket.destroy();
});

socket.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.log('8080端口未被占用');
  } else {
    console.log('端口检查错误:', err.message);
  }
});

socket.connect(8080, 'localhost');