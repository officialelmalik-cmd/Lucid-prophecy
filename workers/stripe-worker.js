/* NEOSAI APEX — Stripe Proxy Worker (Cloudflare Worker)
 *
 * Deployment:
 *   1. Cloudflare → Workers & Pages → Create → Start with Hello World
 *   2. Name it: stripe-proxy
 *   3. Deploy → Edit Code → paste this file
 *   4. Settings → Variables → Add Secrets:
 *        STRIPE_SECRET_KEY   = sk_live_...
 *        STRIPE_WEBHOOK_SECRET = whsec_...
 *        ALLOWED_ORIGIN      = https://sai8.com
 *
 * Price IDs — create these in your Stripe Dashboard and add them as secrets:
 *        PRICE_PRO_MONTHLY       = price_...
 *        PRICE_PRO_ANNUAL        = price_...
 *        PRICE_ENTERPRISE_MONTHLY = price_...
 *        PRICE_ENTERPRISE_ANNUAL  = price_...
 */

const STRIPE_BASE = 'https://api.stripe.com/v1';

function corsHeaders(origin) {
  const allowed = self.ALLOWED_ORIGIN || 'https://sai8.com';
  return {
    'Access-Control-Allow-Origin': (origin === allowed || origin?.includes('localhost')) ? origin : allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
    'Access-Control-Max-Age': '86400',
  };
}

function stripePost(path, params) {
  const body = new URLSearchParams(params).toString();
  return fetch(`${STRIPE_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${self.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
}

const PRICE_MAP = {
  'pro-monthly':         () => self.PRICE_PRO_MONTHLY,
  'pro-annual':          () => self.PRICE_PRO_ANNUAL,
  'enterprise-monthly':  () => self.PRICE_ENTERPRISE_MONTHLY,
  'enterprise-annual':   () => self.PRICE_ENTERPRISE_ANNUAL,
};

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
    /* POST /checkout — create a Stripe Checkout session */
    if (path === '/checkout' && request.method === 'POST') {
      const body = await request.json();
      const { plan, successUrl, cancelUrl } = body;

      /* Determine billing interval from toggle */
      const annual = body.annual ? 'annual' : 'monthly';
      const priceKey = `${plan}-${annual}`;
      const priceId = PRICE_MAP[priceKey]?.();

      if (!priceId) {
        return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400 });
      }

      const res = await stripePost('/checkout/sessions', {
        'mode': 'subscription',
        'payment_method_types[]': 'card',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'success_url': successUrl || 'https://sai8.com/?success=1',
        'cancel_url': cancelUrl || 'https://sai8.com/?cancelled=1',
        'allow_promotion_codes': 'true',
      });

      const session = await res.json();
      return new Response(JSON.stringify({ sessionId: session.id }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    /* POST /portal — Stripe Customer Portal */
    if (path === '/portal' && request.method === 'POST') {
      const body = await request.json();
      const res = await stripePost('/billing_portal/sessions', {
        customer: body.customerId,
        return_url: body.returnUrl || 'https://sai8.com',
      });
      const session = await res.json();
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      });
    }

    /* POST /webhook — Stripe webhook handler */
    if (path === '/webhook' && request.method === 'POST') {
      /* In production: verify Stripe-Signature header here */
      const payload = await request.text();
      const event = JSON.parse(payload);

      if (event.type === 'checkout.session.completed') {
        /* Provision access, send welcome email, notify Slack, etc. */
        console.log('Checkout complete:', event.data.object.customer_email);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
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
