const fs = require('fs');
const path = require('path');

// Read partials
const head = fs.readFileSync('src/partials/head.html', 'utf8');
const navbar = fs.readFileSync('src/partials/navbar.html', 'utf8');
const footer = fs.readFileSync('src/partials/footer.html', 'utf8');
// Load search widget (optional — if file exists, it will be included via HEAD)
let searchWidget = '';
const searchWidgetPath = 'src/partials/search-widget.html';
if (fs.existsSync(searchWidgetPath)) {
  searchWidget = fs.readFileSync(searchWidgetPath, 'utf8');
}

// Read data
const datasets = JSON.parse(fs.readFileSync('docs/data/datasets.json', 'utf8'));
const standards = JSON.parse(fs.readFileSync('docs/data/standards.json', 'utf8'));

// Compute stats (for final log)
const totalDatasets = datasets.length;
const allOrgs = new Set(datasets.map(d => d.institution).filter(Boolean));
const allRobotTypes = new Set(datasets.flatMap(d => d.robotType || []));
const totalStandards = standards.length;
const partnerNames = [...allOrgs].slice(0, 12);

// i18n UI strings
const UI = {
  zh: {
    siteTitle: 'Superdata RobotAI — 具身智能数据集导航',
    siteDesc: '全球具身智能、机器人、人形机器人数据集情报站',
    home: '首页', datasets: '全部数据集', standards: '数据标准', tools: '工具/平台', submit: '提交数据集', blog: '技术博客',
    typeLabels: { open: '开源', partial: '部分开源', apply: '可申请', closed: '闭源' },
    robotLabels: { humanoid: '人形机器人', arm: '机械臂', mobile: '移动机器人', quadruped: '四足机器人', multi: '多机型', '触觉传感': '触觉传感', '仿真': '仿真', '灵巧手': '灵巧手', '通用': '通用' },
    taskLabels: { '操作': '操作', '抓取': '抓取', '导航': '导航', '装配': '装配', '家居': '家居', '交互': '交互', '运动控制': '运动控制', '可供性分割': '可供性分割', '3D运动预测': '3D运动预测', '接触点预测': '接触点预测', '人机交互': '人机交互', '物体交互': '物体交互', '3D场景理解': '3D场景理解', '语义分割': '语义分割', '语言推理': '语言推理' },
    standardTypeLabels: { format: '数据格式', benchmark: '评测基准', industry: '行业标准', closed: '商业闭源' },
    opennessLabels: { open: '完全开源', partial: '部分开源', standard: '行业标准', closed: '闭源' },
    sceneLabels: { real: '真机', sim: '仿真', general: '通用' },
  },
  en: {
    siteTitle: 'Superdata RobotAI — Robotics Dataset Navigator',
    siteDesc: 'A global intelligence hub for embodied AI, humanoid robots, and robotics datasets',
    home: 'Home', datasets: 'Datasets', standards: 'Standards', tools: 'Tools & Platforms', submit: 'Submit', blog: 'Blog',
    typeLabels: { open: 'Open', partial: 'Partial', apply: 'Apply', closed: 'Closed' },
    robotLabels: { humanoid: 'Humanoid', arm: 'Arm', mobile: 'Mobile', quadruped: 'Quadruped', multi: 'Multi-Type', '触觉传感': 'Tactile', '仿真': 'Simulation', '灵巧手': 'Dexterous Hand', '通用': 'General' },
    taskLabels: { '操作': 'Manipulation', '抓取': 'Grasping', '导航': 'Navigation', '装配': 'Assembly', '家居': 'Household', '交互': 'Interaction', '运动控制': 'Locomotion', '可供性分割': 'Affordance Seg.', '3D运动预测': '3D Motion', '接触点预测': 'Contact Pred.', '人机交互': 'HOI', '物体交互': 'Object Interact.', '3D场景理解': '3D Understanding', '语义分割': 'Segmentation', '语言推理': 'Lang. Reasoning' },
    standardTypeLabels: { format: 'Data Format', benchmark: 'Benchmark', industry: 'Industry Standard', closed: 'Proprietary' },
    opennessLabels: { open: 'Fully Open', partial: 'Partially Open', standard: 'Industry Standard', closed: 'Proprietary' },
    sceneLabels: { real: 'Real', sim: 'Simulation', general: 'General' },
  }
};

