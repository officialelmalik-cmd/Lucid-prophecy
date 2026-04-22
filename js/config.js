const NeoConfig = {
    STORAGE_KEY: 'neosai_apex_config',
    AUTH_KEY: 'neosai_apex_auth',
    ADMIN_PASS: 'NEOSAI2026',

    _d: function(s) { return atob(s); },

    _k: {
        o: 'c2stcHJvai1PYmltZFpCOTc4Rmx5SlhuYjRtTkZxblA1Z29aRUNRLUFLRTRQb2V1X3ZvcmZoLU1nZy1Sc2V0czAyVG1DWEFORnhFTTRBRXpnWlQzQmxia0ZKVEdQaDFjSEcwOVpvSUVBUG1CblhRV1VWenBJaTFtdWpkbzlyOXVoM1QzU01OQU4xa3lBREVGX19IWEE3SEtLbHYyNDVZMFIwQUE=',
        r: 'cjhfYWNqaWE2bXROa3JEdEQ2U3JGa1pPTlFmblRha1pHSjI3TExHcA==',
        sp: 'cGtfdGVzdF81MVRPVVQ1SUlsaG1abWtWcU9EcWVkeFVmSlVtNWEwSURueUF3eG5wT09NYWt2d24yemtoZ2hIRGtNNUVFeEFVd2xZa0NkaVdSeWZUSlAyYUNoa3RvZU1jMDBaeUVtTHhxbg==',
        ss: 'cmtfdGVzdF81MVRPVUQ1SVVJbGhtWm1rVlFCVDMyOWVZUnBuZDZqSGF2Qk9wZTZoZXBvT3lkdGc4ZFhJTVpwVHhXSzAzU2JWMUhzTndyRFhMZFRWTlhiVnZKdkI2RWdLdzAwU1Z6OGZxTzE='
    },

    defaults: {
        openai: '',
        anthropic: '',
        elevenlabs: '',
        stripe_pk: '',
        stripe_sk: '',
        stripe_price: '',
        replicate: '',
        slack_token: '',
        slack_channel: '',
        mailchimp_key: '',
        mailchimp_list: '',
        worker_url: 'https://neosai-apex-v2.workers.dev'
    },

    keys: {},

    init() {
        this.defaults.openai = this._d(this._k.o);
        this.defaults.replicate = this._d(this._k.r);
        this.defaults.stripe_pk = this._d(this._k.sp);
        this.defaults.stripe_sk = this._d(this._k.ss);
    },

    load() {
        this.init();
        this.keys = { ...this.defaults };
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                for (const key in parsed) {
                    if (parsed[key]) this.keys[key] = parsed[key];
                }
            }
        } catch (e) {
            console.warn('Failed to load config:', e);
        }
        return this.keys;
    },

    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.keys));
            return true;
        } catch (e) {
            console.error('Failed to save config:', e);
            return false;
        }
    },

    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.keys = { ...this.defaults };
    },

    get(key) {
        return this.keys[key] || this.defaults[key] || '';
    },

    set(key, value) {
        this.keys[key] = value;
    },

    isConfigured(api) {
        switch (api) {
            case 'openai':
                return !!this.get('openai');
            case 'stripe':
                return !!this.get('stripe_pk');
            case 'replicate':
                return !!this.get('replicate');
            case 'slack':
                return !!this.get('slack_token');
            case 'mailchimp':
                return !!this.get('mailchimp_key') && !!this.get('mailchimp_list');
            default:
                return false;
        }
    },

    getWorkerUrl() {
        return this.get('worker_url');
    },

    hasWorker() {
        return !!this.get('worker_url');
    },

    isAuthorized() {
        return sessionStorage.getItem(this.AUTH_KEY) === 'true';
    },

    authorize(password) {
        if (password === this.ADMIN_PASS) {
            sessionStorage.setItem(this.AUTH_KEY, 'true');
            return true;
        }
        return false;
    }
};

NeoConfig.load();

function initConfigModal() {
    const modal = document.getElementById('configModal');
    const openBtn = document.getElementById('openConfig');
    const closeBtn = document.getElementById('closeConfig');
    const saveBtn = document.getElementById('saveConfig');
    const clearBtn = document.getElementById('clearConfig');

    const fields = {
        'openai-key': 'openai',
        'anthropic-key': 'anthropic',
        'elevenlabs-key': 'elevenlabs',
        'stripe-pk': 'stripe_pk',
        'stripe-sk': 'stripe_sk',
        'stripe-price': 'stripe_price',
        'replicate-key': 'replicate',
        'slack-token': 'slack_token',
        'slack-channel': 'slack_channel',
        'mailchimp-key': 'mailchimp_key',
        'mailchimp-list': 'mailchimp_list',
        'worker-url': 'worker_url'
    };

    function populateFields() {
        for (const [fieldId, configKey] of Object.entries(fields)) {
            const el = document.getElementById(fieldId);
            if (el) {
                el.value = NeoConfig.get(configKey);
            }
        }
    }

    function saveFields() {
        for (const [fieldId, configKey] of Object.entries(fields)) {
            const el = document.getElementById(fieldId);
            if (el) {
                NeoConfig.set(configKey, el.value.trim());
            }
        }
        NeoConfig.save();
        updateModuleStatuses();
        modal.classList.remove('active');
        if (typeof NeoApp !== 'undefined' && NeoApp.showNotification) {
            NeoApp.showNotification('Configuration saved!', 'success');
        }
    }

    openBtn.addEventListener('click', () => {
        if (!NeoConfig.isAuthorized()) {
            const pass = prompt('Enter admin password:');
            if (!NeoConfig.authorize(pass)) {
                alert('Invalid password');
                return;
            }
        }
        populateFields();
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    saveBtn.addEventListener('click', saveFields);

    clearBtn.addEventListener('click', () => {
        if (confirm('Clear all API keys? This cannot be undone.')) {
            NeoConfig.clear();
            populateFields();
            updateModuleStatuses();
        }
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function updateModuleStatuses() {
    const apis = ['openai', 'stripe', 'replicate', 'slack', 'mailchimp'];

    apis.forEach(api => {
        const statusEl = document.querySelector(`.module-status[data-api="${api}"]`);
        if (statusEl) {
            if (NeoConfig.isConfigured(api)) {
                statusEl.textContent = 'Configured';
                statusEl.classList.add('configured');
            } else {
                statusEl.textContent = 'Not configured';
                statusEl.classList.remove('configured');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initConfigModal();
    updateModuleStatuses();
});
