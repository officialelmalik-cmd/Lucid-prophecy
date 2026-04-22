const NeoConfig = {
    STORAGE_KEY: 'neosai_apex_config',

    keys: {
        openai: '',
        anthropic: '',
        stripe_pk: '',
        stripe_sk: '',
        stripe_price: '',
        replicate: '',
        slack_token: '',
        slack_channel: '',
        mailchimp_key: '',
        mailchimp_list: '',
        worker_url: ''
    },

    load() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                this.keys = { ...this.keys, ...JSON.parse(stored) };
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
        this.keys = {
            openai: '',
            anthropic: '',
            stripe_pk: '',
            stripe_sk: '',
            stripe_price: '',
            replicate: '',
            slack_token: '',
            slack_channel: '',
            mailchimp_key: '',
            mailchimp_list: '',
            worker_url: ''
        };
    },

    get(key) {
        return this.keys[key] || '';
    },

    set(key, value) {
        this.keys[key] = value;
    },

    isConfigured(api) {
        switch (api) {
            case 'openai':
                return !!this.keys.openai;
            case 'stripe':
                return !!this.keys.stripe_pk && !!this.keys.stripe_price;
            case 'replicate':
                return !!this.keys.replicate;
            case 'slack':
                return !!this.keys.slack_token;
            case 'mailchimp':
                return !!this.keys.mailchimp_key && !!this.keys.mailchimp_list;
            default:
                return false;
        }
    },

    getWorkerUrl() {
        return this.keys.worker_url || '';
    },

    hasWorker() {
        return !!this.keys.worker_url;
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
    }

    openBtn.addEventListener('click', () => {
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
