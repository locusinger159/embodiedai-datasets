/**
 * Superdata RobotAI — AI Search Backend (Alibaba Cloud FC Web Function)
 * Start command: node index.js
 * Port: 9000
 *
 * Uses Bailian (百炼) OpenAI-compatible API for text embedding.
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
      dimensions: 1024,
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

// Search
function search(queryVec) {
  const scored = (arr, k) =>
    arr.map(item => ({ ...item, score: Math.round(cosineSim(queryVec, item.vec) * 100) }))
       .sort((a, b) => b.score - a.score)
       .slice(0, k)
       .map(({ vec, ...rest }) => rest);

  return {
    datasets: scored(embeddings.datasets, 5),
    standards: scored(embeddings.standards, 2),
    tools: scored(embeddings.tools, 2),
  };
}

// CORS and response helpers
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

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // POST /api/search only
  if (req.method !== 'POST') {
    json(res, 405, { error: 'Use POST /api/search' });
    return;
  }

  // Read body
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      const { query, lang } = JSON.parse(body || '{}');
      const q = (query || '').trim();
      if (!q || q.length < 2) {
        json(res, 400, { error: 'Query too short' });
        return;
      }
      if (q.length > 500) {
        json(res, 400, { error: 'Query too long' });
        return;
      }

      const apiKey = process.env.DASHSCOPE_API_KEY;
      if (!apiKey) {
        json(res, 500, { error: 'Server config' });
        return;
      }

      const vec = await embedQuery(q, apiKey);
      const results = search(vec);

      json(res, 200, {
        ...results, query: q, lang: lang || 'zh',
        model: embeddings.model, version: embeddings.version,
      });
    } catch (err) {
      console.error('Search error:', err.message);
      json(res, 500, { error: err.message });
    }
  });
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Superdata search server running on port ${PORT}`);
});
