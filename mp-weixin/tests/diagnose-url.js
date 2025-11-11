#!/usr/bin/env node
/**
 * diagnose-url.js
 * 一键排查：localhost 硬编码、wx/uni/axios 请求劫持与覆盖、mini_fix 加载顺序等问题
 * 用法：
 *   node diagnose-url.js                # 扫描当前目录
 *   node diagnose-url.js D:\path\proj   # 指定目录
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(process.argv[2] || process.cwd());

// 需要扫描的根（小程序目录常见在 mp-weixin）
const CANDIDATE_ROOTS = ['.', 'mp-weixin', 'src', 'src/views/front', 'src/views/admin']
  .map(p => path.resolve(ROOT, p))
  .filter(p => fs.existsSync(p) && fs.statSync(p).isDirectory());

// 忽略目录/文件
const IGNORE_DIRS = new RegExp(
  [
    '\\bnode_modules\\b',
    '\\bdist\\b',
    '\\bunpackage\\b',
    '\\bbuild\\b',
    '\\bout\\b',
    '\\.git\\b',
  ].join('|'),
  'i'
);
const IGNORE_FILES = /\.(min\.js|vendor\.js)$/i;

// 规则集合
const RULES = [
  {
    id: 'hardcodedLocalhost',
    title: '硬编码 localhost/127.0.0.1（含端口）',
    regex: /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i,
    hint: '将 localhost 改为局域网 IP 或读取 getApp().$base.url',
  },
  {
    id: 'baseUrlAssign',
    title: 'baseUrl/base_url 等赋值（可能覆盖全局）',
    regex: /\b(baseurl|base_url)\b\s*[:=]/i,
    hint: '统一从 getApp().$base.url 读取；不要写死字符串',
  },
  {
    id: 'wxRequestOverride',
    title: '重写/覆盖 wx.request',
    regex: /\bwx\.request\s*=\s*|const\s+\w+\s*=\s*wx\.request\b/i,
    hint: '如需包装，请在 mini_fix 之后且不要绕开修正；更推荐在 mini_fix 内统一封装',
  },
  {
    id: 'uniRequestOverride',
    title: '重写/覆盖/使用 uni.request',
    regex: /\buni\.request\b|\buni\.request\s*=\s*/i,
    hint: '若使用 uni.request，需要同样拦截封装（mini_fix 已提供范例）',
  },
  {
    id: 'axiosBase',
    title: 'axios baseURL/拦截器（可能自带拼接）',
    regex: /\baxios\.create|\baxios\.defaults\.baseURL|\baxios\.interceptors\.request/i,
    hint: '确保 axios 的 baseURL 与拦截器也做了 localhost → IP 修正',
  },
  {
    id: 'loginPath',
    title: '登录路径硬编码（xuesheng/login）',
    regex: /xuesheng\/login/i,
    hint: '使用基于 BASE 的 join(BASE,"xuesheng/login") 生成，不要和 localhost 拼在一起',
  },
];

const findings = {};
RULES.forEach(r => (findings[r.id] = []));

const hitsSummary = [];
let scannedFiles = 0;

function scanFile(file) {
  if (IGNORE_FILES.test(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);

  RULES.forEach(rule => {
    lines.forEach((line, idx) => {
      if (rule.regex.test(line)) {
        findings[rule.id].push({
          file,
          line: idx + 1,
          content: line.trim().slice(0, 400),
        });
      }
    });
  });
}

function walk(dir) {
  const ents = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of ents) {
    const p = path.join(dir, ent.name);
    if (IGNORE_DIRS.test(p)) continue;
    if (ent.isDirectory()) {
      walk(p);
    } else if (ent.isFile()) {
      const ext = path.extname(ent.name).toLowerCase();
      if (ext === '.js' || ext === '.json') {
        scannedFiles++;
        scanFile(p);
      }
    }
  }
}

// 1) 扫描
for (const root of CANDIDATE_ROOTS) {
  walk(root);
}

// 2) 检查 app.js 里 mini_fix 加载顺序
const orderCheck = [];
const appJsCandidates = [
  path.join(ROOT, 'mp-weixin', 'app.js'),
  path.join(ROOT, 'app.js'),
].filter(fs.existsSync);

for (const appPath of appJsCandidates) {
  const src = fs.readFileSync(appPath, 'utf8');
  const first100 = src.split(/\r?\n/).slice(0, 120).join('\n');
  const miniFixPos = first100.search(/require\(['"]\.\/mini_fix\.js['"]\)/);
  const otherFixersPos = first100.search(/require\(['"].*(global_url_fixer|request_fix|test_url_fix)\.js['"]\)/);
  orderCheck.push({
    file: appPath,
    miniFixFound: miniFixPos >= 0,
    miniFixBeforeOthers: miniFixPos >= 0 && (otherFixersPos === -1 || miniFixPos < otherFixersPos),
    snippet: first100,
  });
}

// 3) 输出
function printSection(title) {
  console.log('\n' + '='.repeat(80));
  console.log(title);
  console.log('='.repeat(80));
}

console.log(`扫描根目录: ${ROOT}`);
console.log(`扫描子目录: \n  - ${CANDIDATE_ROOTS.join('\n  - ')}`);
console.log(`已扫描文件数: ${scannedFiles}`);

for (const rule of RULES) {
  const list = findings[rule.id];
  printSection(`【${rule.title}】命中 ${list.length} 处`);
  if (list.length) {
    list.slice(0, 2000).forEach(it => {
      console.log(`- ${it.file}:${it.line}\n  ${it.content}`);
    });
    console.log(`建议：${rule.hint}`);
  }
  hitsSummary.push({ title: rule.title, count: list.length, hint: rule.hint });
}

// app.js 载入顺序
printSection('【app.js 加载顺序检查（mini_fix.js 是否最先 require）】');
if (orderCheck.length === 0) {
  console.log('未找到 app.js');
} else {
  for (const oc of orderCheck) {
    console.log(`文件: ${oc.file}`);
    console.log(`- 是否找到 mini_fix.js: ${oc.miniFixFound ? '是' : '否'}`);
    console.log(`- mini_fix 是否在其他修复器之前: ${oc.miniFixBeforeOthers ? '是' : '否'}`);
    if (!oc.miniFixBeforeOthers) {
      console.log('  建议：确保在 app.js 顶部第一行就 require("./mini_fix.js")，其余 fixer/测试在其后。');
    }
  }
}

// 4) 摘要
printSection('【摘要】');
hitsSummary.forEach(s => console.log(`- ${s.title}: ${s.count} 处`));
console.log('\n提示：优先修复源码中的硬编码与覆盖点（忽略 node_modules/dist/unpackage 等构建产物）。');