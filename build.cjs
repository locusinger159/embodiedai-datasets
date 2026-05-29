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

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function buildSchemaTree(schema) {
  if (!schema) return '';
  const parts = schema.split('→').map(p => p.trim());
  let html = '';
  for (let i = 0; i < parts.length; i++) {
    html += `<div class="tree-node" style="margin-left:${i * 24}px">`;
    if (i > 0) html += '<span class="tree-line"></span>';
    html += `<span class="tree-label">${esc(parts[i])}</span>`;
    html += '</div>';
  }
  return html;
}

function buildDetailPage(ds) {
  const typeLabel = { open:'开源', partial:'部分开源', apply:'可申请', closed:'闭源' };
  const typeClass = { open:'type-open', partial:'type-partial', apply:'type-partial', closed:'type-closed' };
  const df = ds.dataFormat || {};
  const dc = ds.dataContent || {};
  const cit = ds.citation || {};

  // Schema
  const schemaHTML = buildSchemaTree(df.schema || (ds.modality||[]).join(' → '));

  // Sensors
  let sensorsHTML = '';
  const sensors = dc.sensors || ds.modality || [];
  if (sensors.length) {
    sensorsHTML = sensors.map(s => `<div class="content-stat"><span class="content-stat-value" style="font-weight:400">${esc(s)}</span></div>`).join('');
  } else {
    sensorsHTML = '<div class="empty-hint">暂无传感器规格信息</div>';
  }

  // Annotations
  let annotationsHTML = '';
  const anns = dc.annotations || [];
  if (anns.length) {
    annotationsHTML = '<div style="margin-top:16px"><div class="content-card"><h3>标注信息</h3><div class="data-tags">' + anns.map(a => `<span class="data-tag">${esc(a)}</span>`).join('') + '</div></div></div>';
  }

  // Quality badges
  const q = ds.quality || {};
  const qb = [];
  const collMap = {'遥操作采集':'good','人工遥操作采集':'good','多源聚合':'info','仿真生成':'info','未公开':'warn'};
  const annoMap = {'人工标注':'good','部分人工标注':'good','自动标注':'info','未公开':'warn'};
  const realMap = {'100%真机':'good','仿真':'info','未公开':'warn'};
  if (q.collection) qb.push({label:'🤖 ' + q.collection, cls: collMap[q.collection] || 'info'});
  if (q.annotation) qb.push({label:'✅ ' + q.annotation, cls: annoMap[q.annotation] || 'info'});
  if (q.realWorld) qb.push({label:q.realWorld === '100%真机' ? '🏠 ' + q.realWorld : '💻 ' + q.realWorld, cls: realMap[q.realWorld] || 'info'});
  if (q.hasSplit !== undefined) qb.push({label: q.hasSplit ? '📊 有数据划分' : '📊 无数据划分', cls: q.hasSplit ? 'good' : 'warn'});
  const qualityHTML = qb.length ? '<div class="quality-badges">' + qb.map(b => `<span class="quality-badge ${b.cls}">${b.label}</span>`).join('') + '</div>' : '';

  // Changelog
  const cl = ds.changelog || [];
  let changelogHTML = '';
  if (cl.length) {
    changelogHTML = '<div class="changelog section-block"><h2>更新历史</h2><div class="changelog-list">' + cl.map(c => `<div class="changelog-item"><div class="changelog-date">${esc(c.date)}</div><div class="changelog-text">${esc(c.text)}</div></div>`).join('') + '</div></div>';
  }

  // Links
  let linksHTML = '<div class="section-block"><h2>相关链接</h2><div class="links-section">';
  if (ds.links?.official) linksHTML += `<a href="${esc(ds.links.official)}" target="_blank" class="link-card" rel="noopener">🌐 官方网站</a>`;
  if (ds.links?.paper) linksHTML += `<a href="${esc(ds.links.paper)}" target="_blank" class="link-card" rel="noopener">📄 论文</a>`;
  if (ds.github) linksHTML += `<a href="${esc(ds.github)}" target="_blank" class="link-card" rel="noopener">💻 GitHub</a>`;
  if (ds.huggingface) linksHTML += `<a href="${esc(ds.huggingface)}" target="_blank" class="link-card" rel="noopener">🤗 HuggingFace</a>`;
  linksHTML += '</div></div>';
  if (!ds.links?.official && !ds.links?.paper && !ds.github && !ds.huggingface) linksHTML = '';

  // Citation
  let citationHTML = '';
  if (cit.bibtex) {
    citationHTML = '<div class="section-block"><h2>引用信息</h2><div class="citation-box"><pre>' + esc(cit.bibtex) + '</pre></div></div>';
  }

  // Related datasets (same robot type or same task)
  const related = datasets.filter(d => d.id !== ds.id && (
    (d.robotType || []).some(r => (ds.robotType || []).includes(r)) ||
    (d.task || []).some(t => (ds.task || []).includes(t))
  )).slice(0, 4);
  let relatedHTML = '';
  if (related.length) {
    relatedHTML = related.map(r => {
      const rt = (r.robotType || []).slice(0, 2).map(t => `<span class="data-tag">${esc(t)}</span>`).join('');
      return `<a href="/datasets/${esc(r.id)}/" class="related-card"><div class="related-name">${esc(r.name)}</div><div class="related-org">${esc(r.institution || '')}</div><div class="related-meta">${rt}</div></a>`;
    }).join('');
  } else {
    relatedHTML = '<div class="empty-hint">暂无相关数据集</div>';
  }

  const robotTypesHTML = (ds.robotType || []).map(t => `<span class="data-tag">${esc(t)}</span>`).join(' ') || '-';
  const taskTypesHTML = (ds.task || []).map(t => `<span class="data-tag">${esc(t)}</span>`).join(' ') || '-';
  const modalitiesHTML = (ds.modality || []).length ? (ds.modality || []).join('、') : '-';

  return buildPage('src/pages/dataset-detail.html', {
    meta: `<title>${esc(ds.name)} | EmbodiedAI Datasets</title><meta name="description" content="${esc((ds.notes || ds.description || '').substring(0, 160))}">`,
    nav: navbar.replace('{{NAV_HOME}}', '').replace('{{NAV_DATASETS}}', 'active').replace('{{NAV_STANDARDS}}', '').replace('{{NAV_SUBMIT}}', ''),
    NAME: esc(ds.name),
    TYPE_LABEL: typeLabel[ds.type] || ds.type,
    TYPE_CLASS: typeClass[ds.type] || '',
    INSTITUTION: esc(ds.institution || '未知机构'),
    DESCRIPTION: esc(ds.description || ds.notes || '暂无详细描述'),
    SCALE: esc(ds.scale || '暂无'),
    LICENSE: esc(ds.license || '未知'),
    ROBOT_TYPES: robotTypesHTML,
    TASK_TYPES: taskTypesHTML,
    MODALITIES: modalitiesHTML,
    FORMAT_STORAGE: esc(df.storage || '未知'),
    FORMAT_SIZE: esc(df.size || ds.scale || '未知'),
    FORMAT_COMPRESSION: esc(df.compression || '未知'),
    SCHEMA_ROOT: esc((df.schema || '').split('→')[0]?.trim() || '数据'),
    SCHEMA_TREE: schemaHTML,
    SENSORS: sensorsHTML,
    CONTENT_SCENES: esc(dc.scenes || '未知'),
    CONTENT_OBJECTS: esc(dc.objects || '未知'),
    CONTENT_TASKS: esc(dc.tasks || '未知'),
    CONTENT_EPISODES: esc(dc.episodes || ds.scale || '未知'),
    ANNOTATIONS: annotationsHTML,
    LINKS: linksHTML,
    CITATION: citationHTML,
    RELATED: relatedHTML,
    QUALITY_BADGES: qualityHTML,
    CHANGELOG: changelogHTML
  });
}

