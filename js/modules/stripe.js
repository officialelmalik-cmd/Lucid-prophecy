const NeoStripe = {
    render(container) {
        if (!NeoConfig.isConfigured('stripe')) {
            container.innerHTML = `
                <div class="workspace-placeholder">
                    <p>Stripe not configured. Add your Publishable Key and Price ID.</p>
                    <button class="btn btn-primary" onclick="document.getElementById('openConfig').click()">
                        Configure Stripe
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="stripe-dashboard">
                <div class="stripe-section">
                    <h3>Quick Checkout</h3>
                    <p>Generate a checkout session for your configured product.</p>
                    <div class="stripe-actions">
                        <button class="btn btn-primary" id="stripe-checkout">
                            Create Checkout Session
                        </button>
                    </div>
                </div>

                <div class="stripe-section">
                    <h3>Payment Links</h3>
                    <p>Generate shareable payment links for products.</p>
                    <input type="text" class="chat-input" id="stripe-amount" placeholder="Amount (e.g., 29.99)">
                    <input type="text" class="chat-input" id="stripe-desc" placeholder="Description" style="margin-top: 0.5rem;">
                    <button class="btn btn-primary" id="stripe-link" style="margin-top: 0.75rem;">
                        Generate Link
                    </button>
                </div>

                <div class="stripe-section">
                    <h3>Recent Activity</h3>
                    <div id="stripe-activity">
                        <p style="color: var(--text-muted);">Connect Worker to view activity.</p>
                    </div>
                </div>
            </div>
            <style>
                .stripe-dashboard { display: grid; gap: 1.5rem; }
                .stripe-section {
                    background: var(--bg-primary);
                    padding: 1.25rem;
                    border-radius: 8px;
                }
                .stripe-section h3 { margin-bottom: 0.5rem; }
                .stripe-section p { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; }
                .stripe-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
            </style>
        `;

        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('stripe-checkout').addEventListener('click', () => {
            this.createCheckout();
        });

        document.getElementById('stripe-link').addEventListener('click', () => {
            this.generateLink();
        });
    },

    async createCheckout() {
        if (!NeoConfig.hasWorker()) {
            NeoApp.showNotification('Worker URL required for Stripe checkout', 'error');
            return;
        }

        try {
            const result = await NeoApp.callWorker('stripe_checkout', {
                priceId: NeoConfig.get('stripe_price'),
                successUrl: window.location.href + '?success=true',
                cancelUrl: window.location.href + '?canceled=true'
            });

            if (result.url) {
                window.location.href = result.url;
            }
        } catch (e) {
            NeoApp.showNotification(e.message, 'error');
        }
    },

    async generateLink() {
        const amount = document.getElementById('stripe-amount').value;
        const desc = document.getElementById('stripe-desc').value;

        if (!amount) {
            NeoApp.showNotification('Please enter an amount', 'error');
            return;
        }

        if (!NeoConfig.hasWorker()) {
            NeoApp.showNotification('Worker URL required for payment links', 'error');
            return;
        }

        try {
            const result = await NeoApp.callWorker('stripe_payment_link', {
                amount: Math.round(parseFloat(amount) * 100),
                description: desc || 'Payment'
            });

            if (result.url) {
                await navigator.clipboard.writeText(result.url);
                NeoApp.showNotification('Payment link copied to clipboard!', 'success');
            }
        } catch (e) {
            NeoApp.showNotification(e.message, 'error');
        }
    }
};
