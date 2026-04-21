const NeoReplicate = {
    models: {
        'sdxl': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        'flux': 'black-forest-labs/flux-schnell',
        'musicgen': 'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055f2a37f72d5a82313bc26b1'
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

        container.innerHTML = `
            <div class="media-generator">
                <div class="media-options">
                    <select class="media-select" id="replicate-model">
                        <option value="sdxl">SDXL (Images)</option>
                        <option value="flux">Flux Schnell (Fast Images)</option>
                        <option value="musicgen">MusicGen (Audio)</option>
                    </select>
                </div>
                <textarea class="media-prompt" id="replicate-prompt"
                    placeholder="Describe what you want to generate..."></textarea>
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
        const output = document.getElementById('replicate-output');

        if (!prompt) {
            NeoApp.showNotification('Please enter a prompt', 'error');
            return;
        }

        output.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const result = await this.callAPI(modelKey, prompt);
            this.displayResult(result, modelKey);
        } catch (e) {
            output.innerHTML = `<p style="color: var(--error);">${e.message}</p>`;
            NeoApp.showNotification(e.message, 'error');
        }
    },

    async callAPI(modelKey, prompt) {
        const model = this.models[modelKey];

        if (NeoConfig.hasWorker()) {
            return await NeoApp.callWorker('replicate_generate', {
                model,
                prompt,
                apiToken: NeoConfig.get('replicate')
            });
        }

        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${NeoConfig.get('replicate')}`
            },
            body: JSON.stringify({
                version: model.includes(':') ? model.split(':')[1] : model,
                input: { prompt }
            })
        });

        if (!response.ok) {
            throw new Error('Replicate API request failed');
        }

        const prediction = await response.json();
        return await this.pollPrediction(prediction.id);
    },

    async pollPrediction(id) {
        const maxAttempts = 60;
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(r => setTimeout(r, 2000));

            const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
                headers: {
                    'Authorization': `Token ${NeoConfig.get('replicate')}`
                }
            });

            const prediction = await response.json();

            if (prediction.status === 'succeeded') {
                return prediction.output;
            } else if (prediction.status === 'failed') {
                throw new Error(prediction.error || 'Generation failed');
            }
        }
        throw new Error('Generation timed out');
    },

    displayResult(output, modelKey) {
        const container = document.getElementById('replicate-output');

        if (modelKey === 'musicgen') {
            container.innerHTML = `
                <audio controls style="width: 100%;">
                    <source src="${output}" type="audio/mpeg">
                </audio>
            `;
        } else {
            const imgUrl = Array.isArray(output) ? output[0] : output;
            container.innerHTML = `<img src="${imgUrl}" alt="Generated image">`;
        }
    }
};
