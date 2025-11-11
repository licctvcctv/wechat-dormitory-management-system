// 查找默认账号密码脚本
const fs = require('fs');
const path = require('path');

console.log('===== 查找默认账号密码 =====');

// 1. 检查数据库文件
function checkDatabaseFiles() {
  console.log('\n1. 检查数据库文件...');
  const dbDir = path.join(__dirname, 'nodejsn73cv', 'db');
  
  try {
    const files = fs.readdirSync(dbDir);
    console.log('数据库目录文件:', files);
    
    // 查找可能包含初始数据的文件
    const sqlFiles = files.filter(file => file.endsWith('.sql'));
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log('SQL文件:', sqlFiles);
    console.log('JSON文件:', jsonFiles);
    
    return { sqlFiles, jsonFiles, dbDir };
  } catch (e) {
    console.log('检查数据库文件失败:', e.message);
    return { sqlFiles: [], jsonFiles: [], dbDir: null };
  }
}

// 2. 读取可能包含默认账号的文件
function checkConfigAndInitFiles() {
  console.log('\n2. 检查配置和初始化文件...');
  const configPaths = [
    path.join(__dirname, 'nodejsn73cv', 'src', 'config.js'),
    path.join(__dirname, 'nodejsn73cv', 'src', 'init.js'),
    path.join(__dirname, 'nodejsn73cv', 'package.json')
  ];
  
  configPaths.forEach(configPath => {
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf8');
        console.log(`\n检查文件: ${configPath}`);
        
        // 搜索可能的默认账号密码模式
        const patterns = [
          /username.*[=:]\s*['"](\w+)['"]/gi,
          /password.*[=:]\s*['"](\w+)['"]/gi,
          /default.*admin/gi,
          /初始账号/gi,
          /默认密码/gi,
          /test.*user/gi
        ];
        
        patterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            console.log(`找到匹配: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}`);
          }
        });
      }
    } catch (e) {
      console.log(`读取${configPath}失败:`, e.message);
    }
  });
}

// 3. 尝试常见的默认账号密码组合
function suggestDefaultAccounts() {
  console.log('\n3. 常见默认账号密码组合推荐:');
  const commonAccounts = [
    { username: 'admin', password: 'admin' },
    { username: 'admin', password: '123456' },
    { username: 'test', password: 'test' },
    { username: 'xuesheng', password: '123456' },
    { username: 'student', password: '123456' },
    { username: 'user', password: '123456' },
    { username: '001', password: '123456' },
    { username: '1', password: '1' }
  ];
  
  commonAccounts.forEach((account, index) => {
    console.log(`${index + 1}. ${account.username} / ${account.password}`);
  });
  
  console.log('\n请尝试上述账号密码组合，特别是与学生(xuesheng)角色相关的账号');
}

// 执行查找
function runAccountSearch() {
  const { sqlFiles, jsonFiles } = checkDatabaseFiles();
  checkConfigAndInitFiles();
  suggestDefaultAccounts();
  
  console.log('\n===== 建议操作 =====');
  console.log('1. 尝试上述默认账号密码');
  console.log('2. 检查数据库初始化脚本');
  console.log('3. 如果有SQL文件，可以手动执行查看或修改数据');
  console.log('4. 尝试在小程序中注册新账号');
}

runAccountSearch();