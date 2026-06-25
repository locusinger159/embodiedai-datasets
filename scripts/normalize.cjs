/**
 * normalize.cjs — 数据规范性治理：统一字段名、标准化许可证、清理数据
 *
 * Usage: node scripts/normalize.cjs [--dry-run]
 *   --dry-run  仅检查，不修改文件
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const ROOT = path.resolve(__dirname, '..');

// ===== 1. SPDX 许可证映射 =====
const LICENSE_MAP = {
  'Apache 2.0': 'Apache-2.0',
  'Apache 2.0（完全开源，可商用）': 'Apache-2.0',
  'Apache 2.0 / CC BY 4.0': 'Apache-2.0',
  'MIT': 'MIT',
  'CC BY 4.0': 'CC-BY-4.0',
  'CC-BY-4.0': 'CC-BY-4.0',
  'CC BY-NC 4.0': 'CC-BY-NC-4.0',
  'CC BY-NC-SA 4.0': 'CC-BY-NC-SA-4.0',
  'CC BY-NC-SA 4.0（非商用开源）': 'CC-BY-NC-SA-4.0',
  'CC BY-NC-ND 4.0（动作数据）/ MIT（工具代码）': 'CC-BY-NC-ND-4.0',
  'CC-BY-4.0 / CC BY-NC 4.0（按子集不同）': 'CC-BY-4.0',
  'BSD 3-Clause': 'BSD-3-Clause',
  'BSD-3-Clause': 'BSD-3-Clause',
  'BSD 2-Clause': 'BSD-2-Clause',
  'CC BY-NC 4.0 (data) + Apache 2.0 (code)': 'CC-BY-NC-4.0',
  'RoboCasa License（开源非商用）': 'LicenseRef-RoboCasa',
  'Ego4D License（需签署协议）': 'LicenseRef-Ego4D',
  'Custom (research)': 'LicenseRef-Custom-Research',
  'Research use only（需申请）': 'LicenseRef-Research-Only',
};

function normalizeLicense(raw) {
  if (!raw) return { license: 'Unspecified', licenseNotes: '未明确' };
  const trimmed = raw.trim();
  if (LICENSE_MAP[trimmed]) return { license: LICENSE_MAP[trimmed], licenseNotes: trimmed };
  if (trimmed === '未明确' || trimmed === '开源' || trimmed === '开源（详见官方链接）' || trimmed === '学术使用' || trimmed === '非商业用途')
    return { license: 'Unspecified', licenseNotes: trimmed };
  // Unknown — keep as-is
  return { license: trimmed, licenseNotes: '' };
}

// ===== 2. 字段名映射 =====

// Standard 字段名修正
const STANDARD_FIELD_MAP = {
  'org': 'institution',
  'desc': 'description',
};

// Tool 字段名修正
const TOOL_FIELD_MAP = {
  'modality': 'modalities',
};

// Links 键名统一（所有实体）
const LINKS_KEY_MAP = {
  'official': 'site',
};

// ===== 3. 主逻辑 =====
const stats = { renamed: 0, licenseFixed: 0, linksFixed: 0, dataFormatFixed: 0, warnings: [] };

function renameFields(obj, map, entityId) {
  let count = 0;
  for (const [oldKey, newKey] of Object.entries(map)) {
    if (obj[oldKey] !== undefined) {
      if (obj[newKey] === undefined) {
        obj[newKey] = obj[oldKey];
      }
      delete obj[oldKey];
      count++;
    }
  }
  return count;
}

function normalizeLinks(obj) {
  let count = 0;
  if (!obj.links || typeof obj.links !== 'object') return count;
  for (const [oldKey, newKey] of Object.entries(LINKS_KEY_MAP)) {
    if (obj.links[oldKey] !== undefined) {
      if (obj.links[newKey] === undefined) {
        obj.links[newKey] = obj.links[oldKey];
      }
      delete obj.links[oldKey];
      count++;
    }
  }
  return count;
}

function normalizeDataFormat(ds) {
  if (typeof ds.dataFormat === 'object' && ds.dataFormat !== null) {
    const detail = ds.dataFormat;
    // Build string summary
    const parts = [];
    if (detail.storage) parts.push(detail.storage);
    if (detail.schema) parts.push(detail.schema.split('\n')[0]);
    ds.dataFormat = parts.join(' — ') || '详见 dataFormatDetail';
    ds.dataFormatDetail = detail;
    return 1;
  }
  return 0;
}

function processFile(filePath, entityType) {
  const name = path.basename(filePath);
  console.log(`\n📄 ${name} (${entityType})`);

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let localStats = { renamed: 0, licenseFixed: 0, linksFixed: 0, dataFormatFixed: 0 };

  data.forEach((item, i) => {
    const id = item.id || item.name || `[${i}]`;

    // Rename fields
    let fieldMap = {};
    if (entityType === 'standard') fieldMap = STANDARD_FIELD_MAP;
    if (entityType === 'tool') fieldMap = TOOL_FIELD_MAP;
    const renames = renameFields(item, fieldMap, id);
    if (renames) {
      if (DRY_RUN) console.log(`  🔧 ${id}: renamed ${renames} fields`);
      localStats.renamed += renames;
    }

    // Normalize links
    const linkFixes = normalizeLinks(item);
    if (linkFixes) {
      if (DRY_RUN) console.log(`  🔗 ${id}: fixed ${linkFixes} link keys`);
      localStats.linksFixed += linkFixes;
    }

    // Normalize license
    if (item.license !== undefined && item.license !== null) {
      const { license, licenseNotes } = normalizeLicense(item.license);
      if (license !== item.license) {
        if (DRY_RUN) console.log(`  📜 ${id}: license "${item.license}" → "${license}"`);
        item.license = license;
        if (licenseNotes && licenseNotes !== license) {
          item.licenseNotes = licenseNotes;
        }
        localStats.licenseFixed++;
      }
    }

    // Normalize dataFormat (datasets only)
    if (entityType === 'dataset') {
      const dfFix = normalizeDataFormat(item);
      if (dfFix) {
        if (DRY_RUN) console.log(`  📦 ${id}: dataFormat object → string`);
        localStats.dataFormatFixed += dfFix;
      }
    }

    // Ensure modalities is plural for tools
    if (entityType === 'tool' && item.modality && !item.modalities) {
      item.modalities = item.modality;
      delete item.modality;
      localStats.renamed++;
    }
  });

  // Write back
  if (!DRY_RUN) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`  ✅ saved (${data.length} items)`);
  }

  stats.renamed += localStats.renamed;
  stats.licenseFixed += localStats.licenseFixed;
  stats.linksFixed += localStats.linksFixed;
  stats.dataFormatFixed += localStats.dataFormatFixed;

  return localStats;
}

// ===== Run =====
console.log('🔍 Superdata RobotAI — 数据规范性治理');
console.log(DRY_RUN ? '(DRY RUN — 仅检查，不修改)\n' : '(写入模式)\n');

const files = [
  ['docs/data/datasets.json', 'dataset'],
  ['docs/data/datasets.en.json', 'dataset'],
  ['docs/data/standards.json', 'standard'],
  ['docs/data/standards.en.json', 'standard'],
  ['docs/data/tools.json', 'tool'],
  ['docs/data/tools.en.json', 'tool'],
];

files.forEach(([file, type]) => {
  const fullPath = path.join(ROOT, file);
  if (fs.existsSync(fullPath)) processFile(fullPath, type);
});

console.log('\n==================================================');
console.log('Summary:');
console.log(`  字段重命名: ${stats.renamed}`);
console.log(`  许可证标准化: ${stats.licenseFixed}`);
console.log(`  链接键名统一: ${stats.linksFixed}`);
console.log(`  dataFormat 类型统一: ${stats.dataFormatFixed}`);
if (DRY_RUN) console.log('\n⚠️  DRY RUN — 未修改任何文件。去掉 --dry-run 以实际写入。');
console.log('==================================================');
