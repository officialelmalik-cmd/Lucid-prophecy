/* NEOSAI APEX — Replicate Proxy Worker (Cloudflare Worker)
 *
 * Deployment:
 *   1. Cloudflare → Workers & Pages → Create → Start with Hello World
 *   2. Name it: replicate-proxy
 *   3. Deploy → Edit Code → paste this file
 *   4. Settings → Variables → Add Secrets:
 *        REPLICATE_API_TOKEN = r8_...your token...
 *        ALLOWED_ORIGIN      = https://sai8.com
 */

const REPLICATE_BASE = 'https://api.replicate.com/v1';

function corsHeaders(origin) {
  const allowed = self.ALLOWED_ORIGIN || 'https://sai8.com';
  return {
    'Access-Control-Allow-Origin': (origin === allowed || origin?.includes('localhost')) ? origin : allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function replicateHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Token ${self.REPLICATE_API_TOKEN}`,
  };
}

async function createPrediction(body) {
  const res = await fetch(`${REPLICATE_BASE}/predictions`, {
    method: 'POST',
    headers: replicateHeaders(),
    body: JSON.stringify({ version: body.version, input: body.input }),
  });
  return res.json();
}

async function getPrediction(id) {
  const res = await fetch(`${REPLICATE_BASE}/predictions/${id}`, {
    headers: replicateHeaders(),
  });
  return res.json();
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin') || '';

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  const path = url.pathname;

  try {
    /* POST /predict — start a prediction */
    if (request.method === 'POST' && path === '/predict') {
      const body = await request.json();
      const data = await createPrediction(body);
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    /* GET /predict/:id — poll prediction status */
    if (request.method === 'GET' && path.startsWith('/predict/')) {
      const id = path.replace('/predict/', '');
      const data = await getPrediction(id);
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  }
}
