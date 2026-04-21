# NEOSAI APEX

Unified platform for AI, commerce, media generation, and automated communications.

## Features

- **AI Assistant** - GPT-powered text generation via OpenAI
- **Media Studio** - Image/audio generation via Replicate (SDXL, Flux, MusicGen)
- **Commerce Hub** - Stripe payments, subscriptions, checkout flows
- **Slack Integration** - Automated messaging and notifications
- **Email Campaigns** - Mailchimp automation for newsletters
- **Analytics** - Usage metrics and API health monitoring
- **Workflows** - Chain modules together for automation pipelines
- **Storage** - Manage generated assets and exports

## Quick Start

1. **Deploy the frontend** to GitHub Pages, Netlify, or Vercel
2. **Deploy the worker** to Cloudflare Workers or Deno Deploy
3. **Configure API keys** via the in-app settings modal

## Deployment

### GitHub Pages
Already configured via CNAME (`www.sai8.com`)

### Netlify
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

### Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Cloudflare Worker
1. Go to [workers.cloudflare.com](https://workers.cloudflare.com)
2. Create new Worker
3. Paste contents of `worker.js`
4. Set environment variables
5. Deploy

### Deno Deploy
1. Go to [dash.deno.com](https://dash.deno.com)
2. Create new project
3. Link to this repo or paste `worker.js`
4. Set environment variables
5. Deploy

## Environment Variables (Worker)

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `REPLICATE_API_TOKEN` | Replicate API token |
| `SLACK_BOT_TOKEN` | Slack bot token |
| `MAILCHIMP_API_KEY` | Mailchimp API key |

## API Keys Setup

All API keys can be configured directly in the app via the settings gear icon. Keys are stored locally in your browser.

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
├── css/styles.css      # Styling
├── js/
│   ├── config.js       # Configuration management
│   ├── app.js          # Main application
│   └── modules/        # 8 feature modules
├── worker.js           # Backend (Cloudflare/Deno)
├── netlify.toml        # Netlify config
├── vercel.json         # Vercel config
├── _config.yml         # GitHub Pages config
└── assets/             # Icons and images
```

## License

MIT
