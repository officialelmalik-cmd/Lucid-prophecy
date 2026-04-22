const NeoSlack = {
    botInfo: null,
    currentChannel: null,
    messages: [],

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
            <div class="slack-panel">
                <div class="slack-tabs">
                    <button class="slack-tab active" data-tab="history">Bot History</button>
                    <button class="slack-tab" data-tab="send">Send Message</button>
                    <button class="slack-tab" data-tab="templates">Templates</button>
                </div>

                <div class="slack-tab-content" id="tab-history">
                    <div class="slack-history-section">
                        <div class="slack-bot-info" id="slack-bot-info">
                            <div class="loading-spinner"></div>
                            <p>Loading bot info...</p>
                        </div>
                        <div class="slack-channel-select">
                            <label>Select Channel</label>
                            <select id="slack-channel-select">
                                <option value="">Loading channels...</option>
                            </select>
                            <button class="btn btn-primary" id="slack-load-history">Load History</button>
                        </div>
                        <div class="slack-history-container">
                            <h4>Conversation History</h4>
                            <div class="slack-messages" id="slack-messages">
                                <p class="slack-empty">Select a channel to view conversation history.</p>
                            </div>
                            <div class="slack-history-actions">
                                <button class="btn btn-secondary" id="slack-export-history">Export History</button>
                                <button class="btn btn-secondary" id="slack-load-more" style="display:none;">Load More</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="slack-tab-content" id="tab-send" style="display:none;">
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
                </div>

                <div class="slack-tab-content" id="tab-templates" style="display:none;">
                    <div class="slack-section">
                        <h3>Message Templates</h3>
                        <div class="slack-templates">
                            <button class="template-btn" data-template="update">
                                Project Update
                            </button>
                            <button class="template-btn" data-template="alert">
                                Alert
                            </button>
                            <button class="template-btn" data-template="summary">
                                Daily Summary
                            </button>
                        </div>
                    </div>
                    <div class="slack-section">
                        <h3>Quick Actions</h3>
                        <div class="slack-quick-actions">
                            <button class="btn btn-secondary" id="slack-status">
                                Set Status
                            </button>
                            <button class="btn btn-secondary" id="slack-presence">
                                Toggle Presence
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .slack-panel { display: grid; gap: 1.5rem; }
                .slack-tabs { display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.75rem; }
                .slack-tab {
                    padding: 0.5rem 1rem;
                    background: transparent;
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .slack-tab:hover { border-color: var(--accent); color: var(--text-primary); }
                .slack-tab.active { background: var(--accent); border-color: var(--accent); color: white; }
                .slack-section {
                    background: var(--bg-primary);
                    padding: 1.25rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                }
                .slack-section h3 { margin-bottom: 1rem; }
                .slack-quick-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
                .slack-templates { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .template-btn {
                    padding: 0.5rem 1rem;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    color: var(--text-primary);
                    cursor: pointer;
                    font-size: 0.875rem;
                }
                .template-btn:hover { border-color: var(--accent); }
                .slack-bot-info {
                    background: var(--bg-primary);
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .slack-bot-info .bot-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    background: var(--accent);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }
                .slack-bot-info .bot-details { flex: 1; }
                .slack-bot-info .bot-name { font-weight: 600; font-size: 1.1rem; }
                .slack-bot-info .bot-team { color: var(--text-muted); font-size: 0.875rem; }
                .slack-channel-select {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                }
                .slack-channel-select label { font-weight: 500; }
                .slack-channel-select select {
                    flex: 1;
                    min-width: 200px;
                    padding: 0.75rem;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    color: var(--text-primary);
                }
                .slack-history-container h4 { margin-bottom: 0.75rem; }
                .slack-messages {
                    background: var(--bg-primary);
                    border-radius: 8px;
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 1rem;
                    margin-bottom: 1rem;
                }
                .slack-empty { color: var(--text-muted); text-align: center; padding: 2rem; }
                .slack-msg {
                    padding: 0.75rem;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    gap: 0.75rem;
                }
                .slack-msg:last-child { border-bottom: none; }
                .slack-msg-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 6px;
                    background: var(--bg-card);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .slack-msg-content { flex: 1; }
                .slack-msg-header { display: flex; align-items: baseline; gap: 0.5rem; margin-bottom: 0.25rem; }
                .slack-msg-user { font-weight: 600; font-size: 0.9rem; }
                .slack-msg-time { color: var(--text-muted); font-size: 0.75rem; }
                .slack-msg-text { font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
                .slack-msg-bot { background: rgba(124, 58, 237, 0.1); border-radius: 8px; }
                .slack-history-actions { display: flex; gap: 0.75rem; }
            </style>
        `;

        this.bindEvents();
        this.loadBotInfo();
    },

    bindEvents() {
        document.querySelectorAll('.slack-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.slack-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.slack-tab-content').forEach(c => c.style.display = 'none');
                tab.classList.add('active');
                document.getElementById(`tab-${tab.dataset.tab}`).style.display = 'block';
            });
        });

        document.getElementById('slack-send')?.addEventListener('click', () => {
            this.sendMessage();
        });

        document.getElementById('slack-load-history')?.addEventListener('click', () => {
            this.loadHistory();
        });

        document.getElementById('slack-export-history')?.addEventListener('click', () => {
            this.exportHistory();
        });

        document.getElementById('slack-load-more')?.addEventListener('click', () => {
            this.loadMoreHistory();
        });

        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyTemplate(btn.dataset.template);
                document.querySelector('.slack-tab[data-tab="send"]').click();
            });
        });
    },

    templates: {
        update: `*Project Update*

:white_check_mark: Completed:
- Item 1
- Item 2

:construction: In Progress:
- Item 3

:calendar: Next Steps:
- Item 4`,

        alert: `:rotating_light: *Alert*

*Issue:* [Description]
*Impact:* [Scope]
*Action Required:* [Steps]`,

        summary: `*Daily Summary - ${new Date().toLocaleDateString()}*

:chart_with_upwards_trend: *Metrics:*
- Users:
- Revenue:
- Conversions:

:memo: *Notes:*
-

:dart: *Tomorrow's Focus:*
- `
    },

    applyTemplate(name) {
        const textarea = document.getElementById('slack-message');
        if (textarea) {
            textarea.value = this.templates[name] || '';
        }
    },

    async loadBotInfo() {
        if (!NeoConfig.hasWorker()) {
            document.getElementById('slack-bot-info').innerHTML = `
                <p style="color: var(--warning);">Worker URL required to load bot info.</p>
            `;
            return;
        }

        try {
            const info = await NeoApp.callWorker('slack_bot_info', {
                token: NeoConfig.get('slack_token')
            });

            this.botInfo = info;

            document.getElementById('slack-bot-info').innerHTML = `
                <div class="bot-avatar">${info.user?.charAt(0)?.toUpperCase() || 'B'}</div>
                <div class="bot-details">
                    <div class="bot-name">${info.user || 'Slack Bot'}</div>
                    <div class="bot-team">${info.team || 'Team'} | Bot ID: ${info.bot_id || 'N/A'}</div>
                </div>
                <span style="color: var(--success);">Connected</span>
            `;

            const select = document.getElementById('slack-channel-select');
            if (info.channels && info.channels.length > 0) {
                select.innerHTML = '<option value="">Select a channel...</option>' +
                    info.channels.map(ch => `
                        <option value="${ch.id}">${ch.is_im ? 'DM' : (ch.is_private ? '#' : '#')}${ch.name || ch.id}</option>
                    `).join('');
            } else {
                select.innerHTML = '<option value="">No channels found</option>';
            }

        } catch (e) {
            document.getElementById('slack-bot-info').innerHTML = `
                <p style="color: var(--error);">Failed to load bot info: ${e.message}</p>
            `;
        }
    },

    async loadHistory() {
        const channel = document.getElementById('slack-channel-select').value;
        if (!channel) {
            NeoApp.showNotification('Please select a channel', 'error');
            return;
        }

        this.currentChannel = channel;

        if (!NeoConfig.hasWorker()) {
            NeoApp.showNotification('Worker URL required', 'error');
            return;
        }

        const messagesContainer = document.getElementById('slack-messages');
        messagesContainer.innerHTML = '<div class="loading-spinner" style="margin: 2rem auto;"></div>';

        try {
            const result = await NeoApp.callWorker('slack_history', {
                channel,
                limit: 50,
                token: NeoConfig.get('slack_token')
            });

            this.messages = result.messages || [];
            this.renderMessages();

            if (result.has_more) {
                document.getElementById('slack-load-more').style.display = 'block';
            } else {
                document.getElementById('slack-load-more').style.display = 'none';
            }

            NeoApp.showNotification(`Loaded ${this.messages.length} messages`, 'success');

        } catch (e) {
            messagesContainer.innerHTML = `<p class="slack-empty" style="color: var(--error);">Failed to load history: ${e.message}</p>`;
        }
    },

    async loadMoreHistory() {
        if (!this.currentChannel || this.messages.length === 0) return;

        const oldest = this.messages[this.messages.length - 1]?.ts;
        if (!oldest) return;

        try {
            const result = await NeoApp.callWorker('slack_history', {
                channel: this.currentChannel,
                limit: 50,
                latest: oldest,
                token: NeoConfig.get('slack_token')
            });

            this.messages = [...this.messages, ...(result.messages || [])];
            this.renderMessages();

            if (!result.has_more) {
                document.getElementById('slack-load-more').style.display = 'none';
            }

        } catch (e) {
            NeoApp.showNotification(e.message, 'error');
        }
    },

    renderMessages() {
        const container = document.getElementById('slack-messages');

        if (this.messages.length === 0) {
            container.innerHTML = '<p class="slack-empty">No messages found in this channel.</p>';
            return;
        }

        container.innerHTML = this.messages.map(msg => {
            const time = new Date(parseFloat(msg.ts) * 1000);
            const timeStr = time.toLocaleString();
            const isBot = msg.bot_id || msg.subtype === 'bot_message';

            return `
                <div class="slack-msg ${isBot ? 'slack-msg-bot' : ''}">
                    <div class="slack-msg-avatar">
                        ${isBot ? '&#129302;' : '&#128100;'}
                    </div>
                    <div class="slack-msg-content">
                        <div class="slack-msg-header">
                            <span class="slack-msg-user">${msg.user || msg.username || (isBot ? 'Bot' : 'Unknown')}</span>
                            <span class="slack-msg-time">${timeStr}</span>
                        </div>
                        <div class="slack-msg-text">${this.escapeHtml(msg.text || '')}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    exportHistory() {
        if (this.messages.length === 0) {
            NeoApp.showNotification('No messages to export', 'error');
            return;
        }

        const data = {
            channel: this.currentChannel,
            exported_at: new Date().toISOString(),
            message_count: this.messages.length,
            messages: this.messages.map(msg => ({
                user: msg.user || msg.username,
                text: msg.text,
                timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
                is_bot: !!(msg.bot_id || msg.subtype === 'bot_message')
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `slack-history-${this.currentChannel}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        NeoApp.showNotification('History exported!', 'success');
    },

    async sendMessage() {
        const channel = document.getElementById('slack-channel').value.trim();
        const message = document.getElementById('slack-message').value.trim();

        if (!channel || !message) {
            NeoApp.showNotification('Channel and message required', 'error');
            return;
        }

        if (!NeoConfig.hasWorker()) {
            NeoApp.showNotification('Worker URL required for Slack messaging', 'error');
            return;
        }

        try {
            await NeoApp.callWorker('slack_post', {
                channel,
                text: message,
                token: NeoConfig.get('slack_token')
            });

            NeoApp.showNotification('Message sent!', 'success');
            document.getElementById('slack-message').value = '';
        } catch (e) {
            NeoApp.showNotification(e.message, 'error');
        }
    }
};