function buildAll(lang) {
  const ui = UI[lang];
  const isEn = lang === 'en';

  // Pick correct data files and partials
  const dataDatasets = isEn
    ? JSON.parse(fs.readFileSync('docs/data/datasets.en.json', 'utf8'))
    : datasets;
  const dataStandards = isEn
    ? JSON.parse(fs.readFileSync('docs/data/standards.en.json', 'utf8'))
    : standards;
  const dataTools = isEn
    ? JSON.parse(fs.readFileSync('docs/data/tools.en.json', 'utf8'))
    : JSON.parse(fs.readFileSync('docs/data/tools.json', 'utf8'));
  const navPartial = isEn
    ? fs.readFileSync('src/partials/navbar-en.html', 'utf8')
    : navbar;
  const footerPartial = isEn
    ? fs.readFileSync('src/partials/footer-en.html', 'utf8')
    : footer;
  const templateDir = 'src/pages/';  // same for both until en pages exist
  const outDir = isEn ? 'dist/en' : 'dist';

  // Compute stats for this language
  const totalDatasets = dataDatasets.length;
  const allOrgs = new Set(dataDatasets.map(d => d.institution).filter(Boolean));
  const allRobotTypes = new Set(dataDatasets.flatMap(d => d.robotType || []));
  const totalStandards = dataStandards.length;
  const partnerNames = [...allOrgs].slice(0, 12);

  function getActiveNav(page) {
    return navPartial
      .replace('{{NAV_HOME}}', page === 'home' ? 'active' : '')
      .replace('{{NAV_DATASETS}}', page === 'datasets' ? 'active' : '')
      .replace('{{NAV_STANDARDS}}', page === 'standards' ? 'active' : '')
      .replace('{{NAV_TOOLS}}', page === 'tools' ? 'active' : '')
      .replace('{{NAV_SUBMIT}}', page === 'submit' ? 'active' : '')
      .replace('{{NAV_BLOG}}', page === 'blog' ? 'active' : '');
  }

  function buildPage(templateFile, replacements) {
    let html = fs.readFileSync(templateFile, 'utf8');
    const headWithMeta = head.replace('{{META}}', replacements.meta || '');
    html = html.replace('{{HEAD}}', headWithMeta);
    html = html.replace('{{NAVBAR}}', replacements.nav || navPartial);
    html = html.replace('{{FOOTER}}', footerPartial);
    for (const [key, val] of Object.entries(replacements)) {
      if (key === 'meta' || key === 'nav') continue;
      html = html.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), val);
    }
    // Inject search widget before </body> if available
    if (searchWidget) {
      html = html.replace('</body>', searchWidget + '\n</body>');
    }
    return html;
  }

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function formatDescription(s) {
    if (!s || !String(s).trim()) return '<p>暂无详细描述</p>';
    let html = esc(String(s));
    // Auto-link URLs (before other transforms, since escaped content has no existing tags)
    html = html.replace(/(https?:\/\/[^\s<>"']+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Double newline → paragraph break
    html = html.replace(/\n\n/g, '</p><p>');
    // Single newline → <br>
    html = html.replace(/\n/g, '<br>');
    // Wrap in <p>
    return '<p>' + html + '</p>';
  }

  function splitOutsideParens(text, sep) {
    // Split by separator only when outside parentheses (including Chinese parens).
    // Recognizes patterns: " / ", "）/ ", " /（", etc.
    var parts = [];
    var depth = 0;
    var current = '';
    var i = 0;
    while (i < text.length) {
      var ch = text[i];
      if (ch === '(' || ch === '[' || ch === '（' || ch === '【') depth++;
      else if (ch === ')' || ch === ']' || ch === '）' || ch === '】') depth--;
      // Try to split when we see sep outside parens
      if (depth === 0 && ch === sep) {
        var prevCh = i > 0 ? text[i - 1] : '';
        var nextCh = i < text.length - 1 ? text[i + 1] : '';
        var prevSep = prevCh === ' ' || prevCh === ')' || prevCh === ']' || prevCh === '）' || prevCh === '】';
        var nextSep = nextCh === ' ' || nextCh === '(' || nextCh === '[' || nextCh === '（' || nextCh === '【';
        if (prevSep && nextSep) {
          // Trim trailing space
          var part = current;
          if (part.length > 0 && part[part.length - 1] === ' ') part = part.slice(0, -1);
          if (part.trim()) parts.push(part.trim());
          current = '';
          i++;
          if (i < text.length && text[i] === ' ') i++; // skip trailing space
          continue;
        }
      }
      current += ch;
      i++;
    }
    if (current.trim()) parts.push(current.trim());
    return parts.length > 0 ? parts : [text];
  }

  function buildSchemaTree(schema) {
    if (!schema) return '';
    // 1. Split by → for nesting hierarchy
    const levels = schema.split('→').map(function(p) { return p.trim(); });
    // 2. Split each level by / (siblings at same depth)
    const nodes = []; // [{text, depth, isRoot}]
    for (let i = 0; i < levels.length; i++) {
      const siblings = splitOutsideParens(levels[i], '/');
      for (let j = 0; j < siblings.length; j++) {
        nodes.push({ text: siblings[j], depth: i, isRoot: i === 0 && j === 0 });
      }
    }
    // 3. Render tree: increase depth for →, siblings at same margin
    let html = '';
    for (let k = 0; k < nodes.length; k++) {
      const node = nodes[k];
      html += '<div class="tree-node" style="margin-left:' + (node.depth * 24) + 'px">';
      if (node.depth > 0) html += '<span class="tree-line"></span>';
      html += '<span class="tree-label' + (node.isRoot ? ' root' : '') + '">' + esc(node.text) + '</span>';
      html += '</div>';
    }
    return html;
  }

  function buildDetailPage(ds) {
    const typeLabel = ui.typeLabels;
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
      sensorsHTML = '<div class="empty-hint">{{EMPTY_SENSORS}}</div>';
    }

    // Annotations
    let annotationsHTML = '';
    const anns = dc.annotations || [];
    if (anns.length) {
      annotationsHTML = '<div style="margin-top:16px"><div class="content-card"><h3>{{SECTION_ANNOTATIONS}}</h3><div class="data-tags">' + anns.map(a => `<span class="data-tag">${esc(a)}</span>`).join('') + '</div></div></div>';
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
      changelogHTML = '<div class="changelog section-block"><h2>{{SECTION_CHANGELOG}}</h2><div class="changelog-list">' + cl.map(c => `<div class="changelog-item"><div class="changelog-date">${esc(c.date)}</div><div class="changelog-text">${esc(c.text)}</div></div>`).join('') + '</div></div>';
    }

    // Links
    let linksHTML = '<div class="section-block"><h2>{{SECTION_LINKS}}</h2><div class="links-section">';
    if (ds.links?.official) linksHTML += `<a href="${esc(ds.links.official)}" target="_blank" class="link-card" rel="noopener">🌐 官方网站</a>`;
    if (ds.links?.paper) linksHTML += `<a href="${esc(ds.links.paper)}" target="_blank" class="link-card" rel="noopener">📄 论文</a>`;
    if (ds.github) linksHTML += `<a href="${esc(ds.github)}" target="_blank" class="link-card" rel="noopener">💻 GitHub</a>`;
    if (ds.huggingface) linksHTML += `<a href="${esc(ds.huggingface)}" target="_blank" class="link-card" rel="noopener">🤗 HuggingFace</a>`;
    linksHTML += '</div></div>';
    if (!ds.links?.official && !ds.links?.paper && !ds.github && !ds.huggingface) linksHTML = '';

    // Citation
    let citationHTML = '';
    if (cit.bibtex) {
      citationHTML = '<div class="section-block"><h2>{{SECTION_CITATION}}</h2><div class="citation-box"><pre>' + esc(cit.bibtex) + '</pre></div></div>';
    }

    // Related datasets — weighted by shared robotType (×3) + shared task (×2)
    const related = dataDatasets
      .filter(d => d.id !== ds.id)
      .map(d => {
        const sharedRT = (d.robotType || []).filter(r => (ds.robotType || []).includes(r)).length;
        const sharedTask = (d.task || []).filter(t => (ds.task || []).includes(t)).length;
        return { ...d, _score: sharedRT * 3 + sharedTask * 2 };
      })
      .filter(d => d._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 4);
    let relatedHTML = '';
    if (related.length) {
      relatedHTML = related.map(r => {
        const rt = (r.robotType || []).slice(0, 2).map(t => `<span class="data-tag">${esc(t)}</span>`).join('');
        return `<a href="/datasets/${esc(r.id)}/" class="related-card"><div class="related-name">${esc(r.name)}</div><div class="related-org">${esc(r.institution || '')}</div><div class="related-meta">${rt}</div></a>`;
      }).join('');
    } else {
      relatedHTML = '<div class="empty-hint">{{EMPTY_RELATED}}</div>';
    }

    const robotTypesHTML = (ds.robotType || []).map(t => `<span class="data-tag">${esc(t)}</span>`).join(' ') || '-';
    const taskTypesHTML = (ds.task || []).map(t => `<span class="data-tag">${esc(t)}</span>`).join(' ') || '-';
    const modalitiesHTML = (ds.modality || []).length ? (ds.modality || []).join('、') : '-';

    // Related standards (by explicit standards field)
    const standardIds = ds.standards || [];
    const relatedStandards = standardIds
      .map(sid => dataStandards.find(s => s.id === sid))
      .filter(Boolean);
    let relatedStandardsSectionHTML = '';
    if (relatedStandards.length) {
      const tL2 = ui.standardTypeLabels;
      const tC2 = {format:'type-format',benchmark:'type-benchmark',industry:'type-industry'};
      relatedStandardsSectionHTML = '<div class="section-block"><h2>' + (isEn ? 'Data Standards' : '采用的数据标准') + '</h2><div class="related-grid">' +
        relatedStandards.map(s => {
          return `<a href="/standards/${esc(s.id)}/" class="related-card"><div class="related-name">${esc(s.name)}</div><div class="related-org">${esc(s.org)}</div><div class="related-meta"><span class="std-type-badge ${tC2[s.type]||''}">${tL2[s.type]||s.type}</span></div></a>`;
        }).join('') + '</div></div>';
    }

    return buildPage('src/pages/dataset-detail.html', {
      meta: `<title>${esc(ds.name)} | Superdata RobotAI</title><meta name="description" content="${esc((ds.notes || ds.description || '').substring(0, 160))}">`,
      nav: getActiveNav('datasets'),
      NAME: esc(ds.name),
      TYPE_LABEL: typeLabel[ds.type] || ds.type,
      TYPE_CLASS: typeClass[ds.type] || '',
      INSTITUTION: esc(ds.institution || '未知机构'),
      DESCRIPTION: formatDescription(ds.description || ds.notes || '暂无详细描述'),
      SCALE: esc(ds.scale || '暂无'),
      LICENSE: esc(ds.license || '未知'),
      ROBOT_TYPES: robotTypesHTML,
      TASK_TYPES: taskTypesHTML,
      MODALITIES: modalitiesHTML,
      FORMAT_STORAGE: esc(df.storage || '未知'),
      FORMAT_SIZE: esc(df.size || ds.scale || '未知'),
      FORMAT_COMPRESSION: esc(df.compression || '未知'),
      SCHEMA_TREE: schemaHTML
        ? '<div class="schema-tree" style="margin-top:16px">' + schemaHTML + '</div>'
        : '',
      SENSORS: sensorsHTML,
      CONTENT_SCENES: esc(dc.scenes || '未知'),
      CONTENT_OBJECTS: esc(dc.objects || '未知'),
      CONTENT_TASKS: esc(dc.tasks || '未知'),
      CONTENT_EPISODES: esc(dc.episodes || ds.scale || '未知'),
      ANNOTATIONS: annotationsHTML,
      LINKS: linksHTML,
      CITATION: citationHTML,
      RELATED: relatedHTML,
      RELATED_STANDARDS_SECTION: relatedStandardsSectionHTML,
      QUALITY_BADGES: qualityHTML,
      CHANGELOG: changelogHTML,
      BACK_TO_DATASETS: isEn ? '← Back to Datasets' : '← 返回全部数据集',
      SECTION_DATA_FORMAT: isEn ? 'Data Format' : '数据格式',
      SECTION_DATA_CONTENT: isEn ? 'Data Content' : '数据内容',
      SECTION_SENSORS: isEn ? 'Sensor Specifications' : '传感器规格',
      SECTION_DATA_STATS: isEn ? 'Data Statistics' : '数据统计',
      SECTION_ANNOTATIONS: isEn ? 'Annotations' : '标注信息',
      SECTION_LINKS: isEn ? 'Links' : '相关链接',
      SECTION_CITATION: isEn ? 'Citation' : '引用信息',
      SECTION_RELATED: isEn ? 'Related Datasets' : '相关数据集',
      SECTION_DISCUSSION: isEn ? 'Discussion' : '讨论',
      SECTION_CHANGELOG: isEn ? 'Changelog' : '更新历史',
      EMPTY_SENSORS: isEn ? 'No sensor specifications available' : '暂无传感器规格信息',
      EMPTY_RELATED: isEn ? 'No related datasets' : '暂无相关数据集',
      LABEL_INSTITUTION: isEn ? 'Institution' : '机构',
      LABEL_SCALE: isEn ? 'Scale' : '规模',
      LABEL_LICENSE: isEn ? 'License' : '许可证',
      LABEL_ROBOT_TYPE: isEn ? 'Robot Type' : '机器人类型',
      LABEL_TASK_TYPE: isEn ? 'Task Type' : '任务类型',
      LABEL_MODALITY: isEn ? 'Modality' : '数据模态'
    });
  }

  function buildStandardDetail(ss) {
    const tL = ui.standardTypeLabels;
    const tC = {format:'type-format',benchmark:'type-benchmark',industry:'type-industry',closed:'type-closed-std'};
    const oL = ui.opennessLabels;
    const oC = {open:'type-open',partial:'type-partial',standard:'type-partial',closed:'type-closed'};
    const oD = {open:'●',partial:'◐',standard:'◆',closed:'○'};
    const scL = ui.sceneLabels;

    // Find related datasets by explicit standards field
    const relatedDS = (ss.datasetIds || [])
      .map(did => dataDatasets.find(d => d.id === did))
      .filter(Boolean)
      .slice(0, 8);

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

    const scenesHTML = (ss.scene || []).map(s => `<span class="data-tag">${scL[s] || s}</span>`).join(' ') || '-';
    const modalitiesHTML = (ss.modalities || []).length ? (ss.modalities || []).join('、') : '-';

    // Requirements rendering
    const reqs = ss.requirements || [];
    let requirementsHTML = '';
    if (reqs.length) {
      const levelLabels = { must: isEn ? 'MUST' : '必须', should: isEn ? 'SHOULD' : '建议', may: isEn ? 'MAY' : '可选' };
      const levelIcons = { must: '🔴', should: '🟡', may: '🟢' };
      var catMap = {};
      for (var ri = 0; ri < reqs.length; ri++) {
        var r = reqs[ri];
        var cat = r.category || (isEn ? 'General' : '通用');
        if (!catMap[cat]) catMap[cat] = [];
        catMap[cat].push(r);
      }
      requirementsHTML = '<div class="section-block"><h2>' + (isEn ? '📋 Normative Requirements' : '📋 规范性要求') + '</h2><div class="requirements-list">';
      for (var catName in catMap) {
        var items = catMap[catName];
        requirementsHTML += '<div class="req-category"><div class="req-category-name">' + esc(catName) + '</div>';
        for (var ri2 = 0; ri2 < items.length; ri2++) {
          var r2 = items[ri2];
          requirementsHTML += '<div class="req-item req-' + esc(r2.level) + '">';
          requirementsHTML += '<span class="req-badge req-badge-' + esc(r2.level) + '">' + (levelIcons[r2.level] || '') + ' ' + (levelLabels[r2.level] || r2.level) + '</span>';
          requirementsHTML += '<div class="req-body"><div class="req-text">' + esc(r2.text) + '</div>';
          if (r2.detail) requirementsHTML += '<div class="req-detail">' + esc(r2.detail) + '</div>';
          requirementsHTML += '</div></div>';
        }
        requirementsHTML += '</div>';
      }
      requirementsHTML += '</div></div>';
    }

    return buildPage('src/pages/standard-detail.html', {
      meta: `<title>${esc(ss.name)} | Superdata RobotAI</title><meta name="description" content="${esc(ss.desc.substring(0, 160))}">`,
      nav: getActiveNav('standards'),
      NAME: esc(ss.name),
      FULLNAME: esc(ss.fullName || ''),
      TYPE_LABEL: tL[ss.type] || ss.type,
      TYPE_CLASS: tC[ss.type] || '',
      ORGANIZATION: esc(ss.org),
      DESCRIPTION: formatDescription(ss.desc),
      LICENSE: esc(ss.license || '未知'),
      OPENNESS_CLASS: oC[ss.openness] || '',
      OPENNESS_DOT: oD[ss.openness] || '',
      OPENNESS_LABEL: oL[ss.openness] || ss.openness,
      SCENES: scenesHTML,
      MODALITIES: modalitiesHTML,
      LINKS: linksHTML,
      REQUIREMENTS: requirementsHTML,
      RELATED_DATASETS: relatedDSHTML
    });
  }

  // ── Homepage ─────────────────────────────────────────────
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(`${outDir}/index.html`, buildPage(`${templateDir}index.html`, {
    meta: `<title>${ui.siteTitle}</title><meta name="description" content="${ui.siteDesc}"><meta name="keywords" content="具身智能,机器人数据集,人形机器人,机械臂,开源数据集,机器人学习"><meta property="og:title" content="${ui.siteTitle}"><meta property="og:description" content="${ui.siteDesc}"><meta property="og:type" content="website">`,
    nav: getActiveNav('home'),
    STAT_TOTAL: String(totalDatasets), STAT_ORGS: String(allOrgs.size), STAT_TYPES: String(allRobotTypes.size), STAT_STANDARDS: String(totalStandards),
    PARTNERS: partnerNames.map(n => `<span class="partner-item">${n}</span>`).join('\n')
  }));

  // ── Datasets list page ───────────────────────────────────
  const i18nJS = `window.I18N = ${JSON.stringify({
  typeLabels: ui.typeLabels,
  robotLabels: ui.robotLabels,
  taskLabels: ui.taskLabels,
  searchPlaceholder: isEn ? 'Search dataset name, institution, task type...' : '搜索数据集名称、机构、任务类型...',
  robotType: isEn ? 'Robot Type' : '机器人类型',
  taskType: isEn ? 'Task Type' : '任务类型',
  openness: isEn ? 'Access Level' : '开放程度',
  sortYear: isEn ? 'Time ↓' : '时间排序 ↓',
  sortName: isEn ? 'Name' : '名称排序',
  sortOrg: isEn ? 'Institution' : '机构排序',
  clearFilters: isEn ? 'Clear Filters' : '清除筛选',
  compareTextPrefix: isEn ? 'Selected ' : '已选择 ',
  compareTextSuffix: isEn ? ' datasets' : ' 个数据集',
  compareBtn: isEn ? 'Compare' : '开始对比',
  compareClear: isEn ? 'Clear' : '清除',
  compareTitle: isEn ? 'Dataset Comparison' : '数据集对比',
  highlightDiff: isEn ? 'Highlight Differences' : '高亮不同',
  formatStorage: isEn ? 'Storage Format' : '存储格式',
  formatSize: isEn ? 'Data Size' : '数据大小',
  formatCompression: isEn ? 'Compression' : '压缩方式',
  formatSchema: isEn ? 'Schema' : 'Schema',
  qualityCollection: isEn ? 'Collection Method' : '采集方式',
  qualityAnnotation: isEn ? 'Annotation' : '标注方式',
  qualityRealWorld: isEn ? 'Real-World Ratio' : '真机占比',
  qualityHasSplit: isEn ? 'Data Split' : '数据划分',
  hasSplitYes: isEn ? 'Yes' : '有',
  hasSplitNo: isEn ? 'No' : '无',
  noResults: isEn ? 'No matching datasets found.' : '没有匹配的数据集。',
  tagFilter: isEn ? 'Trending Tags' : '热门标签',
  resultCount: isEn ? 'Found' : '找到',
})};`;
  fs.mkdirSync(`${outDir}/datasets`, { recursive: true });
  fs.writeFileSync(`${outDir}/datasets/index.html`, buildPage(`${templateDir}datasets.html`, {
    meta: `<title>${ui.datasets} | Superdata RobotAI</title><meta name="description" content="${isEn ? 'Browse all embodied AI and robotics datasets' : '浏览全部具身智能、机器人数据集'}">`,
    nav: getActiveNav('datasets'),
    I18N_JS: i18nJS,
    DATASETS_JSON: JSON.stringify(dataDatasets)
  }));

  // ── Dataset detail pages ─────────────────────────────────
  for (const ds of dataDatasets) {
    const dir = `${outDir}/datasets/${ds.id}`;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/index.html`, buildDetailPage(ds));
  }

  // ── Standards list page ───────────────────────────────────
  fs.mkdirSync(`${outDir}/standards`, { recursive: true });
  fs.writeFileSync(`${outDir}/standards/index.html`, buildPage(`${templateDir}standards.html`, {
    meta: `<title>${ui.standards} | Superdata RobotAI</title><meta name="description" content="${isEn ? 'Industry data standards and benchmarks for embodied AI' : '具身智能行业数据标准与评测基准'}">`,
    nav: getActiveNav('standards'),
    STANDARDS_JSON: JSON.stringify(dataStandards)
  }));

  // ── Standard detail pages ────────────────────────────────
  for (const ss of dataStandards) {
    const dir = `${outDir}/standards/${ss.id}`;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/index.html`, buildStandardDetail(ss));
  }

  // ── Tools & Platforms list page ───────────────────────────
  const toolsI18N = {
    typeLabels: ui.typeLabels,
    robotLabels: ui.robotLabels,
    taskLabels: ui.taskLabels,
  };
  fs.mkdirSync(`${outDir}/tools`, { recursive: true });
  fs.writeFileSync(`${outDir}/tools/index.html`, buildPage(`${templateDir}tools.html`, {
    meta: `<title>${ui.tools} | Superdata RobotAI</title><meta name="description" content="${isEn ? 'Robotics simulation platforms, toolkits, and infrastructure' : '机器人仿真平台、工具链与基础设施'}">`,
    nav: getActiveNav('tools'),
    TOOLS_PAGE_TITLE: isEn ? 'Tools & Platforms' : '工具/平台',
    TOOLS_PAGE_SUBTITLE: isEn ? 'Robotics simulation environments, data toolkits, and infrastructure' : '机器人仿真环境、数据处理工具链与基础设施',
    TOOLS_JSON: JSON.stringify(dataTools),
    I18N_JS: `window.I18N = ${JSON.stringify(toolsI18N)};`
  }));

  // ── Tool detail pages ─────────────────────────────────────
  for (const tool of dataTools) {
    const dir = `${outDir}/tools/${tool.id}`;
    fs.mkdirSync(dir, { recursive: true });
    const typeLabel = ui.typeLabels;
    const typeClass = { open:'type-open', partial:'type-partial', apply:'type-partial', closed:'type-closed' };
    const cit = tool.citation || {};
    const links = tool.links || {};
    const robotTypes = (tool.robotType || []).map(r => ui.robotLabels[r] || r).join(', ') || '-';
    const taskTypes = (tool.task || []).map(t => ui.taskLabels[t] || t).join(', ') || '-';

    let linksHTML = '<div class="links-section">';
    if (links.official) linksHTML += `<a href="${esc(links.official)}" target="_blank" class="link-card" rel="noopener">🏠 ${isEn ? 'Official Site' : '官方网站'}</a>`;
    if (links.paper) linksHTML += `<a href="${esc(links.paper)}" target="_blank" class="link-card" rel="noopener">📄 Paper</a>`;
    if (tool.github) linksHTML += `<a href="${esc(tool.github)}" target="_blank" class="link-card" rel="noopener">💻 GitHub</a>`;
    if (tool.huggingface) { const hf = tool.huggingface.startsWith('http') ? tool.huggingface : `https://huggingface.co/${tool.huggingface}`; linksHTML += `<a href="${esc(hf)}" target="_blank" class="link-card" rel="noopener">🤗 Hugging Face</a>`; }
    linksHTML += '</div>';

    let citationHTML = '';
    if (cit.bibtex) citationHTML = `<div class="section-block"><h2>${isEn ? 'Citation (BibTeX)' : '引用格式 (BibTeX)'}</h2><div class="citation-box"><pre>${esc(cit.bibtex)}</pre></div></div>`;
    else if (cit.year) citationHTML = `<div class="section-block"><h2>${isEn ? 'Citation' : '引用'}</h2><div class="citation-box"><pre>${esc(cit.authors || tool.institution || '')}, ${cit.year}${cit.venue ? ', ' + cit.venue : ''}</pre></div></div>`;

    fs.writeFileSync(`${dir}/index.html`, buildPage(`${templateDir}tool-detail.html`, {
      meta: `<title>${esc(tool.name)} | Superdata RobotAI</title><meta name="description" content="${esc((tool.notes || '').substring(0, 160))}">`,
      nav: getActiveNav('tools'),
      NAME: esc(tool.name),
      TYPE_LABEL: typeLabel[tool.type] || tool.type,
      TYPE_CLASS: typeClass[tool.type] || '',
      INSTITUTION: esc(tool.institution || ''),
      DESCRIPTION: formatDescription(tool.description || tool.notes || ''),
      LICENSE: esc(tool.license || '未知'),
      ROBOT_TYPES: robotTypes,
      TASK_TYPES: taskTypes,
      LINKS: linksHTML,
      CITATION: citationHTML,
      BACK_TO_TOOLS: isEn ? '← Back to Tools' : '← 返回工具/平台',
      LABEL_INSTITUTION: isEn ? 'Institution' : '机构',
      LABEL_LICENSE: isEn ? 'License' : '协议',
      LABEL_ROBOT_TYPE: isEn ? 'Platform Type' : '平台类型',
      LABEL_TASK_TYPE: isEn ? 'Use Case' : '适用场景',
    }));
  }

  // ── Submit page ──────────────────────────────────────────
  fs.mkdirSync(`${outDir}/submit`, { recursive: true });
  fs.writeFileSync(`${outDir}/submit/index.html`, buildPage(`${templateDir}submit.html`, {
    meta: `<title>${ui.submit} | Superdata RobotAI</title><meta name="description" content="${isEn ? 'Submit a new embodied AI dataset' : '提交新的具身智能数据集'}">`,
    nav: getActiveNav('submit')
  }));

  // ── Blog ────────────────────────────────────────────────
  const blogFile = 'docs/data/blog.json';
  let blogPosts = [];
  if (fs.existsSync(blogFile)) {
    blogPosts = JSON.parse(fs.readFileSync(blogFile, 'utf8'));
    blogPosts.sort((a, b) => b.date.localeCompare(a.date));
  }

  if (blogPosts.length > 0) {
    const blogDir = outDir + '/blog';
    fs.mkdirSync(blogDir, { recursive: true });

    // Blog cards for list page
    const blogCardsHTML = blogPosts.map(p => {
      const title = isEn ? (p.titleEn || p.title) : p.title;
      const summary = isEn ? (p.summaryEn || p.summary) : p.summary;
      const tags = isEn ? (p.tagsEn || p.tags) : p.tags;
      return '<article class="blog-card"><a href="/' + (isEn ? 'en/' : '') + 'blog/' + esc(p.id) + '/" class="blog-card-link"><h2 class="blog-card-title">' + esc(title) + '</h2><time class="blog-card-date">' + esc(p.date) + '</time><p class="blog-card-summary">' + esc(summary) + '</p><div class="blog-card-tags">' + (tags || []).map(t => '<span class="blog-tag">' + esc(t) + '</span>').join('') + '</div></a></article>';
    }).join('');

    // Blog list page
    fs.writeFileSync(blogDir + '/index.html', buildPage('src/pages/blog.html', {
      meta: '<title>' + ui.blog + ' | Superdata RobotAI</title><meta name="description" content="' + (isEn ? 'Technical blog on embodied AI datasets and data standards' : '具身智能数据集技术博客') + '">',
      nav: getActiveNav('blog'),
      BLOG_CARDS: blogCardsHTML,
      BLOG_PAGE_TITLE: isEn ? 'Technical Blog' : '技术博客',
      BLOG_PAGE_SUBTITLE: isEn ? 'Deep dives into embodied AI datasets, data standards, and industry trends' : '深入分析具身智能数据集、数据标准与行业趋势',
    }));

    // Blog detail pages
    for (const post of blogPosts) {
      const detailDir = blogDir + '/' + post.id;
      fs.mkdirSync(detailDir, { recursive: true });
      const title = isEn ? (post.titleEn || post.title) : post.title;
      const content = isEn ? (post.contentHtmlEn || post.contentHtml) : post.contentHtml;
      const tags = isEn ? (post.tagsEn || post.tags) : post.tags;

      fs.writeFileSync(detailDir + '/index.html', buildPage('src/pages/blog-detail.html', {
        meta: '<title>' + esc(title) + ' | Superdata RobotAI</title><meta name="description" content="' + esc((isEn ? (post.summaryEn || post.summary) : post.summary).substring(0, 160)) + '">',
        nav: getActiveNav('blog'),
        BLOG_TITLE: esc(title),
        BLOG_DATE: esc(post.date),
        BLOG_AUTHOR: esc(post.author || 'Superdata RobotAI'),
        BLOG_AUTHOR_LABEL: isEn ? 'By' : '作者',
        BLOG_TAGS: (tags || []).map(t => '<span class="blog-tag">' + esc(t) + '</span>').join(''),
        BLOG_CONTENT: content,
        BACK_TO_BLOG: isEn ? '← Back to Blog' : '← 返回博客',
      }));
    }

    // RSS feed (only for Chinese build, placed at dist root)
    if (!isEn) {
      const rssItems = blogPosts.map(p => '<item><title>' + esc(p.title) + '</title><link>https://superdata-robotai.com/blog/' + esc(p.id) + '/</link><description>' + esc(p.summary) + '</description><pubDate>' + new Date(p.date).toUTCString() + '</pubDate><guid>https://superdata-robotai.com/blog/' + esc(p.id) + '/</guid></item>').join('\n');
      const rss = '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n  <title>Superdata RobotAI Blog</title>\n  <link>https://superdata-robotai.com/blog/</link>\n  <description>具身智能数据集技术博客</description>\n  <language>zh-CN</language>\n' + rssItems + '\n</channel>\n</rss>';
      fs.writeFileSync('dist/rss.xml', rss);
    }
  }

  // ── Format panorama ──────────────────────────────────────
  function buildFormatData(dss) {
    const storageCounts = {};
    const sensorCounts = {};
    let standardCount = 0;
    const schemaDepths = {};

    dss.forEach(d => {
      const df = d.dataFormat || {};
      const dc = d.dataContent || {};
      const storage = df.storage || 'Unknown';
      storageCounts[storage] = (storageCounts[storage] || 0) + 1;
      const schema = df.schema || '';
      const depth = schema.split('→').length;
      schemaDepths[depth] = (schemaDepths[depth] || 0) + 1;
      if (['RLDS', 'TFDS', 'HDF5'].some(s => (df.storage || '').includes(s))) standardCount++;
      (dc.sensors || d.modality || []).forEach(s => { sensorCounts[s] = (sensorCounts[s] || 0) + 1; });
    });

    return {
      totalDatasets: dss.length,
      storageCounts,
      sensorCounts,
      standardFormatRatio: Math.round(standardCount / dss.length * 100),
      schemaDepths
    };
  }

  const formatsDir = outDir + '/formats';
  fs.mkdirSync(formatsDir, { recursive: true });
  fs.writeFileSync(formatsDir + '/index.html', buildPage('src/pages/formats.html', {
    meta: '<title>' + (isEn ? 'Data Format Panorama' : '数据格式全景图') + ' | Superdata RobotAI</title>',
    nav: getActiveNav('datasets'),
    FORMATS_JSON: JSON.stringify(buildFormatData(dataDatasets)),
    FORMATS_PAGE_TITLE: isEn ? 'Data Format Panorama' : '数据格式全景图',
    FORMATS_PAGE_SUBTITLE: isEn ? 'Global view of dataset format distribution, schema structures, and sensor coverage' : '全局视角查看数据集格式分布、Schema 结构与传感器覆盖',
    FORMATS_STORAGE_TITLE: isEn ? 'Storage Format Distribution' : '存储格式分布',
    FORMATS_SCHEMA_TITLE: isEn ? 'Schema Depth Distribution' : 'Schema 层级分布',
    FORMATS_SENSOR_TITLE: isEn ? 'Top Sensor Types' : '传感器类型 Top 15',
    STAT_TOTAL_DATASETS: isEn ? 'Total Datasets' : '数据集总数',
    STAT_STORAGE_FORMATS: isEn ? 'Storage Formats' : '存储格式种类',
    STAT_SENSOR_TYPES: isEn ? 'Sensor Types' : '传感器类型数',
    STAT_STANDARD_RATIO: isEn ? 'Standard Format %' : '标准格式占比',
  }));

  // ── Standard Proposal ────────────────────────────────────
  const proposalContent = isEn ? `
    <div class="disclaimer-box">
      <p><strong>⚠️ This is a community draft — not an authoritative standard.</strong> Based on analysis of ` + dataDatasets.length + ` embodied AI datasets, we propose a unified data format. Feedback is welcome.</p>
    </div>
    <h2>1. Proposed Schema Structure</h2>
    <p>The recommended data hierarchy follows a nested episode-step structure, consistent with 90%+ of current datasets:</p>
    <div class="schema-box"><div class="schema-code">episode
  └── step (timestamp, scene_id)
       ├── observation
       │    ├── image (RGB, depth, etc.)
       │    ├── state (joint positions, velocities)
       │    └── language (instruction text)
       ├── action
       │    ├── pose (end-effector pose)
       │    ├── gripper (open/close)
       │    └── joints (target joint positions)
       └── info
            ├── reward
            ├── discount
            └── success (task completion flag)</div></div>
    <h2>2. Recommended Storage Format</h2>
    <p>We recommend <strong>RLDS (Reinforcement Learning Datasets)</strong> based on TFDS as the primary storage format, with HDF5 as a lightweight alternative for smaller datasets.</p>
    <table class="comparison-table">
      <thead><tr><th>Format</th><th>Pros</th><th>Cons</th><th>Recommendation</th></tr></thead>
      <tbody>
        <tr><td>RLDS / TFDS</td><td>Streaming, sharding, rich ecosystem</td><td>Heavy dependency, steep learning curve</td><td>✅ Primary standard</td></tr>
        <tr><td>HDF5</td><td>Lightweight, widely supported</td><td>No built-in streaming</td><td>⚡ Lightweight alternative</td></tr>
        <tr><td>Custom JSONL</td><td>Human-readable</td><td>No schema enforcement, slow I/O</td><td>❌ Not recommended</td></tr>
      </tbody>
    </table>
    <h2>3. Required Metadata Fields</h2>
    <ul>
      <li><strong>camera_intrinsics</strong> — Camera intrinsic matrix (fx, fy, cx, cy)</li>
      <li><strong>camera_extrinsics</strong> — Camera pose in world frame</li>
      <li><strong>joint_names</strong> — Ordered list of joint names</li>
      <li><strong>language_instruction</strong> — Natural language task description</li>
      <li><strong>episode_id</strong> — Unique episode identifier</li>
      <li><strong>robot_type</strong> — Robot morphology identifier</li>
      <li><strong>scene_description</strong> — Textual scene context</li>
    </ul>
    <h2>4. Relationship to Existing Standards</h2>
    <p>This proposal draws from and is compatible with:</p>
    <ul>
      <li><strong>RLDS</strong> — Adopts the episode-step hierarchy</li>
      <li><strong>LeRobot Format</strong> — Compatible metadata schema</li>
      <li><strong>Open X-Embodiment</strong> — Extension of the OXE format</li>
      <li><strong>ROS 2 Bag</strong> — Mapping to ROS ecosystem</li>
    </ul>
  ` : `
    <div class="disclaimer-box">
      <p><strong>⚠️ 这是一份社区草案，并非权威标准。</strong>基于对 ` + dataDatasets.length + ` 个具身智能数据集的分析，我们提出一个统一数据格式建议。欢迎提供反馈。</p>
    </div>
    <h2>1. 推荐 Schema 结构</h2>
    <p>推荐采用嵌套的 episode-step 层级结构，与 90%+ 现有数据集的设计模式一致：</p>
    <div class="schema-box"><div class="schema-code">episode
  └── step (timestamp, scene_id)
       ├── observation
       │    ├── image (RGB, 深度图等)
       │    ├── state (关节位置、速度)
       │    └── language (任务指令文本)
       ├── action
       │    ├── pose (末端执行器位姿)
       │    ├── gripper (开合状态)
       │    └── joints (目标关节位置)
       └── info
            ├── reward
            ├── discount
            └── success (任务完成标志)</div></div>
    <h2>2. 推荐存储格式</h2>
    <p>建议以 <strong>RLDS (Reinforcement Learning Datasets)</strong> 基于 TFDS 为主要存储格式，HDF5 为轻量替代方案。</p>
    <table class="comparison-table">
      <thead><tr><th>格式</th><th>优点</th><th>缺点</th><th>建议</th></tr></thead>
      <tbody>
        <tr><td>RLDS / TFDS</td><td>流式读取、分片、生态成熟</td><td>依赖较重、学习曲线陡</td><td>✅ 主要标准</td></tr>
        <tr><td>HDF5</td><td>轻量、广泛支持</td><td>无内置流式支持</td><td>⚡ 轻量替代</td></tr>
        <tr><td>自定义 JSONL</td><td>人类可读</td><td>无 schema 约束、I/O 慢</td><td>❌ 不推荐</td></tr>
      </tbody>
    </table>
    <h2>3. 必需元数据字段</h2>
    <ul>
      <li><strong>camera_intrinsics</strong> — 相机内参矩阵 (fx, fy, cx, cy)</li>
      <li><strong>camera_extrinsics</strong> — 相机在世界坐标系中的位姿</li>
      <li><strong>joint_names</strong> — 关节名称有序列表</li>
      <li><strong>language_instruction</strong> — 自然语言任务描述</li>
      <li><strong>episode_id</strong> — 唯一 episode 标识符</li>
      <li><strong>robot_type</strong> — 机器人形态标识符</li>
      <li><strong>scene_description</strong> — 场景文本描述</li>
    </ul>
    <h2>4. 与现有标准的关系</h2>
    <p>此草案兼容并汲取以下标准的设计思路：</p>
    <ul>
      <li><strong>RLDS</strong> — 采用 episode-step 层级结构</li>
      <li><strong>LeRobot Format</strong> — 兼容的元数据 schema</li>
      <li><strong>Open X-Embodiment</strong> — OXE 数据格式的扩展</li>
      <li><strong>ROS 2 Bag</strong> — 可映射到 ROS 生态</li>
    </ul>
  `;

  const proposalDir = outDir + '/standard-proposal';
  fs.mkdirSync(proposalDir, { recursive: true });
  fs.writeFileSync(proposalDir + '/index.html', buildPage('src/pages/standard-proposal.html', {
    meta: '<title>' + (isEn ? 'Data Standard Proposal' : '数据标准草案') + ' | Superdata RobotAI</title><meta name="description" content="' + (isEn ? 'A community draft for unified embodied AI data format' : '具身智能统一数据格式社区草案') + '">',
    nav: getActiveNav('standards'),
    PROPOSAL_TITLE: isEn ? 'Embodied AI Data Standard Proposal' : '具身智能数据标准草案',
    PROPOSAL_SUBTITLE: isEn ? 'A community draft for unified embodied AI data format — based on analysis of ' + dataDatasets.length + ' datasets' : '基于 ' + dataDatasets.length + ' 个数据集的分析 — 统一数据格式社区草案',
    PROPOSAL_CONTENT: proposalContent,
  }));

  console.log(`${isEn ? 'English' : 'Chinese'} build: ${totalDatasets} datasets, ${totalStandards} standards, ${allOrgs.size} orgs`);
}

