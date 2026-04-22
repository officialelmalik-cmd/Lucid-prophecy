const NeoSocial = {
    render(container) {
        container.innerHTML = `
            <div class="social-studio">
                <div class="social-tabs">
                    <button class="social-tab active" data-tab="content">Content Generator</button>
                    <button class="social-tab" data-tab="calendar">Content Calendar</button>
                    <button class="social-tab" data-tab="hashtags">Hashtag Research</button>
                    <button class="social-tab" data-tab="analytics">Post Analytics</button>
                </div>

                <div class="social-tab-content" id="stab-content">
                    <div class="social-section">
                        <h3>Multi-Platform Content Generator</h3>
                        <div class="platform-selector">
                            <label class="platform-check">
                                <input type="checkbox" value="twitter" checked> Twitter/X
                            </label>
                            <label class="platform-check">
                                <input type="checkbox" value="instagram" checked> Instagram
                            </label>
                            <label class="platform-check">
                                <input type="checkbox" value="linkedin"> LinkedIn
                            </label>
                            <label class="platform-check">
                                <input type="checkbox" value="facebook"> Facebook
                            </label>
                            <label class="platform-check">
                                <input type="checkbox" value="tiktok"> TikTok
                            </label>
                            <label class="platform-check">
                                <input type="checkbox" value="youtube"> YouTube Description
                            </label>
                        </div>
                        <div class="form-row">
                            <select class="media-select" id="content-tone">
                                <option value="professional">Professional</option>
                                <option value="casual">Casual & Fun</option>
                                <option value="inspirational">Inspirational</option>
                                <option value="educational">Educational</option>
                                <option value="promotional">Promotional</option>
                                <option value="storytelling">Storytelling</option>
                                <option value="controversial">Thought-Provoking</option>
                            </select>
                            <select class="media-select" id="content-goal">
                                <option value="engagement">Maximize Engagement</option>
                                <option value="sales">Drive Sales/Conversions</option>
                                <option value="awareness">Brand Awareness</option>
                                <option value="followers">Grow Followers</option>
                                <option value="traffic">Drive Web Traffic</option>
                                <option value="community">Build Community</option>
                            </select>
                        </div>
                        <textarea class="media-prompt" id="content-topic"
                            placeholder="Describe what you want to post about... (e.g. 'Launching our new AI platform that helps creators automate their workflow')"></textarea>
                        <div class="form-row">
                            <input type="text" class="chat-input" id="brand-name"
                                placeholder="Brand/Company name (optional)">
                            <input type="text" class="chat-input" id="target-audience"
                                placeholder="Target audience (e.g. 'tech entrepreneurs')">
                        </div>
                        <button class="btn btn-primary" id="gen-content">Generate Content</button>
                        <div class="content-output" id="content-output"></div>
                    </div>
                </div>

                <div class="social-tab-content hidden" id="stab-calendar">
                    <div class="social-section">
                        <h3>Content Calendar Generator</h3>
                        <div class="form-row">
                            <select class="media-select" id="cal-duration">
                                <option value="1-week">1 Week</option>
                                <option value="2-weeks" selected>2 Weeks</option>
                                <option value="1-month">1 Month</option>
                            </select>
                            <select class="media-select" id="cal-frequency">
                                <option value="daily">Daily Posts</option>
                                <option value="3x-week">3x Per Week</option>
                                <option value="5x-week">5x Per Week</option>
                                <option value="twice-daily">Twice Daily</option>
                            </select>
                            <select class="media-select" id="cal-niche">
                                <option value="tech/AI">Tech / AI</option>
                                <option value="business">Business</option>
                                <option value="gaming">Gaming</option>
                                <option value="fitness">Fitness</option>
                                <option value="fashion">Fashion</option>
                                <option value="food">Food & Lifestyle</option>
                                <option value="finance">Finance</option>
                                <option value="education">Education</option>
                                <option value="entertainment">Entertainment</option>
                            </select>
                        </div>
                        <textarea class="media-prompt" id="cal-brand-info"
                            placeholder="Describe your brand, goals, and key messages..."></textarea>
                        <button class="btn btn-primary" id="gen-calendar">Generate Calendar</button>
                        <div class="glass-card" id="calendar-output">
                            <p class="text-muted">Your content calendar will appear here...</p>
                        </div>
                    </div>
                </div>

                <div class="social-tab-content hidden" id="stab-hashtags">
                    <div class="social-section">
                        <h3>Hashtag Strategy Research</h3>
                        <div class="form-row">
                            <select class="media-select" id="hashtag-platform">
                                <option value="Instagram">Instagram</option>
                                <option value="Twitter/X">Twitter/X</option>
                                <option value="TikTok">TikTok</option>
                                <option value="LinkedIn">LinkedIn</option>
                            </select>
                            <select class="media-select" id="hashtag-goal">
                                <option value="reach">Maximum Reach</option>
                                <option value="niche">Niche Targeting</option>
                                <option value="trending">Trending Topics</option>
                            </select>
                        </div>
                        <textarea class="media-prompt" id="hashtag-topic"
                            placeholder="Your content topic or niche... (e.g. 'AI tools for video game developers')"></textarea>
                        <button class="btn btn-primary" id="gen-hashtags">Research Hashtags</button>
                        <div class="hashtag-output glass-card" id="hashtag-output">
                            <p class="text-muted">Hashtag strategy will appear here...</p>
                        </div>
                    </div>
                </div>

                <div class="social-tab-content hidden" id="stab-analytics">
                    <div class="social-section">
                        <h3>Post Performance Analyzer</h3>
                        <div class="form-row">
                            <select class="media-select" id="analyze-platform">
                                <option value="Instagram">Instagram</option>
                                <option value="Twitter/X">Twitter/X</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="TikTok">TikTok</option>
                            </select>
                        </div>
                        <textarea class="media-prompt" id="post-content-analyze"
                            placeholder="Paste your post content here..."></textarea>
                        <div class="form-row">
                            <input type="number" class="chat-input" id="post-likes" placeholder="Likes" min="0">
                            <input type="number" class="chat-input" id="post-comments" placeholder="Comments" min="0">
                            <input type="number" class="chat-input" id="post-shares" placeholder="Shares" min="0">
                            <input type="number" class="chat-input" id="post-reach" placeholder="Reach" min="0">
                        </div>
                        <button class="btn btn-primary" id="analyze-post">Analyze & Improve</button>
                        <div class="glass-card" id="analysis-output">
                            <p class="text-muted">Analysis and improvement suggestions will appear here...</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                .social-studio { display: flex; flex-direction: column; gap: 1.5rem; }
                .social-tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
                .social-tab {
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
                .social-tab:hover { color: var(--text-primary); border-color: var(--accent); }
                .social-tab.active { background: var(--accent); border-color: var(--accent); color: white; }
                .social-tab-content.hidden { display: none; }
                .social-section { display: flex; flex-direction: column; gap: 1rem; }
                .social-section h3 { color: var(--accent-light); }
                .form-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
                .form-row .media-select, .form-row .chat-input { flex: 1; min-width: 140px; }
                .platform-selector {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    padding: 1rem;
                    background: var(--bg-primary);
                    border-radius: 8px;
                    border: 1px solid var(--border);
                }
                .platform-check {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    font-size: 0.875rem;
                    cursor: pointer;
                }
                .platform-check input { accent-color: var(--accent); }
                .content-output { display: flex; flex-direction: column; gap: 1rem; }
                .platform-post {
                    background: var(--bg-primary);
                    border: 1px solid var(--border);
                    border-left: 3px solid var(--accent);
                    border-radius: 10px;
                    padding: 1.25rem;
                }
                .platform-post-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }
                .platform-label {
                    font-weight: 600;
                    color: var(--accent-light);
                    font-size: 0.9rem;
                }
                .platform-post-body { font-size: 0.9rem; line-height: 1.7; white-space: pre-wrap; }
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
                .hashtag-output .hashtag-tag {
                    display: inline-block;
                    padding: 0.3rem 0.8rem;
                    background: var(--bg-card);
                    border: 1px solid var(--accent);
                    border-radius: 20px;
                    color: var(--accent-light);
                    font-size: 0.85rem;
                    margin: 0.25rem;
                    cursor: pointer;
                }
                .text-muted { color: var(--text-muted); }
            </style>
        `;

        this.bindEvents();
    },

    bindEvents() {
        document.querySelectorAll('.social-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.social-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.social-tab-content').forEach(c => c.classList.add('hidden'));
                tab.classList.add('active');
                document.getElementById(`stab-${tab.dataset.tab}`).classList.remove('hidden');
            });
        });

        document.getElementById('gen-content').addEventListener('click', () => this.generateContent());
        document.getElementById('gen-calendar').addEventListener('click', () => this.generateCalendar());
        document.getElementById('gen-hashtags').addEventListener('click', () => this.generateHashtags());
        document.getElementById('analyze-post').addEventListener('click', () => this.analyzePost());
    },

    getSelectedPlatforms() {
        return Array.from(document.querySelectorAll('.platform-check input:checked')).map(c => c.value);
    },

    async generateContent() {
        const platforms = this.getSelectedPlatforms();
        const tone = document.getElementById('content-tone').value;
        const goal = document.getElementById('content-goal').value;
        const topic = document.getElementById('content-topic').value.trim();
        const brand = document.getElementById('brand-name').value.trim();
        const audience = document.getElementById('target-audience').value.trim();
        const output = document.getElementById('content-output');

        if (!topic) { NeoApp.showNotification('Please describe what you want to post about', 'error'); return; }
        if (platforms.length === 0) { NeoApp.showNotification('Select at least one platform', 'error'); return; }

        output.innerHTML = '<div class="loading-spinner"></div>';

        const prompt = `You are a world-class social media strategist. Create optimized posts for multiple platforms.

Topic: ${topic}
Brand: ${brand || 'Personal/Unknown'}
Target Audience: ${audience || 'General'}
Tone: ${tone}
Goal: ${goal}
Platforms: ${platforms.join(', ')}

For EACH platform, create a separate, platform-optimized post. Follow each platform's best practices:
- Twitter/X: Max 280 chars, punchy, hooks, relevant hashtags (3-5)
- Instagram: Caption with hook, story, CTA, 20-30 hashtags
- LinkedIn: Professional, value-driven, 1-3 hashtags, thought leadership angle
- Facebook: Conversational, slightly longer, question to drive comments
- TikTok: Script-style hook + talking points + call to action
- YouTube: Full description with keywords, timestamps placeholder, links section

Format each as: [PLATFORM NAME]
[Content here]

Make them compelling, authentic, and algorithm-friendly.`;

        try {
            const result = await NeoApp.callWorker('openai_chat', {
                messages: [{ role: 'user', content: prompt }],
                model: 'gpt-4-turbo-preview',
                max_tokens: 3000
            });

            this.renderPosts(output, result.content, platforms);
        } catch (e) {
            output.innerHTML = `<p style="color:var(--error);">${e.message}</p>`;
        }
    },

    renderPosts(container, content, platforms) {
        const icons = {
            twitter: '𝕏', instagram: '📸', linkedin: '💼',
            facebook: '📘', tiktok: '🎵', youtube: '▶️'
        };
        const platformBlocks = [];
        platforms.forEach(p => {
            const label = p.charAt(0).toUpperCase() + p.slice(1);
            const regex = new RegExp(`\\[${label}[^\\]]*\\]([\\s\\S]*?)(?=\\[|$)`, 'i');
            const match = content.match(regex);
            const text = match ? match[1].trim() : '';
            if (text) {
                platformBlocks.push({ platform: p, label, text, icon: icons[p] || '📲' });
            }
        });

        if (platformBlocks.length === 0) {
            container.innerHTML = `<div class="glass-card" style="white-space:pre-wrap;">${content}</div>`;
            return;
        }

        container.innerHTML = platformBlocks.map(b => `
            <div class="platform-post">
                <div class="platform-post-header">
                    <span class="platform-label">${b.icon} ${b.label}</span>
                    <button class="btn btn-secondary" style="font-size:0.75rem;padding:0.3rem 0.75rem;"
                        onclick="navigator.clipboard.writeText(this.closest('.platform-post').querySelector('.platform-post-body').textContent.trim());NeoApp.showNotification('Copied!','success')">
                        Copy
                    </button>
                </div>
                <div class="platform-post-body">${this.escapeHtml(b.text)}</div>
            </div>
        `).join('');
    },

    async generateCalendar() {
        const duration = document.getElementById('cal-duration').value;
        const frequency = document.getElementById('cal-frequency').value;
        const niche = document.getElementById('cal-niche').value;
        const brandInfo = document.getElementById('cal-brand-info').value.trim();
        const output = document.getElementById('calendar-output');

        output.innerHTML = '<div class="loading-spinner"></div>';

        const prompt = `Create a detailed social media content calendar for:
Duration: ${duration}
Posting Frequency: ${frequency}
Niche: ${niche}
Brand Info: ${brandInfo || 'General brand in this niche'}

For each day/post include:
- Date/Day
- Platform
- Content Type (carousel, reel, story, post, etc.)
- Topic/Theme
- Hook (first line)
- Key Message
- CTA
- Best Posting Time

Format as a structured table or organized list. Be specific and actionable.`;

        try {
            const result = await NeoApp.callWorker('openai_chat', {
                messages: [{ role: 'user', content: prompt }],
                model: 'gpt-4-turbo-preview',
                max_tokens: 3000
            });
            output.textContent = result.content;
        } catch (e) {
            output.textContent = `Error: ${e.message}`;
        }
    },

    async generateHashtags() {
        const platform = document.getElementById('hashtag-platform').value;
        const goal = document.getElementById('hashtag-goal').value;
        const topic = document.getElementById('hashtag-topic').value.trim();
        const output = document.getElementById('hashtag-output');

        if (!topic) { NeoApp.showNotification('Please enter your content topic', 'error'); return; }

        output.innerHTML = '<div class="loading-spinner"></div>';

        const prompt = `You are a social media hashtag expert. Research and provide a comprehensive hashtag strategy for ${platform}.

Content Topic: ${topic}
Goal: ${goal}

Provide:
1. MEGA HASHTAGS (1M+ posts) - 5 tags - high reach, competitive
2. LARGE HASHTAGS (100K-1M posts) - 10 tags - good reach
3. MEDIUM HASHTAGS (10K-100K posts) - 10 tags - targeted reach
4. NICHE HASHTAGS (under 10K posts) - 10 tags - high engagement
5. TRENDING HASHTAGS - 5 tags - current trends in this space
6. BRANDED HASHTAG suggestions - 3 ideas

Also provide:
- Optimal hashtag count for ${platform}
- Best posting strategy with these hashtags
- Do/Don't tips for ${platform} hashtags

Format hashtags as a clean list starting with #`;

        try {
            const result = await NeoApp.callWorker('openai_chat', {
                messages: [{ role: 'user', content: prompt }],
                model: 'gpt-4-turbo-preview',
                max_tokens: 1500
            });
            output.textContent = result.content;
        } catch (e) {
            output.textContent = `Error: ${e.message}`;
        }
    },

    async analyzePost() {
        const platform = document.getElementById('analyze-platform').value;
        const content = document.getElementById('post-content-analyze').value.trim();
        const likes = document.getElementById('post-likes').value || '0';
        const comments = document.getElementById('post-comments').value || '0';
        const shares = document.getElementById('post-shares').value || '0';
        const reach = document.getElementById('post-reach').value || '0';
        const output = document.getElementById('analysis-output');

        if (!content) { NeoApp.showNotification('Please paste your post content', 'error'); return; }

        output.innerHTML = '<div class="loading-spinner"></div>';

        const engagementRate = reach > 0
            ? (((parseInt(likes) + parseInt(comments) + parseInt(shares)) / parseInt(reach)) * 100).toFixed(2)
            : 'N/A';

        const prompt = `Analyze this ${platform} post's performance and provide actionable improvements:

POST CONTENT:
${content}

PERFORMANCE METRICS:
- Likes: ${likes}
- Comments: ${comments}
- Shares/Reposts: ${shares}
- Reach: ${reach}
- Engagement Rate: ${engagementRate}%

Provide:
1. Performance Assessment (good/average/poor for ${platform})
2. What worked well (3-5 points)
3. What could be improved (3-5 points)
4. Improved version of the post
5. A/B test variant
6. Best time to repost or boost
7. Audience insights based on the content
8. Score: /10

Be specific, data-driven, and actionable.`;

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

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
