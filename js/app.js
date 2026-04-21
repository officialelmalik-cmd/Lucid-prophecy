/* NEOSAI APEX — Main Application */

(function () {
  'use strict';

  const API = window.NEOSAI_API;

  /* ── Toast Notifications ── */
  const Toast = {
    show(message, type = 'info', duration = 4000) {
      const container = document.getElementById('toast-container');
      const icons = { success: '✓', error: '✗', info: 'ℹ' };
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },
    success: (msg) => Toast.show(msg, 'success'),
    error:   (msg) => Toast.show(msg, 'error'),
    info:    (msg) => Toast.show(msg, 'info'),
  };

  /* ── Theme Toggle ── */
  function initTheme() {
    const btn = document.getElementById('theme-toggle');
    const stored = localStorage.getItem('neosai-theme') || 'dark';
    applyTheme(stored);

    btn?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('neosai-theme', next);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.querySelector('.theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  /* ── Navbar scroll effect ── */
  function initNavbar() {
    window.addEventListener('scroll', () => {
      const navbar = document.querySelector('.navbar');
      navbar?.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  /* ── Auth Modal ── */
  function initAuthModal() {
    const modal = document.getElementById('auth-modal');
    const closeBtn = document.getElementById('close-modal');
    const backdrop = modal?.querySelector('.modal-backdrop');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForm = document.getElementById('auth-form');
    const signupOnly = document.querySelectorAll('.signup-only');
    const authBtnText = document.getElementById('auth-btn-text');

    function openModal() { modal?.classList.add('open'); }
    function closeModal() { modal?.classList.remove('open'); }

    document.getElementById('get-started-btn')?.addEventListener('click', openModal);
    document.getElementById('start-free-btn')?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    backdrop?.addEventListener('click', closeModal);

    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const isSignup = tab.dataset.auth === 'signup';
        signupOnly.forEach(el => el.style.display = isSignup ? 'block' : 'none');
        if (authBtnText) authBtnText.textContent = isSignup ? 'Create Account' : 'Sign In';
      });
    });

    authForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = authForm.querySelector('button[type="submit"]');
      const email = document.getElementById('auth-email').value;
      const isSignup = document.querySelector('.auth-tab.active')?.dataset.auth === 'signup';

      btn.classList.add('loading');
      try {
        await new Promise(r => setTimeout(r, 1200)); /* Demo delay */
        closeModal();
        Toast.success(isSignup ? 'Account created! Welcome to NEOSAI APEX.' : 'Welcome back!');
        if (isSignup) {
          /* Subscribe to Mailchimp on signup */
          API.mailchimp.subscribe(email, ['signup']).catch(console.warn);
          /* Notify Slack */
          API.slack.notifyNewUser(email).catch(console.warn);
        }
      } catch (err) {
        Toast.error(err.message || 'Authentication failed');
      } finally {
        btn.classList.remove('loading');
      }
    });
  }

  /* ── Studio Tabs ── */
  function initStudioTabs() {
    const tabs = document.querySelectorAll('.studio-tab');
    const panels = document.querySelectorAll('.studio-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.tab + '-panel');
        target?.classList.add('active');
      });
    });
  }

  /* ── Text Generation ── */
  function initTextGeneration() {
    const btn = document.getElementById('generate-text-btn');
    const prompt = document.getElementById('text-prompt');
    const output = document.getElementById('text-output');
    const copyBtn = document.getElementById('copy-text-btn');
    const modelSel = document.getElementById('text-model');

    btn?.addEventListener('click', async () => {
      const text = prompt.value.trim();
      if (!text) { Toast.info('Please enter a prompt'); return; }

      btn.classList.add('loading');
      output.classList.add('loading');
      output.classList.remove('has-content');
      output.innerHTML = '';

      try {
        const data = await API.openai.complete(text, modelSel?.value);
        const result = data.choices?.[0]?.message?.content || data.result || '';
        output.textContent = result;
        output.classList.add('has-content');
        output.classList.remove('loading');
      } catch (err) {
        output.classList.remove('loading');
        output.innerHTML = `<span style="color:var(--accent-pink)">${err.message}</span>`;
        Toast.error('Text generation failed: ' + err.message);
      } finally {
        btn.classList.remove('loading');
      }
    });

    copyBtn?.addEventListener('click', () => {
      const text = output.textContent;
      if (!text || output.querySelector('.placeholder-text')) return;
      navigator.clipboard.writeText(text).then(() => Toast.success('Copied to clipboard'));
    });

    /* Allow Ctrl+Enter to generate */
    prompt?.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') btn?.click();
    });
  }

  /* ── Image Generation ── */
  function initImageGeneration() {
    const btn = document.getElementById('generate-image-btn');
    const prompt = document.getElementById('image-prompt');
    const output = document.getElementById('image-output');
    const downloadBtn = document.getElementById('download-image-btn');
    const modelSel = document.getElementById('image-model');
    let lastImageUrl = null;

    btn?.addEventListener('click', async () => {
      const text = prompt.value.trim();
      if (!text) { Toast.info('Please describe the image you want to generate'); return; }

      btn.classList.add('loading');
      output.innerHTML = `
        <div class="image-placeholder">
          <span class="placeholder-icon" style="animation: spin 1s linear infinite; display: inline-block">⟳</span>
          <p>Generating your image… this takes 20-40 seconds</p>
        </div>`;

      try {
        const data = await API.replicate.generateImage(text, modelSel?.value);
        const url = Array.isArray(data.output) ? data.output[0] : data.output;
        lastImageUrl = url;
        output.innerHTML = `<img src="${url}" alt="${text}" loading="lazy">`;
      } catch (err) {
        output.innerHTML = `
          <div class="image-placeholder">
            <span class="placeholder-icon">⚠️</span>
            <p style="color:var(--accent-pink)">${err.message}</p>
          </div>`;
        Toast.error('Image generation failed: ' + err.message);
      } finally {
        btn.classList.remove('loading');
      }
    });

    downloadBtn?.addEventListener('click', () => {
      if (!lastImageUrl) return;
      const a = document.createElement('a');
      a.href = lastImageUrl;
      a.download = 'neosai-image.png';
      a.target = '_blank';
      a.click();
    });

    prompt?.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') btn?.click();
    });
  }

  /* ── Chat ── */
  function initChat() {
    const sendBtn = document.getElementById('send-chat-btn');
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    const history = [{ role: 'system', content: 'You are a helpful AI assistant for NEOSAI APEX, an AI-powered platform. Be concise and helpful.' }];

    function appendMessage(role, content) {
      const isUser = role === 'user';
      const div = document.createElement('div');
      div.className = `chat-message ${isUser ? 'user' : 'assistant'}`;
      div.innerHTML = `
        <div class="message-avatar">${isUser ? '👤' : '🤖'}</div>
        <div class="message-content"><p>${content}</p></div>`;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;

      input.value = '';
      appendMessage('user', text);
      history.push({ role: 'user', content: text });

      const thinking = document.createElement('div');
      thinking.className = 'chat-message assistant';
      thinking.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content"><p style="color:var(--text-muted)">Thinking…</p></div>`;
      messages.appendChild(thinking);
      messages.scrollTop = messages.scrollHeight;

      try {
        const data = await API.openai.chat(history);
        const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
        thinking.remove();
        history.push({ role: 'assistant', content: reply });
        appendMessage('assistant', reply);
      } catch (err) {
        thinking.remove();
        appendMessage('assistant', `Error: ${err.message}`);
      }
    }

    sendBtn?.addEventListener('click', sendMessage);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }

  /* ── Pricing Toggle ── */
  function initPricing() {
    const toggle = document.getElementById('billing-toggle');
    const prices = document.querySelectorAll('.price');

    toggle?.addEventListener('change', () => {
      const isAnnual = toggle.checked;
      prices.forEach(el => {
        const val = isAnnual ? el.dataset.annual : el.dataset.monthly;
        el.textContent = val;
      });
    });

    /* Plan buttons → Stripe checkout */
    document.querySelectorAll('[data-plan]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const plan = btn.dataset.plan;
        if (plan === 'starter') {
          document.getElementById('auth-modal')?.classList.add('open');
          return;
        }
        if (plan === 'enterprise') {
          Toast.info('Contact us at hello@sai8.com for enterprise pricing');
          return;
        }
        btn.classList.add('loading');
        try {
          await API.stripe.createCheckoutSession(plan);
        } catch (err) {
          Toast.error('Could not start checkout: ' + err.message);
          btn.classList.remove('loading');
        }
      });
    });
  }

  /* ── Newsletter Form ── */
  function initNewsletter() {
    const form = document.getElementById('newsletter-form');
    const successEl = document.getElementById('newsletter-success');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletter-email').value.trim();
      if (!email) return;

      const btn = form.querySelector('button');
      btn.classList.add('loading');

      try {
        await API.mailchimp.subscribe(email, ['newsletter']);
        form.style.display = 'none';
        successEl.style.display = 'flex';
        Toast.success('Subscribed! Check your inbox for a confirmation email.');
        API.slack.notify(`📧 Newsletter signup: ${email}`).catch(console.warn);
      } catch (err) {
        Toast.error('Subscription failed: ' + err.message);
        btn.classList.remove('loading');
      }
    });
  }

  /* ── Smooth scroll for nav links ── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Check URL params (Stripe return) ── */
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1') {
      Toast.success('Payment successful! Welcome to NEOSAI APEX Pro.');
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (params.get('cancelled') === '1') {
      Toast.info('Checkout was cancelled. You can try again anytime.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  /* ── Demo mode (no live API keys configured) ── */
  function enableDemoMode() {
    const cfg = window.NEOSAI_CONFIG;
    if (!cfg.workers.openai.includes('YOUR_SUBDOMAIN')) return;

    /* Patch API to return mock data */
    window.NEOSAI_API.openai.complete = async (prompt) => {
      await new Promise(r => setTimeout(r, 1400));
      return { choices: [{ message: { content: `[Demo] You asked: "${prompt}"\n\nThis is a demo response. Connect your OpenAI API key via the Cloudflare Worker to enable live AI responses.` } }] };
    };

    window.NEOSAI_API.openai.chat = async (messages) => {
      await new Promise(r => setTimeout(r, 1000));
      const last = messages[messages.length - 1]?.content || '';
      return { choices: [{ message: { content: `[Demo] You said: "${last}" — Connect your OpenAI key to enable real chat.` } }] };
    };

    window.NEOSAI_API.replicate.generateImage = async (prompt) => {
      await new Promise(r => setTimeout(r, 2000));
      return { output: [`https://picsum.photos/seed/${encodeURIComponent(prompt)}/512/512`] };
    };

    window.NEOSAI_API.mailchimp.subscribe = async (email) => {
      await new Promise(r => setTimeout(r, 800));
      console.log('[Demo] Mailchimp subscribe:', email);
      return { status: 'subscribed' };
    };

    window.NEOSAI_API.slack.notify = async (msg) => {
      console.log('[Demo] Slack notify:', msg);
      return { ok: true };
    };
  }

  /* ── Boot ── */
  function init() {
    initTheme();
    initNavbar();
    initAuthModal();
    initStudioTabs();
    initTextGeneration();
    initImageGeneration();
    initChat();
    initPricing();
    initNewsletter();
    initSmoothScroll();
    checkUrlParams();
    enableDemoMode();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
