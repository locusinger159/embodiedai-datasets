const fs = require('fs');
const path = require('path');

// Read partials
const head = fs.readFileSync('src/partials/head.html', 'utf8');
const navbar = fs.readFileSync('src/partials/navbar.html', 'utf8');
const footer = fs.readFileSync('src/partials/footer.html', 'utf8');

// Read data
const datasets = JSON.parse(fs.readFileSync('docs/data/datasets.json', 'utf8'));
const standards = JSON.parse(fs.readFileSync('docs/data/standards.json', 'utf8'));

// Compute stats
const totalDatasets = datasets.length;
const allOrgs = new Set(datasets.map(d => d.institution).filter(Boolean));
const allRobotTypes = new Set(datasets.flatMap(d => d.robotType || []));
const totalStandards = standards.length;
const partnerNames = [...allOrgs].slice(0, 12);

// Build function
function buildPage(templateFile, replacements) {
  let html = fs.readFileSync(templateFile, 'utf8');
  const headWithMeta = head.replace('{{META}}', replacements.meta || '');
  html = html.replace('{{HEAD}}', headWithMeta);
  html = html.replace('{{NAVBAR}}', replacements.nav || navbar);
  html = html.replace('{{FOOTER}}', footer);
  for (const [key, val] of Object.entries(replacements)) {
    if (key === 'meta' || key === 'nav') continue;
    html = html.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), val);
  }
  return html;
}

// Clean dist
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });

// Homepage
fs.writeFileSync('dist/index.html', buildPage('src/pages/index.html', {
  meta: '<title>具身智能数据集导航 | EmbodiedAI Datasets</title><meta name="description" content="全球具身智能、机器人、人形机器人数据集情报站 | EmbodiedAI Datasets"><meta name="keywords" content="具身智能,机器人数据集,人形机器人,机械臂,开源数据集,机器人学习"><meta property="og:title" content="具身智能数据集导航 | EmbodiedAI Datasets"><meta property="og:description" content="全球机器人数据集情报站，助力算法研发"><meta property="og:type" content="website">',
  nav: navbar.replace('{{NAV_HOME}}', 'active').replace('{{NAV_DATASETS}}', '').replace('{{NAV_STANDARDS}}', '').replace('{{NAV_SUBMIT}}', ''),
  STAT_TOTAL: String(totalDatasets),
  STAT_ORGS: String(allOrgs.size),
  STAT_TYPES: String(allRobotTypes.size),
  STAT_STANDARDS: String(totalStandards),
  PARTNERS: partnerNames.map(n => `<span class="partner-item">${n}</span>`).join('\n')
}));

// Datasets page
fs.mkdirSync('dist/datasets', { recursive: true });
fs.writeFileSync('dist/datasets/index.html', buildPage('src/pages/datasets.html', {
  meta: '<title>全部数据集 | EmbodiedAI Datasets</title><meta name="description" content="浏览全部具身智能、机器人数据集">',
  nav: navbar.replace('{{NAV_HOME}}', '').replace('{{NAV_DATASETS}}', 'active').replace('{{NAV_STANDARDS}}', '').replace('{{NAV_SUBMIT}}', ''),
  DATASETS_JSON: JSON.stringify(datasets)
}));

// Standards page
fs.mkdirSync('dist/standards', { recursive: true });
fs.writeFileSync('dist/standards/index.html', buildPage('src/pages/standards.html', {
  meta: '<title>数据标准 | EmbodiedAI Datasets</title><meta name="description" content="具身智能行业数据标准与评测基准">',
  nav: navbar.replace('{{NAV_HOME}}', '').replace('{{NAV_DATASETS}}', '').replace('{{NAV_STANDARDS}}', 'active').replace('{{NAV_SUBMIT}}', ''),
  STANDARDS_JSON: JSON.stringify(standards)
}));

// Submit page
fs.mkdirSync('dist/submit', { recursive: true });
fs.writeFileSync('dist/submit/index.html', buildPage('src/pages/submit.html', {
  meta: '<title>提交数据集 | EmbodiedAI Datasets</title><meta name="description" content="提交新的具身智能数据集">',
  nav: navbar.replace('{{NAV_HOME}}', '').replace('{{NAV_DATASETS}}', '').replace('{{NAV_STANDARDS}}', '').replace('{{NAV_SUBMIT}}', 'active')
}));

// Copy static assets
const publicDir = 'docs/public';
if (fs.existsSync(publicDir)) {
  for (const f of fs.readdirSync(publicDir)) {
    fs.copyFileSync(path.join(publicDir, f), path.join('dist', f));
  }
}
fs.writeFileSync('dist/.nojekyll', '');

console.log(`Build complete: ${totalDatasets} datasets, ${totalStandards} standards, ${allOrgs.size} orgs`);
console.log('Output: dist/');
console.log('  dist/index.html');
console.log('  dist/datasets/index.html');
console.log('  dist/standards/index.html');
console.log('  dist/submit/index.html');
console.log('\nPreview: npx serve dist');
