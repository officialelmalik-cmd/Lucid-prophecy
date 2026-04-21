/**
 * NEOSAI APEX — Cloudflare Worker: Mailchimp Proxy
 *
 * Accepts POST { email, firstName } from the NEOSAI platform,
 * forwards to Mailchimp API v3 using server-side credentials,
 * and returns a normalised { success, message } or { success, error } response.
 *
 * Required secrets (set via `npx wrangler secret put`):
 *   MAILCHIMP_API_KEY      — your Mailchimp API key
 *   MAILCHIMP_LIST_ID      — your audience / list ID
 *
 * Required var (set in wrangler.toml or via dashboard):
 *   MAILCHIMP_SERVER_PREFIX — e.g. "us1", "us14" (from your API key / account URL)
 */

// ─── CORS helpers ──────────────────────────────────────────────────────────────

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function corsResponse(body, status = 200, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

function json(obj, status = 200) {
  return corsResponse(JSON.stringify(obj), status);
}

// ─── Request validation ────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateBody(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body must be JSON.' };
  }
  const { email, firstName } = body;
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Missing required field: email.' };
  }
  if (!EMAIL_RE.test(email.trim())) {
    return { valid: false, error: 'Invalid email address format.' };
  }
  return { valid: true, email: email.trim().toLowerCase(), firstName: (firstName || '').trim() };
}

// ─── Mailchimp API call ────────────────────────────────────────────────────────

async function subscribeToMailchimp({ email, firstName }, env) {
  const { MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, MAILCHIMP_SERVER_PREFIX } = env;

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID) {
    throw new Error('Worker misconfigured: MAILCHIMP_API_KEY and MAILCHIMP_LIST_ID secrets are required.');
  }

  const serverPrefix = MAILCHIMP_SERVER_PREFIX || 'us1';
  const apiUrl = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`;

  // Mailchimp uses HTTP Basic auth: "anystring:<api_key>" base64-encoded
  const credentials = btoa(`neosai:${MAILCHIMP_API_KEY}`);

  const payload = {
    email_address: email,
    status: 'subscribed',
    merge_fields: {
      FNAME: firstName || '144K Node',
    },
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  return { status: response.status, data };
}

// ─── Response normalisation ────────────────────────────────────────────────────

function normaliseMailchimpResponse(status, data) {
  // 200 = updated existing member, 201 = new subscriber
  if (status === 200 || status === 201) {
    return {
      success: true,
      message: `${data.email_address} has been added to the 144K broadcast list.`,
    };
  }

  // Mailchimp error codes
  const title = data.title || '';
  const detail = data.detail || data.message || 'Unknown error';

  if (title === 'Member Exists') {
    return {
      success: true, // treat as success — they're already on the list
      message: `${data.email_address || 'This email'} is already in the 144K broadcast list.`,
    };
  }

  if (title === 'Invalid Resource') {
    // Often a bad email address or merge field issue
    return {
      success: false,
      error: `Invalid data: ${detail}`,
    };
  }

  if (status === 401 || status === 403) {
    return {
      success: false,
      error: 'Mailchimp authentication failed — check MAILCHIMP_API_KEY secret.',
    };
  }

  if (status === 404) {
    return {
      success: false,
      error: 'Mailchimp list not found — check MAILCHIMP_LIST_ID secret.',
    };
  }

  return {
    success: false,
    error: `Mailchimp error (${status}): ${detail}`,
  };
}

// ─── Main fetch handler ────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check
    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ status: 'ok', service: 'neosai-mailchimp-proxy' });
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Only accept POST to / or /subscribe
    if (request.method !== 'POST') {
      return json({ success: false, error: `Method ${request.method} not allowed.` }, 405);
    }

    if (url.pathname !== '/' && url.pathname !== '/subscribe') {
      return json({ success: false, error: 'Not found.' }, 404);
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: 'Invalid JSON body.' }, 400);
    }

    // Validate
    const validation = validateBody(body);
    if (!validation.valid) {
      return json({ success: false, error: validation.error }, 400);
    }

    // Call Mailchimp
    let mcStatus, mcData;
    try {
      const result = await subscribeToMailchimp(
        { email: validation.email, firstName: validation.firstName },
        env
      );
      mcStatus = result.status;
      mcData = result.data;
    } catch (err) {
      console.error('Mailchimp fetch error:', err.message);
      return json(
        { success: false, error: `Worker error: ${err.message}` },
        500
      );
    }

    // Normalise and return
    const normalised = normaliseMailchimpResponse(mcStatus, mcData);
    const httpStatus = normalised.success ? 200 : (mcStatus >= 400 && mcStatus < 500 ? mcStatus : 500);
    return json(normalised, normalised.success ? 200 : httpStatus);
  },
};
