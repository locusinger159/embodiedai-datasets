/**
 * Superdata RobotAI — AI Search + LLM Assistant (Alibaba Cloud FC Web Function)
 * Start: node index.js | Port: 9000
 * Embedding: Bailian (百炼) text-embedding-v4, 2048-dim
 * LLM: DeepSeek V4 Flash (OpenAI-compatible API)
 */

const http = require('http');
let embeddings, paperEmbeddings;
try {
  embeddings = require('./embeddings.json');
} catch (e) {
  embeddings = { datasets: [], standards: [], tools: [] };
}
try {
  paperEmbeddings = require('./embeddings_papers.json');
} catch (e) {
  paperEmbeddings = { papers: [] };
}

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

  const scored = (arr, k, typeBonus) =>
    arr.map(item => {
      const embScore = Math.round(cosineSim(queryVec, item.vec) * 100);
      const boost = (typeBonus || 0) + keywordBoost(item, keywords);
      return { ...item, score: embScore + boost, _emb: embScore, _kw: boost };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(({ vec, _emb, _kw, ...rest }) => rest);

  const papers = scored(paperEmbeddings.papers || [], 8, 10);  // +10 boost for papers

  return {
    datasets: scored(embeddings.datasets, 5),
    standards: scored(embeddings.standards, 3),
    tools: scored(embeddings.tools, 5),
    papers,
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

// LLM Assistant — query DeepSeek with search context injected
async function assistant(query, history, apiKey, model) {
  const embedKey = process.env.DASHSCOPE_API_KEY;
  if (!embedKey) throw new Error('DASHSCOPE_API_KEY not configured');
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

  // 1. Embedding search
  const vec = await embedQuery(query, embedKey);
  const results = search(vec, query);
  // Merge all results, but ensure papers get at least 2 slots
  const datasetResults = [
    ...results.datasets.map(d => ({ ...d, type: 'dataset' })),
    ...results.standards.map(s => ({ ...s, type: 'standard' })),
    ...results.tools.map(t => ({ ...t, type: 'tool' })),
  ].sort((a, b) => b.score - a.score);

  const paperResults = results.papers.map(p => ({ ...p, type: 'paper', name: p.title, notes: p.text }));

  const allResults = [
    ...datasetResults.slice(0, 6),
    ...paperResults.slice(0, 2),  // Reserve 2 slots for papers
  ].sort((a, b) => b.score - a.score);

  // 2. Build context for LLM
  const contextParts = allResults.map((r, i) => {
    const icon = r.type === 'dataset' ? '📊' : r.type === 'standard' ? '📐' : r.type === 'tool' ? '🔧' : '📄';
    if (r.type === 'paper') {
      return `[${i + 1}] ${icon} **${r.title?.substring(0, 80) || '未知论文'}**\n   类型: 学术论文\n   相关数据集: ${r.dataset || '通用'}\n   摘要: ${(r.text || '').substring(0, 150)}`;
    }
    return `[${i + 1}] ${icon} **${r.name}** (${r.institution || '未知机构'})\n   类型: ${r.type === 'dataset' ? '数据集' : r.type === 'standard' ? '数据标准' : '工具/平台'}\n   简介: ${(r.notes || '').substring(0, 150)}\n` +
      (r.id ? `   链接: https://superdata-robotai.com/${r.type === 'tool' ? 'tools' : 'datasets'}/${r.id}/\n` : '');
  }).join('\n');

  const systemPrompt = `你是 Superdata RobotAI 的 AI 助手，专门帮助用户从具身智能数据集导航站中找到合适的数据集、数据标准和工具/平台。

网站收录 94 个数据集、22 个标准、18 个工具、122 篇论文知识库。

根据用户的问题，以下是从数据库中检索到的最相关内容:

${contextParts}

请基于以上检索结果回答用户的问题。要求:
1. 推荐最相关的数据集/标准/工具，说明推荐理由
2. 如果检索结果不完全匹配，诚实说明，并给出搜索建议
3. 回答简洁专业，引用来源时使用 [N] 标注（如 "根据 [1]..."）
4. 如有多个相关结果，做横向对比
5. 用中文回复`;

  // 3. Build messages — strip system msgs + limit history to prevent overflow
  const cleanHistory = (history || [])
    .filter(m => m.role !== 'system')
    .slice(-4);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...cleanHistory,
    { role: 'user', content: query },
  ];

  // 4. Call DeepSeek API (OpenAI-compatible)
  const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model || 'deepseek-v4-flash',
      messages,
      max_tokens: 1200,
      temperature: 0.3,
      max_input_tokens: 16000,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error(`DeepSeek API ${resp.status}: ${err.substring(0, 500)}`);
    throw new Error(`DeepSeek API ${resp.status}: ${err.substring(0, 200)}`);
  }

  const jsonResp = await resp.json();
  const reply = jsonResp.choices[0].message.content;

  // 5. Return structured response
  const keywords = extractKeywords(query);
  function findSnippet(text) {
    if (!text) return '';
    const sarr = String(text).split(/(?<=[。.!?？])/);
    for (const s of sarr) {
      if (s.toLowerCase().includes(query.toLowerCase())) return s.trim().slice(0,200);
    }
    return String(text).slice(0,200);
  }

  return {
    reply,
    sources: allResults.slice(0, 5).map(r => {
      const matching_fields = [];
      if (r.name && r.name.toLowerCase().includes(query.toLowerCase())) matching_fields.push('name');
      if (r.notes && r.notes.toLowerCase().includes(query.toLowerCase())) matching_fields.push('notes');
      if ((r.robotType||[]).some(rt => keywords.robotType.includes(rt))) matching_fields.push('robotType');
      if ((r.task||[]).some(t => keywords.task.includes(t))) matching_fields.push('task');
      if ((r.modality||[]).some(m => keywords.modality.includes(m))) matching_fields.push('modality');
      const snippet = findSnippet(r.notes || r.description || r.summary || '');
      return {
        id: r.id,
        name: r.name,
        type: r.type,
        score: r.score,
        matching_fields,
        snippet,
        link: r.id ? `https://superdata-robotai.com/${r.type === 'tool' ? 'tools' : 'datasets'}/${r.id}/` : null,
      };
    }),
  };
}

// HTTP server
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders); res.end(); return;
  }
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Use POST /api/search or /api/assistant' }); return;
  }

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const parsed = JSON.parse(body || '{}');
      const query = (parsed.query || '').trim();

      // ── Assistant endpoint ──
      if (path === '/api/assistant') {
        if (!query || query.length < 2) { json(res, 400, { error: 'Query too short' }); return; }
        if (query.length > 2000) { json(res, 400, { error: 'Query too long' }); return; }

        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) { json(res, 500, { error: 'DEEPSEEK_API_KEY not configured' }); return; }

        const result = await assistant(query, parsed.history, apiKey, process.env.DEEPSEEK_MODEL);
        json(res, 200, { ...result, query });
        return;
      }

      // ── Search endpoint (default) ──
      if (!query || query.length < 2) { json(res, 400, { error: 'Query too short' }); return; }
      if (query.length > 500) { json(res, 400, { error: 'Query too long' }); return; }

      const embedKey = process.env.DASHSCOPE_API_KEY;
      if (!embedKey) { json(res, 500, { error: 'DASHSCOPE_API_KEY not configured' }); return; }

      const vec = await embedQuery(query, embedKey);
      const results = search(vec, query);

      json(res, 200, {
        ...results, query, lang: parsed.lang || 'zh',
        model: embeddings.model, dim: embeddings.dim, version: embeddings.version,
      });
    } catch (err) {
      console.error('Request error:', err.message);
      json(res, 500, { error: err.message });
    }
  });
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => console.log(`Superdata search running on port ${PORT}`));
