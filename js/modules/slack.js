const NeoSlack = {
    currentChannel: null,
    nextCursor: null,
    botInfo: null,
    historyData: [],

    render(container) {
        if (!NeoConfig.isConfigured('slack')) {
            container.innerHTML = `
                <div class="workspace-placeholder">
                    <p>Slack bot token not configured.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('openConfig').click()">
                        Configure Slack
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="slack-tabs">
                <button class="slack-tab active" data-tab="send">Send Message</button>
                <button class="slack-tab" data-tab="history">Bot History</button>
                <button class="slack-tab" data-tab="channels">Channels</button>
            </div>

            <div class="slack-tab-content" id="tab-send">
                <div class="slack-panel">
                    <div class="slack-section">
                        <h3>Send Message</h3>
                        <input type="text" class="chat-input" id="slack-channel"
                            placeholder="Channel ID (e.g., C0XXXXXXXX)"
                            value="${NeoConfig.get('slack_channel') || ''}">
                        <textarea class="media-prompt" id="slack-message"
                            placeholder="Your message..." style="margin-top: 0.75rem; min-height: 80px;"></textarea>
                        <button class="btn btn-primary" id="slack-send" style="margin-top: 0.75rem;">
                            Send Message
                        </button>
                    </div>

                    <div class="slack-section">
                        <h3>Message Templates</h3>
                        <div class="slack-templates">
                            <button class="template-btn" data-template="update">Project Update</button>
                            <button class="template-btn" data-template="alert">Alert</button>
                            <button class="template-btn" data-template="summary">Daily Summary</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="slack-tab-content hidden" id="tab-history">
                <div class="slack-panel">
                    <div class="slack-section">
                        <div class="slack-bot-info" id="slack-bot-info">
                            <div class="loading-spinner"></div>
                            <span>Loading bot info...</span>
                        </div>
                    </div>

                    <div class="slack-section">
                        <h3>Channel History</h3>
                        <select class="media-select" id="history-channel-select" style="width: 100%; margin-bottom: 1rem;">
                            <option value="">Select a channel...</option>
                        </select>
                        <div class="slack-history-messages" id="slack-history-messages">
                            <p class="text-muted">Select a channel to view message history</p>
                        </div>
                        <button class="btn btn-secondary" id="slack-load-more" style="display: none; margin-top: 1rem;">
                            Load More
                        </button>
                    </div>

                    <div class="slack-section">
                        <button class="btn btn-primary" id="slack-export-history">Export to JSON</button>
                    </div>
                </div>
            </div>

            <div class="slack-tab-content hidden" id="tab-channels">
                <div class="slack-panel">
                    <div class="slack-section">
                        <h3>All Channels</h3>
                        <div class="slack-channel-list" id="slack-channel-list">
                            <div class="loading-spinner"></div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .slack-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
                .slack-tab { padding: 0.75rem 1.5rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px 8px 0 0; color: var(--text-secondary); cursor: pointer; font-weight: 500; transition: all 0.2s; }
                .slack-tab:hover { color: var(--text-primary); }
                .slack-tab.active { background: var(--accent); border-color: var(--accent); color: white; }
                .slack-tab-content.hidden { display: none; }
                .slack-panel { display: grid; gap: 1.5rem; }
                .slack-section { background: var(--bg-primary); padding: 1.25rem; border-radius: 8px; }
                .slack-section h3 { margin-bottom: 1rem; }
                .slack-templates { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .template-btn { padding: 0.5rem 1rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; color: var(--text-primary); cursor: pointer; font-size: 0.875rem; }
                .template-btn:hover { border-color: var(--accent); }
                .slack-bot-info { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-card); border-radius: 8px; }
                .slack-bot-info.loaded { flex-direction: column; align-items: flex-start; }
                .slack-bot-info .info-row { display: flex; gap: 0.5rem; font-size: 0.9rem; }
                .slack-bot-info .info-label { color: var(--text-muted); }
                .slack-history-messages { max-height: 400px; overflow-y: auto; background: var(--bg-card); border-radius: 8px; padding: 1rem; }
                .history-message { padding: 0.75rem; margin-bottom: 0.5rem; background: var(--bg-primary); border-radius: 6px; border-left: 3px solid var(--border); }
                .history-message.is-bot { border-left-color: var(--accent); }
                .history-message .msg-header { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; }
                .history-message .msg-text { font-size: 0.9rem; white-space: pre-wrap; word-break: break-word; }
                .slack-channel-list { display: grid; gap: 0.5rem; max-height: 400px; overflow-y: auto; }
                .channel-item { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--bg-card); border-radius: 6px; cursor: pointer; transition: all 0.2s; }
                .channel-item:hover { background: var(--accent); }
                .channel-item .channel-name { font-weight: 500; }
                .channel-item .channel-type { font-size: 0.75rem; color: var(--text-muted); padding: 0.25rem 0.5rem; background: var(--bg-primary); border-radius: 4px; }
                .text-muted { color: var(--text-muted); }
            </style>
        `;

        this.bindEvents();
        this.loadBotInfo();
    },

    bindEvents() {
        document.getElementById('slack-send').addEventListener('click', () => this.sendMessage());

        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => this.applyTemplate(btn.dataset.template));
        });

        document.querySelectorAll('.slack-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.slack-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.slack-tab-content').forEach(c => c.classList.add('hidden'));
                tab.classList.add('active');
                document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
                if (tab.dataset.tab === 'channels') this.loadChannels();
            });
        });

        document.getElementById('history-channel-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.currentChannel = e.target.value;
                this.nextCursor = null;
                this.loadHistory(e.target.value);
            }
        });

        document.getElementById('slack-load-more').addEventListener('click', () => {
            if (this.currentChannel && this.nextCursor) this.loadHistory(this.currentChannel, this.nextCursor);
        });

        document.getElementById('slack-export-history').addEventListener('click', () => this.exportHistory());
    },

    templates: {
        update: `*Project Update*\n\n:white_check_mark: Completed:\n- Item 1\n- Item 2\n\n:construction: In Progress:\n- Item 3`,
        alert: `:rotating_light: *Alert*\n\n*Issue:* [Description]\n*Impact:* [Scope]\n*Action Required:* [Steps]`,
        summary: `*Daily Summary - ${new Date().toLocaleDateString()}*\n\n:chart_with_upwards_trend: *Metrics:*\n- Users:\n- Revenue:\n\n:dart: *Tomorrow's Focus:*\n- `
    },

    applyTemplate(name) {
        document.getElementById('slack-message').value = this.templates[name] || '';
    },

    async sendMessage() {
        const channel = document.getElementById('slack-channel').value.trim();
        const message = document.getElementById('slack-message').value.trim();

        if (!channel || !message) { NeoApp.showNotification('Channel and message required', 'error'); return; }
        if (!NeoConfig.hasWorker()) { NeoApp.showNotification('Worker URL required', 'error'); return; }

        try {
            await NeoApp.callWorker('slack_post', { channel, text: message, token: NeoConfig.get('slack_token') });
            NeoApp.showNotification('Message sent!', 'success');
            document.getElementById('slack-message').value = '';
        } catch (e) { NeoApp.showNotification(e.message, 'error'); }
    },

    async loadBotInfo() {
        if (!NeoConfig.hasWorker()) return;
        const infoEl = document.getElementById('slack-bot-info');
        try {
            const result = await NeoApp.callWorker('slack_bot_info', { token: NeoConfig.get('slack_token') });
            this.botInfo = result;
            infoEl.classList.add('loaded');
            infoEl.innerHTML = `
                <div class="info-row"><span class="info-label">Bot ID:</span> ${result.bot_id || 'N/A'}</div>
                <div class="info-row"><span class="info-label">Team:</span> ${result.team || 'N/A'}</div>
                <div class="info-row"><span class="info-label">Status:</span> <span style="color: var(--success);">Connected</span></div>
            `;
            this.loadChannelsForSelect();
        } catch (e) { infoEl.innerHTML = `<span style="color: var(--error);">Failed: ${e.message}</span>`; }
    },

    async loadChannelsForSelect() {
        if (!NeoConfig.hasWorker()) return;
        try {
            const result = await NeoApp.callWorker('slack_channels', { token: NeoConfig.get('slack_token') });
            const select = document.getElementById('history-channel-select');
            select.innerHTML = '<option value="">Select a channel...</option>';
            result.channels.forEach(ch => {
                const prefix = ch.is_im ? 'DM' : '#';
                select.innerHTML += `<option value="${ch.id}">${prefix} ${ch.name || ch.id}</option>`;
            });
        } catch (e) { console.error('Failed to load channels:', e); }
    },

    async loadChannels() {
        if (!NeoConfig.hasWorker()) return;
        const listEl = document.getElementById('slack-channel-list');
        listEl.innerHTML = '<div class="loading-spinner"></div>';
        try {
            const result = await NeoApp.callWorker('slack_channels', { token: NeoConfig.get('slack_token') });
            listEl.innerHTML = '';
            result.channels.forEach(ch => {
                const type = ch.is_im ? 'DM' : ch.is_private ? 'Private' : 'Public';
                const item = document.createElement('div');
                item.className = 'channel-item';
                item.innerHTML = `<span class="channel-name">${ch.name || ch.id}</span><span class="channel-type">${type}</span>`;
                item.addEventListener('click', () => {
                    document.querySelectorAll('.slack-tab')[1].click();
                    document.getElementById('history-channel-select').value = ch.id;
                    this.currentChannel = ch.id;
                    this.loadHistory(ch.id);
                });
                listEl.appendChild(item);
            });
        } catch (e) { listEl.innerHTML = `<p style="color: var(--error);">${e.message}</p>`; }
    },

    async loadHistory(channel, cursor = null) {
        if (!NeoConfig.hasWorker()) return;
        const messagesEl = document.getElementById('slack-history-messages');
        const loadMoreBtn = document.getElementById('slack-load-more');
        if (!cursor) messagesEl.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const result = await NeoApp.callWorker('slack_history', { channel, cursor, limit: 50, token: NeoConfig.get('slack_token') });
            if (!cursor) { messagesEl.innerHTML = ''; this.historyData = []; }

            result.messages.forEach(msg => {
                const isBot = msg.bot_id || msg.subtype === 'bot_message';
                const time = new Date(parseFloat(msg.ts) * 1000).toLocaleString();
                const msgEl = document.createElement('div');
                msgEl.className = `history-message${isBot ? ' is-bot' : ''}`;
                msgEl.innerHTML = `<div class="msg-header"><span>${isBot ? 'Bot' : 'User'}</span><span>${time}</span></div><div class="msg-text">${this.escapeHtml(msg.text || '')}</div>`;
                messagesEl.appendChild(msgEl);
                this.historyData.push(msg);
            });

            this.nextCursor = result.next_cursor;
            loadMoreBtn.style.display = result.has_more ? 'block' : 'none';
        } catch (e) { messagesEl.innerHTML = `<p style="color: var(--error);">${e.message}</p>`; }
    },

    escapeHtml(text) { const div = document.createElement('div'); div.textContent = text; return div.innerHTML; },

    exportHistory() {
        if (!this.historyData.length) { NeoApp.showNotification('No history to export', 'error'); return; }
        const data = { channel: this.currentChannel, exported_at: new Date().toISOString(), bot_info: this.botInfo, messages: this.historyData };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `slack-history-${this.currentChannel}-${Date.now()}.json`; a.click();
        URL.revokeObjectURL(url);
        NeoApp.showNotification('History exported!', 'success');
    }
};
