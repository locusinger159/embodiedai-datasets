/**
 * Superdata RobotAI — AI Search Backend (Alibaba Cloud FC Web Function)
 * Start: node index.js | Port: 9000
 * Embedding: Bailian (百炼) text-embedding-v4, 2048-dim
 */

const http = require('http');
const embeddings = require('./embeddings.json');

// Cosine similarity
function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

// Embed query via Bailian (百炼) OpenAI-compatible API
async function embedQuery(text, apiKey) {
  const resp = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-v4',
      input: text,
      dimensions: 2048,
      encoding_format: 'float',
    }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Bailian API ${resp.status}: ${err}`);
  }
  const json = await resp.json();
  return json.data[0].embedding;
}

// Keyword extraction from query for structured boosting
function extractKeywords(query) {
  const keywords = { robotType: [], task: [], modality: [] };
  const ROBOT_MAP = { '人形': '人形机器人', '机械臂': '机械臂', '移动': '移动机器人', '四足': '四足机器人', '仿真': '仿真', '触觉': '触觉传感', '多机型': '多机型' };
  const TASK_MAP = { '操作': '操作', '抓取': '抓取', '导航': '导航', '装配': '装配', '家居': '家居', '交互': '交互', '运动控制': '运动控制', '运动': '运动控制', '行走': '运动控制', '双足': '运动控制' };
  const MOD_MAP = { 'rgb': 'RGB', '深度': '深度', '触觉': '触觉', 'lidar': 'LiDAR', '点云': '点云', '力控': '力控', '动作': '动作', '语言': '语言', '视觉': '视觉' };

  for (const [kw, val] of Object.entries(ROBOT_MAP)) if (query.includes(kw)) keywords.robotType.push(val);
  for (const [kw, val] of Object.entries(TASK_MAP)) if (query.includes(kw)) keywords.task.push(val);
  for (const [kw, val] of Object.entries(MOD_MAP)) if (query.toLowerCase().includes(kw.toLowerCase())) keywords.modality.push(val);

  return keywords;
}

// Keyword boost score (0-20 points added to embedding score)
function keywordBoost(item, keywords) {
  let boost = 0;
  for (const rt of keywords.robotType) if ((item.robotType || []).includes(rt)) boost += 6;
  for (const t of keywords.task) if ((item.task || []).includes(t)) boost += 5;
  for (const m of keywords.modality) if ((item.modality || []).includes(m)) boost += 3;
  return Math.min(boost, 20); // cap at 20
}

// Search with hybrid scoring (embedding + keyword boost)
function search(queryVec, query) {
  const keywords = extractKeywords(query);

  const scored = (arr, k) =>
    arr.map(item => {
      const embScore = Math.round(cosineSim(queryVec, item.vec) * 100);
      const boost = keywordBoost(item, keywords);
      return { ...item, score: embScore + boost, _emb: embScore, _kw: boost };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(({ vec, _emb, _kw, ...rest }) => rest);

  return {
    datasets: scored(embeddings.datasets, 5),
    standards: scored(embeddings.standards, 3),
    tools: scored(embeddings.tools, 5),  // increased from 2 → 5
  };
}

// CORS helpers
const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(resp, code, data) {
  resp.writeHead(code, corsHeaders);
  resp.end(JSON.stringify(data));
}

// HTTP server
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders); res.end(); return;
  }
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Use POST /api/search' }); return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { query, lang } = JSON.parse(body || '{}');
      const q = (query || '').trim();
      if (!q || q.length < 2) { json(res, 400, { error: 'Query too short' }); return; }
      if (q.length > 500) { json(res, 400, { error: 'Query too long' }); return; }

      const apiKey = process.env.DASHSCOPE_API_KEY;
      if (!apiKey) { json(res, 500, { error: 'Server config' }); return; }

      const vec = await embedQuery(q, apiKey);
      const results = search(vec, q);

      json(res, 200, {
        ...results, query: q, lang: lang || 'zh',
        model: embeddings.model, dim: embeddings.dim, version: embeddings.version,
      });
    } catch (err) {
      console.error('Search error:', err.message);
      json(res, 500, { error: err.message });
    }
  });
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => console.log(`Superdata search running on port ${PORT}`));
