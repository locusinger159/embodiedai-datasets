/**
 * migrate.cjs — 将现有 JSON 数据迁移到 SQLite 数据库
 *
 * Usage: node scripts/migrate.cjs [--force]
 *   --force  删除已有数据库，重新创建
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'data', 'embodiedai.db');
const FORCE = process.argv.includes('--force');

if (FORCE && fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('🗑️  已删除旧数据库');
}

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.exec('PRAGMA journal_mode=WAL;');
db.exec('PRAGMA foreign_keys=ON;');

// Create schema
const schema = fs.readFileSync(path.join(ROOT, 'scripts', 'schema.sql'), 'utf8');
db.exec(schema);
console.log('✅ Schema created');

// ===== Helpers =====
function jsonArr(val) {
  if (Array.isArray(val)) return JSON.stringify(val);
  if (typeof val === 'string') return val; // already JSON string
  return '[]';
}

function jsonObj(val) {
  if (val && typeof val === 'object') return JSON.stringify(val);
  if (typeof val === 'string') return val;
  return null;
}

function loadJSON(name) {
  const p = path.join(ROOT, 'docs', 'data', name);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// ===== Migrate datasets =====
const datasets = loadJSON('datasets.json');
const insertDS = db.prepare(`
  INSERT OR REPLACE INTO datasets (id, name, institution, description, modalities,
    robot_type, task, openness, license, license_notes, links_site, links_paper,
    links_github, links_huggingface, github, huggingface, scale, data_format,
    data_format_detail, year, tags, notes, quality_collection, quality_annotation,
    quality_real_world, quality_has_split, vla_compatible, citation_bibtex,
    citation_year, citation_venue, usage_load, usage_preprocess, data_content,
    changelog, created_at, updated_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))
`);

let count = 0;
for (const d of datasets) {
  insertDS.run(
    d.id, d.name, d.institution, d.description, jsonArr(d.modalities || d.modality),
    jsonArr(d.robotType), jsonArr(d.task), d.openness || d.type || 'open',
    d.license, d.licenseNotes || null,
    d.links?.site || d.links?.official || null, d.links?.paper || null,
    d.links?.github || null, d.links?.huggingface || null,
    d.github || null, d.huggingface || null,
    d.scale || null, d.dataFormat || null,
    jsonObj(d.dataFormatDetail) || null,
    d.year, jsonArr(d.tags), d.notes || null,
    d.quality?.collection || null, d.quality?.annotation || null,
    d.quality?.realWorld || null, d.quality?.hasSplit ? 1 : 0,
    jsonArr(d.vlaCompatible), d.citation?.bibtex || null,
    d.citation?.year || null, d.citation?.venue || null,
    d.usage?.load || null, d.usage?.preprocess || null,
    jsonObj(d.dataContent) || null, jsonArr(d.changelog) || null
  );
  count++;
}
console.log(`✅ Datasets: ${count} migrated`);

// ===== Migrate standards =====
const standards = loadJSON('standards.json');
const insertSS = db.prepare(`
  INSERT OR REPLACE INTO standards (id, name, full_name, institution, description,
    type, openness, modalities, license, year, scene, links_site, links_paper,
    links_github, links_huggingface, requirements_must, requirements_should,
    requirements_may, dataset_ids, dataset_count, benchmark_rank_by,
    benchmark_metric, benchmark_unit, benchmark_higher_is_better, benchmark_max_score,
    created_at, updated_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))
`);

count = 0;
for (const s of standards) {
  const bm = s.benchmarkMeta || {};
  insertSS.run(
    s.id, s.name, s.fullName || null, s.institution || s.org,
    s.description || s.desc, s.type, s.openness || 'open',
    jsonArr(s.modalities), s.license || null, s.year || null,
    jsonArr(s.scene), s.links?.site || s.links?.official || null,
    s.links?.paper || null, s.links?.github || null,
    s.links?.huggingface || null,
    jsonArr(s.requirements?.MUST), jsonArr(s.requirements?.SHOULD),
    jsonArr(s.requirements?.MAY),
    jsonArr(s.datasetIds), s.datasetCount || 0,
    bm.rankBy || null, bm.metric || null, bm.unit || null,
    bm.higherIsBetter !== false ? 1 : 0, bm.maxScore || null
  );
  count++;
}
console.log(`✅ Standards: ${count} migrated`);

// ===== Migrate tools =====
const tools = loadJSON('tools.json');
const insertTL = db.prepare(`
  INSERT OR REPLACE INTO tools (id, name, institution, description, tool_type,
    openness, license, license_notes, modalities, links_site, links_paper,
    links_github, links_huggingface, scale, data_format, year, tags, notes,
    citation_bibtex, citation_year, citation_venue, tutorial_load,
    tutorial_preprocess, changelog)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`);

count = 0;
for (const t of tools) {
  insertTL.run(
    t.id, t.name, t.institution, t.description || t.desc || '',
    t.toolType, t.openness || t.type || 'open', t.license || null,
    t.licenseNotes || null, jsonArr(t.modalities || t.modality),
    t.links?.site || t.links?.official || null, t.links?.paper || null,
    t.links?.github || null, t.links?.huggingface || null,
    t.scale || null, t.dataFormat || null, t.year || null,
    jsonArr(t.tags), t.notes || null, t.citation?.bibtex || null,
    t.citation?.year || null, t.citation?.venue || null,
    t.tutorial?.load || null, t.tutorial?.preprocess || null,
    jsonArr(t.changelog) || null
  );
  count++;
}
console.log(`✅ Tools: ${count} migrated`);

// ===== Migrate benchmarks =====
const insertBM = db.prepare(`
  INSERT OR REPLACE INTO benchmarks (standard_id, dataset_id, model, model_size,
    score, unit, suite, paper, paper_title, conditions)
  VALUES (?,?,?,?,?,?,?,?,?,?)
`);

count = 0;
for (const d of datasets) {
  const bms = d.benchmarks;
  if (!bms || !bms.length) continue;
  for (const b of bms) {
    insertBM.run(
      b.benchmarkId, d.id, b.model, b.modelSize || null,
      b.score, b.unit || '%', b.suite || 'Overall',
      b.paper || null, b.paperTitle || null, b.conditions || null
    );
    count++;
  }
}
console.log(`✅ Benchmarks: ${count} migrated`);

// ===== Record migration in changelog =====
db.prepare(`INSERT INTO changelog (entity_type, entity_id, action, reason, author)
  VALUES ('system', 'all', 'migrate', 'Initial JSON → SQLite migration', 'migrate.cjs')`).run();

// ===== Verify =====
const stats = {
  datasets: db.prepare('SELECT COUNT(*) as c FROM datasets').get().c,
  standards: db.prepare('SELECT COUNT(*) as c FROM standards').get().c,
  tools: db.prepare('SELECT COUNT(*) as c FROM tools').get().c,
  benchmarks: db.prepare('SELECT COUNT(*) as c FROM benchmarks').get().c,
  changelog: db.prepare('SELECT COUNT(*) as c FROM changelog').get().c,
};

console.log('\n==================================================');
console.log('Migration complete:');
console.log(`  datasets:  ${stats.datasets}`);
console.log(`  standards: ${stats.standards}`);
console.log(`  tools:     ${stats.tools}`);
console.log(`  benchmarks:${stats.benchmarks}`);
console.log(`  changelog: ${stats.changelog}`);
console.log(`  Database:  ${DB_PATH} (${(fs.statSync(DB_PATH).size / 1024 / 1024).toFixed(1)} MB)`);
console.log('==================================================');

db.close();
