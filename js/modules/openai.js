const NeoOpenAI = {
    messages: [],
    selectedModel: 'gpt-4-turbo-preview',

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
            <div class="ai-panel">
                <div class="ai-controls">
                    <select class="media-select" id="ai-model-select">
                        <optgroup label="OpenAI">
                            <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                            <option value="gpt-4o">GPT-4o</option>
                            <option value="gpt-4o-mini">GPT-4o Mini</option>
                        </optgroup>
                        <optgroup label="Anthropic">
                            <option value="claude-sonnet-4-6-20250514">Claude Sonnet 4.6</option>
                            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                        </optgroup>
                    </select>
                    <button class="btn btn-secondary" id="ai-clear">Clear Chat</button>
                </div>
                <div class="chat-container">
                    <div class="chat-messages" id="ai-messages"></div>
                    <div class="chat-input-row">
                        <input type="text" class="chat-input" id="ai-input" placeholder="Ask anything...">
                        <button class="chat-send" id="ai-send">Send</button>
                    </div>
                </div>
            </div>
            <style>
                .ai-panel { display: flex; flex-direction: column; gap: 1rem; }
                .ai-controls { display: flex; gap: 1rem; align-items: center; }
                .ai-controls .media-select { flex: 1; }
            </style>
        `;

        this.bindEvents();
        this.renderMessages();
    },

    bindEvents() {
        const input = document.getElementById('ai-input');
        const sendBtn = document.getElementById('ai-send');
        const modelSelect = document.getElementById('ai-model-select');
        const clearBtn = document.getElementById('ai-clear');

        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        modelSelect.addEventListener('change', (e) => {
            this.selectedModel = e.target.value;
        });

        clearBtn.addEventListener('click', () => {
            this.messages = [];
            this.renderMessages();
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
        const isClaude = this.selectedModel.startsWith('claude');

        if (NeoConfig.hasWorker()) {
            const result = await NeoApp.callWorker('openai_chat', {
                messages: this.messages,
                model: this.selectedModel,
                provider: isClaude ? 'anthropic' : 'openai',
                apiKey: NeoConfig.get('openai'),
                anthropicKey: NeoConfig.get('anthropic')
            });
            return result.content;
        }

        if (isClaude) {
            throw new Error('Claude requires Worker backend. Please configure Worker URL.');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NeoConfig.get('openai')}`
            },
            body: JSON.stringify({
                model: this.selectedModel,
                messages: this.messages.map(m => ({
                    role: m.role,
                    content: m.content
                })),
                max_tokens: 4096
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
