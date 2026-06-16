/**
 * Superdata RobotAI — Data Validation Script
 *
 * Usage: node scripts/validate.cjs [--links]
 *   --links   Also run HTTP HEAD check on all external URLs (slow, ~30s)
 *
 * Checks:
 *   1. JSON parse validity
 *   2. Required fields per entity type
 *   3. Cross-language consistency (zh/en IDs match)
 *   4. Year field presence
 *   5. Controlled vocabulary conformance
 *   6. URL format correctness
 *   7. Link health (optional, with --links flag)
 */

const fs = require('fs');
const http = require('http');
const https = require('https');

const RUN_LINKS = process.argv.includes('--links');
let errors = 0;
let warnings = 0;

function err(msg) { console.error('  ❌ ' + msg); errors++; }
function warn(msg) { console.warn('  ⚠️  ' + msg); warnings++; }
function ok(msg) { console.log('  ✅ ' + msg); }

// --- 1. JSON parsing ---
console.log('\n📋 1. JSON Parse Check');
const files = {
  'datasets (zh)': 'docs/data/datasets.json',
  'datasets (en)': 'docs/data/datasets.en.json',
  'standards (zh)': 'docs/data/standards.json',
  'standards (en)': 'docs/data/standards.en.json',
  'tools (zh)': 'docs/data/tools.json',
  'tools (en)': 'docs/data/tools.en.json',
  'blog': 'docs/data/blog.json',
};

const data = {};
for (const [name, path] of Object.entries(files)) {
  try {
    const raw = fs.readFileSync(path, 'utf8');
    data[name] = JSON.parse(raw);
    ok(`${name}: ${data[name].length} entries`);
  } catch (e) {
    err(`${name}: ${e.message}`);
  }
}

// --- 2. Required fields ---
console.log('\n📋 2. Required Fields');

const DATASET_REQUIRED = ['id', 'name', 'institution', 'robotType', 'task', 'modality', 'type', 'links', 'year'];
const STANDARD_REQUIRED = ['id', 'name', 'org', 'type', 'links'];
const TOOL_REQUIRED = ['id', 'name', 'institution', 'toolType', 'links'];
const BLOG_REQUIRED = ['id', 'title', 'date'];

function checkRequired(entries, required, entityType) {
  for (const e of entries) {
    for (const field of required) {
      if (!e[field] && e[field] !== 0) {
        err(`${entityType} "${e.name || e.id || '?'}" missing required field: ${field}`);
      }
    }
  }
}

if (data['datasets (zh)']) checkRequired(data['datasets (zh)'], DATASET_REQUIRED, 'Dataset');
if (data['standards (zh)']) checkRequired(data['standards (zh)'], STANDARD_REQUIRED, 'Standard');
if (data['tools (zh)']) checkRequired(data['tools (zh)'], TOOL_REQUIRED, 'Tool');
if (data['blog']) checkRequired(data['blog'], BLOG_REQUIRED, 'Blog');

// --- 3. Cross-language consistency ---
console.log('\n📋 3. Cross-language Consistency');

if (data['datasets (zh)'] && data['datasets (en)']) {
  const zhIds = new Set(data['datasets (zh)'].map(d => d.id));
  const enIds = new Set(data['datasets (en)'].map(d => d.id));

  if (zhIds.size !== enIds.size) {
    err(`Dataset count mismatch: zh=${zhIds.size} en=${enIds.size}`);
  }

  for (const id of zhIds) {
    if (!enIds.has(id)) err(`Dataset "${id}" exists in zh but not en`);
  }
  for (const id of enIds) {
    if (!zhIds.has(id)) err(`Dataset "${id}" exists in en but not zh`);
  }

  // Check year consistency
  const zhMap = new Map(data['datasets (zh)'].map(d => [d.id, d]));
  const enMap = new Map(data['datasets (en)'].map(d => [d.id, d]));
  for (const [id, d] of zhMap) {
    const en = enMap.get(id);
    if (en && d.year !== en.year) {
      warn(`Year mismatch for "${d.name}": zh=${d.year} en=${en.year}`);
    }
  }

  ok(`Datasets: ${zhIds.size} ids match`);
}

if (data['standards (zh)'] && data['standards (en)']) {
  const zhIds = new Set(data['standards (zh)'].map(d => d.id));
  const enIds = new Set(data['standards (en)'].map(d => d.id));
  const onlyZh = [...zhIds].filter(id => !enIds.has(id));
  const onlyEn = [...enIds].filter(id => !zhIds.has(id));
  for (const id of onlyZh) err(`Standard "${id}" in zh but not en`);
  for (const id of onlyEn) err(`Standard "${id}" in en but not zh`);
  ok(`Standards: ${zhIds.size} ids match`);
}