// ── Clean dist ───────────────────────────────────────────
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });

// ── Homepage ─────────────────────────────────────────────
fs.writeFileSync('dist/index.html', buildPage('src/pages/index.html', {
  meta: '<title>具身智能数据集导航 | EmbodiedAI Datasets</title><meta name="description" content="全球具身智能、机器人、人形机器人数据集情报站 | EmbodiedAI Datasets"><meta name="keywords" content="具身智能,机器人数据集,人形机器人,机械臂,开源数据集,机器人学习"><meta property="og:title" content="具身智能数据集导航 | EmbodiedAI Datasets"><meta property="og:description" content="全球机器人数据集情报站，助力算法研发"><meta property="og:type" content="website">',
  nav: navbar.replace('{{NAV_HOME}}', 'active').replace('{{NAV_DATASETS}}', '').replace('{{NAV_STANDARDS}}', '').replace('{{NAV_SUBMIT}}', ''),
  STAT_TOTAL: String(totalDatasets), STAT_ORGS: String(allOrgs.size), STAT_TYPES: String(allRobotTypes.size), STAT_STANDARDS: String(totalStandards),
  PARTNERS: partnerNames.map(n => `<span class="partner-item">${n}</span>`).join('\n')
}));

// ── Datasets list page ───────────────────────────────────
fs.mkdirSync('dist/datasets', { recursive: true });
fs.writeFileSync('dist/datasets/index.html', buildPage('src/pages/datasets.html', {
  meta: '<title>全部数据集 | EmbodiedAI Datasets</title><meta name="description" content="浏览全部具身智能、机器人数据集">',
  nav: navbar.replace('{{NAV_HOME}}', '').replace('{{NAV_DATASETS}}', 'active').replace('{{NAV_STANDARDS}}', '').replace('{{NAV_SUBMIT}}', ''),
  DATASETS_JSON: JSON.stringify(datasets)
}));

