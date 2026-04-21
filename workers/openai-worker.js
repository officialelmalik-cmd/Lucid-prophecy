/* NEOSAI APEX — OpenAI Proxy Worker (Cloudflare Worker)
 *
 * Deployment:
 *   1. Go to Cloudflare Dashboard → Workers & Pages → Create → Start with Hello World
 *   2. Name it: openai-proxy
 *   3. Deploy → Edit Code → paste this file
 *   4. Settings → Variables → Add Secret:
 *        OPENAI_API_KEY = sk-...your key...
 *        ALLOWED_ORIGIN = https://sai8.com
 */

const OPENAI_BASE = 'https://api.openai.com/v1';

function corsHeaders(origin) {
  const allowed = self.ALLOWED_ORIGIN || 'https://sai8.com';
  return {
    'Access-Control-Allow-Origin': (origin === allowed || origin === 'http://localhost:8787') ? origin : allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

async function handleChat(request, path) {
  const body = await request.json();
  const endpoint = path === '/complete' ? '/chat/completions' : '/chat/completions';

  const res = await fetch(OPENAI_BASE + endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${self.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: body.model || 'gpt-4-turbo-preview',
      messages: body.messages,
      max_tokens: Math.min(body.max_tokens || 1024, 2048),
      temperature: body.temperature || 0.7,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request.headers.get('Origin') || '') },
  });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin') || '';

  /* Preflight */
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  /* Rate-limit: only POST allowed */
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const path = url.pathname;

  try {
    if (path === '/complete' || path === '/chat') {
      return await handleChat(request, path);
    }
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  }
}
