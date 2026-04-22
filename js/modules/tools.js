const NeoTools = {
    render(container) {
        container.innerHTML = `
            <div class="tools-hub">
                <div class="tools-tabs">
                    <button class="tools-tab active" data-tab="seo">SEO Analyzer</button>
                    <button class="tools-tab" data-tab="translate">Translator</button>
                    <button class="tools-tab" data-tab="summarize">Summarizer</button>
                    <button class="tools-tab" data-tab="image-ai">Image Analyzer</button>
                    <button class="tools-tab" data-tab="docs">Document Gen</button>
                </div>

                <!-- SEO Analyzer -->
                <div class="tools-tab-content" id="ttab-seo">
                    <div class="tool-section">
                        <h3>SEO Content Analyzer</h3>
                        <div class="form-row">
                            <input class="chat-input" id="seo-title" placeholder="Page title or URL...">
                            <input class="chat-input" id="seo-keywords" placeholder="Target keywords (comma-separated)">
                        </div>
                        <textarea class="media-prompt" id="seo-content"
                            placeholder="Paste your page content, blog post, or product description here..."></textarea>
                        <button class="btn btn-primary" id="run-seo">Analyze & Optimize</button>
                        <div class="tool-output glass-card" id="seo-output">
                            <p class="text-muted">SEO analysis will appear here...</p>
                        </div>
                    </div>
                </div>

                <!-- Translator -->
                <div class="tools-tab-content hidden" id="ttab-translate">
                    <div class="tool-section">
                        <h3>AI Translator</h3>
                        <div class="form-row">
                            <select class="media-select" id="translate-from">
                                <option value="auto">Auto-detect</option>
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Italian">Italian</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Korean">Korean</option>
                                <option value="Chinese (Simplified)">Chinese (Simplified)</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Russian">Russian</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                            <div style="display:flex;align-items:center;font-size:1.25rem;color:var(--accent);">→</div>
                            <select class="media-select" id="translate-to">
                                <option value="Spanish">Spanish</option>
                                <option value="English">English</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Italian">Italian</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Korean">Korean</option>
                                <option value="Chinese (Simplified)">Chinese (Simplified)</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Russian">Russian</option>
                                <option value="Hindi">Hindi</option>
                            </select>
                            <label class="platform-check" style="white-space:nowrap;">
                                <input type="checkbox" id="translate-preserve" checked> Preserve formatting
                            </label>
                        </div>
                        <textarea class="media-prompt" id="translate-input"
                            placeholder="Enter text to translate..."></textarea>
                        <button class="btn btn-primary" id="run-translate">Translate</button>
                        <div class="translate-result" id="translate-output">
                            <div class="tool-output glass-card" style="min-height:120px;">
                                <p class="text-muted">Translation will appear here...</p>
                            </div>
                            <button class="btn btn-secondary" id="copy-translation" style="display:none;margin-top:0.5rem;">Copy Translation</button>
                        </div>
                    </div>
                </div>

                <!-- Summarizer -->
                <div class="tools-tab-content hidden" id="ttab-summarize">
                    <div class="tool-section">
                        <h3>AI Content Summarizer</h3>
                        <div class="form-row">
                            <select class="media-select" id="summary-style">
                                <option value="concise">Concise (2-3 sentences)</option>
                                <option value="detailed">Detailed Summary</option>
                                <option value="bullets">Bullet Points</option>
                                <option value="executive">Executive Brief</option>
                            </select>
                        </div>
                        <textarea class="media-prompt" id="summarize-input" style="min-height:200px;"
                            placeholder="Paste article, document, or any long text here..."></textarea>
                        <button class="btn btn-primary" id="run-summarize">Summarize</button>
                        <div class="tool-output glass-card" id="summarize-output">
                            <p class="text-muted">Summary will appear here...</p>
                        </div>
                    </div>
                </div>

                <!-- Image Analyzer -->
                <div class="tools-tab-content hidden" id="ttab-image-ai">
                    <div class="tool-section">
                        <h3>AI Image Analyzer (GPT-4o Vision)</h3>
                        <input type="url" class="chat-input" id="image-url-input"
                            placeholder="Image URL (https://...)">
                        <select class="media-select" id="image-analysis-type" style="margin-top:0.75rem;">
                            <option value="">General Description</option>
                            <option value="Extract all text visible in this image (OCR). Return raw text only.">Extract Text (OCR)</option>
                            <option value="Analyze this image for use as game art. Describe style, color palette, mood, and recommend similar art directions.">Game Art Analysis</option>
                            <option value="Analyze this product image for e-commerce. Describe the product, suggest alt text, and write a product description.">Product Analysis</option>
                            <option value="Analyze this image's composition, lighting, color theory, and photographic techniques used.">Photography Critique</option>
                            <option value="Identify all objects, people, and scene elements. Provide a structured analysis.">Object Detection</option>
                            <option value="Analyze this UI/UX design screenshot. Comment on layout, hierarchy, usability, and improvements.">UI/UX Review</option>
                        </select>
                        <button class="btn btn-primary" id="run-image-analyze" style="margin-top:0.75rem;">Analyze Image</button>
                        <div class="image-analyze-output" id="image-analyze-output">
                            <div class="tool-output glass-card">
                                <p class="text-muted">Image analysis will appear here...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Document Generator -->
                <div class="tools-tab-content hidden" id="ttab-docs">
                    <div class="tool-section">
                        <h3>AI Document Generator</h3>
                        <div class="form-row">
                            <select class="media-select" id="doc-type">
                                <optgroup label="Business">
                                    <option value="business-proposal">Business Proposal</option>
                                    <option value="executive-summary">Executive Summary</option>
                                    <option value="business-plan">Business Plan</option>
                                    <option value="pitch-deck-script">Pitch Deck Script</option>
                                    <option value="project-scope">Project Scope of Work</option>
                                </optgroup>
                                <optgroup label="Legal & Contracts">
                                    <option value="nda">Non-Disclosure Agreement</option>
                                    <option value="freelance-contract">Freelance Contract</option>
                                    <option value="terms-of-service">Terms of Service</option>
                                    <option value="privacy-policy">Privacy Policy</option>
                                </optgroup>
                                <optgroup label="Marketing">
                                    <option value="press-release">Press Release</option>
                                    <option value="brand-guide">Brand Guidelines</option>
                                    <option value="marketing-plan">Marketing Plan</option>
                                    <option value="case-study">Case Study</option>
                                </optgroup>
                                <optgroup label="Technical">
                                    <option value="api-docs">API Documentation</option>
                                    <option value="technical-spec">Technical Specification</option>
                                    <option value="readme">README File</option>
                                </optgroup>
                            </select>
                        </div>
                        <textarea class="media-prompt" id="doc-brief"
                            placeholder="Describe your company, project, or context for the document... (e.g. 'NEOSAI APEX is an AI automation platform targeting creative professionals and businesses wanting to automate their workflow...')"></textarea>
                        <button class="btn btn-primary" id="gen-document">Generate Document</button>
                        <div class="doc-output-wrap">
                            <div class="tool-output glass-card" id="doc-output" style="min-height:200px;">
                                <p class="text-muted">Document will appear here...</p>
                            </div>
                            <div class="doc-actions" id="doc-actions" style="display:none;margin-top:0.75rem;display:flex;gap:0.5rem;">
                                <button class="btn btn-secondary" id="copy-doc">Copy Document</button>
                                <button class="btn btn-secondary" id="download-doc">Download .txt</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .tools-hub { display: flex; flex-direction: column; gap: 1.5rem; }
                .tools-tabs { display: flex; gap: 0.4rem; flex-wrap: wrap; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
                .tools-tab {
                    padding: 0.6rem 1.1rem;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .tools-tab:hover { color: var(--text-primary); border-color: var(--accent); }
                .tools-tab.active { background: var(--accent); border-color: var(--accent); color: white; }
                .tools-tab-content.hidden { display: none; }
                .tool-section { display: flex; flex-direction: column; gap: 1rem; }
                .tool-section h3 { color: var(--accent-light); }
                .form-row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
                .form-row .chat-input, .form-row .media-select { flex: 1; min-width: 160px; }
                .glass-card {
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 1.25rem;
                    min-height: 100px;
                    line-height: 1.7;
                    white-space: pre-wrap;
                    font-size: 0.9rem;
                }
                .translate-result { display: flex; flex-direction: column; }
                .platform-check { display: flex; align-items: center; gap: 0.4rem; font-size: 0.875rem; cursor: pointer; }
                .platform-check input { accent-color: var(--accent); }
                .text-muted { color: var(--text-muted); }
                .doc-actions { display: flex; gap: 0.5rem; }
            </style>
        `;

        this.bindEvents();
    },

    bindEvents() {
        document.querySelectorAll('.tools-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tools-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tools-tab-content').forEach(c => c.classList.add('hidden'));
                tab.classList.add('active');
                document.getElementById(`ttab-${tab.dataset.tab}`).classList.remove('hidden');
            });
        });

        document.getElementById('run-seo').addEventListener('click', () => this.runSEO());
        document.getElementById('run-translate').addEventListener('click', () => this.runTranslate());
        document.getElementById('run-summarize').addEventListener('click', () => this.runSummarize());
        document.getElementById('run-image-analyze').addEventListener('click', () => this.runImageAnalyze());
        document.getElementById('gen-document').addEventListener('click', () => this.generateDocument());

        document.getElementById('copy-translation').addEventListener('click', () => {
            const text = document.querySelector('#translate-output .glass-card')?.textContent || '';
            navigator.clipboard.writeText(text.trim());
            NeoApp.showNotification('Copied!', 'success');
        });

        document.getElementById('copy-doc').addEventListener('click', () => {
            const text = document.getElementById('doc-output')?.textContent || '';
            navigator.clipboard.writeText(text.trim());
            NeoApp.showNotification('Copied!', 'success');
        });

        document.getElementById('download-doc').addEventListener('click', () => {
            const text = document.getElementById('doc-output')?.textContent || '';
            const type = document.getElementById('doc-type').value;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-${Date.now()}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        });
    },

    async runSEO() {
        const title = document.getElementById('seo-title').value.trim();
        const keywords = document.getElementById('seo-keywords').value.trim();
        const content = document.getElementById('seo-content').value.trim();
        const output = document.getElementById('seo-output');

        if (!content) { NeoApp.showNotification('Please enter content to analyze', 'error'); return; }
        if (!NeoConfig.hasWorker()) { NeoApp.showNotification('Worker URL required', 'error'); return; }

        output.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const result = await NeoApp.callWorker('seo_analyze', {
                title, keywords, content, apiKey: NeoConfig.get('openai')
            });
            output.textContent = result.analysis;
        } catch (e) {
            output.textContent = `Error: ${e.message}`;
        }
    },

    async runTranslate() {
        const text = document.getElementById('translate-input').value.trim();
        const to = document.getElementById('translate-to').value;
        const preserve = document.getElementById('translate-preserve').checked;
        const outputEl = document.querySelector('#translate-output .glass-card');
        const copyBtn = document.getElementById('copy-translation');

        if (!text) { NeoApp.showNotification('Please enter text to translate', 'error'); return; }
        if (!NeoConfig.hasWorker()) { NeoApp.showNotification('Worker URL required', 'error'); return; }

        outputEl.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const result = await NeoApp.callWorker('translate', {
                text, targetLanguage: to, preserveFormatting: preserve,
                apiKey: NeoConfig.get('openai')
            });
            outputEl.textContent = result.translated;
            copyBtn.style.display = 'block';
        } catch (e) {
            outputEl.textContent = `Error: ${e.message}`;
        }
    },

    async runSummarize() {
        const content = document.getElementById('summarize-input').value.trim();
        const style = document.getElementById('summary-style').value;
        const output = document.getElementById('summarize-output');

        if (!content) { NeoApp.showNotification('Please enter content to summarize', 'error'); return; }
        if (!NeoConfig.hasWorker()) { NeoApp.showNotification('Worker URL required', 'error'); return; }

        output.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const result = await NeoApp.callWorker('summarize', {
                content, style, apiKey: NeoConfig.get('openai')
            });
            output.textContent = result.summary;
        } catch (e) {
            output.textContent = `Error: ${e.message}`;
        }
    },

    async runImageAnalyze() {
        const imageUrl = document.getElementById('image-url-input').value.trim();
        const analysisType = document.getElementById('image-analysis-type').value;
        const outputWrap = document.getElementById('image-analyze-output');

        if (!imageUrl) { NeoApp.showNotification('Please enter an image URL', 'error'); return; }
        if (!NeoConfig.hasWorker()) { NeoApp.showNotification('Worker URL required', 'error'); return; }

        outputWrap.innerHTML = '<div class="loading-spinner" style="margin:1rem 0;"></div>';

        try {
            const result = await NeoApp.callWorker('image_analyze', {
                imageUrl,
                prompt: analysisType || undefined,
                apiKey: NeoConfig.get('openai')
            });

            outputWrap.innerHTML = `
                <img src="${imageUrl}" alt="Analyzed image" style="max-width:100%;border-radius:8px;margin-bottom:1rem;max-height:300px;object-fit:contain;">
                <div class="glass-card">${this.escapeHtml(result.description)}</div>
            `;
        } catch (e) {
            outputWrap.innerHTML = `<div class="glass-card" style="color:var(--error);">${e.message}</div>`;
        }
    },

    async generateDocument() {
        const docType = document.getElementById('doc-type').value;
        const brief = document.getElementById('doc-brief').value.trim();
        const output = document.getElementById('doc-output');
        const actions = document.getElementById('doc-actions');

        if (!brief) { NeoApp.showNotification('Please describe your context for the document', 'error'); return; }
        if (!NeoConfig.hasWorker()) { NeoApp.showNotification('Worker URL required', 'error'); return; }

        output.innerHTML = '<div class="loading-spinner"></div>';
        actions.style.display = 'none';

        const docPrompts = {
            'business-proposal': 'Write a professional business proposal',
            'executive-summary': 'Write a compelling executive summary',
            'business-plan': 'Write a comprehensive business plan outline',
            'pitch-deck-script': 'Write a pitch deck script (slide-by-slide)',
            'project-scope': 'Write a detailed project scope of work document',
            'nda': 'Write a professional Non-Disclosure Agreement (NDA). Add [PARTY A] and [PARTY B] as placeholders.',
            'freelance-contract': 'Write a professional freelance services contract. Include placeholders for parties, rates, and deliverables.',
            'terms-of-service': 'Write comprehensive Terms of Service for a SaaS platform.',
            'privacy-policy': 'Write a GDPR-compliant Privacy Policy for a web application.',
            'press-release': 'Write a professional press release',
            'brand-guide': 'Write comprehensive brand guidelines document',
            'marketing-plan': 'Write a detailed digital marketing plan',
            'case-study': 'Write a compelling case study document',
            'api-docs': 'Write API documentation in Markdown format',
            'technical-spec': 'Write a technical specification document',
            'readme': 'Write a comprehensive README.md file'
        };

        const instruction = docPrompts[docType] || 'Write a professional document';

        try {
            const result = await NeoApp.callWorker('openai_chat', {
                messages: [{
                    role: 'user',
                    content: `${instruction} based on this context:

${brief}

Requirements:
- Professional formatting with clear sections
- Complete and ready to use (with [PLACEHOLDER] for customizable fields)
- Industry-standard structure and language
- Comprehensive coverage of all necessary sections`
                }],
                model: 'gpt-4-turbo-preview',
                max_tokens: 4096,
                apiKey: NeoConfig.get('openai')
            });

            output.textContent = result.content;
            actions.style.display = 'flex';
        } catch (e) {
            output.textContent = `Error: ${e.message}`;
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
