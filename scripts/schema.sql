-- Superdata RobotAI — SQLite Schema v1.0
-- 执行方式: node -e "const {DatabaseSync}=require('node:sqlite');const db=new DatabaseSync('data/embodiedai.db');db.exec(require('fs').readFileSync('scripts/schema.sql','utf8'));"

-- ===== 数据集 =====
CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  description TEXT NOT NULL,
  modalities TEXT NOT NULL,          -- JSON array: ["RGB","深度","动作"]
  robot_type TEXT NOT NULL,          -- JSON array: ["机械臂","人形机器人"]
  task TEXT NOT NULL,                -- JSON array: ["操作","抓取"]
  openness TEXT NOT NULL DEFAULT 'open',  -- open/partial/apply/closed
  license TEXT NOT NULL,             -- SPDX identifier
  license_notes TEXT,
  links_site TEXT,
  links_paper TEXT,
  links_github TEXT,
  links_huggingface TEXT,
  github TEXT,                       -- deprecated, use links_github
  huggingface TEXT,                  -- deprecated, use links_huggingface
  scale TEXT,
  data_format TEXT,
  data_format_detail TEXT,           -- JSON (deprecated object fields preserved)
  year INTEGER NOT NULL,
  tags TEXT,                         -- JSON array
  notes TEXT,
  quality_collection TEXT,           -- 遥操作采集/仿真生成/多源聚合
  quality_annotation TEXT,           -- 人工标注/自动标注
  quality_real_world TEXT,           -- 真机实测/仿真
  quality_has_split INTEGER DEFAULT 0,
  vla_compatible TEXT,               -- JSON array: ["pi0","openvla"]
  citation_bibtex TEXT,
  citation_year INTEGER,
  citation_venue TEXT,
  usage_load TEXT,
  usage_preprocess TEXT,
  data_content TEXT,                 -- JSON object
  changelog TEXT,                    -- JSON array
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ===== 数据标准 / 评测基准 =====
CREATE TABLE IF NOT EXISTS standards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT,
  institution TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL,                -- format/benchmark/industry/closed
  openness TEXT NOT NULL DEFAULT 'open',
  modalities TEXT,                   -- JSON array
  license TEXT,
  year INTEGER,
  scene TEXT,                        -- JSON array: ["real","sim"]
  links_site TEXT,
  links_paper TEXT,
  links_github TEXT,
  links_huggingface TEXT,
  requirements_must TEXT,            -- JSON array
  requirements_should TEXT,          -- JSON array
  requirements_may TEXT,             -- JSON array
  dataset_ids TEXT,                  -- JSON array
  dataset_count INTEGER DEFAULT 0,
  benchmark_rank_by TEXT,            -- dataset/model
  benchmark_metric TEXT,
  benchmark_unit TEXT,
  benchmark_higher_is_better INTEGER DEFAULT 1,
  benchmark_max_score REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ===== 工具 / 平台 =====
CREATE TABLE IF NOT EXISTS tools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  institution TEXT NOT NULL,
  description TEXT NOT NULL,
  tool_type TEXT NOT NULL,           -- 仿真器/物理引擎/训练框架/可视化/触觉模拟
  openness TEXT NOT NULL DEFAULT 'open',
  license TEXT,
  license_notes TEXT,
  modalities TEXT,                   -- JSON array
  links_site TEXT,
  links_paper TEXT,
  links_github TEXT,
  links_huggingface TEXT,
  scale TEXT,
  data_format TEXT,
  year INTEGER,
  tags TEXT,                         -- JSON array
  notes TEXT,
  citation_bibtex TEXT,
  citation_year INTEGER,
  citation_venue TEXT,
  tutorial_load TEXT,
  tutorial_preprocess TEXT,
  changelog TEXT,                    -- JSON array
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ===== Benchmark 排行记录 =====
CREATE TABLE IF NOT EXISTS benchmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  standard_id TEXT NOT NULL REFERENCES standards(id),
  dataset_id TEXT REFERENCES datasets(id),
  model TEXT NOT NULL,
  model_size TEXT,
  score REAL NOT NULL,
  unit TEXT DEFAULT '%',
  suite TEXT NOT NULL DEFAULT 'Overall',
  paper TEXT,
  paper_title TEXT,
  conditions TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ===== 变更日志 =====
CREATE TABLE IF NOT EXISTS changelog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,         -- dataset/standard/tool/benchmark
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,              -- create/update/delete/migrate
  changed_fields TEXT,               -- JSON: {"field":["old","new"],...}
  reason TEXT,
  author TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ===== 索引 =====
CREATE INDEX IF NOT EXISTS idx_datasets_institution ON datasets(institution);
CREATE INDEX IF NOT EXISTS idx_datasets_year ON datasets(year);
CREATE INDEX IF NOT EXISTS idx_standards_type ON standards(type);
CREATE INDEX IF NOT EXISTS idx_benchmarks_standard ON benchmarks(standard_id);
CREATE INDEX IF NOT EXISTS idx_benchmarks_model ON benchmarks(model);
CREATE INDEX IF NOT EXISTS idx_changelog_entity ON changelog(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_changelog_time ON changelog(created_at);
