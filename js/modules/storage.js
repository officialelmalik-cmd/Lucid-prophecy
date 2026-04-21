const NeoStorage = {
    items: [],

    render(container) {
        container.innerHTML = `
            <div class="storage-panel">
                <div class="storage-header">
                    <h3>Asset Storage</h3>
                    <div class="storage-actions">
                        <button class="btn btn-secondary" id="storage-clear">Clear All</button>
                        <button class="btn btn-primary" id="storage-export">Export</button>
                    </div>
                </div>

                <div class="storage-stats">
                    <div class="storage-stat">
                        <span class="stat-value" id="storage-count">0</span>
                        <span class="stat-label">Items</span>
                    </div>
                    <div class="storage-stat">
                        <span class="stat-value" id="storage-size">0 KB</span>
                        <span class="stat-label">Total Size</span>
                    </div>
                </div>

                <div class="storage-filters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="image">Images</button>
                    <button class="filter-btn" data-filter="audio">Audio</button>
                    <button class="filter-btn" data-filter="text">Text</button>
                </div>

                <div class="storage-grid" id="storage-grid">
                    <p style="color: var(--text-muted); text-align: center; padding: 2rem; grid-column: 1/-1;">
                        Generated assets will appear here.
                    </p>
                </div>
            </div>
            <style>
                .storage-panel { display: grid; gap: 1.5rem; }
                .storage-header { display: flex; justify-content: space-between; align-items: center; }
                .storage-actions { display: flex; gap: 0.75rem; }
                .storage-stats { display: flex; gap: 2rem; }
                .storage-stat { text-align: center; }
                .storage-stat .stat-value { font-size: 1.5rem; font-weight: 700; display: block; }
                .storage-stat .stat-label { font-size: 0.75rem; color: var(--text-muted); }
                .storage-filters { display: flex; gap: 0.5rem; }
                .filter-btn {
                    padding: 0.5rem 1rem;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    color: var(--text-primary);
                    cursor: pointer;
                }
                .filter-btn.active { background: var(--accent); border-color: var(--accent); }
                .storage-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 1rem;
                }
                .storage-item {
                    background: var(--bg-primary);
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid var(--border);
                }
                .storage-preview {
                    height: 120px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-card);
                }
                .storage-preview img { max-width: 100%; max-height: 100%; }
                .storage-meta {
                    padding: 0.75rem;
                }
                .storage-meta .item-name {
                    font-size: 0.875rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .storage-meta .item-size {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .storage-item-actions {
                    display: flex;
                    gap: 0.5rem;
                    padding: 0 0.75rem 0.75rem;
                }
                .storage-item-actions button {
                    flex: 1;
                    padding: 0.5rem;
                    font-size: 0.75rem;
                }
            </style>
        `;

        this.loadItems();
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('storage-clear').addEventListener('click', () => {
            if (confirm('Clear all stored items?')) {
                this.clearAll();
            }
        });

        document.getElementById('storage-export').addEventListener('click', () => {
            this.exportAll();
        });

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterItems(btn.dataset.filter);
            });
        });
    },

    loadItems() {
        try {
            const stored = localStorage.getItem('neosai_storage');
            if (stored) {
                this.items = JSON.parse(stored);
            }
        } catch (e) {
            console.warn('Failed to load storage:', e);
        }
        this.renderItems();
        this.updateStats();
    },

    addItem(item) {
        this.items.push({
            id: Date.now(),
            name: item.name || `Item ${this.items.length + 1}`,
            type: item.type || 'text',
            data: item.data,
            url: item.url,
            size: item.size || 0,
            created: new Date().toISOString()
        });

        localStorage.setItem('neosai_storage', JSON.stringify(this.items));
        this.renderItems();
        this.updateStats();
    },

    renderItems(filter = 'all') {
        const grid = document.getElementById('storage-grid');
        let filtered = this.items;

        if (filter !== 'all') {
            filtered = this.items.filter(item => item.type === filter);
        }

        if (filtered.length === 0) {
            grid.innerHTML = `
                <p style="color: var(--text-muted); text-align: center; padding: 2rem; grid-column: 1/-1;">
                    ${filter === 'all' ? 'Generated assets will appear here.' : `No ${filter} items.`}
                </p>
            `;
            return;
        }

        grid.innerHTML = filtered.map(item => `
            <div class="storage-item" data-id="${item.id}">
                <div class="storage-preview">
                    ${this.renderPreview(item)}
                </div>
                <div class="storage-meta">
                    <div class="item-name">${item.name}</div>
                    <div class="item-size">${this.formatSize(item.size)}</div>
                </div>
                <div class="storage-item-actions">
                    <button class="btn btn-secondary" onclick="NeoStorage.downloadItem(${item.id})">Download</button>
                    <button class="btn btn-secondary" onclick="NeoStorage.deleteItem(${item.id})">Delete</button>
                </div>
            </div>
        `).join('');
    },

    renderPreview(item) {
        if (item.type === 'image' && item.url) {
            return `<img src="${item.url}" alt="${item.name}">`;
        } else if (item.type === 'audio') {
            return `<span style="font-size: 2rem;">&#127925;</span>`;
        } else {
            return `<span style="font-size: 2rem;">&#128196;</span>`;
        }
    },

    filterItems(filter) {
        this.renderItems(filter);
    },

    updateStats() {
        document.getElementById('storage-count').textContent = this.items.length;

        const totalSize = this.items.reduce((sum, item) => sum + (item.size || 0), 0);
        document.getElementById('storage-size').textContent = this.formatSize(totalSize);
    },

    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    },

    downloadItem(id) {
        const item = this.items.find(i => i.id === id);
        if (!item) return;

        if (item.url) {
            const a = document.createElement('a');
            a.href = item.url;
            a.download = item.name;
            a.click();
        } else if (item.data) {
            const blob = new Blob([item.data], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = item.name;
            a.click();
            URL.revokeObjectURL(url);
        }
    },

    deleteItem(id) {
        this.items = this.items.filter(i => i.id !== id);
        localStorage.setItem('neosai_storage', JSON.stringify(this.items));
        this.renderItems();
        this.updateStats();
    },

    clearAll() {
        this.items = [];
        localStorage.removeItem('neosai_storage');
        this.renderItems();
        this.updateStats();
    },

    exportAll() {
        const data = JSON.stringify(this.items, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `neosai-export-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};
