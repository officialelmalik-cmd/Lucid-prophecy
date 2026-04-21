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
    },

    bindModuleButtons() {
        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const moduleName = btn.dataset.module;
                this.openModule(moduleName);
            });
        });
    },

    bindWorkspaceClose() {
        document.getElementById('closeWorkspace').addEventListener('click', () => {
            this.closeWorkspace();
        });
    },

    openModule(name) {
        this.currentModule = name;
        this.workspace.classList.add('active');

        const titles = {
            openai: 'AI Assistant',
            replicate: 'Media Studio',
            stripe: 'Commerce Hub',
            slack: 'Slack Integration',
            mailchimp: 'Email Campaigns',
            analytics: 'Analytics Dashboard',
            workflows: 'Workflow Builder',
            storage: 'Asset Storage'
        };

        this.workspaceTitle.textContent = titles[name] || name;

        switch (name) {
            case 'openai':
                NeoOpenAI.render(this.workspaceContent);
                break;
            case 'replicate':
                NeoReplicate.render(this.workspaceContent);
                break;
            case 'stripe':
                NeoStripe.render(this.workspaceContent);
                break;
            case 'slack':
                NeoSlack.render(this.workspaceContent);
                break;
            case 'mailchimp':
                NeoMailchimp.render(this.workspaceContent);
                break;
            case 'analytics':
                NeoAnalytics.render(this.workspaceContent);
                break;
            case 'workflows':
                NeoWorkflows.render(this.workspaceContent);
                break;
            case 'storage':
                NeoStorage.render(this.workspaceContent);
                break;
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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action, ...data })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Worker request failed');
        }

        return response.json();
    },

    async checkWorkerHealth() {
        if (!NeoConfig.hasWorker()) return;

        try {
            const result = await this.callWorker('health');
            console.log('Worker health:', result);
        } catch (e) {
            console.warn('Worker health check failed:', e.message);
        }
    },

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#7c3aed'};
            color: white;
            border-radius: 8px;
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    NeoApp.init();
});
