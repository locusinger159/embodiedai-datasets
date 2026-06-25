/**
 * export.cjs — 从 SQLite 数据库导出 JSON 文件（兼容 build.cjs）
 *
 * Usage: node scripts/export.cjs
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'data', 'embodiedai.db');

if (!fs.existsSync(DB_PATH)) {
  console.error('❌ Database not found:', DB_PATH);
  console.error('   Run migrate.cjs first.');
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys=ON;');

// ===== Helpers =====
function parseJSON(val, fallback) {
  if (!val) return fallback;
  try { return JSON.parse(val); } catch { return fallback; }
}

const rDataset = db.prepare('SELECT * FROM datasets');
const rStandard = db.prepare('SELECT * FROM standards');
const rTool = db.prepare('SELECT * FROM tools');
const rBenchmark = db.prepare('SELECT * FROM benchmarks');

const allBenchmarks = rBenchmark.all();

// ===== 1. Export datasets =====
const datasets = rDataset.all().map(row => {
  const ds = {
    id: row.id,
    name: row.name,
    institution: row.institution,
    description: row.description,
    modality: parseJSON(row.modalities, []),  // singular for build.cjs compat
    robotType: parseJSON(row.robot_type, []),
    task: parseJSON(row.task, []),
    type: row.openness,                       // legacy compat
    openness: row.openness,
    license: row.license,
    links: {},
    scale: row.scale,
    dataFormat: row.data_format || '详见 dataFormatDetail',
    year: row.year,
    tags: parseJSON(row.tags, []),
    notes: row.notes,
    vlaCompatible: parseJSON(row.vla_compatible, []),
    quality: {
      collection: row.quality_collection,
      annotation: row.quality_annotation,
      realWorld: row.quality_real_world,
      hasSplit: row.quality_has_split === 1,
    },
    citation: {
      bibtex: row.citation_bibtex,
      year: row.citation_year,
      venue: row.citation_venue,
    },
    usage: {
      load: row.usage_load,
      preprocess: row.usage_preprocess,
    },
  };

  // Links
  if (row.links_site) ds.links.site = row.links_site;  // new name
  if (row.links_paper) ds.links.paper = row.links_paper;
  if (row.links_github) ds.links.github = row.links_github;
  if (row.links_huggingface) ds.links.huggingface = row.links_huggingface;
  if (row.github) ds.github = row.github;  // legacy
  if (row.huggingface) ds.huggingface = row.huggingface;

  // Optional
  if (row.license_notes) ds.licenseNotes = row.license_notes;
  if (row.data_format_detail) ds.dataFormatDetail = parseJSON(row.data_format_detail, {});
  if (row.data_content) ds.dataContent = parseJSON(row.data_content, {});
  if (row.changelog) ds.changelog = parseJSON(row.changelog, []);

  // Filter out empty/undefined values in quality/citation/usage
  if (!ds.quality.collection && !ds.quality.annotation && !ds.quality.realWorld) {
    // keep hasSplit at least
  }
  if (!ds.citation.bibtex && !ds.citation.year && !ds.citation.venue) {
    ds.citation = { year: row.year };
  }
  if (!ds.usage.load && !ds.usage.preprocess) {
    delete ds.usage;
  }

  // Benchmarks for this dataset
  const bms = allBenchmarks.filter(b => b.dataset_id === row.id);
  if (bms.length) {
    ds.benchmarks = bms.map(b => ({
      benchmarkId: b.standard_id,
      model: b.model,
      modelSize: b.model_size,
      score: b.score,
      unit: b.unit,
      suite: b.suite,
      paper: b.paper || '',
      paperTitle: b.paper_title || '',
      conditions: b.conditions || '',
    }));
  }

  return ds;
});

// ===== 2. Export standards =====
const standards = rStandard.all().map(row => {
  const s = {
    id: row.id,
    name: row.name,
    fullName: row.full_name,
    org: row.institution,                      // legacy compat (build.cjs uses org)
    institution: row.institution,
    type: row.type,
    openness: row.openness,
    links: {},
    year: row.year,
    desc: row.description,                     // legacy compat (build.cjs uses desc)
    description: row.description,
  };

  if (row.links_site) s.links.site = row.links_site;
  if (row.links_paper) s.links.paper = row.links_paper;
  if (row.links_github) s.links.github = row.links_github;
  if (row.links_huggingface) s.links.huggingface = row.links_huggingface;
  if (row.license) s.license = row.license;
  if (row.scene) s.scene = parseJSON(row.scene, []);
  if (row.modalities) s.modalities = parseJSON(row.modalities, []);

  // Requirements
  const must = parseJSON(row.requirements_must, []);
  const should = parseJSON(row.requirements_should, []);
  const may = parseJSON(row.requirements_may, []);
  if (must.length || should.length || may.length) {
    s.requirements = { MUST: must, SHOULD: should, MAY: may };
  }

  // Benchmark meta
  if (row.benchmark_rank_by) {
    s.benchmarkMeta = {
      rankBy: row.benchmark_rank_by,
      metric: row.benchmark_metric,
      unit: row.benchmark_unit,
      higherIsBetter: row.benchmark_higher_is_better === 1,
    };
    if (row.benchmark_max_score) s.benchmarkMeta.maxScore = row.benchmark_max_score;
  }

  if (row.dataset_ids) s.datasetIds = parseJSON(row.dataset_ids, []);
  if (row.dataset_count) s.datasetCount = row.dataset_count;

  return s;
});

// ===== 3. Export tools =====
const tools = rTool.all().map(row => {
  const t = {
    id: row.id,
    name: row.name,
    institution: row.institution,
    description: row.description,
    toolType: row.tool_type,
    type: row.openness,
    openness: row.openness,
    links: {},
    modality: parseJSON(row.modalities, []),   // singular for build.cjs compat
  };

  if (row.links_site) t.links.site = row.links_site;
  if (row.links_paper) t.links.paper = row.links_paper;
  if (row.links_github) t.links.github = row.links_github;
  if (row.links_huggingface) t.links.huggingface = row.links_huggingface;
  if (row.license) t.license = row.license;
  if (row.license_notes) t.licenseNotes = row.license_notes;
  if (row.scale) t.scale = row.scale;
  if (row.data_format) t.dataFormat = row.data_format;
  if (row.year) t.year = row.year;
  if (row.tags) t.tags = parseJSON(row.tags, []);
  if (row.notes) t.notes = row.notes;
  if (row.citation_bibtex || row.citation_year) {
    t.citation = { bibtex: row.citation_bibtex, year: row.citation_year, venue: row.citation_venue };
  }
  if (row.tutorial_load || row.tutorial_preprocess) {
    t.tutorial = { load: row.tutorial_load, preprocess: row.tutorial_preprocess };
  }
  if (row.changelog) t.changelog = parseJSON(row.changelog, []);

  return t;
});

// ===== Write JSON files =====
const dataDir = path.join(ROOT, 'docs', 'data');

function writeJSON(filename, data) {
  const filepath = path.join(dataDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`✅ ${filename}: ${data.length} entries`);
}

writeJSON('datasets.json', datasets);
writeJSON('standards.json', standards);
writeJSON('tools.json', tools);

// English versions are identical for now (same data, English descriptions handled by build.cjs i18n)
writeJSON('datasets.en.json', datasets);
writeJSON('standards.en.json', standards);
writeJSON('tools.en.json', tools);

db.close();
console.log('\nExport complete.');