// ── Dataset detail pages ─────────────────────────────────
fs.mkdirSync('dist/datasets', { recursive: true });
for (const ds of datasets) {
  const dir = `dist/datasets/${ds.id}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/index.html`, buildDetailPage(ds));
}

// ── Standard detail pages ────────────────────────────────
function buildStandardDetail(ss) {
  const tL = {format:'数据格式',benchmark:'评测基准',industry:'行业标准',closed:'商业闭源'};
  const tC = {format:'type-format',benchmark:'type-benchmark',industry:'type-industry',closed:'type-closed-std'};
  const oL = {open:'完全开源',partial:'部分开源',standard:'行业标准',closed:'闭源'};
  const oC = {open:'type-open',partial:'type-partial',standard:'type-partial',closed:'type-closed'};
  const oD = {open:'●',partial:'◐',standard:'◆',closed:'○'};
  const scL = {real:'真机',sim:'仿真',general:'通用'};

  // Find related datasets (cross-reference by name mentions in notes, dataFormat, etc.)
  const relatedDS = datasets.filter(d => {
    const haystack = [d.notes || '', d.description || '', d.dataFormat?.storage || '', (d.name || '')].join(' ').toLowerCase();
    const keywords = [ss.name.toLowerCase(), ss.fullName.toLowerCase()];
    return d.id !== ss.id && keywords.some(k => haystack.includes(k));
  }).slice(0, 4);

  // Find related standards (same type or scene)
  const relatedST = standards.filter(s => s.id !== ss.id && (s.type === ss.type || (s.scene || []).some(sc => (ss.scene || []).includes(sc)))).slice(0, 4);

  // Links
  let linksHTML = '';
  if (ss.links?.site || ss.links?.github) {
    linksHTML = '<div class="section-block"><h2>相关链接</h2><div class="links-section">';
    if (ss.links?.site) linksHTML += `<a href="${esc(ss.links.site)}" target="_blank" class="link-card" rel="noopener">🌐 官方网站</a>`;
    if (ss.links?.github) linksHTML += `<a href="${esc(ss.links.github)}" target="_blank" class="link-card" rel="noopener">💻 GitHub</a>`;
    linksHTML += '</div></div>';
  }

  const relatedDSHTML = relatedDS.length
    ? relatedDS.map(d => `<a href="/datasets/${esc(d.id)}/" class="related-card"><div class="related-name">${esc(d.name)}</div><div class="related-org">${esc(d.institution || '')}</div><div class="related-meta">${(d.robotType || []).slice(0, 2).map(t => `<span class="data-tag">${esc(t)}</span>`).join('')}</div></a>`).join('')
    : '<div class="empty-hint">暂无关联数据集</div>';

  const relatedSTHTML = relatedST.length
    ? relatedST.map(s => `<a href="/standards/${esc(s.id)}/" class="related-card"><div class="related-name">${esc(s.name)}</div><div class="related-org">${esc(s.org)}</div><div class="related-meta"><span class="std-type-badge ${tC[s.type]||''}">${tL[s.type]||s.type}</span></div></div></a>`).join('')
    : '<div class="empty-hint">暂无相关标准</div>';

  const scenesHTML = (ss.scene || []).map(s => `<span class="data-tag">${scL[s] || s}</span>`).join(' ') || '-';
  const modalitiesHTML = (ss.modalities || []).length ? (ss.modalities || []).join('、') : '-';

  return buildPage('src/pages/standard-detail.html', {
    meta: `<title>${esc(ss.name)} | EmbodiedAI Datasets</title><meta name="description" content="${esc(ss.desc.substring(0, 160))}">`,
    nav: navbar.replace('{{NAV_HOME}}', '').replace('{{NAV_DATASETS}}', '').replace('{{NAV_STANDARDS}}', 'active').replace('{{NAV_SUBMIT}}', ''),
    NAME: esc(ss.name),
    FULLNAME: esc(ss.fullName || ''),
    TYPE_LABEL: tL[ss.type] || ss.type,
    TYPE_CLASS: tC[ss.type] || '',
    ORGANIZATION: esc(ss.org),
    DESCRIPTION: esc(ss.desc),
    LICENSE: esc(ss.license || '未知'),
    OPENNESS_CLASS: oC[ss.openness] || '',
    OPENNESS_DOT: oD[ss.openness] || '',
    OPENNESS_LABEL: oL[ss.openness] || ss.openness,
    SCENES: scenesHTML,
    MODALITIES: modalitiesHTML,
    LINKS: linksHTML,
    RELATED_DATASETS: relatedDSHTML,
    RELATED_STANDARDS: relatedSTHTML
  });
}

