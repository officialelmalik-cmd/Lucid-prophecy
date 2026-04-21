const NeoAnalytics = {
    render(container) {
        container.innerHTML = `
            <div class="analytics-dashboard">
                <div class="analytics-header">
                    <h3>Platform Analytics</h3>
                    <select class="media-select" id="analytics-range">
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                </div>

                <div class="stats-overview">
                    <div class="stat-card">
                        <span class="stat-icon">&#128172;</span>
                        <div class="stat-info">
                            <span class="stat-value" id="stat-ai">0</span>
                            <span class="stat-label">AI Requests</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-icon">&#127912;</span>
                        <div class="stat-info">
                            <span class="stat-value" id="stat-media">0</span>
                            <span class="stat-label">Media Generated</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-icon">&#128179;</span>
                        <div class="stat-info">
                            <span class="stat-value" id="stat-revenue">$0</span>
                            <span class="stat-label">Revenue</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-icon">&#9993;</span>
                        <div class="stat-info">
                            <span class="stat-value" id="stat-emails">0</span>
                            <span class="stat-label">Emails Sent</span>
                        </div>
                    </div>
                </div>

                <div class="api-health">
                    <h4>API Health</h4>
                    <div class="health-grid">
                        <div class="health-item" data-api="openai">
                            <span class="health-dot"></span>
                            <span>OpenAI</span>
                        </div>
                        <div class="health-item" data-api="stripe">
                            <span class="health-dot"></span>
                            <span>Stripe</span>
                        </div>
                        <div class="health-item" data-api="replicate">
                            <span class="health-dot"></span>
                            <span>Replicate</span>
                        </div>
                        <div class="health-item" data-api="slack">
                            <span class="health-dot"></span>
                            <span>Slack</span>
                        </div>
                        <div class="health-item" data-api="mailchimp">
                            <span class="health-dot"></span>
                            <span>Mailchimp</span>
                        </div>
                        <div class="health-item" data-api="worker">
                            <span class="health-dot"></span>
                            <span>Worker</span>
                        </div>
                    </div>
                </div>

                <div class="usage-log">
                    <h4>Recent Activity</h4>
                    <div id="activity-log">
                        <p style="color: var(--text-muted); text-align: center; padding: 1rem;">
                            Activity will appear as you use modules.
                        </p>
                    </div>
                </div>
            </div>
            <style>
                .analytics-dashboard { display: grid; gap: 1.5rem; }
                .analytics-header { display: flex; justify-content: space-between; align-items: center; }
                .stats-overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: var(--bg-primary);
                    padding: 1.25rem;
                    border-radius: 8px;
                }
                .stat-icon { font-size: 2rem; }
                .stat-info { display: flex; flex-direction: column; }
                .stat-value { font-size: 1.5rem; font-weight: 700; }
                .stat-label { font-size: 0.75rem; color: var(--text-muted); }
                .api-health, .usage-log {
                    background: var(--bg-primary);
                    padding: 1.25rem;
                    border-radius: 8px;
                }
                .api-health h4, .usage-log h4 { margin-bottom: 1rem; }
                .health-grid { display: flex; flex-wrap: wrap; gap: 1rem; }
                .health-item { display: flex; align-items: center; gap: 0.5rem; }
                .health-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: var(--text-muted);
                }
                .health-item.active .health-dot { background: var(--success); }
                .health-item.inactive .health-dot { background: var(--error); }
            </style>
        `;

        this.updateHealth();
        this.loadStats();
    },

    updateHealth() {
        const apis = ['openai', 'stripe', 'replicate', 'slack', 'mailchimp'];

        apis.forEach(api => {
            const item = document.querySelector(`.health-item[data-api="${api}"]`);
            if (item) {
                if (NeoConfig.isConfigured(api)) {
                    item.classList.add('active');
                    item.classList.remove('inactive');
                } else {
                    item.classList.add('inactive');
                    item.classList.remove('active');
                }
            }
        });

        const workerItem = document.querySelector('.health-item[data-api="worker"]');
        if (workerItem) {
            if (NeoConfig.hasWorker()) {
                workerItem.classList.add('active');
                workerItem.classList.remove('inactive');
            } else {
                workerItem.classList.add('inactive');
                workerItem.classList.remove('active');
            }
        }
    },

    async loadStats() {
        if (!NeoConfig.hasWorker()) return;

        try {
            const stats = await NeoApp.callWorker('analytics_summary');

            document.getElementById('stat-ai').textContent = stats.ai_requests || 0;
            document.getElementById('stat-media').textContent = stats.media_generated || 0;
            document.getElementById('stat-revenue').textContent = `$${(stats.revenue || 0).toFixed(2)}`;
            document.getElementById('stat-emails').textContent = stats.emails_sent || 0;
        } catch (e) {
            console.warn('Failed to load analytics:', e);
        }
    }
};