if (data['tools (zh)'] && data['tools (en)']) {
  const zhIds = new Set(data['tools (zh)'].map(d => d.id));
  const enIds = new Set(data['tools (en)'].map(d => d.id));
  const onlyZh = [...zhIds].filter(id => !enIds.has(id));
  const onlyEn = [...enIds].filter(id => !zhIds.has(id));
  for (const id of onlyZh) err(`Tool "${id}" in zh but not en`);
  for (const id of onlyEn) err(`Tool "${id}" in en but not zh`);
  ok(`Tools: ${zhIds.size} ids match`);
}

// --- 4. Year field ---
console.log('\n📋 4. Year Field Coverage');

if (data['datasets (zh)']) {
  const noYear = data['datasets (zh)'].filter(d => !d.year && d.year !== 0);
  const yearNull = data['datasets (zh)'].filter(d => d.year === null);
  if (noYear.length) err(`${noYear.length} datasets have no year field at all`);
  if (yearNull.length) warn(`${yearNull.length} datasets have year=null (needs research): ${yearNull.map(d => d.name).join(', ')}`);
  const withYear = data['datasets (zh)'].filter(d => d.year && d.year > 0).length;
  ok(`${withYear}/${data['datasets (zh)'].length} datasets have year`);

  // Year range sanity
  const years = data['datasets (zh)'].map(d => d.year).filter(y => y > 0);
  const minY = Math.min(...years), maxY = Math.max(...years);
  if (minY < 2000) warn(`Earliest year is ${minY} — verify`);
  if (maxY > new Date().getFullYear() + 1) warn(`Latest year is ${maxY} — in the future?`);
  ok(`Year range: ${minY} – ${maxY}`);
}

// --- 5. Controlled vocabularies ---
console.log('\n📋 5. Controlled Vocabularies');

const VALID_ROBOT_TYPES = ['人形机器人', '机械臂', '移动机器人', '四足机器人', '多机型', '触觉传感', '仿真', '灵巧手', '通用'];
const VALID_TASKS = ['操作', '抓取', '导航', '装配', '家居', '交互', '运动控制', '可供性分割', '3D运动预测', '接触点预测', '人机交互', '物体交互', '3D场景理解', '语义分割', '语言推理', '康养护理'];
const VALID_MODALITIES = ['视觉', '深度', '触觉', '本体状态', '动作', '音频', '文本', '力觉', '力矩', 'LiDAR', 'IMU', '眼动追踪', '表面肌电', 'RGB', '点云', '3D点云', '3D重建', '力控', '语言', '语义分割', '多视角视觉', '仿真状态'];
const VALID_TYPES = ['open', 'partial', 'apply', 'closed'];
const VALID_TOOL_TYPES = ['仿真器', '物理引擎', '训练框架', '可视化', '触觉模拟'];

if (data['datasets (zh)']) {
  for (const d of data['datasets (zh)']) {
    for (const rt of (d.robotType || [])) {
      if (!VALID_ROBOT_TYPES.includes(rt)) warn(`Dataset "${d.name}": unknown robotType "${rt}"`);
    }
    for (const t of (d.task || [])) {
      if (!VALID_TASKS.includes(t)) warn(`Dataset "${d.name}": unknown task "${t}"`);
    }
    for (const m of (d.modality || [])) {
      if (!VALID_MODALITIES.includes(m)) warn(`Dataset "${d.name}": unknown modality "${m}"`);
    }
    if (!VALID_TYPES.includes(d.type)) warn(`Dataset "${d.name}": unknown type "${d.type}"`);
  }
  ok('Dataset vocabularies checked');
}

if (data['tools (zh)']) {
  for (const t of data['tools (zh)']) {
    if (t.toolType && !VALID_TOOL_TYPES.includes(t.toolType)) {
      warn(`Tool "${t.name}": unknown toolType "${t.toolType}"`);
    }
  }
  ok('Tool vocabularies checked');
}

// --- 6. URL format ---
console.log('\n📋 6. URL Format');

if (data['datasets (zh)']) {
  for (const d of data['datasets (zh)']) {
    const official = d.links?.official;
    const paper = d.links?.paper;
    const hf = d.links?.huggingface || d.huggingface;

    if (official && !official.startsWith('http')) {
      err(`Dataset "${d.name}": official link not HTTP: ${official}`);
    }
    if (paper && !paper.startsWith('http')) {
      err(`Dataset "${d.name}": paper link not HTTP: ${paper}`);
    }
    // HuggingFace URL should use /datasets/ prefix
    if (hf && hf.includes('huggingface.co') && !hf.includes('/datasets/')) {
      warn(`Dataset "${d.name}": HuggingFace URL missing /datasets/ prefix: ${hf}`);
    }
  }
  ok('URL formats checked');
}

