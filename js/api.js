/* NEOSAI APEX — API Client Layer
 * All external API calls go through Cloudflare Worker proxies.
 * This keeps secrets server-side while the frontend remains static.
 */

const API = (() => {
  const cfg = () => window.NEOSAI_CONFIG;

  /* ── Generic fetch helper ── */
  async function request(url, options = {}) {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  /* ══════════════════════════════════════════════════════════════
   * OpenAI — Text generation & chat (proxied via Cloudflare Worker)
   * ══════════════════════════════════════════════════════════════ */
  const openai = {
    async complete(prompt, model = null) {
      return request(cfg().workers.openai + '/complete', {
        method: 'POST',
        body: JSON.stringify({
          model: model || cfg().models.text,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });
    },

    async chat(messages, model = null) {
      return request(cfg().workers.openai + '/chat', {
        method: 'POST',
        body: JSON.stringify({
          model: model || cfg().models.chat,
          messages,
          max_tokens: 1024,
          temperature: 0.8,
        }),
      });
    },
  };

  /* ══════════════════════════════════════════════════════════════
   * Replicate — Image generation (proxied via Cloudflare Worker)
   * ══════════════════════════════════════════════════════════════ */
  const replicate = {
    async generateImage(prompt, modelVersion = null) {
      const version = modelVersion || cfg().models.image;
      const data = await request(cfg().workers.replicate + '/predict', {
        method: 'POST',
        body: JSON.stringify({
          version,
          input: {
            prompt,
            negative_prompt: 'blurry, low quality, distorted',
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 50,
          },
        }),
      });
      /* Poll for result if async */
      if (data.status === 'starting' || data.status === 'processing') {
        return replicate.pollPrediction(data.id);
      }
      return data;
    },

    async pollPrediction(predictionId, maxAttempts = 30) {
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, 2000));
        const data = await request(
          cfg().workers.replicate + '/predict/' + predictionId
        );
        if (data.status === 'succeeded') return data;
        if (data.status === 'failed') throw new Error(data.error || 'Prediction failed');
      }
      throw new Error('Image generation timed out');
    },
  };

  /* ══════════════════════════════════════════════════════════════
   * Stripe — Payment & subscription management
   * ══════════════════════════════════════════════════════════════ */
  const stripe = {
    _stripe: null,

    async init() {
      if (this._stripe) return this._stripe;
      await loadScript('https://js.stripe.com/v3/');
      this._stripe = window.Stripe(cfg().stripePublicKey);
      return this._stripe;
    },

    async createCheckoutSession(plan) {
      const data = await request(cfg().workers.stripe + '/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan, successUrl: window.location.origin + '/?success=1', cancelUrl: window.location.href }),
      });
      const stripeClient = await this.init();
      return stripeClient.redirectToCheckout({ sessionId: data.sessionId });
    },

    async createPortalSession() {
      const data = await request(cfg().workers.stripe + '/portal', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      window.location.href = data.url;
    },
  };

  /* ══════════════════════════════════════════════════════════════
   * Slack — Notifications
   * ══════════════════════════════════════════════════════════════ */
  const slack = {
    async notify(message, channel = '#general') {
      return request(cfg().workers.slack + '/notify', {
        method: 'POST',
        body: JSON.stringify({ text: message, channel }),
      });
    },

    async notifyNewUser(email) {
      return this.notify(`🚀 New user signed up: *${email}*`, '#signups');
    },

    async notifyPayment(plan, amount) {
      return this.notify(`💳 New payment: *${plan}* — $${amount}`, '#payments');
    },
  };

  /* ══════════════════════════════════════════════════════════════
   * Mailchimp — Email list & campaigns
   * ══════════════════════════════════════════════════════════════ */
  const mailchimp = {
    async subscribe(email, tags = []) {
      return request(cfg().workers.mailchimp + '/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email, tags, status: 'subscribed' }),
      });
    },

    async unsubscribe(email) {
      return request(cfg().workers.mailchimp + '/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
  };

  /* ── Script loader utility ── */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  return { openai, replicate, stripe, slack, mailchimp };
})();

window.NEOSAI_API = API;
