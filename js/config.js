/* NEOSAI APEX — Runtime Config
 * API keys are loaded from environment variables at the worker/proxy layer.
 * For GitHub Pages (static), keys are injected via Cloudflare Workers.
 * NEVER commit real keys here — use .env.local or worker secrets.
 */
const CONFIG = {
  /* ── Worker Proxy Base URLs ──────────────────────────────────────────────
   * Replace these with your deployed Cloudflare Worker URLs after deployment.
   * Each worker handles auth, rate-limiting, and forwards to the real API.
   */
  workers: {
    openai:    'https://openai-proxy.YOUR_SUBDOMAIN.workers.dev',
    replicate: 'https://replicate-proxy.YOUR_SUBDOMAIN.workers.dev',
    stripe:    'https://stripe-proxy.YOUR_SUBDOMAIN.workers.dev',
    slack:     'https://slack-proxy.YOUR_SUBDOMAIN.workers.dev',
    mailchimp: 'https://mailchimp-proxy.YOUR_SUBDOMAIN.workers.dev',
  },

  /* ── Stripe Public Key (safe to expose) ── */
  stripePublicKey: 'pk_live_YOUR_STRIPE_PUBLIC_KEY',

  /* ── Feature Flags ── */
  features: {
    imageGeneration: true,
    textGeneration:  true,
    chat:            true,
    payments:        true,
    newsletter:      true,
    slackNotify:     true,
  },

  /* ── App Settings ── */
  app: {
    name:    'NEOSAI APEX',
    version: '1.0.0',
    domain:  'sai8.com',
  },

  /* ── Default AI Models ── */
  models: {
    text:  'gpt-4-turbo-preview',
    image: 'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e702ddd8071330d70978d9148',
    chat:  'gpt-4-turbo-preview',
  },
};

/* Detect dev vs prod */
CONFIG.isDev = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
);

if (CONFIG.isDev) {
  CONFIG.workers.openai    = 'http://localhost:8787/openai';
  CONFIG.workers.replicate = 'http://localhost:8787/replicate';
  CONFIG.workers.stripe    = 'http://localhost:8787/stripe';
  CONFIG.workers.slack     = 'http://localhost:8787/slack';
  CONFIG.workers.mailchimp = 'http://localhost:8787/mailchimp';
}

window.NEOSAI_CONFIG = CONFIG;
