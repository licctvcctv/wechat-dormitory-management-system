const fs = require('fs');
const path = require('path');

// 验证app.json文件存在性和内容
const appJsonPath = path.join(__dirname, 'app.json');

try {
  if (fs.existsSync(appJsonPath)) {
    console.log('app.json文件存在');
    const content = fs.readFileSync(appJsonPath, 'utf8');
    console.log('文件内容长度:', content.length, '字符');
    
    // 尝试解析JSON
    const json = JSON.parse(content);
    console.log('JSON解析成功，包含页面数量:', json.pages?.length || 0);
  } else {
    console.log('ERROR: app.json文件不存在');
  }
} catch (error) {
  console.error('验证过程中出现错误:', error.message);
}