// --- 7. Link health (optional) ---
if (RUN_LINKS) {
  console.log('\n📋 7. Link Health Check');

  // Hosts that reliably reject HEAD — use GET with Range: bytes=0-0 instead
  const HEAD_UNFRIENDLY = ['arxiv.org', 'huggingface.co', 'openreview.net', 'sites.google.com',
    'github.io', 'proceedings.mlr.press', 'dl.acm.org', 'ieeexplore.ieee.org', 'link.springer.com'];
  // Hosts known to be slow — give them more timeout
  const SLOW_HOSTS = ['google.com', 'github.io', 'sites.google.com', 'openatom.tech', 'openatom.cn'];

  const allUrls = new Set();

  if (data['datasets (zh)']) {
    for (const d of data['datasets (zh)']) {
      if (d.links?.official) allUrls.add(d.links.official);
      if (d.links?.paper) allUrls.add(d.links.paper);
      if (d.links?.download) allUrls.add(d.links.download);
      if (d.links?.huggingface) allUrls.add(d.links.huggingface);
      if (d.github) allUrls.add(d.github);
      if (d.huggingface) allUrls.add(d.huggingface);
    }
  }
  if (data['standards (zh)']) {
    for (const s of data['standards (zh)']) {
      if (s.links?.official) allUrls.add(s.links.official);
      if (s.links?.paper) allUrls.add(s.links.paper);
    }
  }
  if (data['tools (zh)']) {
    for (const t of data['tools (zh)']) {
      if (t.links?.official) allUrls.add(t.links.official);
      if (t.links?.paper) allUrls.add(t.links.paper);
      if (t.github) allUrls.add(t.github);
    }
  }

  const urls = [...allUrls].filter(u => u && u.startsWith('http'));
  console.log(`  Checking ${urls.length} unique URLs...`);

  let checked = 0, dead = 0, timedOut = 0;
  const BATCH = 4;  // lower concurrency to avoid rate-limiting
  const MAX_RETRIES = 2;

  function isHeadUnfriendly(url) {
    return HEAD_UNFRIENDLY.some(h => url.includes(h));
  }
  function isSlow(url) {
    return SLOW_HOSTS.some(h => url.includes(h));
  }

  function checkUrlOnce(url, method) {
    return new Promise((resolve) => {
      const lib = url.startsWith('https') ? https : http;
      const timeoutMs = isSlow(url) ? 20000 : 10000;
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      };
      if (method === 'GET') {
        headers['Range'] = 'bytes=0-0';  // only fetch 1 byte
      }

      const req = lib.request(url, { method, timeout: timeoutMs, headers }, (res) => {
        // 2xx, 3xx are fine. 401/403 means the server responded (link exists, just requires auth).
        // 404 is a real dead link.
        if (res.statusCode === 404 || res.statusCode === 410) {
          resolve({ status: 'dead', code: res.statusCode });
        } else if (res.statusCode >= 500) {
          resolve({ status: 'server_error', code: res.statusCode });
        } else {
          // 2xx, 3xx, 401, 403 all mean the resource exists
          resolve({ status: 'ok', code: res.statusCode });
        }
      });
      req.on('error', (e) => {
        resolve({ status: 'error', msg: e.message });
      });
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 'timeout' });
      });
      req.end();
    });
  }

  async function checkUrl(url) {
    // Try HEAD first; if host is known unfriendly, use GET
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const method = (attempt === 0 && isHeadUnfriendly(url)) ? 'GET' : (attempt === 0 ? 'HEAD' : 'GET');
      const result = await checkUrlOnce(url, method);
      if (result.status === 'ok') return;
      if (result.status === 'dead') {
        err(`${result.code} ${url}`);
        dead++;
        return;
      }
      if (result.status === 'timeout') {
        if (attempt < MAX_RETRIES) continue;  // retry with GET
        warn(`Timeout (after ${MAX_RETRIES + 1} tries): ${url}`);
        timedOut++;
        return;
      }
      if (result.status === 'server_error') {
        if (attempt < MAX_RETRIES) continue;
        warn(`${result.code} ${url}`);
        return;
      }
      if (result.status === 'error') {
        if (attempt < MAX_RETRIES) continue;
        warn(`Connection failed: ${url} (${result.msg})`);
        return;
      }
    }
  }

  async function runAll() {
    for (let i = 0; i < urls.length; i += BATCH) {
      const batch = urls.slice(i, i + BATCH);
      await Promise.all(batch.map(checkUrl));
      checked += batch.length;
      process.stdout.write(`\r  ${checked}/${urls.length} — ${dead} dead, ${timedOut} timeout`);
    }
    console.log(`\n  Done: ${checked} checked, ${dead} dead, ${timedOut} timeout`);
    if (timedOut > 0) console.log('  (Timeouts are usually slow servers, not dead links — verify in browser if concerned)');
  }

  // Run async
  runAll().then(() => {
    printSummary();
    process.exit(errors > 0 ? 1 : 0);
  });
} else {
  printSummary();
}

function printSummary() {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Summary: ${errors} errors, ${warnings} warnings`);
  if (errors > 0) {
    console.log('❌ VALIDATION FAILED');
  } else if (warnings > 0) {
    console.log('⚠️  VALIDATION PASSED WITH WARNINGS');
  } else {
    console.log('✅ ALL CHECKS PASSED');
  }
  console.log(`${'='.repeat(50)}\n`);
}

if (!RUN_LINKS) {
  process.exit(errors > 0 ? 1 : 0);
}
