# NEOSAI APEX Platform v2.0

Enterprise-grade unified platform for AI, Commerce, Media Generation, and Automated Communications.

## Features

### Core Modules
- **AI Assistant** - Multi-model support (GPT-4 Turbo, Claude 3, Llama 3)
- **Media Studio** - Premium image/video generation (SDXL, Flux Pro, Midjourney-style)
- **Commerce Hub** - Stripe payments, subscriptions, checkout flows
- **Slack Integration** - Bot history, messaging, search, channels
- **Email Campaigns** - Mailchimp automation for newsletters
- **Analytics** - Real-time metrics and API health monitoring
- **Workflows** - Chain modules together for automation pipelines
- **Storage** - Asset management and exports

### v2.0 Upgrades
- **PWA Support** - Installable app with offline capabilities
- **Slack Bot History** - Full conversation retrieval and export (Stilla)
- **CI/CD Pipeline** - Automated GitHub Actions deployment
- **Docker Support** - Containerized deployment
- **Premium UI** - Glass morphism, animations, dark theme

## Quick Start

### Option 1: GitHub Pages (Frontend)
```bash
# Already configured via CNAME (www.sai8.com)
# Enable Pages in repo Settings > Pages
```

### Option 2: Docker
```bash
docker-compose up -d
# Access at http://localhost:3000
```

### Option 3: Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### Option 4: Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Backend Deployment

### Cloudflare Workers
```bash
# Install wrangler
npm install -g wrangler

# Login and deploy
wrangler login
wrangler deploy

# Set secrets
wrangler secret put OPENAI_API_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put SLACK_BOT_TOKEN
wrangler secret put REPLICATE_API_TOKEN
wrangler secret put MAILCHIMP_API_KEY
```

### Deno Deploy
1. Go to [dash.deno.com](https://dash.deno.com)
2. Create new project
3. Link to this repo or paste `worker.js`
4. Set environment variables
5. Deploy

## CI/CD (GitHub Actions)

Add these secrets to your repository:
- `CF_API_TOKEN` - Cloudflare API token
- `CF_ACCOUNT_ID` - Cloudflare account ID
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `REPLICATE_API_TOKEN`
- `SLACK_BOT_TOKEN`
- `MAILCHIMP_API_KEY`

Push to `main` to auto-deploy.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key (GPT-4) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `REPLICATE_API_TOKEN` | Replicate API token |
| `SLACK_BOT_TOKEN` | Slack bot token (xoxb-) |
| `MAILCHIMP_API_KEY` | Mailchimp API key |

## API Keys Setup

| Service | Get Key |
|---------|---------|
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) |
| Stripe | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| Replicate | [replicate.com/account](https://replicate.com/account) |
| Slack | [api.slack.com/apps](https://api.slack.com/apps) |
| Mailchimp | [mailchimp.com/developer](https://mailchimp.com/developer/) |

## File Structure

```
/
├── index.html          # Main dashboard
├── css/styles.css      # Premium styling
├── js/
│   ├── config.js       # Configuration management
│   ├── app.js          # Main application
│   └── modules/        # 8 feature modules
├── worker.js           # Backend (Cloudflare/Deno)
├── sw.js               # Service worker (PWA)
├── manifest.json       # PWA manifest
├── wrangler.toml       # Cloudflare config
├── netlify.toml        # Netlify config
├── vercel.json         # Vercel config
├── Dockerfile          # Docker build
├── docker-compose.yml  # Docker compose
├── nginx.conf          # Nginx config
└── .github/workflows/  # CI/CD
```

## Slack Bot History (Stilla)

The platform includes full Slack conversation history retrieval:
- View messages from any accessible channel
- Bot/user message differentiation
- Timestamp display
- Load more pagination
- Export to JSON

## PWA Features

- Installable on desktop and mobile
- Offline-capable with service worker
- Fast load times with caching
- Native-like experience

## License

MIT
