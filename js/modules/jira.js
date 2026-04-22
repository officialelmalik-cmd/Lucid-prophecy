const NeoJira = {
    render(container) {
        container.innerHTML = `
            <div class="jira-module">
                <div class="jira-tabs">
                    <button class="jira-tab active" data-tab="issues">Issues</button>
                    <button class="jira-tab" data-tab="create">Create</button>
                    <button class="jira-tab" data-tab="boards">Boards</button>
                    <button class="jira-tab" data-tab="sprints">Sprints</button>
                    <button class="jira-tab" data-tab="delegate">Delegate</button>
                    <button class="jira-tab" data-tab="automate">Automate</button>
                </div>

                <div class="jira-config-bar">
                    <input type="text" id="jira-domain" placeholder="your-domain.atlassian.net" class="jira-input">
                    <input type="email" id="jira-email" placeholder="Email" class="jira-input">
                    <input type="password" id="jira-token" placeholder="API Token" class="jira-input">
                    <button class="btn btn-primary" id="jira-connect">Connect</button>
                </div>

                <div class="jira-content">
                    <div class="jira-panel active" id="panel-issues">
                        <div class="jira-filters">
                            <select id="jira-project" class="jira-select">
                                <option value="">Select Project</option>
                            </select>
                            <select id="jira-status" class="jira-select">
                                <option value="">All Statuses</option>
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="In Review">In Review</option>
                                <option value="Done">Done</option>
                            </select>
                            <select id="jira-assignee" class="jira-select">
                                <option value="">All Assignees</option>
                                <option value="currentUser()">Assigned to Me</option>
                                <option value="EMPTY">Unassigned</option>
                            </select>
                            <button class="btn btn-secondary" id="jira-search">Search</button>
                        </div>
                        <div class="jira-issues-list" id="jira-issues"></div>
                    </div>

                    <div class="jira-panel" id="panel-create">
                        <div class="jira-form">
                            <div class="form-group">
                                <label>Project</label>
                                <select id="create-project" class="jira-select full"></select>
                            </div>
                            <div class="form-group">
                                <label>Issue Type</label>
                                <select id="create-type" class="jira-select full">
                                    <option value="Task">Task</option>
                                    <option value="Story">Story</option>
                                    <option value="Bug">Bug</option>
                                    <option value="Epic">Epic</option>
                                    <option value="Subtask">Subtask</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Summary</label>
                                <input type="text" id="create-summary" class="jira-input full" placeholder="Issue summary">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea id="create-description" class="jira-textarea" placeholder="Detailed description..."></textarea>
                            </div>
                            <div class="form-row">
                                <div class="form-group half">
                                    <label>Priority</label>
                                    <select id="create-priority" class="jira-select full">
                                        <option value="Highest">Highest</option>
                                        <option value="High">High</option>
                                        <option value="Medium" selected>Medium</option>
                                        <option value="Low">Low</option>
                                        <option value="Lowest">Lowest</option>
                                    </select>
                                </div>
                                <div class="form-group half">
                                    <label>Assignee</label>
                                    <select id="create-assignee" class="jira-select full"></select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Labels</label>
                                <input type="text" id="create-labels" class="jira-input full" placeholder="label1, label2">
                            </div>
                            <button class="btn btn-primary full" id="create-issue">Create Issue</button>
                        </div>
                    </div>

                    <div class="jira-panel" id="panel-boards">
                        <div class="jira-boards-grid" id="jira-boards"></div>
                    </div>

                    <div class="jira-panel" id="panel-sprints">
                        <div class="sprint-selector">
                            <select id="sprint-board" class="jira-select">
                                <option value="">Select Board</option>
                            </select>
                            <select id="sprint-list" class="jira-select">
                                <option value="">Select Sprint</option>
                            </select>
                        </div>
                        <div class="sprint-overview" id="sprint-overview"></div>
                    </div>

                    <div class="jira-panel" id="panel-delegate">
                        <h3>Quick Delegation</h3>
                        <p class="panel-desc">Bulk assign issues or create tasks from templates</p>

                        <div class="delegate-section">
                            <h4>Bulk Reassign</h4>
                            <div class="delegate-form">
                                <select id="delegate-from" class="jira-select">
                                    <option value="">From User</option>
                                </select>
                                <span class="delegate-arrow">→</span>
                                <select id="delegate-to" class="jira-select">
                                    <option value="">To User</option>
                                </select>
                                <button class="btn btn-primary" id="bulk-reassign">Reassign All</button>
                            </div>
                        </div>

                        <div class="delegate-section">
                            <h4>Task Templates</h4>
                            <div class="template-grid">
                                <button class="template-btn" data-template="sprint-planning">
                                    <span class="template-icon">📋</span>
                                    <span>Sprint Planning</span>
                                </button>
                                <button class="template-btn" data-template="release-checklist">
                                    <span class="template-icon">🚀</span>
                                    <span>Release Checklist</span>
                                </button>
                                <button class="template-btn" data-template="bug-triage">
                                    <span class="template-icon">🐛</span>
                                    <span>Bug Triage</span>
                                </button>
                                <button class="template-btn" data-template="onboarding">
                                    <span class="template-icon">👋</span>
                                    <span>Team Onboarding</span>
                                </button>
                            </div>
                        </div>

                        <div class="delegate-section">
                            <h4>AI Task Breakdown</h4>
                            <textarea id="ai-task-input" class="jira-textarea" placeholder="Describe a large task and AI will break it into subtasks..."></textarea>
                            <button class="btn btn-primary" id="ai-breakdown">Generate Subtasks</button>
                            <div id="ai-subtasks-result"></div>
                        </div>
                    </div>

                    <div class="jira-panel" id="panel-automate">
                        <h3>Automation Rules</h3>
                        <p class="panel-desc">Create rules to automate repetitive Jira actions</p>

                        <div class="automation-rules" id="automation-rules">
                            <div class="automation-rule">
                                <div class="rule-header">
                                    <span class="rule-icon">⚡</span>
                                    <span class="rule-name">Auto-assign by label</span>
                                    <label class="toggle">
                                        <input type="checkbox" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <p class="rule-desc">When issue has label "frontend" → assign to Frontend Team</p>
                            </div>
                            <div class="automation-rule">
                                <div class="rule-header">
                                    <span class="rule-icon">⚡</span>
                                    <span class="rule-name">Sprint completion alerts</span>
                                    <label class="toggle">
                                        <input type="checkbox" checked>
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <p class="rule-desc">3 days before sprint end → Slack alert for incomplete issues</p>
                            </div>
                            <div class="automation-rule">
                                <div class="rule-header">
                                    <span class="rule-icon">⚡</span>
                                    <span class="rule-name">Auto-transition on PR merge</span>
                                    <label class="toggle">
                                        <input type="checkbox">
                                        <span class="toggle-slider"></span>
                                    </label>
                                </div>
                                <p class="rule-desc">When PR merged → move issue to "Done"</p>
                            </div>
                        </div>

                        <div class="create-automation">
                            <h4>Create New Rule</h4>
                            <div class="automation-builder">
                                <div class="builder-row">
                                    <label>When</label>
                                    <select id="auto-trigger" class="jira-select">
                                        <option value="issue_created">Issue is created</option>
                                        <option value="issue_updated">Issue is updated</option>
                                        <option value="status_changed">Status changes</option>
                                        <option value="comment_added">Comment is added</option>
                                        <option value="sprint_started">Sprint starts</option>
                                        <option value="sprint_ending">Sprint ending (3 days)</option>
                                    </select>
                                </div>
                                <div class="builder-row">
                                    <label>If</label>
                                    <select id="auto-condition" class="jira-select">
                                        <option value="any">Any issue</option>
                                        <option value="has_label">Has label</option>
                                        <option value="priority_high">Priority is High+</option>
                                        <option value="unassigned">Is unassigned</option>
                                        <option value="overdue">Is overdue</option>
                                    </select>
                                </div>
                                <div class="builder-row">
                                    <label>Then</label>
                                    <select id="auto-action" class="jira-select">
                                        <option value="assign">Assign to user</option>
                                        <option value="transition">Change status</option>
                                        <option value="add_label">Add label</option>
                                        <option value="slack_notify">Send Slack message</option>
                                        <option value="add_comment">Add comment</option>
                                        <option value="create_subtask">Create subtask</option>
                                    </select>
                                </div>
                                <button class="btn btn-primary" id="save-automation">Save Rule</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents(container);
        this.loadConfig();
    },

    bindEvents(container) {
        container.querySelectorAll('.jira-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                container.querySelectorAll('.jira-tab').forEach(t => t.classList.remove('active'));
                container.querySelectorAll('.jira-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(`panel-${tab.dataset.tab}`).classList.add('active');
            });
        });

        document.getElementById('jira-connect')?.addEventListener('click', () => this.connect());
        document.getElementById('jira-search')?.addEventListener('click', () => this.searchIssues());
        document.getElementById('create-issue')?.addEventListener('click', () => this.createIssue());
        document.getElementById('bulk-reassign')?.addEventListener('click', () => this.bulkReassign());
        document.getElementById('ai-breakdown')?.addEventListener('click', () => this.aiBreakdown());
        document.getElementById('save-automation')?.addEventListener('click', () => this.saveAutomation());

        container.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => this.applyTemplate(btn.dataset.template));
        });
    },

    loadConfig() {
        const saved = localStorage.getItem('neosai_jira_config');
        if (saved) {
            const config = JSON.parse(saved);
            document.getElementById('jira-domain').value = config.domain || '';
            document.getElementById('jira-email').value = config.email || '';
        }
    },

    saveConfig() {
        const config = {
            domain: document.getElementById('jira-domain').value,
            email: document.getElementById('jira-email').value
        };
        localStorage.setItem('neosai_jira_config', JSON.stringify(config));
    },

    getAuth() {
        const email = document.getElementById('jira-email').value;
        const token = document.getElementById('jira-token').value;
        return btoa(`${email}:${token}`);
    },

    async connect() {
        const domain = document.getElementById('jira-domain').value;
        if (!domain) {
            NeoApp.showNotification('Enter Jira domain', 'error');
            return;
        }

        try {
            const response = await fetch(`https://${domain}/rest/api/3/myself`, {
                headers: {
                    'Authorization': `Basic ${this.getAuth()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Connection failed');

            const user = await response.json();
            this.saveConfig();
            NeoApp.showNotification(`Connected as ${user.displayName}`, 'success');

            this.loadProjects();
            this.loadUsers();
            this.loadBoards();
        } catch (error) {
            NeoApp.showNotification('Connection failed: Check credentials', 'error');
        }
    },

    async loadProjects() {
        const domain = document.getElementById('jira-domain').value;
        try {
            const response = await fetch(`https://${domain}/rest/api/3/project`, {
                headers: { 'Authorization': `Basic ${this.getAuth()}` }
            });
            const projects = await response.json();

            const selects = ['jira-project', 'create-project'];
            selects.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    select.innerHTML = '<option value="">Select Project</option>' +
                        projects.map(p => `<option value="${p.key}">${p.name}</option>`).join('');
                }
            });
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    },

    async loadUsers() {
        const domain = document.getElementById('jira-domain').value;
        try {
            const response = await fetch(`https://${domain}/rest/api/3/users/search?maxResults=100`, {
                headers: { 'Authorization': `Basic ${this.getAuth()}` }
            });
            const users = await response.json();

            const selects = ['jira-assignee', 'create-assignee', 'delegate-from', 'delegate-to'];
            selects.forEach(id => {
                const select = document.getElementById(id);
                if (select) {
                    const defaultOpt = select.querySelector('option')?.outerHTML || '';
                    select.innerHTML = defaultOpt +
                        users.map(u => `<option value="${u.accountId}">${u.displayName}</option>`).join('');
                }
            });
        } catch (error) {
            console.error('Failed to load users:', error);
        }
    },

    async loadBoards() {
        const domain = document.getElementById('jira-domain').value;
        try {
            const response = await fetch(`https://${domain}/rest/agile/1.0/board`, {
                headers: { 'Authorization': `Basic ${this.getAuth()}` }
            });
            const data = await response.json();

            const boardsGrid = document.getElementById('jira-boards');
            const sprintBoard = document.getElementById('sprint-board');

            if (boardsGrid) {
                boardsGrid.innerHTML = data.values.map(b => `
                    <div class="board-card" data-id="${b.id}">
                        <div class="board-type">${b.type}</div>
                        <div class="board-name">${b.name}</div>
                        <div class="board-project">${b.location?.projectName || ''}</div>
                    </div>
                `).join('');
            }

            if (sprintBoard) {
                sprintBoard.innerHTML = '<option value="">Select Board</option>' +
                    data.values.filter(b => b.type === 'scrum').map(b =>
                        `<option value="${b.id}">${b.name}</option>`
                    ).join('');

                sprintBoard.addEventListener('change', () => this.loadSprints(sprintBoard.value));
            }
        } catch (error) {
            console.error('Failed to load boards:', error);
        }
    },

    async loadSprints(boardId) {
        if (!boardId) return;
        const domain = document.getElementById('jira-domain').value;

        try {
            const response = await fetch(`https://${domain}/rest/agile/1.0/board/${boardId}/sprint`, {
                headers: { 'Authorization': `Basic ${this.getAuth()}` }
            });
            const data = await response.json();

            const sprintList = document.getElementById('sprint-list');
            if (sprintList) {
                sprintList.innerHTML = '<option value="">Select Sprint</option>' +
                    data.values.map(s => `<option value="${s.id}">${s.name} (${s.state})</option>`).join('');

                sprintList.addEventListener('change', () => this.loadSprintDetails(boardId, sprintList.value));
            }
        } catch (error) {
            console.error('Failed to load sprints:', error);
        }
    },

    async loadSprintDetails(boardId, sprintId) {
        if (!sprintId) return;
        const domain = document.getElementById('jira-domain').value;

        try {
            const [sprintRes, issuesRes] = await Promise.all([
                fetch(`https://${domain}/rest/agile/1.0/sprint/${sprintId}`, {
                    headers: { 'Authorization': `Basic ${this.getAuth()}` }
                }),
                fetch(`https://${domain}/rest/agile/1.0/sprint/${sprintId}/issue`, {
                    headers: { 'Authorization': `Basic ${this.getAuth()}` }
                })
            ]);

            const sprint = await sprintRes.json();
            const issuesData = await issuesRes.json();

            const todo = issuesData.issues.filter(i => i.fields.status.statusCategory.key === 'new').length;
            const inProgress = issuesData.issues.filter(i => i.fields.status.statusCategory.key === 'indeterminate').length;
            const done = issuesData.issues.filter(i => i.fields.status.statusCategory.key === 'done').length;
            const total = issuesData.issues.length;

            document.getElementById('sprint-overview').innerHTML = `
                <div class="sprint-header">
                    <h3>${sprint.name}</h3>
                    <span class="sprint-state ${sprint.state}">${sprint.state}</span>
                </div>
                <div class="sprint-dates">
                    ${sprint.startDate ? `Start: ${new Date(sprint.startDate).toLocaleDateString()}` : ''}
                    ${sprint.endDate ? ` | End: ${new Date(sprint.endDate).toLocaleDateString()}` : ''}
                </div>
                <div class="sprint-progress">
                    <div class="progress-bar">
                        <div class="progress-done" style="width: ${(done/total)*100}%"></div>
                        <div class="progress-in-progress" style="width: ${(inProgress/total)*100}%"></div>
                    </div>
                    <div class="progress-legend">
                        <span class="legend-done">Done: ${done}</span>
                        <span class="legend-progress">In Progress: ${inProgress}</span>
                        <span class="legend-todo">To Do: ${todo}</span>
                    </div>
                </div>
                <div class="sprint-issues">
                    ${issuesData.issues.map(i => `
                        <div class="sprint-issue ${i.fields.status.statusCategory.key}">
                            <span class="issue-key">${i.key}</span>
                            <span class="issue-summary">${i.fields.summary}</span>
                            <span class="issue-status">${i.fields.status.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            console.error('Failed to load sprint details:', error);
        }
    },

    async searchIssues() {
        const domain = document.getElementById('jira-domain').value;
        const project = document.getElementById('jira-project').value;
        const status = document.getElementById('jira-status').value;
        const assignee = document.getElementById('jira-assignee').value;

        let jql = [];
        if (project) jql.push(`project = "${project}"`);
        if (status) jql.push(`status = "${status}"`);
        if (assignee) jql.push(`assignee = ${assignee}`);

        const jqlQuery = jql.length ? jql.join(' AND ') : 'ORDER BY created DESC';

        try {
            const response = await fetch(`https://${domain}/rest/api/3/search?jql=${encodeURIComponent(jqlQuery)}&maxResults=50`, {
                headers: { 'Authorization': `Basic ${this.getAuth()}` }
            });
            const data = await response.json();

            document.getElementById('jira-issues').innerHTML = data.issues.map(i => `
                <div class="issue-row">
                    <span class="issue-type-icon">${this.getTypeIcon(i.fields.issuetype.name)}</span>
                    <a href="https://${domain}/browse/${i.key}" target="_blank" class="issue-key">${i.key}</a>
                    <span class="issue-summary">${i.fields.summary}</span>
                    <span class="issue-status status-${i.fields.status.statusCategory.key}">${i.fields.status.name}</span>
                    <span class="issue-priority">${i.fields.priority?.name || 'None'}</span>
                    <span class="issue-assignee">${i.fields.assignee?.displayName || 'Unassigned'}</span>
                </div>
            `).join('') || '<p class="no-issues">No issues found</p>';
        } catch (error) {
            NeoApp.showNotification('Search failed', 'error');
        }
    },

    getTypeIcon(type) {
        const icons = {
            'Task': '✓',
            'Story': '📖',
            'Bug': '🐛',
            'Epic': '⚡',
            'Subtask': '◦'
        };
        return icons[type] || '•';
    },

    async createIssue() {
        const domain = document.getElementById('jira-domain').value;
        const project = document.getElementById('create-project').value;
        const issueType = document.getElementById('create-type').value;
        const summary = document.getElementById('create-summary').value;
        const description = document.getElementById('create-description').value;
        const priority = document.getElementById('create-priority').value;
        const assignee = document.getElementById('create-assignee').value;
        const labels = document.getElementById('create-labels').value.split(',').map(l => l.trim()).filter(Boolean);

        if (!project || !summary) {
            NeoApp.showNotification('Project and Summary are required', 'error');
            return;
        }

        const issueData = {
            fields: {
                project: { key: project },
                summary: summary,
                issuetype: { name: issueType },
                description: {
                    type: 'doc',
                    version: 1,
                    content: [{
                        type: 'paragraph',
                        content: [{ type: 'text', text: description || '' }]
                    }]
                },
                priority: { name: priority },
                labels: labels
            }
        };

        if (assignee) {
            issueData.fields.assignee = { accountId: assignee };
        }

        try {
            const response = await fetch(`https://${domain}/rest/api/3/issue`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${this.getAuth()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(issueData)
            });

            if (!response.ok) throw new Error('Failed to create issue');

            const result = await response.json();
            NeoApp.showNotification(`Created ${result.key}`, 'success');

            document.getElementById('create-summary').value = '';
            document.getElementById('create-description').value = '';
        } catch (error) {
            NeoApp.showNotification('Failed to create issue', 'error');
        }
    },

    async bulkReassign() {
        const domain = document.getElementById('jira-domain').value;
        const fromUser = document.getElementById('delegate-from').value;
        const toUser = document.getElementById('delegate-to').value;

        if (!fromUser || !toUser) {
            NeoApp.showNotification('Select both users', 'error');
            return;
        }

        try {
            const searchRes = await fetch(`https://${domain}/rest/api/3/search?jql=assignee=${fromUser}&maxResults=100`, {
                headers: { 'Authorization': `Basic ${this.getAuth()}` }
            });
            const data = await searchRes.json();

            let reassigned = 0;
            for (const issue of data.issues) {
                await fetch(`https://${domain}/rest/api/3/issue/${issue.key}/assignee`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Basic ${this.getAuth()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ accountId: toUser })
                });
                reassigned++;
            }

            NeoApp.showNotification(`Reassigned ${reassigned} issues`, 'success');
        } catch (error) {
            NeoApp.showNotification('Bulk reassign failed', 'error');
        }
    },

    async aiBreakdown() {
        const taskDesc = document.getElementById('ai-task-input').value;
        if (!taskDesc) {
            NeoApp.showNotification('Enter a task description', 'error');
            return;
        }

        const resultDiv = document.getElementById('ai-subtasks-result');
        resultDiv.innerHTML = '<div class="loading-spinner"></div>';

        try {
            const response = await NeoApp.callWorker('openai_chat', {
                messages: [{
                    role: 'user',
                    content: `Break down this task into 3-7 actionable Jira subtasks. Return as JSON array with fields: summary, description, estimate (story points 1-8).

Task: ${taskDesc}

Return ONLY valid JSON array, no other text.`
                }]
            });

            const subtasks = JSON.parse(response.content);

            resultDiv.innerHTML = `
                <div class="subtasks-preview">
                    ${subtasks.map((s, i) => `
                        <div class="subtask-item">
                            <span class="subtask-num">${i + 1}</span>
                            <div class="subtask-content">
                                <strong>${s.summary}</strong>
                                <p>${s.description}</p>
                                <span class="subtask-estimate">${s.estimate} SP</span>
                            </div>
                            <input type="checkbox" checked class="subtask-check" data-index="${i}">
                        </div>
                    `).join('')}
                    <button class="btn btn-primary" id="create-subtasks">Create Selected in Jira</button>
                </div>
            `;

            document.getElementById('create-subtasks')?.addEventListener('click', () => {
                this.createSubtasksInJira(subtasks);
            });
        } catch (error) {
            resultDiv.innerHTML = '<p class="error">AI breakdown failed</p>';
        }
    },

    async createSubtasksInJira(subtasks) {
        const domain = document.getElementById('jira-domain').value;
        const project = document.getElementById('create-project').value;

        if (!project) {
            NeoApp.showNotification('Select a project first', 'error');
            return;
        }

        const checks = document.querySelectorAll('.subtask-check:checked');
        const indices = Array.from(checks).map(c => parseInt(c.dataset.index));

        let created = 0;
        for (const idx of indices) {
            const subtask = subtasks[idx];
            try {
                await fetch(`https://${domain}/rest/api/3/issue`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${this.getAuth()}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        fields: {
                            project: { key: project },
                            summary: subtask.summary,
                            issuetype: { name: 'Task' },
                            description: {
                                type: 'doc',
                                version: 1,
                                content: [{
                                    type: 'paragraph',
                                    content: [{ type: 'text', text: subtask.description }]
                                }]
                            }
                        }
                    })
                });
                created++;
            } catch (e) {
                console.error('Failed to create subtask:', e);
            }
        }

        NeoApp.showNotification(`Created ${created} issues in Jira`, 'success');
    },

    applyTemplate(template) {
        const templates = {
            'sprint-planning': [
                { summary: 'Sprint Planning Meeting', type: 'Task' },
                { summary: 'Review and groom backlog', type: 'Task' },
                { summary: 'Estimate stories for sprint', type: 'Task' },
                { summary: 'Assign sprint items to team', type: 'Task' },
                { summary: 'Update sprint board', type: 'Task' }
            ],
            'release-checklist': [
                { summary: 'Code freeze', type: 'Task' },
                { summary: 'Run full test suite', type: 'Task' },
                { summary: 'Update changelog', type: 'Task' },
                { summary: 'Create release branch', type: 'Task' },
                { summary: 'Deploy to staging', type: 'Task' },
                { summary: 'QA sign-off', type: 'Task' },
                { summary: 'Deploy to production', type: 'Task' },
                { summary: 'Post-release monitoring', type: 'Task' }
            ],
            'bug-triage': [
                { summary: 'Review new bug reports', type: 'Task' },
                { summary: 'Reproduce and verify bugs', type: 'Task' },
                { summary: 'Prioritize by severity', type: 'Task' },
                { summary: 'Assign to developers', type: 'Task' },
                { summary: 'Update bug status board', type: 'Task' }
            ],
            'onboarding': [
                { summary: 'Setup development environment', type: 'Task' },
                { summary: 'Access to repositories', type: 'Task' },
                { summary: 'Review codebase documentation', type: 'Task' },
                { summary: 'Meet the team', type: 'Task' },
                { summary: 'First pair programming session', type: 'Task' },
                { summary: 'Complete first small task', type: 'Task' }
            ]
        };

        const tasks = templates[template];
        if (!tasks) return;

        document.getElementById('ai-subtasks-result').innerHTML = `
            <div class="template-preview">
                <h4>Template: ${template.replace('-', ' ').toUpperCase()}</h4>
                ${tasks.map((t, i) => `
                    <div class="subtask-item">
                        <span class="subtask-num">${i + 1}</span>
                        <strong>${t.summary}</strong>
                        <input type="checkbox" checked class="subtask-check" data-index="${i}">
                    </div>
                `).join('')}
                <button class="btn btn-primary" id="create-template-tasks">Create in Jira</button>
            </div>
        `;

        document.getElementById('create-template-tasks')?.addEventListener('click', () => {
            this.createSubtasksInJira(tasks.map(t => ({ summary: t.summary, description: '', estimate: 2 })));
        });
    },

    saveAutomation() {
        const trigger = document.getElementById('auto-trigger').value;
        const condition = document.getElementById('auto-condition').value;
        const action = document.getElementById('auto-action').value;

        const rules = JSON.parse(localStorage.getItem('neosai_jira_automations') || '[]');
        rules.push({ trigger, condition, action, enabled: true, created: Date.now() });
        localStorage.setItem('neosai_jira_automations', JSON.stringify(rules));

        NeoApp.showNotification('Automation rule saved', 'success');
    }
};
