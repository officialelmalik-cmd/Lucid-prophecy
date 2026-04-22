const NeoGameStudio = {
    activeTab: 'concept',
    generatedAssets: [],

    render(container) {
        container.innerHTML = `
            <div class="game-studio">
                <div class="game-tabs">
                    <button class="game-tab active" data-tab="concept">Concept & Story</button>
                    <button class="game-tab" data-tab="assets">Asset Generator</button>
                    <button class="game-tab" data-tab="code">Game Code</button>
                    <button class="game-tab" data-tab="music">Game Music</button>
                    <button class="game-tab" data-tab="builder">Level Builder</button>
                </div>

                <div class="game-tab-content" id="gtab-concept">
                    <div class="game-section">
                        <h3>Game Concept Generator</h3>
                        <div class="game-form">
                            <div class="form-row">
                                <select class="media-select" id="game-genre">
                                    <option value="platformer">Platformer</option>
                                    <option value="rpg">RPG / Adventure</option>
                                    <option value="shooter">Top-Down Shooter</option>
                                    <option value="puzzle">Puzzle</option>
                                    <option value="strategy">Strategy / RTS</option>
                                    <option value="fighting">Fighting</option>
                                    <option value="horror">Horror</option>
                                    <option value="open-world">Open World</option>
                                </select>
                                <select class="media-select" id="game-style">
                                    <option value="pixel-art">Pixel Art (2D)</option>
                                    <option value="cartoon">Cartoon (2D)</option>
                                    <option value="realistic">Realistic (3D)</option>
                                    <option value="low-poly">Low Poly (3D)</option>
                                    <option value="anime">Anime Style</option>
                                </select>
                            </div>
                            <textarea class="media-prompt" id="game-theme"
                                placeholder="Describe your game idea or theme... (e.g. 'A space explorer discovers ancient ruins on a dying planet')"></textarea>
                            <button class="btn btn-primary" id="gen-concept">Generate Game Concept</button>
                        </div>
                        <div class="game-output glass-card" id="concept-output">
                            <p class="text-muted">Your game concept will appear here...</p>
                        </div>
                    </div>
                </div>

                <div class="game-tab-content hidden" id="gtab-assets">
                    <div class="game-section">
                        <h3>Game Asset Generator</h3>
                        <div class="asset-grid-controls">
                            <select class="media-select" id="asset-type">
                                <optgroup label="Characters">
                                    <option value="hero">Hero Character</option>
                                    <option value="enemy">Enemy Character</option>
                                    <option value="npc">NPC</option>
                                    <option value="boss">Boss Character</option>
                                </optgroup>
                                <optgroup label="Environments">
                                    <option value="background">Game Background</option>
                                    <option value="tileset">Tileset</option>
                                    <option value="environment">Environment Scene</option>
                                </optgroup>
                                <optgroup label="UI & Items">
                                    <option value="item">Item / Pickup</option>
                                    <option value="weapon">Weapon</option>
                                    <option value="ui">UI Elements</option>
                                    <option value="icon">Game Icons</option>
                                </optgroup>
                                <optgroup label="3D Models">
                                    <option value="3d-character">3D Character</option>
                                    <option value="3d-prop">3D Prop</option>
                                    <option value="3d-vehicle">3D Vehicle</option>
                                </optgroup>
                            </select>
                            <select class="media-select" id="asset-style-select">
                                <option value="pixel art, 8-bit style">Pixel Art (8-bit)</option>
                                <option value="pixel art, 16-bit SNES style">Pixel Art (16-bit)</option>
                                <option value="cartoon, vibrant colors, game art">Cartoon</option>
                                <option value="realistic, high detail, game asset">Realistic</option>
                                <option value="low-poly, 3D render">Low Poly 3D</option>
                                <option value="anime style, game art">Anime</option>
                                <option value="dark fantasy, detailed illustration">Dark Fantasy</option>
                                <option value="sci-fi, futuristic design">Sci-Fi</option>
                            </select>
                        </div>
                        <textarea class="media-prompt" id="asset-prompt"
                            placeholder="Describe the asset... (e.g. 'warrior with blue armor wielding a lightning sword')"></textarea>
                        <button class="btn btn-primary" id="gen-asset">Generate Asset</button>
                        <div class="asset-gallery" id="asset-gallery">
                            <p class="text-muted">Generated assets will appear here...</p>
                        </div>
                    </div>
                </div>

                <div class="game-tab-content hidden" id="gtab-code">
                    <div class="game-section">
                        <h3>Game Code Generator (Phaser.js / Three.js)</h3>
                        <div class="form-row">
                            <select class="media-select" id="code-engine">
                                <option value="phaser">Phaser.js (2D)</option>
                                <option value="threejs">Three.js (3D)</option>
                                <option value="babylon">Babylon.js (3D)</option>
                                <option value="vanilla">Vanilla JS (Canvas)</option>
                            </select>
                            <select class="media-select" id="code-component">
                                <option value="full-game">Full Game Template</option>
                                <option value="player">Player Controller</option>
                                <option value="enemies">Enemy AI System</option>
                                <option value="combat">Combat System</option>
                                <option value="inventory">Inventory System</option>
                                <option value="level">Level Manager</option>
                                <option value="ui">Game UI / HUD</option>
                                <option value="physics">Physics System</option>
                                <option value="audio">Audio Manager</option>
                            </select>
                        </div>
                        <textarea class="media-prompt" id="code-spec"
                            placeholder="Describe what the code should do... (e.g. 'A player that can jump, double-jump, and shoot projectiles with animated sprites')"></textarea>
                        <button class="btn btn-primary" id="gen-code">Generate Code</button>
                        <div class="code-output-wrap" id="code-output-wrap">
                            <pre class="code-output" id="code-output"><code>// Generated game code will appear here...</code></pre>
                            <button class="btn btn-secondary copy-code-btn" id="copy-code" style="display:none">Copy Code</button>
                        </div>
                    </div>
                </div>

                <div class="game-tab-content hidden" id="gtab-music">
                    <div class="game-section">
                        <h3>Game Music & SFX Generator</h3>
                        <div class="form-row">
                            <select class="media-select" id="music-type">
                                <option value="title-screen">Title Screen Theme</option>
                                <option value="battle">Battle Music</option>
                                <option value="boss">Boss Fight Theme</option>
                                <option value="exploration">Exploration / World Map</option>
                                <option value="victory">Victory Fanfare</option>
                                <option value="ambient">Ambient / Atmospheric</option>
                                <option value="dungeon">Dungeon / Cave</option>
                                <option value="credits">Credits Theme</option>
                            </select>
                            <select class="media-select" id="music-style">
                                <option value="8-bit chiptune, retro game music">8-Bit Chiptune</option>
                                <option value="orchestral, epic cinematic game music">Orchestral Epic</option>
                                <option value="electronic, synth, cyberpunk">Electronic Synth</option>
                                <option value="jazz, relaxed">Jazz / Chill</option>
                                <option value="metal, heavy guitar, intense">Metal / Intense</option>
                                <option value="acoustic, peaceful nature sounds">Acoustic / Peaceful</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <input type="number" class="chat-input" id="music-duration"
                                placeholder="Duration (sec)" value="30" min="5" max="120" style="max-width:150px">
                        </div>
                        <textarea class="media-prompt" id="music-prompt"
                            placeholder="Additional music description... (e.g. 'fast-paced, intense, with dramatic brass and pounding drums')"></textarea>
                        <button class="btn btn-primary" id="gen-music">Generate Music</button>
                        <div class="media-output" id="music-output">
                            <p class="text-muted">Generated music will appear here</p>
                        </div>
                    </div>
                </div>

                <div class="game-tab-content hidden" id="gtab-builder">
                    <div class="game-section">
                        <h3>Level Design Assistant</h3>
                        <div class="form-row">
                            <select class="media-select" id="level-type">
                                <option value="platformer">Side-Scroller / Platformer</option>
                                <option value="top-down">Top-Down (Zelda-style)</option>
                                <option value="dungeon">Dungeon / Roguelike</option>
                                <option value="open-world">Open World Area</option>
                                <option value="shooter">Shooter Arena</option>
                            </select>
                            <select class="media-select" id="level-difficulty">
                                <option value="tutorial">Tutorial / Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard / Challenge</option>
                                <option value="boss">Boss Level</option>
                            </select>
                        </div>
                        <textarea class="media-prompt" id="level-prompt"
                            placeholder="Describe the level theme and objectives... (e.g. 'A volcanic cave with lava pits, crumbling platforms, and a fire dragon boss at the end')"></textarea>
                        <button class="btn btn-primary" id="gen-level">Generate Level Design</button>
                        <button class="btn btn-secondary" id="gen-level-art" style="margin-left: 0.5rem;">Generate Level Art</button>
                        <div class="game-output glass-card" id="level-output">
                            <p class="text-muted">Level design blueprint will appear here...</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .game-studio { display: flex; flex-direction: column; gap: 1.5rem; }
                .game-tabs {
                    display: flex;
                    gap: 0.4rem;
                    flex-wrap: wrap;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 1rem;
                }
                .game-tab {
                    padding: 0.6rem 1.2rem;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .game-tab:hover { color: var(--text-primary); border-color: var(--accent); }
                .game-tab.active { background: var(--accent); border-color: var(--accent); color: white; }
                .game-tab-content.hidden { display: none; }
                .game-section { display: flex; flex-direction: column; gap: 1rem; }
                .game-section h3 { font-size: 1.1rem; color: var(--accent-light); }
                .game-form { display: flex; flex-direction: column; gap: 0.75rem; }
                .form-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
                .form-row .media-select { flex: 1; min-width: 180px; }
                .asset-grid-controls { display: flex; gap: 0.75rem; flex-wrap: wrap; }
                .asset-grid-controls .media-select { flex: 1; min-width: 180px; }
                .glass-card {
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    padding: 1.25rem;
                    min-height: 150px;
                    line-height: 1.7;
                    white-space: pre-wrap;
                    font-size: 0.9rem;
                }
                .asset-gallery {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1rem;
                    min-height: 100px;
                    padding: 1rem;
                    background: var(--bg-primary);
                    border-radius: 10px;
                    border: 1px solid var(--border);
                }
                .asset-item {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    background: var(--bg-card);
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid var(--border);
                }
                .asset-item img {
                    width: 100%;
                    aspect-ratio: 1;
                    object-fit: cover;
                }
                .asset-item-actions {
                    display: flex;
                    gap: 0.4rem;
                    padding: 0.5rem;
                }
                .code-output-wrap {
                    position: relative;
                    background: #0d1117;
                    border-radius: 10px;
                    border: 1px solid var(--border);
                    overflow: hidden;
                }
                .code-output {
                    padding: 1.25rem;
                    overflow-x: auto;
                    font-family: 'Courier New', monospace;
                    font-size: 0.85rem;
                    line-height: 1.6;
                    color: #e6edf3;
                    max-height: 500px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                    word-break: break-word;
                }
                .copy-code-btn {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    padding: 0.4rem 0.8rem;
                    font-size: 0.8rem;
                }
                .text-muted { color: var(--text-muted); }
            </style>
        `;

        this.bindEvents();
    },

    bindEvents() {
        document.querySelectorAll('.game-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.game-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.game-tab-content').forEach(c => c.classList.add('hidden'));
                tab.classList.add('active');
                this.activeTab = tab.dataset.tab;
                document.getElementById(`gtab-${tab.dataset.tab}`).classList.remove('hidden');
            });
        });

        document.getElementById('gen-concept').addEventListener('click', () => this.generateConcept());
        document.getElementById('gen-asset').addEventListener('click', () => this.generateAsset());
        document.getElementById('gen-code').addEventListener('click', () => this.generateCode());
        document.getElementById('gen-music').addEventListener('click', () => this.generateMusic());
        document.getElementById('gen-level').addEventListener('click', () => this.generateLevel());
        document.getElementById('gen-level-art').addEventListener('click', () => this.generateLevelArt());
        document.getElementById('copy-code').addEventListener('click', () => this.copyCode());
    },

    async generateConcept() {
        const genre = document.getElementById('game-genre').value;
        const style = document.getElementById('game-style').value;
        const theme = document.getElementById('game-theme').value.trim() || 'an epic adventure';
        const output = document.getElementById('concept-output');

        output.innerHTML = '<div class="loading-spinner"></div>';

        const prompt = `You are a professional game designer. Create a detailed game concept document for:
Genre: ${genre}
Visual Style: ${style}
Theme/Idea: ${theme}

Include:
1. Game Title & Tagline
2. Core Concept (2-3 sentences)
3. Gameplay Mechanics (5 key mechanics)
4. Story/Narrative Summary
5. Main Characters (2-3)
6. World/Setting Description
7. Progression System
8. Unique Selling Points (3 things that make it stand out)
9. Target Audience
10. Monetization Strategy

Format cleanly with clear sections.`;

        try {
            const result = await NeoApp.callWorker('openai_chat', {
                messages: [{ role: 'user', content: prompt }],
                model: 'gpt-4-turbo-preview',
                max_tokens: 2000
            });
            output.textContent = result.content;
        } catch (e) {
            output.textContent = `Error: ${e.message}`;
        }
    },

    async generateAsset() {
        const assetType = document.getElementById('asset-type').value;
        const style = document.getElementById('asset-style-select').value;
        const description = document.getElementById('asset-prompt').value.trim();
        const gallery = document.getElementById('asset-gallery');

        if (!description) {
            NeoApp.showNotification('Please describe the asset', 'error');
            return;
        }

        if (!NeoConfig.hasWorker()) {
            NeoApp.showNotification('Worker URL required', 'error');
            return;
        }

        const typePrompts = {
            hero: 'hero character sprite, front-facing, full body',
            enemy: 'enemy character sprite, menacing, full body',
            npc: 'friendly NPC character, full body',
            boss: 'massive boss monster, intimidating, full body',
            background: 'seamless game background scene, horizontal scrolling',
            tileset: 'game tileset collection on transparent background, grid layout',
            environment: 'detailed environment scene',
            item: 'game item pickup, icon style, transparent background',
            weapon: 'game weapon design, detailed, transparent background',
            ui: 'game UI panel design, clean interface',
            icon: 'game icon set, clean, on dark background',
            '3d-character': '3D rendered character, game asset, turntable view',
            '3d-prop': '3D rendered prop, game asset, studio lighting',
            '3d-vehicle': '3D rendered vehicle, game asset'
        };

        const typeHint = typePrompts[assetType] || assetType;
        const fullPrompt = `${description}, ${typeHint}, ${style}, high quality, no text, no watermark`;

        const loadCard = document.createElement('div');
        loadCard.className = 'asset-item';
        loadCard.innerHTML = '<div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;"><div class="loading-spinner"></div></div>';
        if (gallery.querySelector('.text-muted')) gallery.innerHTML = '';
        gallery.appendChild(loadCard);

        try {
            const result = await NeoApp.callWorker('replicate_generate', {
                model: 'flux-pro',
                prompt: fullPrompt,
                width: 1024,
                height: 1024,
                apiToken: NeoConfig.get('replicate')
            });

            const imgUrl = Array.isArray(result.output) ? result.output[0] : result.output;
            loadCard.innerHTML = `
                <img src="${imgUrl}" alt="${assetType}">
                <div class="asset-item-actions">
                    <a href="${imgUrl}" download class="btn btn-secondary" style="font-size:0.75rem;padding:0.3rem 0.6rem;flex:1;text-align:center;">Download</a>
                </div>
            `;
            this.generatedAssets.push({ type: assetType, url: imgUrl, prompt: description });
        } catch (e) {
            loadCard.innerHTML = `<p style="color:var(--error);padding:1rem;">${e.message}</p>`;
        }
    },

    async generateCode() {
        const engine = document.getElementById('code-engine').value;
        const component = document.getElementById('code-component').value;
        const spec = document.getElementById('code-spec').value.trim();
        const output = document.getElementById('code-output');
        const copyBtn = document.getElementById('copy-code');

        output.innerHTML = '<code>// Generating code...</code>';
        copyBtn.style.display = 'none';

        const engineDocs = {
            phaser: 'Phaser 3 (latest)',
            threejs: 'Three.js r160+',
            babylon: 'Babylon.js 6+',
            vanilla: 'Vanilla JavaScript Canvas API'
        };

        const prompt = `You are an expert game developer. Write clean, complete, well-commented game code using ${engineDocs[engine]}.

Component: ${component}
Additional requirements: ${spec || 'standard implementation with best practices'}

Requirements:
- Production-quality code
- Well-commented
- Handle edge cases
- Include any required setup/initialization
- Use modern JavaScript (ES6+)
- Make it extensible

Provide ONLY the code block, no explanations outside the code.`;

        try {
            const result = await NeoApp.callWorker('openai_chat', {
                messages: [{ role: 'user', content: prompt }],
                model: 'claude-sonnet-4-6-20250514',
                provider: 'anthropic',
                max_tokens: 4096
            });

            const code = result.content.replace(/```[\w]*\n?/g, '').replace(/```$/g, '').trim();
            output.textContent = code;
            copyBtn.style.display = 'block';
        } catch (e) {
            output.textContent = `// Error: ${e.message}`;
        }
    },

    async generateMusic() {
        const musicType = document.getElementById('music-type').value;
        const musicStyle = document.getElementById('music-style').value;
        const prompt = document.getElementById('music-prompt').value.trim();
        const output = document.getElementById('music-output');

        if (!NeoConfig.hasWorker()) {
            NeoApp.showNotification('Worker URL required', 'error');
            return;
        }

        output.innerHTML = '<div class="loading-spinner"></div><p style="margin-top:1rem;color:var(--text-muted)">Composing music...</p>';

        const fullPrompt = `${musicType.replace('-', ' ')} music, ${musicStyle}${prompt ? ', ' + prompt : ''}`;

        try {
            const result = await NeoApp.callWorker('replicate_generate', {
                model: 'musicgen',
                prompt: fullPrompt,
                apiToken: NeoConfig.get('replicate')
            });

            const audioUrl = Array.isArray(result.output) ? result.output[0] : result.output;
            output.innerHTML = `
                <p style="color:var(--text-secondary);margin-bottom:0.75rem;">${musicType} — ${musicStyle}</p>
                <audio controls style="width:100%;margin-bottom:1rem;">
                    <source src="${audioUrl}" type="audio/mpeg">
                </audio>
                <a href="${audioUrl}" download class="btn btn-secondary">Download Track</a>
            `;
        } catch (e) {
            output.innerHTML = `<p style="color:var(--error);">${e.message}</p>`;
        }
    },

    async generateLevel() {
        const levelType = document.getElementById('level-type').value;
        const difficulty = document.getElementById('level-difficulty').value;
        const theme = document.getElementById('level-prompt').value.trim() || 'a mysterious ancient temple';
        const output = document.getElementById('level-output');

        output.innerHTML = '<div class="loading-spinner"></div>';

        const prompt = `You are a professional game level designer. Create a detailed level design document for:

Level Type: ${levelType}
Difficulty: ${difficulty}
Theme/Description: ${theme}

Include:
1. Level Overview & Objective
2. Layout Blueprint (ASCII map or grid description)
3. Key Areas & Rooms (5-8 sections)
4. Enemy Placement & Behavior
5. Puzzle/Challenge Mechanics
6. Collectibles & Secrets (3-5)
7. Environmental Hazards
8. Boss Encounter (if applicable)
9. Atmosphere & Lighting Suggestions
10. Music/Sound Cues
11. Estimated Playtime
12. Difficulty Curve Notes

Be specific and actionable for a game developer.`;

        try {
            const result = await NeoApp.callWorker('openai_chat', {
                messages: [{ role: 'user', content: prompt }],
                model: 'gpt-4-turbo-preview',
                max_tokens: 2500
            });
            output.textContent = result.content;
        } catch (e) {
            output.textContent = `Error: ${e.message}`;
        }
    },

    async generateLevelArt() {
        const levelType = document.getElementById('level-type').value;
        const theme = document.getElementById('level-prompt').value.trim() || 'mysterious ancient temple';

        if (!NeoConfig.hasWorker()) {
            NeoApp.showNotification('Worker URL required', 'error');
            return;
        }

        const prompt = `${theme}, ${levelType} game level background, wide scene, game concept art, highly detailed, cinematic`;

        try {
            NeoApp.showNotification('Generating level art...', 'info');
            const result = await NeoApp.callWorker('replicate_generate', {
                model: 'flux-pro',
                prompt,
                width: 1280,
                height: 720,
                apiToken: NeoConfig.get('replicate')
            });

            const imgUrl = Array.isArray(result.output) ? result.output[0] : result.output;
            const output = document.getElementById('level-output');
            output.innerHTML += `\n\n<img src="${imgUrl}" alt="Level Art" style="width:100%;border-radius:8px;margin-top:1rem;">
                <a href="${imgUrl}" download class="btn btn-secondary" style="margin-top:0.75rem;display:inline-block;">Download Level Art</a>`;
        } catch (e) {
            NeoApp.showNotification(e.message, 'error');
        }
    },

    copyCode() {
        const code = document.getElementById('code-output').textContent;
        navigator.clipboard.writeText(code);
        NeoApp.showNotification('Code copied to clipboard!', 'success');
    }
};
