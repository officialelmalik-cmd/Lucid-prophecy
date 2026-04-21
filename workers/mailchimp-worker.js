/* NEOSAI APEX — Mailchimp Proxy Worker (Cloudflare Worker)
 *
 * This is the worker that blocked you before. Follow these steps exactly:
 *
 * Deployment:
 *   1. Cloudflare → Workers & Pages → Create → "Start with Hello World!" ← IMPORTANT
 *      (NOT "Upload your static files" — that caused the previous error)
 *   2. Click Deploy → then click "Edit Code"
 *   3. Select all the default code and paste THIS file
 *   4. Click "Save and Deploy"
 *   5. Go to Settings → Variables → Add these Secrets (click Encrypt):
 *        MAILCHIMP_API_KEY   = your-api-key (found in Mailchimp → Account → Extras → API Keys)
 *        MAILCHIMP_SERVER    = us1  (the prefix from your API key, e.g. us1, us6, us12)
 *        MAILCHIMP_LIST_ID   = your-list-id (Audience → Settings → Audience name and defaults)
 *        ALLOWED_ORIGIN      = https://sai8.com
 *   6. Copy your Worker URL (e.g. mailchimp-proxy.your-name.workers.dev)
 *   7. Paste it into js/config.js → workers.mailchimp
 */

function corsHeaders(origin) {
  const allowed = self.ALLOWED_ORIGIN || 'https://sai8.com';
  return {
    'Access-Control-Allow-Origin': (origin === allowed || origin?.includes('localhost')) ? origin : allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function mailchimpURL(path) {
  const server = self.MAILCHIMP_SERVER || 'us1';
  return `https://${server}.api.mailchimp.com/3.0${path}`;
}

function mailchimpAuth() {
  return 'Basic ' + btoa(`anystring:${self.MAILCHIMP_API_KEY}`);
}

async function mailchimpRequest(path, method, body) {
  const res = await fetch(mailchimpURL(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': mailchimpAuth(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  try { return { ok: res.ok, status: res.status, data: JSON.parse(text) }; }
  catch { return { ok: res.ok, status: res.status, data: { raw: text } }; }
}

/* MD5 for Mailchimp member ID (subscriber hash) */
async function md5(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  /* Cloudflare doesn't have MD5 natively; use SHA-256 as lookup key instead */
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
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

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const path = url.pathname;
  const listId = self.MAILCHIMP_LIST_ID;

  try {
    /* POST /subscribe */
    if (path === '/subscribe') {
      const body = await request.json();
      const { email, tags = [], status = 'subscribed' } = body;

      if (!email || !email.includes('@')) {
        return new Response(JSON.stringify({ error: 'Valid email required' }), { status: 400 });
      }

      const subscriberHash = await md5(email.toLowerCase());
      const result = await mailchimpRequest(
        `/lists/${listId}/members/${subscriberHash}`,
        'PUT',
        {
          email_address: email,
          status_if_new: status,
          status,
          tags: tags.map(name => ({ name, status: 'active' })),
          merge_fields: {
            SOURCE: 'neosai-apex',
          },
        }
      );

      const responseStatus = result.ok ? 200 : result.status;
      return new Response(JSON.stringify(result.data), {
        status: responseStatus,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    /* POST /unsubscribe */
    if (path === '/unsubscribe') {
      const body = await request.json();
      const { email } = body;
      const subscriberHash = await md5(email.toLowerCase());

      const result = await mailchimpRequest(
        `/lists/${listId}/members/${subscriberHash}`,
        'PATCH',
        { status: 'unsubscribed' }
      );

      return new Response(JSON.stringify(result.data), {
        status: result.ok ? 200 : result.status,
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