fs.mkdirSync('dist/standards', { recursive: true });
for (const ss of standards) {
  const dir = `dist/standards/${ss.id}`;
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(`${dir}/index.html`, buildStandardDetail(ss));
}

// ── Standards list page ───────────────────────────────────
fs.mkdirSync('dist/standards', { recursive: true });
fs.writeFileSync('dist/standards/index.html', buildPage('src/pages/standards.html', {
  meta: '<title>数据标准 | EmbodiedAI Datasets</title><meta name="description" content="具身智能行业数据标准与评测基准">',
  nav: navbar.replace('{{NAV_HOME}}', '').replace('{{NAV_DATASETS}}', '').replace('{{NAV_STANDARDS}}', 'active').replace('{{NAV_SUBMIT}}', ''),
  STANDARDS_JSON: JSON.stringify(standards)
}));

// ── Submit page ──────────────────────────────────────────
fs.mkdirSync('dist/submit', { recursive: true });
fs.writeFileSync('dist/submit/index.html', buildPage('src/pages/submit.html', {
  meta: '<title>提交数据集 | EmbodiedAI Datasets</title><meta name="description" content="提交新的具身智能数据集">',
  nav: navbar.replace('{{NAV_HOME}}', '').replace('{{NAV_DATASETS}}', '').replace('{{NAV_STANDARDS}}', '').replace('{{NAV_SUBMIT}}', 'active')
}));

// ── Copy static assets ───────────────────────────────────
const publicDir = 'docs/public';
if (fs.existsSync(publicDir)) {
  for (const f of fs.readdirSync(publicDir)) {
    fs.copyFileSync(path.join(publicDir, f), path.join('dist', f));
  }
}
fs.writeFileSync('dist/.nojekyll', '');

console.log(`Build complete: ${totalDatasets} datasets, ${totalStandards} standards, ${allOrgs.size} orgs`);
console.log(`Generated ${datasets.length} dataset detail pages`);
console.log('Output: dist/');
console.log('  dist/index.html');
console.log('  dist/datasets/index.html');
console.log('  dist/datasets/{id}/index.html x' + datasets.length);
console.log('  dist/standards/index.html');
console.log('  dist/submit/index.html');
console.log('\nPreview: npx serve dist');