// ── Clean dist ───────────────────────────────────────────
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist', { recursive: true });

// Build Chinese
buildAll('zh');

// Build English
buildAll('en');

// ── Copy static assets ───────────────────────────────────
const publicDir = 'docs/public';
if (fs.existsSync(publicDir)) {
  for (const f of fs.readdirSync(publicDir)) {
    fs.copyFileSync(path.join(publicDir, f), path.join('dist', f));
    // Also copy to en/ (skip CNAME and .nojekyll which are site-level)
    if (f !== 'CNAME' && f !== '.nojekyll') {
      const enPublicDir = 'dist/en';
      fs.mkdirSync(enPublicDir, { recursive: true });
      fs.copyFileSync(path.join(publicDir, f), path.join(enPublicDir, f));
    }
  }
}
fs.writeFileSync('dist/.nojekyll', '');

// Copy embeddings.json if exists (generated by scripts/embed.cjs, also kept in fc/ for deployment)
const embSrc = fs.existsSync('fc/embeddings.json') ? 'fc/embeddings.json' : 'dist/embeddings.json';
if (fs.existsSync(embSrc)) {
  const embDest = path.join('dist', 'embeddings.json');
  fs.copyFileSync(embSrc, embDest);
  console.log('  embeddings.json copied (' + (fs.statSync(embDest).size / 1024).toFixed(1) + ' KB)');
}

console.log('Build complete: ' + datasets.length + ' datasets, ' + standards.length + ' standards, ' + allOrgs.size + ' orgs');
console.log('  dist/       - Chinese');
console.log('  dist/en/    - English');
console.log('  dist/datasets/{id}/index.html x' + datasets.length);
console.log('\nPreview: npx serve dist');
