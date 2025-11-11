const envTools = require('../config.env.js');

console.log('===== 环境检测测试 =====');

function logRuntimeInfo() {
  try {
    const snapshot = envTools.getRuntimeSnapshot(false);
    const config = envTools.getEnvConfig(false);
    console.log('\n当前运行环境快照:');
    console.log('- 系统平台:', snapshot.platform || 'unknown');
    console.log('- 小程序通道:', snapshot.envVersion || 'unknown');
    console.log('- 判定环境:', snapshot.env + (snapshot.manualEnv ? ' (手动指定)' : ''));
    console.log('- API 基础地址:', config.baseURL);
    console.log('- 覆盖的测试环境地址:', snapshot.overrides.testingBaseURL || '未设置');
    console.log('- 覆盖的生产环境地址:', snapshot.overrides.productionBaseURL || '未设置');

    if (snapshot.env !== 'development' && config.baseURL.indexOf('localhost') !== -1) {
      console.error('\nERROR: 非开发环境仍然指向 localhost，真机无法访问。');
      console.error('请执行 envTools.setEnvironmentBaseURL("testing", "192.168.x.x:8080/nodejsn73cv/") 设置可访问的服务器地址。');
    }
  } catch (error) {
    console.error('环境信息读取失败:', error);
  }
}

function inspectAppBase() {
  setTimeout(() => {
    try {
      const app = getApp();
      if (!app || !app.$base) {
        console.error('ERROR: 无法获取 App.$base');
        return;
      }
      console.log('\nApp.$base 状态:');
      console.log('- env:', app.$base.env || 'unknown');
      console.log('- url:', app.$base.url);
      if (app.$base.env !== 'development' && app.$base.url && app.$base.url.indexOf('localhost') !== -1) {
        console.error('ERROR: 真机环境的 App.$base.url 仍为 localhost');
      }
    } catch (error) {
      console.error('读取 App.$base 失败:', error);
    }
  }, 120);
}

function runProbeRequest() {
  setTimeout(() => {
    console.log('\n测试 wx.request 调用:');
    wx.request({
      url: 'xuesheng/login',
      method: 'GET',
      data: { username: 'test', password: 'test' },
      success: (res) => {
        console.log('请求成功，状态码:', res.statusCode, res.errMsg);
      },
      fail: (err) => {
        console.error('请求失败:', err);
      }
    });
  }, 250);
}

console.log('\n提示: 在控制台可执行以下命令管理环境配置:');
console.log('  const env = require("../config.env.js");');
console.log('  env.setManualEnvironment("testing") // 手动锁定环境');
console.log('  env.setEnvironmentBaseURL("testing", "192.168.x.x:8080/nodejsn73cv/") // 设置真机调试地址');
console.log('  env.clearManualEnvironment() // 恢复自动检测 (可选)');

logRuntimeInfo();
inspectAppBase();
runProbeRequest();
