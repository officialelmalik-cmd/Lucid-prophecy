const NeoSlack = {
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
            </div>
            <style>
                .slack-panel { display: grid; gap: 1.5rem; }
                .slack-section {
                    background: var(--bg-primary);
                    padding: 1.25rem;
                    border-radius: 8px;
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
            </style>
        `;

        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('slack-send').addEventListener('click', () => {
            this.sendMessage();
        });

        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyTemplate(btn.dataset.template);
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
        textarea.value = this.templates[name] || '';
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
