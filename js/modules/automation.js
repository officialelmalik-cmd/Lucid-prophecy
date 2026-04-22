const NeoAutomation = {
    connections: {},

    render(container) {
        container.innerHTML = `
            <div class="automation-module">
                <div class="auto-tabs">
                    <button class="auto-tab active" data-tab="hub">Command Hub</button>
                    <button class="auto-tab" data-tab="pipelines">Pipelines</button>
                    <button class="auto-tab" data-tab="schedules">Schedules</button>
                    <button class="auto-tab" data-tab="integrations">Integrations</button>
                    <button class="auto-tab" data-tab="logs">Activity Log</button>
                </div>

                <div class="auto-content">
                    <div class="auto-panel active" id="auto-panel-hub">
                        <div class="command-hub">
                            <h3>AI Command Center</h3>
                            <p class="hub-desc">Describe what you want to automate in natural language</p>

                            <div class="command-input-area">
                                <textarea id="ai-command" class="command-textarea" placeholder="Examples:
• Create a Jira task and notify the team on Slack
• Every Monday, send a sprint summary to #engineering
• When a high-priority bug is created, assign to on-call and alert via Slack
• Generate weekly analytics report and email to stakeholders"></textarea>
                                <button class="btn btn-primary" id="execute-command">Execute</button>
                            </div>

                            <div class="quick-commands">
                                <h4>Quick Actions</h4>
                                <div class="quick-grid">
                                    <button class="quick-btn" data-cmd="standup">
                                        <span class="quick-icon">☀️</span>
                                        <span>Daily Standup</span>
                                    </button>
                                    <button class="quick-btn" data-cmd="sprint-report">
                                        <span class="quick-icon">📊</span>
                                        <span>Sprint Report</span>
                                    </button>
                                    <button class="quick-btn" data-cmd="delegate-tasks">
                                        <span class="quick-icon">👥</span>
                                        <span>Delegate Tasks</span>
                                    </button>
                                    <button class="quick-btn" data-cmd="review-prs">
                                        <span class="quick-icon">🔍</span>
                                        <span>Review PRs</span>
                                    </button>
                                    <button class="quick-btn" data-cmd="bug-triage">
                                        <span class="quick-icon">🐛</span>
                                        <span>Bug Triage</span>
                                    </button>
                                    <button class="quick-btn" data-cmd="team-sync">
                                        <span class="quick-icon">🔄</span>
                                        <span>Team Sync</span>
                                    </button>
                                </div>
                            </div>

                            <div id="command-result" class="command-result"></div>
                        </div>
                    </div>

                    <div class="auto-panel" id="auto-panel-pipelines">
                        <div class="pipelines-header">
                            <h3>Automation Pipelines</h3>
                            <button class="btn btn-primary" id="new-pipeline">+ New Pipeline</button>
                        </div>

                        <div class="pipeline-list" id="pipeline-list">
                            <div class="pipeline-card">
                                <div class="pipeline-header">
                                    <span class="pipeline-icon">🚀</span>
                                    <div class="pipeline-info">
                                        <h4>Release Automation</h4>
                                        <p>Jira → Slack → Email → GitHub</p>
                                    </div>
                                    <label class="toggle">
                                        <input type="checkbox" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="pipeline-steps">
                                    <span class="step">Update Jira</span>
                                    <span class="step-arrow">→</span>
                                    <span class="step">Notify Slack</span>
                                    <span class="step-arrow">→</span>
                                    <span class="step">Send Email</span>
                                    <span class="step-arrow">→</span>
                                    <span class="step">Tag Release</span>
                                </div>
                                <div class="pipeline-stats">
                                    <span>Last run: 2 hours ago</span>
                                    <span>Runs: 47</span>
                                </div>
                            </div>

                            <div class="pipeline-card">
                                <div class="pipeline-header">
                                    <span class="pipeline-icon">📋</span>
                                    <div class="pipeline-info">
                                        <h4>Daily Standup</h4>
                                        <p>Jira + Slack → Summary</p>
                                    </div>
                                    <label class="toggle">
                                        <input type="checkbox" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="pipeline-steps">
                                    <span class="step">Fetch Issues</span>
                                    <span class="step-arrow">→</span>
                                    <span class="step">AI Summary</span>
                                    <span class="step-arrow">→</span>
                                    <span class="step">Post to Slack</span>
                                </div>
                                <div class="pipeline-stats">
                                    <span>Schedule: Daily 9:00 AM</span>
                                    <span>Runs: 124</span>
                                </div>
                            </div>

                            <div class="pipeline-card">
                                <div class="pipeline-header">
                                    <span class="pipeline-icon">🐛</span>
                                    <div class="pipeline-info">
                                        <h4>Bug Alert Pipeline</h4>
                                        <p>Jira Webhook → Slack → Assign</p>
                                    </div>
                                    <label class="toggle">
                                        <input type="checkbox">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <div class="pipeline-steps">
                                    <span class="step">Bug Created</span>
                                    <span class="step-arrow">→</span>
                                    <span class="step">Alert Channel</span>
                                    <span class="step-arrow">→</span>
                                    <span class="step">Auto-Assign</span>
                                </div>
                                <div class="pipeline-stats">
                                    <span>Trigger: Webhook</span>
                                    <span>Runs: 89</span>
                                </div>
                            </div>
                        </div>

                        <div class="pipeline-builder hidden" id="pipeline-builder">
                            <h3>Build Pipeline</h3>
                            <input type="text" id="pipeline-name" class="auto-input" placeholder="Pipeline name">

                            <div class="builder-canvas" id="builder-canvas">
                                <div class="builder-step trigger-step">
                                    <select class="step-select" id="trigger-type">
                                        <option value="">Select Trigger</option>
                                        <option value="schedule">Schedule</option>
                                        <option value="webhook">Webhook</option>
                                        <option value="slack_command">Slack Command</option>
                                        <option value="jira_event">Jira Event</option>
                                        <option value="manual">Manual</option>
                                    </select>
                                </div>
                            </div>

                            <div class="add-step-row">
                                <button class="btn btn-secondary" id="add-step">+ Add Step</button>
                            </div>

                            <div class="step-templates">
                                <div class="step-template" data-type="jira">
                                    <span>📋</span> Jira Action
                                </div>
                                <div class="step-template" data-type="slack">
                                    <span>💬</span> Slack Message
                                </div>
                                <div class="step-template" data-type="email">
                                    <span>✉️</span> Send Email
                                </div>
                                <div class="step-template" data-type="ai">
                                    <span>🤖</span> AI Process
                                </div>
                                <div class="step-template" data-type="delay">
                                    <span>⏱️</span> Delay
                                </div>
                                <div class="step-template" data-type="condition">
                                    <span>🔀</span> Condition
                                </div>
                            </div>

                            <div class="builder-actions">
                                <button class="btn btn-secondary" id="cancel-pipeline">Cancel</button>
                                <button class="btn btn-primary" id="save-pipeline">Save Pipeline</button>
                            </div>
                        </div>
                    </div>

                    <div class="auto-panel" id="auto-panel-schedules">
                        <h3>Scheduled Tasks</h3>

                        <div class="schedule-list">
                            <div class="schedule-item">
                                <div class="schedule-time">
                                    <span class="time-display">09:00</span>
                                    <span class="time-zone">Daily</span>
                                </div>
                                <div class="schedule-info">
                                    <h4>Morning Standup Summary</h4>
                                    <p>Fetch Jira updates → Generate AI summary → Post to #team-standup</p>
                                </div>
                                <div class="schedule-actions">
                                    <button class="btn btn-small">Edit</button>
                                    <button class="btn btn-small btn-danger">Delete</button>
                                </div>
                            </div>

                            <div class="schedule-item">
                                <div class="schedule-time">
                                    <span class="time-display">17:00</span>
                                    <span class="time-zone">Fri</span>
                                </div>
                                <div class="schedule-info">
                                    <h4>Weekly Sprint Report</h4>
                                    <p>Compile sprint metrics → Email stakeholders</p>
                                </div>
                                <div class="schedule-actions">
                                    <button class="btn btn-small">Edit</button>
                                    <button class="btn btn-small btn-danger">Delete</button>
                                </div>
                            </div>

                            <div class="schedule-item">
                                <div class="schedule-time">
                                    <span class="time-display">00:00</span>
                                    <span class="time-zone">Daily</span>
                                </div>
                                <div class="schedule-info">
                                    <h4>Analytics Backup</h4>
                                    <p>Export analytics data → Store in vault</p>
                                </div>
                                <div class="schedule-actions">
                                    <button class="btn btn-small">Edit</button>
                                    <button class="btn btn-small btn-danger">Delete</button>
                                </div>
                            </div>
                        </div>

                        <div class="add-schedule">
                            <h4>Add Scheduled Task</h4>
                            <div class="schedule-form">
                                <div class="form-row">
                                    <input type="time" id="schedule-time" class="auto-input">
                                    <select id="schedule-frequency" class="auto-select">
                                        <option value="daily">Daily</option>
                                        <option value="weekdays">Weekdays</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                                <select id="schedule-pipeline" class="auto-select">
                                    <option value="">Select Pipeline</option>
                                    <option value="standup">Daily Standup</option>
                                    <option value="sprint-report">Sprint Report</option>
                                    <option value="bug-triage">Bug Triage</option>
                                </select>
                                <button class="btn btn-primary">Add Schedule</button>
                            </div>
                        </div>
                    </div>

                    <div class="auto-panel" id="auto-panel-integrations">
                        <h3>Connected Services</h3>

                        <div class="integrations-grid">
                            <div class="integration-card connected">
                                <div class="int-icon">💬</div>
                                <div class="int-name">Slack</div>
                                <div class="int-status">Connected</div>
                                <button class="btn btn-small">Configure</button>
                            </div>

                            <div class="integration-card">
                                <div class="int-icon">📋</div>
                                <div class="int-name">Jira</div>
                                <div class="int-status">Not connected</div>
                                <button class="btn btn-small btn-primary">Connect</button>
                            </div>

                            <div class="integration-card">
                                <div class="int-icon">📧</div>
                                <div class="int-name">Gmail</div>
                                <div class="int-status">Not connected</div>
                                <button class="btn btn-small btn-primary">Connect</button>
                            </div>

                            <div class="integration-card">
                                <div class="int-icon">📊</div>
                                <div class="int-name">Google Sheets</div>
                                <div class="int-status">Not connected</div>
                                <button class="btn btn-small btn-primary">Connect</button>
                            </div>

                            <div class="integration-card">
                                <div class="int-icon">🐙</div>
                                <div class="int-name">GitHub</div>
                                <div class="int-status">Not connected</div>
                                <button class="btn btn-small btn-primary">Connect</button>
                            </div>

                            <div class="integration-card">
                                <div class="int-icon">📹</div>
                                <div class="int-name">Zoom</div>
                                <div class="int-status">Not connected</div>
                                <button class="btn btn-small btn-primary">Connect</button>
                            </div>

                            <div class="integration-card">
                                <div class="int-icon">📝</div>
                                <div class="int-name">Notion</div>
                                <div class="int-status">Not connected</div>
                                <button class="btn btn-small btn-primary">Connect</button>
                            </div>

                            <div class="integration-card">
                                <div class="int-icon">📅</div>
                                <div class="int-name">Google Calendar</div>
                                <div class="int-status">Not connected</div>
                                <button class="btn btn-small btn-primary">Connect</button>
                            </div>

                            <div class="integration-card">
                                <div class="int-icon">🎯</div>
                                <div class="int-name">Linear</div>
                                <div class="int-status">Not connected</div>
                                <button class="btn btn-small btn-primary">Connect</button>
                            </div>

                            <div class="integration-card">
                                <div class="int-icon">📦</div>
                                <div class="int-name">Trello</div>
                                <div class="int-status">Not connected</div>
                                <button class="btn btn-small btn-primary">Connect</button>
                            </div>

                            <div class="integration-card">
                                <div class="int-icon">💼</div>
                                <div class="int-name">Asana</div>
                                <div class="int-status">Not connected</div>
                                <button class="btn btn-small btn-primary">Connect</button>
                            </div>

                            <div class="integration-card">
                                <div class="int-icon">🔔</div>
                                <div class="int-name">PagerDuty</div>
                                <div class="int-status">Not connected</div>
                                <button class="btn btn-small btn-primary">Connect</button>
                            </div>
                        </div>
                    </div>

                    <div class="auto-panel" id="auto-panel-logs">
                        <h3>Activity Log</h3>

                        <div class="log-filters">
                            <select class="auto-select">
                                <option value="all">All Activities</option>
                                <option value="pipelines">Pipelines</option>
                                <option value="schedules">Scheduled Tasks</option>
                                <option value="commands">Commands</option>
                            </select>
                            <select class="auto-select">
                                <option value="24h">Last 24 hours</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                            </select>
                        </div>

                        <div class="log-list" id="activity-log">
                            <div class="log-entry success">
                                <span class="log-time">10:32 AM</span>
                                <span class="log-icon">✓</span>
                                <span class="log-msg">Daily Standup Summary posted to #team-standup</span>
                            </div>
                            <div class="log-entry success">
                                <span class="log-time">10:30 AM</span>
                                <span class="log-icon">✓</span>
                                <span class="log-msg">Fetched 12 Jira issues for standup</span>
                            </div>
                            <div class="log-entry info">
                                <span class="log-time">09:00 AM</span>
                                <span class="log-icon">⚡</span>
                                <span class="log-msg">Pipeline "Daily Standup" triggered by schedule</span>
                            </div>
                            <div class="log-entry warning">
                                <span class="log-time">Yesterday</span>
                                <span class="log-icon">⚠️</span>
                                <span class="log-msg">Sprint Report: 3 overdue issues detected</span>
                            </div>
                            <div class="log-entry error">
                                <span class="log-time">Yesterday</span>
                                <span class="log-icon">✗</span>
                                <span class="log-msg">Email delivery failed: Invalid recipient</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents(container);
        this.loadSavedData();
    },

    bindEvents(container) {
        container.querySelectorAll('.auto-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.auto-tab').forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.auto-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`auto-panel-${tab.dataset.tab}`).classList.add('active');
            });
        });

        document.getElementById('execute-command')?.addEventListener('click', () => this.executeCommand());

        container.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', () => this.runQuickCommand(btn.dataset.cmd));
        });

        document.getElementById('new-pipeline')?.addEventListener('click', () => this.showPipelineBuilder());
        document.getElementById('cancel-pipeline')?.addEventListener('click', () => this.hidePipelineBuilder());
        document.getElementById('save-pipeline')?.addEventListener('click', () => this.savePipeline());
        document.getElementById('add-step')?.addEventListener('click', () => this.addPipelineStep());

        container.querySelectorAll('.step-template').forEach(tpl => {
            tpl.addEventListener('click', () => this.addStepOfType(tpl.dataset.type));
        });
    },

    loadSavedData() {
        const pipelines = JSON.parse(localStorage.getItem('neosai_pipelines') || '[]');
        const schedules = JSON.parse(localStorage.getItem('neosai_schedules') || '[]');
        this.connections = JSON.parse(localStorage.getItem('neosai_connections') || '{}');
    },

    async executeCommand() {
        const command = document.getElementById('ai-command').value;
        if (!command.trim()) {
            NeoApp.showNotification('Enter a command', 'error');
            return;
        }

        const resultDiv = document.getElementById('command-result');
        resultDiv.innerHTML = '<div class="loading-spinner"></div><p>Processing command...</p>';

        try {
            const response = await NeoApp.callWorker('openai_chat', {
                messages: [{
                    role: 'system',
                    content: `You are an automation assistant. Parse the user's natural language command and return a JSON action plan.

Available actions:
- jira_create: {project, summary, description, type, assignee}
- jira_search: {jql}
- jira_update: {issueKey, fields}
- slack_post: {channel, message}
- slack_notify: {users, message}
- email_send: {to, subject, body}
- schedule: {time, frequency, pipeline}
- ai_generate: {prompt, type}

Return JSON with: {actions: [...], summary: "..."}`
                }, {
                    role: 'user',
                    content: command
                }]
            });

            const plan = JSON.parse(response.content);

            resultDiv.innerHTML = `
                <div class="command-plan">
                    <h4>Execution Plan</h4>
                    <p class="plan-summary">${plan.summary}</p>
                    <div class="plan-actions">
                        ${plan.actions.map((a, i) => `
                            <div class="plan-step">
                                <span class="step-num">${i + 1}</span>
                                <span class="step-action">${a.type || Object.keys(a)[0]}</span>
                                <span class="step-details">${JSON.stringify(a).substring(0, 60)}...</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="plan-buttons">
                        <button class="btn btn-primary" id="confirm-execute">Execute Now</button>
                        <button class="btn btn-secondary" id="save-as-pipeline">Save as Pipeline</button>
                    </div>
                </div>
            `;

            document.getElementById('confirm-execute')?.addEventListener('click', () => {
                this.executeActions(plan.actions);
            });

            document.getElementById('save-as-pipeline')?.addEventListener('click', () => {
                this.savePipelineFromPlan(plan);
            });

        } catch (error) {
            resultDiv.innerHTML = `<p class="error">Failed to process command: ${error.message}</p>`;
        }
    },

    async executeActions(actions) {
        const resultDiv = document.getElementById('command-result');
        const results = [];

        for (const action of actions) {
            const actionType = action.type || Object.keys(action)[0];

            try {
                let result;
                switch (actionType) {
                    case 'slack_post':
                        result = await NeoApp.callWorker('slack_post', {
                            channel: action.channel,
                            text: action.message
                        });
                        break;

                    case 'jira_create':
                        // Would call Jira API
                        result = { success: true, key: 'PROJ-123' };
                        break;

                    case 'email_send':
                        // Would call email API
                        result = { success: true };
                        break;

                    default:
                        result = { skipped: true };
                }

                results.push({ action: actionType, success: true, result });
            } catch (error) {
                results.push({ action: actionType, success: false, error: error.message });
            }
        }

        resultDiv.innerHTML = `
            <div class="execution-results">
                <h4>Execution Complete</h4>
                ${results.map(r => `
                    <div class="result-item ${r.success ? 'success' : 'error'}">
                        <span class="result-icon">${r.success ? '✓' : '✗'}</span>
                        <span class="result-action">${r.action}</span>
                        <span class="result-msg">${r.success ? 'Success' : r.error}</span>
                    </div>
                `).join('')}
            </div>
        `;

        this.logActivity(results);
        NeoApp.showNotification('Command executed', 'success');
    },

    async runQuickCommand(cmd) {
        const commands = {
            'standup': 'Generate a daily standup summary from Jira issues in progress and post to #team-standup Slack channel',
            'sprint-report': 'Create a sprint progress report with completion stats and post to #engineering',
            'delegate-tasks': 'Show unassigned high-priority Jira tasks and suggest team members to assign',
            'review-prs': 'List open pull requests needing review and notify relevant reviewers on Slack',
            'bug-triage': 'Fetch new bugs from Jira, categorize by severity, and create triage summary',
            'team-sync': 'Schedule a team sync meeting and send calendar invites to all team members'
        };

        document.getElementById('ai-command').value = commands[cmd];
        this.executeCommand();
    },

    showPipelineBuilder() {
        document.getElementById('pipeline-list').classList.add('hidden');
        document.getElementById('pipeline-builder').classList.remove('hidden');
    },

    hidePipelineBuilder() {
        document.getElementById('pipeline-list').classList.remove('hidden');
        document.getElementById('pipeline-builder').classList.add('hidden');
    },

    addPipelineStep() {
        const canvas = document.getElementById('builder-canvas');
        const stepCount = canvas.querySelectorAll('.builder-step').length;

        const step = document.createElement('div');
        step.className = 'builder-step';
        step.innerHTML = `
            <span class="step-arrow">→</span>
            <select class="step-select">
                <option value="">Select Action</option>
                <option value="jira_query">Jira: Query Issues</option>
                <option value="jira_create">Jira: Create Issue</option>
                <option value="jira_update">Jira: Update Issue</option>
                <option value="slack_post">Slack: Post Message</option>
                <option value="slack_notify">Slack: Notify Users</option>
                <option value="email_send">Email: Send</option>
                <option value="ai_summarize">AI: Summarize</option>
                <option value="ai_generate">AI: Generate Content</option>
                <option value="delay">Delay</option>
                <option value="condition">Condition</option>
            </select>
            <button class="step-remove">×</button>
        `;

        step.querySelector('.step-remove').addEventListener('click', () => step.remove());
        canvas.appendChild(step);
    },

    addStepOfType(type) {
        const canvas = document.getElementById('builder-canvas');

        const configs = {
            jira: { label: 'Jira Action', options: ['Query Issues', 'Create Issue', 'Update Issue', 'Assign'] },
            slack: { label: 'Slack', options: ['Post Message', 'Notify Users', 'Create Channel'] },
            email: { label: 'Email', options: ['Send Email', 'Send Report'] },
            ai: { label: 'AI Process', options: ['Summarize', 'Generate', 'Analyze', 'Translate'] },
            delay: { label: 'Delay', options: ['5 minutes', '1 hour', '1 day'] },
            condition: { label: 'Condition', options: ['If contains', 'If status', 'If priority'] }
        };

        const config = configs[type];
        const step = document.createElement('div');
        step.className = 'builder-step';
        step.dataset.type = type;
        step.innerHTML = `
            <span class="step-arrow">→</span>
            <div class="step-config">
                <span class="step-label">${config.label}</span>
                <select class="step-select">
                    ${config.options.map(o => `<option value="${o}">${o}</option>`).join('')}
                </select>
            </div>
            <button class="step-remove">×</button>
        `;

        step.querySelector('.step-remove').addEventListener('click', () => step.remove());
        canvas.appendChild(step);
    },

    savePipeline() {
        const name = document.getElementById('pipeline-name').value;
        const trigger = document.getElementById('trigger-type').value;
        const steps = Array.from(document.querySelectorAll('#builder-canvas .builder-step')).map(s => ({
            type: s.dataset.type || 'action',
            action: s.querySelector('.step-select')?.value
        }));

        if (!name) {
            NeoApp.showNotification('Enter pipeline name', 'error');
            return;
        }

        const pipelines = JSON.parse(localStorage.getItem('neosai_pipelines') || '[]');
        pipelines.push({ name, trigger, steps, enabled: true, created: Date.now() });
        localStorage.setItem('neosai_pipelines', JSON.stringify(pipelines));

        NeoApp.showNotification('Pipeline saved', 'success');
        this.hidePipelineBuilder();
    },

    savePipelineFromPlan(plan) {
        const name = prompt('Pipeline name:');
        if (!name) return;

        const pipelines = JSON.parse(localStorage.getItem('neosai_pipelines') || '[]');
        pipelines.push({
            name,
            trigger: 'manual',
            steps: plan.actions,
            enabled: true,
            created: Date.now()
        });
        localStorage.setItem('neosai_pipelines', JSON.stringify(pipelines));

        NeoApp.showNotification('Pipeline saved', 'success');
    },

    logActivity(results) {
        const logs = JSON.parse(localStorage.getItem('neosai_activity_log') || '[]');
        logs.unshift({
            timestamp: Date.now(),
            results,
            type: 'command'
        });
        localStorage.setItem('neosai_activity_log', JSON.stringify(logs.slice(0, 100)));
    }
};
