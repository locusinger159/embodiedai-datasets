/**
 * embed.js — Generate text embeddings for all dataset/standard/tool entities
 *
 * Usage: DASHSCOPE_API_KEY=xxx node scripts/embed.js
 * Output: dist/embeddings.json (~300KB, 73 entities × 1024-dim)
 *
 * Uses Alibaba Cloud Bailian (百炼) text-embedding-v4 (Qwen3)
 * API Key: https://bailian.console.aliyun.com
 * Free tier: 100万 tokens (new users)
 * 73 entities × ~200 chars each ≈ 15K tokens = well within free tier
 */

const fs = require('fs');
const path = require('path');

const DASHSCOPE_KEY = process.env.DASHSCOPE_API_KEY;
if (!DASHSCOPE_KEY) {
  console.error('Error: DASHSCOPE_API_KEY environment variable is required.');
  console.error('Usage: DASHSCOPE_API_KEY=xxx node scripts/embed.js');
  process.exit(1);
}

// Load data
const datasets = JSON.parse(fs.readFileSync('docs/data/datasets.json', 'utf8'));
const standards = JSON.parse(fs.readFileSync('docs/data/standards.json', 'utf8'));
const tools = JSON.parse(fs.readFileSync('docs/data/tools.json', 'utf8'));

// Build text representations for each entity
function buildText(item, type) {
  const parts = [item.name];
  // Add description (first 200 chars for embedding)
  const desc = type === 'standard' ? item.desc : item.description;
  if (desc && typeof desc === 'string') parts.push(desc.substring(0, 200));
  if (item.notes && typeof item.notes === 'string') parts.push(item.notes);
  // Add structured fields as keywords
  if (item.robotType && item.robotType.length) parts.push('机器人类型: ' + item.robotType.join(', '));
  if (item.task && item.task.length) parts.push('任务: ' + item.task.join(', '));
  if (item.modality && item.modality.length) parts.push('模态: ' + item.modality.join(', '));
  if (item.license) parts.push('协议: ' + item.license);
  if (item.institution) parts.push('机构: ' + item.institution);
  return parts.join('。');
}

const entities = [];
for (const ds of datasets) {
  entities.push({ id: ds.id, text: buildText(ds, 'dataset'), type: 'datasets', name: ds.name, notes: ds.notes || '', robotType: ds.robotType || [], task: ds.task || [], modality: ds.modality || [] });
}
for (const ss of standards) {
  entities.push({ id: ss.id, text: buildText(ss, 'standard'), type: 'standards', name: ss.name, notes: ss.desc || '', robotType: [], task: [], modality: ss.modalities || [] });
}
for (const t of tools) {
  entities.push({ id: t.id, text: buildText(t, 'tool'), type: 'tools', name: t.name, notes: t.notes || '', robotType: t.robotType || [], task: t.task || [], modality: t.modality || [] });
}

console.log(`Total entities to embed: ${entities.length}`);

// Call Bailian (百炼) OpenAI-compatible API
async function callEmbedding(texts) {
  const resp = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DASHSCOPE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-v4',
      input: texts,
      dimensions: 1024,
      encoding_format: 'float',
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Bailian API ${resp.status}: ${err}`);
  }
  const json = await resp.json();
  return json.data.map(d => d.embedding);
}

async function main() {
  // Batch by 25 (DashScope supports batch embedding)
  const BATCH = 10;
  const allEmbeddings = [];
  const texts = entities.map(e => e.text);

  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    console.log(`Embedding batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(texts.length / BATCH)} (${batch.length} texts)...`);
    try {
      const embeddings = await callEmbedding(batch);
      allEmbeddings.push(...embeddings);
    } catch (err) {
      console.error(`Batch ${Math.floor(i / BATCH) + 1} failed:`, err.message);
      process.exit(1);
    }
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`Received ${allEmbeddings.length} embeddings, dim=${allEmbeddings[0] ? allEmbeddings[0].length : 0}`);

  // Build output
  const output = {
    version: 1,
    dim: allEmbeddings[0] ? allEmbeddings[0].length : 1024,
    model: 'text-embedding-v4',
    generated: new Date().toISOString(),
    datasets: [],
    standards: [],
    tools: []
  };

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i];
    const vec = allEmbeddings[i];
    if (!vec) { console.error(`Missing embedding for entity ${i}: ${entity.id}`); continue; }

    // Round to 4 decimal places for smaller file
    const rounded = vec.map(v => Math.round(v * 10000) / 10000);

    output[entity.type].push({
      id: entity.id,
      name: entity.name,
      notes: entity.notes,
      robotType: entity.robotType,
      task: entity.task,
      modality: entity.modality,
      vec: rounded,
    });
  }

  const distDir = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

  const outPath = path.join(distDir, 'embeddings.json');
  fs.writeFileSync(outPath, JSON.stringify(output));

  const stats = fs.statSync(outPath);
  console.log(`\nDone! ${outPath}`);
  console.log(`  Datasets: ${output.datasets.length}`);
  console.log(`  Standards: ${output.standards.length}`);
  console.log(`  Tools: ${output.tools.length}`);
  console.log(`  Size: ${(stats.size / 1024).toFixed(1)} KB`);
}

main().catch(err => { console.error(err); process.exit(1); });
