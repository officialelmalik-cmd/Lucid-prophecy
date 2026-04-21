/* NEOSAI APEX — Slack Proxy Worker (Cloudflare Worker)
 *
 * Deployment:
 *   1. Cloudflare → Workers & Pages → Create → Start with Hello World
 *   2. Name it: slack-proxy
 *   3. Deploy → Edit Code → paste this file
 *   4. Settings → Variables → Add Secrets:
 *        SLACK_BOT_TOKEN  = xoxb-...your bot token...
 *        ALLOWED_ORIGIN   = https://sai8.com
 *
 * Slack App Setup:
 *   - Create app at api.slack.com/apps
 *   - Add OAuth scopes: chat:write, channels:read
 *   - Install to workspace → copy Bot Token
 */

const SLACK_BASE = 'https://slack.com/api';

function corsHeaders(origin) {
  const allowed = self.ALLOWED_ORIGIN || 'https://sai8.com';
  return {
    'Access-Control-Allow-Origin': (origin === allowed || origin?.includes('localhost')) ? origin : allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

async function slackAPI(method, params) {
  const res = await fetch(`${SLACK_BASE}/${method}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': `Bearer ${self.SLACK_BOT_TOKEN}`,
    },
    body: JSON.stringify(params),
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

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const path = url.pathname;

  try {
    /* POST /notify — send a message */
    if (path === '/notify') {
      const body = await request.json();
      const { text, channel = '#general', blocks } = body;

      const params = { channel, text };
      if (blocks) params.blocks = blocks;

      const data = await slackAPI('chat.postMessage', params);

      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    /* POST /notify-rich — send a rich block message */
    if (path === '/notify-rich') {
      const body = await request.json();
      const data = await slackAPI('chat.postMessage', {
        channel: body.channel || '#general',
        text: body.fallback || 'NEOSAI APEX notification',
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: body.text },
          },
          body.footer ? {
            type: 'context',
            elements: [{ type: 'mrkdwn', text: body.footer }],
          } : null,
        ].filter(Boolean),
      });

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
