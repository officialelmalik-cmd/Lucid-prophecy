const NeoReplicate = {
    models: {
        'flux-pro': { name: 'Flux 1.1 Pro', type: 'image' },
        'flux-schnell': { name: 'Flux Schnell', type: 'image' },
        'sdxl': { name: 'SDXL', type: 'image' },
        'sd3': { name: 'Stable Diffusion 3', type: 'image' },
        'ideogram': { name: 'Ideogram v2 Turbo', type: 'image' },
        'recraft': { name: 'Recraft v3 SVG', type: 'image' },
        'musicgen': { name: 'MusicGen', type: 'audio' },
        'video': { name: 'Minimax Video', type: 'video' },
        'upscale': { name: 'Real-ESRGAN Upscale', type: 'image' }
    },

    render(container) {
        if (!NeoConfig.isConfigured('replicate')) {
            container.innerHTML = `
                <div class="workspace-placeholder">
                    <p>Replicate API token not configured.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('openConfig').click()">
                        Configure API Token
                    </button>
                </div>
            `;
            return;
        }

        const modelOptions = Object.entries(this.models).map(([key, val]) =>
            `<option value="${key}">${val.name} (${val.type})</option>`
        ).join('');

        container.innerHTML = `
            <div class="media-generator">
                <div class="media-options">
                    <select class="media-select" id="replicate-model">
                        <optgroup label="Premium Image Models">
                            <option value="flux-pro">Flux 1.1 Pro (Best Quality)</option>
                            <option value="ideogram">Ideogram v2 Turbo</option>
                            <option value="sd3">Stable Diffusion 3</option>
                        </optgroup>
                        <optgroup label="Fast Image Models">
                            <option value="flux-schnell">Flux Schnell (Fast)</option>
                            <option value="sdxl">SDXL</option>
                        </optgroup>
                        <optgroup label="Specialized">
                            <option value="recraft">Recraft v3 SVG</option>
                            <option value="upscale">Real-ESRGAN Upscale</option>
                        </optgroup>
                        <optgroup label="Audio & Video">
                            <option value="musicgen">MusicGen (Audio)</option>
                            <option value="video">Minimax Video</option>
                        </optgroup>
                    </select>
                    <select class="media-select" id="replicate-size">
                        <option value="1024x1024">1024x1024</option>
                        <option value="1024x768">1024x768 (Landscape)</option>
                        <option value="768x1024">768x1024 (Portrait)</option>
                        <option value="1280x720">1280x720 (HD)</option>
                    </select>
                </div>
                <textarea class="media-prompt" id="replicate-prompt"
                    placeholder="Describe what you want to generate..."></textarea>
                <textarea class="media-prompt" id="replicate-negative" style="min-height: 60px; margin-top: 0.5rem;"
                    placeholder="Negative prompt (optional) - things to avoid..."></textarea>
                <button class="btn btn-primary" id="replicate-generate">Generate</button>
                <div class="media-output" id="replicate-output">
                    <p>Output will appear here</p>
                </div>
            </div>
        `;

        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('replicate-generate').addEventListener('click', () => {
            this.generate();
        });
    },

    async generate() {
        const modelKey = document.getElementById('replicate-model').value;
        const prompt = document.getElementById('replicate-prompt').value.trim();
        const negativePrompt = document.getElementById('replicate-negative').value.trim();
        const size = document.getElementById('replicate-size').value;
        const output = document.getElementById('replicate-output');

        if (!prompt) {
            NeoApp.showNotification('Please enter a prompt', 'error');
            return;
        }

        output.innerHTML = '<div class="loading-spinner"></div><p style="margin-top: 1rem; color: var(--text-muted);">Generating... This may take a moment.</p>';

        try {
            const [width, height] = size.split('x').map(Number);
            const result = await this.callAPI(modelKey, prompt, negativePrompt, width, height);
            this.displayResult(result, modelKey);
        } catch (e) {
            output.innerHTML = `<p style="color: var(--error);">${e.message}</p>`;
            NeoApp.showNotification(e.message, 'error');
        }
    },

    async callAPI(modelKey, prompt, negativePrompt, width, height) {
        if (NeoConfig.hasWorker()) {
            const result = await NeoApp.callWorker('replicate_generate', {
                model: modelKey,
                prompt,
                negative_prompt: negativePrompt || undefined,
                width,
                height,
                apiToken: NeoConfig.get('replicate')
            });
            return result.output;
        }

        throw new Error('Replicate generation requires Worker backend. Please configure Worker URL.');
    },

    displayResult(output, modelKey) {
        const container = document.getElementById('replicate-output');
        const modelInfo = this.models[modelKey];
        const mediaUrl = Array.isArray(output) ? output[0] : output;

        if (modelInfo.type === 'audio') {
            container.innerHTML = `
                <audio controls style="width: 100%;">
                    <source src="${mediaUrl}" type="audio/mpeg">
                </audio>
                <a href="${mediaUrl}" download class="btn btn-secondary" style="margin-top: 1rem;">Download Audio</a>
            `;
        } else if (modelInfo.type === 'video') {
            container.innerHTML = `
                <video controls style="width: 100%; border-radius: 8px;">
                    <source src="${mediaUrl}" type="video/mp4">
                </video>
                <a href="${mediaUrl}" download class="btn btn-secondary" style="margin-top: 1rem;">Download Video</a>
            `;
        } else {
            container.innerHTML = `
                <img src="${mediaUrl}" alt="Generated image" style="max-width: 100%; border-radius: 8px;">
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <a href="${mediaUrl}" download class="btn btn-secondary">Download</a>
                    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText('${mediaUrl}');NeoApp.showNotification('URL copied!', 'success');">Copy URL</button>
                </div>
            `;
        }
    }
};
