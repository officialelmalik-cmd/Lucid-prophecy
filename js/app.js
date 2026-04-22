const NeoApp = {
    currentModule: null,
    workspace: null,
    workspaceContent: null,
    workspaceTitle: null,

    init() {
        this.workspace = document.getElementById('workspace');
        this.workspaceContent = document.getElementById('workspace-content');
        this.workspaceTitle = document.getElementById('workspace-title');

        this.bindModuleButtons();
        this.bindWorkspaceClose();
        this.checkWorkerHealth();
        this.bindNavLinks();
    },

    bindModuleButtons() {
        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.openModule(btn.dataset.module);
            });
        });
    },

    bindWorkspaceClose() {
        document.getElementById('closeWorkspace').addEventListener('click', () => {
            this.closeWorkspace();
        });
    },

    bindNavLinks() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    },

    openModule(name) {
        this.currentModule = name;
        this.workspace.classList.add('active');

        const titles = {
            openai: 'AI Assistant',
            replicate: 'Media Studio',
            stripe: 'Commerce Hub',
            slack: 'Slack / Stilla Bot',
            mailchimp: 'Email Campaigns',
            analytics: 'Analytics Dashboard',
            workflows: 'Workflow Builder',
            storage: 'Asset Storage',
            gamestudio: 'Game Studio',
            voice: 'Voice Studio',
            social: 'Social Media',
            tools: 'Tools Hub',
            jira: 'Jira Project Hub',
            automation: 'Automation Hub'
        };

        const badges = {
            openai: '🤖 AI', replicate: '🎨 Media', stripe: '💳 Commerce',
            slack: '💬 Slack', mailchimp: '✉️ Email', analytics: '📊 Analytics',
            workflows: '⚙️ Workflows', storage: '🗂️ Storage',
            gamestudio: '🎮 Game Studio', voice: '🎙️ Voice', social: '📱 Social',
            tools: '🛠️ Tools', jira: '📋 Jira', automation: '⚡ Automation'
        };

        this.workspaceTitle.textContent = titles[name] || name;
        const badge = document.getElementById('workspace-badge');
        if (badge) badge.textContent = badges[name] || '';

        switch (name) {
            case 'openai': NeoOpenAI.render(this.workspaceContent); break;
            case 'replicate': NeoReplicate.render(this.workspaceContent); break;
            case 'stripe': NeoStripe.render(this.workspaceContent); break;
            case 'slack': NeoSlack.render(this.workspaceContent); break;
            case 'mailchimp': NeoMailchimp.render(this.workspaceContent); break;
            case 'analytics': NeoAnalytics.render(this.workspaceContent); break;
            case 'workflows': NeoWorkflows.render(this.workspaceContent); break;
            case 'storage': NeoStorage.render(this.workspaceContent); break;
            case 'gamestudio': NeoGameStudio.render(this.workspaceContent); break;
            case 'voice': NeoVoice.render(this.workspaceContent); break;
            case 'social': NeoSocial.render(this.workspaceContent); break;
            case 'tools': NeoTools.render(this.workspaceContent); break;
            case 'jira': NeoJira.render(this.workspaceContent); break;
            case 'automation': NeoAutomation.render(this.workspaceContent); break;
            default:
                this.workspaceContent.innerHTML = '<p class="workspace-placeholder">Module not found.</p>';
        }

        this.workspace.scrollIntoView({ behavior: 'smooth' });
    },

    closeWorkspace() {
        this.workspace.classList.remove('active');
        this.currentModule = null;
    },

    async callWorker(action, data = {}) {
        const workerUrl = NeoConfig.getWorkerUrl();
        if (!workerUrl) {
            throw new Error('Worker URL not configured. Please set it in Settings.');
        }

        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...data })
        });

        if (!response.ok) {
            const error = await response.text();
            let parsed;
            try { parsed = JSON.parse(error); } catch { parsed = { error }; }
            throw new Error(parsed.error || 'Worker request failed');
        }

        return response.json();
    },

    async checkWorkerHealth() {
        const dot = document.querySelector('#worker-status .status-dot');
        if (!dot) return;

        if (!NeoConfig.hasWorker()) {
            dot.style.background = 'var(--text-muted)';
            dot.title = 'Worker not configured';
            return;
        }

        try {
            const result = await this.callWorker('health');
            dot.style.background = 'var(--success)';
            dot.style.boxShadow = '0 0 6px var(--success)';
            dot.title = 'Worker online';
        } catch {
            dot.style.background = 'var(--error)';
            dot.title = 'Worker offline';
        }
    },

    showNotification(message, type = 'info') {
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const colors = {
            error: '#ef4444',
            success: '#10b981',
            info: '#7c3aed',
            warning: '#f59e0b'
        };

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 0.875rem 1.5rem;
            background: ${colors[type] || colors.info};
            color: white;
            border-radius: 10px;
            z-index: 2000;
            font-weight: 500;
            font-size: 0.9rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 320px;
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(20px)';
            notification.style.transition = 'all 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3500);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    NeoApp.init();
});
