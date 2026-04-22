const NeoVoice = {
    activeTab: 'tts',
    audioHistory: [],

    render(container) {
        container.innerHTML = `
            <div class="voice-studio">
                <div class="voice-tabs">
                    <button class="voice-tab active" data-tab="tts">Text to Speech</button>
                    <button class="voice-tab" data-tab="openai-tts">OpenAI TTS</button>
                    <button class="voice-tab" data-tab="history">Audio History</button>
                </div>

                <div class="voice-tab-content" id="vtab-tts">
                    <div class="voice-section">
                        <h3>ElevenLabs Voice Synthesis</h3>
                        <div class="form-row">
                            <select class="media-select" id="eleven-voice">
                                <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Warm, Conversational)</option>
                                <option value="AZnzlk1XvdvUeBnXmlld">Domi (Confident, Energetic)</option>
                                <option value="EXAVITQu4vr4xnSDxMaL">Bella (Soft, Young)</option>
                                <option value="ErXwobaYiN019PkySvjV">Antoni (Confident Male)</option>
                                <option value="MF3mGyEYCl7XYWbV9V6O">Elli (Friendly Female)</option>
                                <option value="TxGEqnHWrfWFTfGW9XjX">Josh (Deep Male)</option>
                                <option value="VR6AewLTigWG4xSOukaG">Arnold (Strong Male)</option>
                                <option value="pNInz6obpgDQGcFmaJgB">Adam (Narration)</option>
                                <option value="yoZ06aMxZJJ28mfd3POQ">Sam (Young Male)</option>
                            </select>
                            <select class="media-select" id="eleven-model">
                                <option value="eleven_multilingual_v2">Multilingual v2 (Best)</option>
                                <option value="eleven_turbo_v2_5">Turbo v2.5 (Fast)</option>
                                <option value="eleven_monolingual_v1">English v1</option>
                            </select>
                        </div>
                        <div class="voice-sliders">
                            <div class="slider-group">
                                <label>Stability: <span id="stability-val">0.5</span></label>
                                <input type="range" id="eleven-stability" min="0" max="1" step="0.1" value="0.5">
                            </div>
                            <div class="slider-group">
                                <label>Similarity Boost: <span id="similarity-val">0.75</span></label>
                                <input type="range" id="eleven-similarity" min="0" max="1" step="0.05" value="0.75">
                            </div>
                        </div>
                        <textarea class="media-prompt" id="eleven-text"
                            placeholder="Enter text to speak... (up to 2500 characters)"></textarea>
                        <div class="char-count" id="eleven-char-count">0 / 2500</div>
                        <input type="password" class="chat-input" id="eleven-api-key"
                            placeholder="ElevenLabs API Key (xi_api_key)...">
                        <button class="btn btn-primary" id="eleven-synthesize">Synthesize Voice</button>
                        <div class="voice-output" id="eleven-output">
                            <p class="text-muted">Generated audio will appear here</p>
                        </div>
                    </div>
                </div>

                <div class="voice-tab-content hidden" id="vtab-openai-tts">
                    <div class="voice-section">
                        <h3>OpenAI Text to Speech</h3>
                        <div class="form-row">
                            <select class="media-select" id="openai-voice-select">
                                <option value="nova">Nova (Friendly Female)</option>
                                <option value="alloy">Alloy (Neutral)</option>
                                <option value="echo">Echo (Male)</option>
                                <option value="fable">Fable (Warm Male)</option>
                                <option value="onyx">Onyx (Deep Male)</option>
                                <option value="shimmer">Shimmer (Soft Female)</option>
                            </select>
                            <select class="media-select" id="openai-tts-model">
                                <option value="tts-1-hd">TTS-1 HD (Best Quality)</option>
                                <option value="tts-1">TTS-1 (Fast)</option>
                            </select>
                            <select class="media-select" id="openai-tts-speed">
                                <option value="0.75">0.75x (Slow)</option>
                                <option value="1.0" selected>1.0x (Normal)</option>
                                <option value="1.25">1.25x (Fast)</option>
                                <option value="1.5">1.5x (Very Fast)</option>
                            </select>
                        </div>
                        <textarea class="media-prompt" id="openai-tts-text"
                            placeholder="Enter text to convert to speech..."></textarea>
                        <button class="btn btn-primary" id="openai-tts-synthesize">Generate Speech</button>
                        <div class="voice-output" id="openai-tts-output">
                            <p class="text-muted">Generated speech will appear here</p>
                        </div>
                    </div>
                </div>

                <div class="voice-tab-content hidden" id="vtab-history">
                    <div class="voice-section">
                        <h3>Audio Generation History</h3>
                        <button class="btn btn-secondary" id="clear-audio-history">Clear History</button>
                        <div class="audio-history-list" id="audio-history-list">
                            <p class="text-muted">No audio generated yet</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .voice-studio { display: flex; flex-direction: column; gap: 1.5rem; }
                .voice-tabs {
                    display: flex;
                    gap: 0.5rem;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 1rem;
                }
                .voice-tab {
                    padding: 0.65rem 1.25rem;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .voice-tab:hover { color: var(--text-primary); }
                .voice-tab.active { background: var(--accent); border-color: var(--accent); color: white; }
                .voice-tab-content.hidden { display: none; }
                .voice-section { display: flex; flex-direction: column; gap: 1rem; }
                .voice-section h3 { color: var(--accent-light); }
                .form-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
                .form-row .media-select, .form-row .chat-input { flex: 1; min-width: 160px; }
                .voice-sliders { display: flex; gap: 1.5rem; flex-wrap: wrap; }
                .slider-group { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; min-width: 200px; }
                .slider-group label { font-size: 0.85rem; color: var(--text-secondary); }
                .slider-group input[type="range"] { accent-color: var(--accent); }
                .char-count { font-size: 0.75rem; color: var(--text-muted); text-align: right; }
                .voice-output {
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 1.25rem;
                    min-height: 80px;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                .audio-history-list { display: flex; flex-direction: column; gap: 0.75rem; }
                .audio-history-item {
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    padding: 1rem;
                }
                .audio-history-item .item-meta {
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                }
                .text-muted { color: var(--text-muted); }
            </style>
        `;

        this.bindEvents();
        this.renderHistory();
    },

    bindEvents() {
        document.querySelectorAll('.voice-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.voice-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.voice-tab-content').forEach(c => c.classList.add('hidden'));
                tab.classList.add('active');
                document.getElementById(`vtab-${tab.dataset.tab}`).classList.remove('hidden');
            });
        });

        const elevenText = document.getElementById('eleven-text');
        elevenText.addEventListener('input', () => {
            document.getElementById('eleven-char-count').textContent = `${elevenText.value.length} / 2500`;
        });

        ['eleven-stability', 'eleven-similarity'].forEach(id => {
            const el = document.getElementById(id);
            const label = id === 'eleven-stability' ? 'stability-val' : 'similarity-val';
            el.addEventListener('input', () => {
                document.getElementById(label).textContent = el.value;
            });
        });

        document.getElementById('eleven-synthesize').addEventListener('click', () => this.synthesizeElevenLabs());
        document.getElementById('openai-tts-synthesize').addEventListener('click', () => this.synthesizeOpenAI());
        document.getElementById('clear-audio-history').addEventListener('click', () => {
            this.audioHistory = [];
            this.renderHistory();
        });
    },

    async synthesizeElevenLabs() {
        const voiceId = document.getElementById('eleven-voice').value;
        const model = document.getElementById('eleven-model').value;
        const text = document.getElementById('eleven-text').value.trim();
        const apiKey = document.getElementById('eleven-api-key').value.trim();
        const stability = parseFloat(document.getElementById('eleven-stability').value);
        const similarity = parseFloat(document.getElementById('eleven-similarity').value);
        const output = document.getElementById('eleven-output');

        if (!text) { NeoApp.showNotification('Please enter text to synthesize', 'error'); return; }
        if (!apiKey && !NeoConfig.hasWorker()) { NeoApp.showNotification('ElevenLabs API key required', 'error'); return; }

        output.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const result = await NeoApp.callWorker('voice_synthesize', {
                provider: 'elevenlabs',
                text,
                voiceId,
                model,
                stability,
                similarity_boost: similarity,
                apiKey
            });

            const audioData = `data:audio/mpeg;base64,${result.audio_base64}`;
            this.addToHistory('ElevenLabs', text.slice(0, 60), audioData);
            this.renderAudioOutput(output, audioData, text);
        } catch (e) {
            output.innerHTML = `<p style="color:var(--error);">${e.message}</p>`;
        }
    },

    async synthesizeOpenAI() {
        const voice = document.getElementById('openai-voice-select').value;
        const model = document.getElementById('openai-tts-model').value;
        const speed = parseFloat(document.getElementById('openai-tts-speed').value);
        const text = document.getElementById('openai-tts-text').value.trim();
        const output = document.getElementById('openai-tts-output');

        if (!text) { NeoApp.showNotification('Please enter text', 'error'); return; }
        if (!NeoConfig.hasWorker()) { NeoApp.showNotification('Worker URL required', 'error'); return; }

        output.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const result = await NeoApp.callWorker('voice_synthesize', {
                provider: 'openai',
                text,
                voice,
                model,
                speed,
                apiKey: NeoConfig.get('openai')
            });

            const audioData = `data:audio/mpeg;base64,${result.audio_base64}`;
            this.addToHistory('OpenAI TTS', text.slice(0, 60), audioData);
            this.renderAudioOutput(output, audioData, text);
        } catch (e) {
            output.innerHTML = `<p style="color:var(--error);">${e.message}</p>`;
        }
    },

    renderAudioOutput(container, audioSrc, text) {
        container.innerHTML = `
            <p style="font-size:0.85rem;color:var(--text-secondary);">"${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"</p>
            <audio controls style="width:100%;">
                <source src="${audioSrc}" type="audio/mpeg">
            </audio>
            <a href="${audioSrc}" download="voice-${Date.now()}.mp3" class="btn btn-secondary">Download MP3</a>
        `;
    },

    addToHistory(provider, textPreview, audioSrc) {
        this.audioHistory.unshift({ provider, textPreview, audioSrc, timestamp: new Date().toLocaleString() });
        if (this.audioHistory.length > 20) this.audioHistory.pop();
    },

    renderHistory() {
        const list = document.getElementById('audio-history-list');
        if (!list) return;
        if (this.audioHistory.length === 0) {
            list.innerHTML = '<p class="text-muted">No audio generated yet</p>';
            return;
        }
        list.innerHTML = this.audioHistory.map((item, i) => `
            <div class="audio-history-item">
                <div class="item-meta">${item.provider} &middot; ${item.timestamp}</div>
                <p style="font-size:0.9rem;margin-bottom:0.5rem;">"${item.textPreview}..."</p>
                <audio controls style="width:100%">
                    <source src="${item.audioSrc}" type="audio/mpeg">
                </audio>
            </div>
        `).join('');
    }
};
