const NeoAnalytics = {
    METRICS_KEY: 'neosai_metrics',

    getMetrics() {
        try {
            return JSON.parse(localStorage.getItem(this.METRICS_KEY) || '{}');
        } catch { return {}; }
    },

    track(event, details = {}) {
        const metrics = this.getMetrics();
        const today = new Date().toISOString().split('T')[0];
        if (!metrics[today]) metrics[today] = {};
        if (!metrics[today][event]) metrics[today][event] = 0;
        metrics[today][event]++;
        if (details.cost) {
            if (!metrics[today].cost) metrics[today].cost = 0;
            metrics[today].cost += details.cost;
        }
        const log = JSON.parse(localStorage.getItem('neosai_activity') || '[]');
        log.unshift({ event, details, timestamp: new Date().toISOString() });
        if (log.length > 100) log.pop();
        localStorage.setItem('neosai_activity', JSON.stringify(log));
        localStorage.setItem(this.METRICS_KEY, JSON.stringify(metrics));
    },

    getActivity() {
        try {
            return JSON.parse(localStorage.getItem('neosai_activity') || '[]');
        } catch { return []; }
    },

    getSummary(days = 7) {
        const metrics = this.getMetrics();
        const totals = {
            ai_requests: 0, media_generated: 0, voice_generated: 0,
            game_assets: 0, social_posts: 0, emails_sent: 0, cost: 0, sessions: 0
        };
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        Object.entries(metrics).forEach(([date, data]) => {
            if (new Date(date) >= cutoff) {
                Object.entries(data).forEach(([key, val]) => {
                    if (totals[key] !== undefined) totals[key] += val;
                });
            }
        });
        return totals;
    },

    render(container) {
        const summary7d = this.getSummary(7);
        const summary30d = this.getSummary(30);
        const activity = this.getActivity();
        const configuredApis = ['openai', 'stripe', 'replicate', 'slack', 'mailchimp']
            .filter(a => NeoConfig.isConfigured(a));

        container.innerHTML = `
            <div class="analytics-dashboard">
                <div class="analytics-header">
                    <h3>Platform Analytics</h3>
                    <div style="display:flex;gap:0.75rem;align-items:center;">
                        <select class="media-select" id="analytics-range">
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                        </select>
                        <button class="btn btn-secondary" id="export-analytics" style="white-space:nowrap;">Export Data</button>
                        <button class="btn btn-secondary" id="clear-analytics" style="white-space:nowrap;color:var(--error);">Clear</button>
                    </div>
                </div>

                <div class="stats-overview" id="stats-grid">
                    ${this.renderStatCards(summary7d)}
                </div>

                <div class="platform-status-section">
                    <h4>Platform Configuration Status</h4>
                    <div class="health-grid">
                        ${['openai','anthropic','stripe','replicate','slack','mailchimp','elevenlabs','worker'].map(api => `
                            <div class="health-item ${this.getHealthClass(api)}" data-api="${api}">
                                <span class="health-dot"></span>
                                <div class="health-info">
                                    <span class="health-name">${this.getApiLabel(api)}</span>
                                    <span class="health-status">${this.getHealthStatus(api)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="usage-log">
                    <h4>Recent Activity <span style="font-size:0.75rem;color:var(--text-muted);font-weight:400;">(${activity.length} events tracked)</span></h4>
                    <div id="activity-log">
                        ${this.renderActivity(activity)}
                    </div>
                </div>
            </div>

            <style>
                .analytics-dashboard { display: grid; gap: 1.5rem; }
                .analytics-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
                .stats-overview { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; }
                .stat-card {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    background: var(--bg-primary);
                    padding: 1.25rem;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    transition: all 0.2s;
                }
                .stat-card:hover { border-color: var(--accent); }
                .stat-icon { font-size: 1.75rem; }
                .stat-value { font-size: 1.75rem; font-weight: 700; color: var(--accent-light); }
                .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
                .platform-status-section, .usage-log {
                    background: var(--bg-primary);
                    padding: 1.25rem;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                }
                .platform-status-section h4, .usage-log h4 { margin-bottom: 1.25rem; }
                .health-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
                .health-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: var(--bg-card);
                    border-radius: 8px;
                    border: 1px solid var(--border);
                }
                .health-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    flex-shrink: 0;
                    background: var(--text-muted);
                }
                .health-item.active .health-dot { background: var(--success); box-shadow: 0 0 6px var(--success); }
                .health-item.inactive .health-dot { background: var(--error); }
                .health-item.partial .health-dot { background: var(--warning); }
                .health-info { display: flex; flex-direction: column; }
                .health-name { font-size: 0.85rem; font-weight: 500; }
                .health-status { font-size: 0.7rem; color: var(--text-muted); }
                .activity-entry {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                    padding: 0.65rem 0;
                    border-bottom: 1px solid var(--border);
                    font-size: 0.875rem;
                }
                .activity-entry:last-child { border-bottom: none; }
                .activity-time { color: var(--text-muted); font-size: 0.75rem; white-space: nowrap; min-width: 70px; }
                .activity-badge {
                    padding: 0.2rem 0.6rem;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    white-space: nowrap;
                }
                .badge-ai { background: rgba(124,58,237,0.2); color: var(--accent-light); }
                .badge-media { background: rgba(16,185,129,0.2); color: var(--success); }
                .badge-voice { background: rgba(245,158,11,0.2); color: var(--warning); }
                .badge-game { background: rgba(239,68,68,0.2); color: var(--error); }
                .badge-social { background: rgba(59,130,246,0.2); color: #60a5fa; }
            </style>
        `;

        this.bindEvents();
    },

    renderStatCards(summary) {
        const cards = [
            { icon: '🤖', key: 'ai_requests', label: 'AI Requests', value: summary.ai_requests },
            { icon: '🎨', key: 'media_generated', label: 'Media Generated', value: summary.media_generated },
            { icon: '🎙️', key: 'voice_generated', label: 'Voice Clips', value: summary.voice_generated },
            { icon: '🎮', key: 'game_assets', label: 'Game Assets', value: summary.game_assets },
            { icon: '📱', key: 'social_posts', label: 'Social Posts', value: summary.social_posts },
            { icon: '📧', key: 'emails_sent', label: 'Emails Sent', value: summary.emails_sent },
        ];
        return cards.map(c => `
            <div class="stat-card">
                <span class="stat-icon">${c.icon}</span>
                <span class="stat-value">${c.value || 0}</span>
                <span class="stat-label">${c.label}</span>
            </div>
        `).join('');
    },

    renderActivity(activity) {
        if (activity.length === 0) {
            return '<p style="color:var(--text-muted);text-align:center;padding:1.5rem;">No activity yet — start using modules to see logs here.</p>';
        }
        const badgeMap = {
            ai_request: 'badge-ai', media_generate: 'badge-media', voice_generate: 'badge-voice',
            game_asset: 'badge-game', social_post: 'badge-social'
        };
        return activity.slice(0, 30).map(a => {
            const time = new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const badge = badgeMap[a.event] || 'badge-ai';
            const label = a.event.replace(/_/g, ' ');
            return `
                <div class="activity-entry">
                    <span class="activity-time">${time}</span>
                    <span class="activity-badge ${badge}">${label}</span>
                    <span style="color:var(--text-secondary);">${a.details?.description || ''}</span>
                </div>
            `;
        }).join('');
    },

    getApiLabel(api) {
        const labels = {
            openai: 'OpenAI', anthropic: 'Anthropic / Claude',
            stripe: 'Stripe', replicate: 'Replicate',
            slack: 'Slack', mailchimp: 'Mailchimp',
            elevenlabs: 'ElevenLabs', worker: 'Backend Worker'
        };
        return labels[api] || api;
    },

    getHealthClass(api) {
        if (api === 'worker') return NeoConfig.hasWorker() ? 'active' : 'inactive';
        if (api === 'elevenlabs') return 'inactive';
        if (api === 'anthropic') return NeoConfig.get('anthropic') ? 'active' : 'inactive';
        return NeoConfig.isConfigured(api) ? 'active' : 'inactive';
    },

    getHealthStatus(api) {
        const cls = this.getHealthClass(api);
        return cls === 'active' ? 'Configured ✓' : 'Not configured';
    },

    bindEvents() {
        document.getElementById('analytics-range').addEventListener('change', (e) => {
            const days = parseInt(e.target.value);
            const summary = this.getSummary(days);
            document.getElementById('stats-grid').innerHTML = this.renderStatCards(summary);
        });

        document.getElementById('export-analytics').addEventListener('click', () => {
            const data = {
                metrics: this.getMetrics(),
                activity: this.getActivity(),
                exported_at: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `neosai-analytics-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            NeoApp.showNotification('Analytics exported!', 'success');
        });

        document.getElementById('clear-analytics').addEventListener('click', () => {
            if (confirm('Clear all analytics data?')) {
                localStorage.removeItem(this.METRICS_KEY);
                localStorage.removeItem('neosai_activity');
                NeoApp.showNotification('Analytics cleared', 'success');
                this.render(document.getElementById('workspace-content'));
            }
        });
    }
};
