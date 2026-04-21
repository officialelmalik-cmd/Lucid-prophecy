const NeoMailchimp = {
    render(container) {
        if (!NeoConfig.isConfigured('mailchimp')) {
            container.innerHTML = `
                <div class="workspace-placeholder">
                    <p>Mailchimp not configured. Add your API key and List ID.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('openConfig').click()">
                        Configure Mailchimp
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="mailchimp-panel">
                <div class="mc-section">
                    <h3>Add Subscriber</h3>
                    <input type="email" class="chat-input" id="mc-email" placeholder="Email address">
                    <input type="text" class="chat-input" id="mc-fname" placeholder="First name" style="margin-top: 0.5rem;">
                    <input type="text" class="chat-input" id="mc-lname" placeholder="Last name" style="margin-top: 0.5rem;">
                    <button class="btn btn-primary" id="mc-subscribe" style="margin-top: 0.75rem;">
                        Add to List
                    </button>
                </div>

                <div class="mc-section">
                    <h3>Campaign Quick Send</h3>
                    <input type="text" class="chat-input" id="mc-subject" placeholder="Subject line">
                    <textarea class="media-prompt" id="mc-content"
                        placeholder="Email content..." style="margin-top: 0.5rem; min-height: 100px;"></textarea>
                    <button class="btn btn-primary" id="mc-campaign" style="margin-top: 0.75rem;">
                        Create Campaign
                    </button>
                </div>

                <div class="mc-section">
                    <h3>List Stats</h3>
                    <div id="mc-stats">
                        <p style="color: var(--text-muted);">Connect Worker to view stats.</p>
                    </div>
                </div>
            </div>
            <style>
                .mailchimp-panel { display: grid; gap: 1.5rem; }
                .mc-section {
                    background: var(--bg-primary);
                    padding: 1.25rem;
                    border-radius: 8px;
                }
                .mc-section h3 { margin-bottom: 1rem; }
            </style>
        `;

        this.bindEvents();
        this.loadStats();
    },

    bindEvents() {
        document.getElementById('mc-subscribe').addEventListener('click', () => {
            this.addSubscriber();
        });

        document.getElementById('mc-campaign').addEventListener('click', () => {
            this.createCampaign();
        });
    },

    async addSubscriber() {
        const email = document.getElementById('mc-email').value.trim();
        const fname = document.getElementById('mc-fname').value.trim();
        const lname = document.getElementById('mc-lname').value.trim();

        if (!email) {
            NeoApp.showNotification('Email is required', 'error');
            return;
        }

        if (!NeoConfig.hasWorker()) {
            NeoApp.showNotification('Worker URL required for Mailchimp', 'error');
            return;
        }

        try {
            await NeoApp.callWorker('mailchimp_subscribe', {
                listId: NeoConfig.get('mailchimp_list'),
                email,
                firstName: fname,
                lastName: lname,
                apiKey: NeoConfig.get('mailchimp_key')
            });

            NeoApp.showNotification('Subscriber added!', 'success');
            document.getElementById('mc-email').value = '';
            document.getElementById('mc-fname').value = '';
            document.getElementById('mc-lname').value = '';
        } catch (e) {
            NeoApp.showNotification(e.message, 'error');
        }
    },

    async createCampaign() {
        const subject = document.getElementById('mc-subject').value.trim();
        const content = document.getElementById('mc-content').value.trim();

        if (!subject || !content) {
            NeoApp.showNotification('Subject and content required', 'error');
            return;
        }

        if (!NeoConfig.hasWorker()) {
            NeoApp.showNotification('Worker URL required for campaigns', 'error');
            return;
        }

        try {
            await NeoApp.callWorker('mailchimp_campaign', {
                listId: NeoConfig.get('mailchimp_list'),
                subject,
                content,
                apiKey: NeoConfig.get('mailchimp_key')
            });

            NeoApp.showNotification('Campaign created!', 'success');
        } catch (e) {
            NeoApp.showNotification(e.message, 'error');
        }
    },

    async loadStats() {
        if (!NeoConfig.hasWorker()) return;

        try {
            const stats = await NeoApp.callWorker('mailchimp_stats', {
                listId: NeoConfig.get('mailchimp_list'),
                apiKey: NeoConfig.get('mailchimp_key')
            });

            document.getElementById('mc-stats').innerHTML = `
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-value">${stats.member_count || 0}</span>
                        <span class="stat-label">Subscribers</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.open_rate || '0%'}</span>
                        <span class="stat-label">Open Rate</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.click_rate || '0%'}</span>
                        <span class="stat-label">Click Rate</span>
                    </div>
                </div>
                <style>
                    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
                    .stat-item { text-align: center; }
                    .stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: var(--accent-light); }
                    .stat-label { font-size: 0.75rem; color: var(--text-muted); }
                </style>
            `;
        } catch (e) {
            console.warn('Failed to load Mailchimp stats:', e);
        }
    }
};
