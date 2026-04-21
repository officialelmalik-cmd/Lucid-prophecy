const NeoOpenAI = {
    messages: [],

    render(container) {
        if (!NeoConfig.isConfigured('openai')) {
            container.innerHTML = `
                <div class="workspace-placeholder">
                    <p>OpenAI API key not configured.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('openConfig').click()">
                        Configure API Key
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="chat-container">
                <div class="chat-messages" id="ai-messages"></div>
                <div class="chat-input-row">
                    <input type="text" class="chat-input" id="ai-input" placeholder="Ask anything...">
                    <button class="chat-send" id="ai-send">Send</button>
                </div>
            </div>
        `;

        this.bindEvents();
        this.renderMessages();
    },

    bindEvents() {
        const input = document.getElementById('ai-input');
        const sendBtn = document.getElementById('ai-send');

        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    },

    renderMessages() {
        const container = document.getElementById('ai-messages');
        container.innerHTML = this.messages.map(m => `
            <div class="chat-message ${m.role}">
                ${this.escapeHtml(m.content)}
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
    },

    async sendMessage() {
        const input = document.getElementById('ai-input');
        const message = input.value.trim();
        if (!message) return;

        this.messages.push({ role: 'user', content: message });
        input.value = '';
        this.renderMessages();

        try {
            const response = await this.callAPI(message);
            this.messages.push({ role: 'assistant', content: response });
            this.renderMessages();
        } catch (e) {
            NeoApp.showNotification(e.message, 'error');
        }
    },

    async callAPI(message) {
        if (NeoConfig.hasWorker()) {
            const result = await NeoApp.callWorker('openai_chat', {
                messages: this.messages,
                apiKey: NeoConfig.get('openai')
            });
            return result.content;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NeoConfig.get('openai')}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: this.messages.map(m => ({
                    role: m.role,
                    content: m.content
                })),
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            throw new Error('OpenAI API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
