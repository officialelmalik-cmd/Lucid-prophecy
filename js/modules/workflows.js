const NeoWorkflows = {
    workflows: [],

    render(container) {
        container.innerHTML = `
            <div class="workflows-panel">
                <div class="wf-header">
                    <h3>Automation Workflows</h3>
                    <button class="btn btn-primary" id="wf-new">+ New Workflow</button>
                </div>

                <div class="wf-templates">
                    <h4>Quick Start Templates</h4>
                    <div class="template-grid">
                        <div class="wf-template" data-template="content-gen">
                            <span class="template-icon">&#129302;&#10132;&#127912;</span>
                            <h5>Content Generator</h5>
                            <p>AI writes copy, Replicate generates images</p>
                        </div>
                        <div class="wf-template" data-template="notify-sale">
                            <span class="template-icon">&#128179;&#10132;&#128172;</span>
                            <h5>Sale Notification</h5>
                            <p>Stripe payment triggers Slack alert</p>
                        </div>
                        <div class="wf-template" data-template="welcome-email">
                            <span class="template-icon">&#128179;&#10132;&#9993;</span>
                            <h5>Welcome Email</h5>
                            <p>New customer triggers Mailchimp sequence</p>
                        </div>
                        <div class="wf-template" data-template="daily-report">
                            <span class="template-icon">&#128200;&#10132;&#128172;</span>
                            <h5>Daily Report</h5>
                            <p>Analytics summary posted to Slack daily</p>
                        </div>
                    </div>
                </div>

                <div class="wf-builder" id="wf-builder" style="display: none;">
                    <h4>Workflow Builder</h4>
                    <div class="wf-steps" id="wf-steps"></div>
                    <div class="wf-actions">
                        <button class="btn btn-secondary" id="wf-add-step">+ Add Step</button>
                        <button class="btn btn-primary" id="wf-save">Save Workflow</button>
                    </div>
                </div>

                <div class="wf-list">
                    <h4>Saved Workflows</h4>
                    <div id="wf-saved">
                        <p style="color: var(--text-muted); text-align: center; padding: 1rem;">
                            No workflows yet. Create one above!
                        </p>
                    </div>
                </div>
            </div>
            <style>
                .workflows-panel { display: grid; gap: 1.5rem; }
                .wf-header { display: flex; justify-content: space-between; align-items: center; }
                .wf-templates h4, .wf-list h4, .wf-builder h4 { margin-bottom: 1rem; }
                .template-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
                .wf-template {
                    background: var(--bg-primary);
                    padding: 1.25rem;
                    border-radius: 8px;
                    cursor: pointer;
                    border: 1px solid transparent;
                    transition: all 0.2s;
                }
                .wf-template:hover { border-color: var(--accent); }
                .template-icon { font-size: 1.5rem; display: block; margin-bottom: 0.5rem; }
                .wf-template h5 { margin-bottom: 0.25rem; }
                .wf-template p { font-size: 0.8rem; color: var(--text-muted); }
                .wf-builder {
                    background: var(--bg-primary);
                    padding: 1.25rem;
                    border-radius: 8px;
                }
                .wf-steps { min-height: 100px; margin-bottom: 1rem; }
                .wf-step {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: var(--bg-card);
                    border-radius: 6px;
                    margin-bottom: 0.5rem;
                }
                .wf-step select, .wf-step input {
                    padding: 0.5rem;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border);
                    border-radius: 4px;
                    color: var(--text-primary);
                }
                .wf-actions { display: flex; gap: 0.75rem; }
                .wf-list {
                    background: var(--bg-primary);
                    padding: 1.25rem;
                    border-radius: 8px;
                }
            </style>
        `;

        this.loadWorkflows();
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('wf-new').addEventListener('click', () => {
            this.showBuilder();
        });

        document.querySelectorAll('.wf-template').forEach(tpl => {
            tpl.addEventListener('click', () => {
                this.applyTemplate(tpl.dataset.template);
            });
        });

        document.getElementById('wf-add-step').addEventListener('click', () => {
            this.addStep();
        });

        document.getElementById('wf-save').addEventListener('click', () => {
            this.saveWorkflow();
        });
    },

    showBuilder() {
        document.getElementById('wf-builder').style.display = 'block';
        document.getElementById('wf-steps').innerHTML = '';
        this.addStep();
    },

    addStep() {
        const steps = document.getElementById('wf-steps');
        const stepNum = steps.children.length + 1;

        const step = document.createElement('div');
        step.className = 'wf-step';
        step.innerHTML = `
            <span>${stepNum}.</span>
            <select class="step-type">
                <option value="">Select action...</option>
                <option value="openai">AI Generate</option>
                <option value="replicate">Create Media</option>
                <option value="slack">Send Slack</option>
                <option value="mailchimp">Send Email</option>
                <option value="delay">Wait</option>
            </select>
            <input type="text" class="step-config" placeholder="Configuration...">
            <button class="btn btn-secondary" onclick="this.parentElement.remove()" style="padding: 0.25rem 0.5rem;">x</button>
        `;

        steps.appendChild(step);
    },

    applyTemplate(name) {
        const templates = {
            'content-gen': [
                { type: 'openai', config: 'Write marketing copy for: {input}' },
                { type: 'replicate', config: 'Generate image: {ai_output}' }
            ],
            'notify-sale': [
                { type: 'slack', config: 'New sale: {amount} from {customer}' }
            ],
            'welcome-email': [
                { type: 'delay', config: '5m' },
                { type: 'mailchimp', config: 'Welcome sequence: {customer_email}' }
            ],
            'daily-report': [
                { type: 'openai', config: 'Summarize metrics: {analytics}' },
                { type: 'slack', config: 'Daily Report: {ai_output}' }
            ]
        };

        const tpl = templates[name];
        if (!tpl) return;

        document.getElementById('wf-builder').style.display = 'block';
        document.getElementById('wf-steps').innerHTML = '';

        tpl.forEach((step, i) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'wf-step';
            stepEl.innerHTML = `
                <span>${i + 1}.</span>
                <select class="step-type">
                    <option value="">Select action...</option>
                    <option value="openai" ${step.type === 'openai' ? 'selected' : ''}>AI Generate</option>
                    <option value="replicate" ${step.type === 'replicate' ? 'selected' : ''}>Create Media</option>
                    <option value="slack" ${step.type === 'slack' ? 'selected' : ''}>Send Slack</option>
                    <option value="mailchimp" ${step.type === 'mailchimp' ? 'selected' : ''}>Send Email</option>
                    <option value="delay" ${step.type === 'delay' ? 'selected' : ''}>Wait</option>
                </select>
                <input type="text" class="step-config" placeholder="Configuration..." value="${step.config}">
                <button class="btn btn-secondary" onclick="this.parentElement.remove()" style="padding: 0.25rem 0.5rem;">x</button>
            `;
            document.getElementById('wf-steps').appendChild(stepEl);
        });
    },

    saveWorkflow() {
        const steps = [];
        document.querySelectorAll('.wf-step').forEach(stepEl => {
            const type = stepEl.querySelector('.step-type').value;
            const config = stepEl.querySelector('.step-config').value;
            if (type) {
                steps.push({ type, config });
            }
        });

        if (steps.length === 0) {
            NeoApp.showNotification('Add at least one step', 'error');
            return;
        }

        const workflow = {
            id: Date.now(),
            name: `Workflow ${this.workflows.length + 1}`,
            steps,
            created: new Date().toISOString()
        };

        this.workflows.push(workflow);
        localStorage.setItem('neosai_workflows', JSON.stringify(this.workflows));

        NeoApp.showNotification('Workflow saved!', 'success');
        document.getElementById('wf-builder').style.display = 'none';
        this.renderWorkflows();
    },

    loadWorkflows() {
        try {
            const stored = localStorage.getItem('neosai_workflows');
            if (stored) {
                this.workflows = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load workflows:', e);
        }
        this.renderWorkflows();
    },

    renderWorkflows() {
        const container = document.getElementById('wf-saved');

        if (this.workflows.length === 0) {
            container.innerHTML = `
                <p style="color: var(--text-muted); text-align: center; padding: 1rem;">
                    No workflows yet. Create one above!
                </p>
            `;
            return;
        }

        container.innerHTML = this.workflows.map(wf => `
            <div class="saved-workflow" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-card); border-radius: 6px; margin-bottom: 0.5rem;">
                <div>
                    <strong>${wf.name}</strong>
                    <span style="color: var(--text-muted); font-size: 0.8rem; margin-left: 0.5rem;">
                        ${wf.steps.length} steps
                    </span>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary" style="padding: 0.5rem 1rem;" onclick="NeoWorkflows.runWorkflow(${wf.id})">Run</button>
                    <button class="btn btn-secondary" style="padding: 0.5rem 1rem;" onclick="NeoWorkflows.deleteWorkflow(${wf.id})">Delete</button>
                </div>
            </div>
        `).join('');
    },

    async runWorkflow(id) {
        const workflow = this.workflows.find(w => w.id === id);
        if (!workflow) return;

        NeoApp.showNotification(`Running ${workflow.name}...`, 'info');

        if (!NeoConfig.hasWorker()) {
            NeoApp.showNotification('Worker URL required to run workflows', 'error');
            return;
        }

        try {
            await NeoApp.callWorker('workflow_execute', {
                workflow: workflow.steps
            });
            NeoApp.showNotification('Workflow completed!', 'success');
        } catch (e) {
            NeoApp.showNotification(e.message, 'error');
        }
    },

    deleteWorkflow(id) {
        this.workflows = this.workflows.filter(w => w.id !== id);
        localStorage.setItem('neosai_workflows', JSON.stringify(this.workflows));
        this.renderWorkflows();
        NeoApp.showNotification('Workflow deleted', 'success');
    }
};
