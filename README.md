# NEOSAI APEX Platform v3.0

Complete AI ecosystem for game creation, voice synthesis, social media, commerce, and automation.

## Live Platform

| Link | Description |
|------|-------------|
| **https://www.sai8.com** | Production Frontend (GitHub Pages) |
| **Worker URL** | Set in Settings modal after deploying |

## 14 Modules

### AI Intelligence
- **AI Assistant** - GPT-4 Turbo, GPT-4o, Claude Sonnet 4.6, Claude 3 Opus
- **Voice Studio** - ElevenLabs (9 voices) + OpenAI TTS (6 voices)
- **Tools Hub** - SEO analyzer, translator, summarizer, image AI, doc generator

### Creative Suite
- **Media Studio** - Flux Pro, Ideogram v2, SD3, video generation, upscaling
- **Game Studio** - Full game creation: concepts, assets, code, music, levels
- **Asset Storage** - Manage generated assets and exports

### Business Tools
- **Commerce Hub** - Stripe payments, subscriptions, payment links
- **Social Media** - Multi-platform content, calendars, hashtags, analytics
- **Analytics** - Real-time usage tracking and API health
- **Workflows** - Multi-step AI automation pipelines

### Communications
- **Slack / Stilla** - Bot history, messaging, channels, search, export
- **Email Campaigns** - Mailchimp automation and subscriber management

## Quick Deploy

### Frontend (GitHub Pages)
Already configured - enable Pages in repo Settings > Pages > main branch.

### Backend (Cloudflare Workers)
```bash
npm install -g wrangler
wrangler login
wrangler deploy

# Set secrets
wrangler secret put OPENAI_API_KEY
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put REPLICATE_API_TOKEN
wrangler secret put SLACK_BOT_TOKEN
wrangler secret put ELEVENLABS_API_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put MAILCHIMP_API_KEY
```

### Docker
```bash
docker-compose up -d                              # Frontend only
docker-compose --profile with-worker up -d        # Frontend + Deno worker
```

## Environment Variables

| Variable | Service |
|----------|---------|
| `OPENAI_API_KEY` | OpenAI GPT-4 |
| `ANTHROPIC_API_KEY` | Claude AI |
| `REPLICATE_API_TOKEN` | Media generation |
| `ELEVENLABS_API_KEY` | Voice synthesis |
| `SLACK_BOT_TOKEN` | Slack bot |
| `STRIPE_SECRET_KEY` | Payments |
| `MAILCHIMP_API_KEY` | Email campaigns |

## File Structure

```
├── index.html              # Main dashboard
├── css/styles.css          # Premium UI
├── js/
│   ├── app.js              # Main app
│   ├── config.js           # API key management
│   └── modules/            # 14 feature modules
├── worker.js               # Backend (Cloudflare/Deno)
├── wrangler.toml           # Cloudflare config
├── docker-compose.yml      # Docker config
├── .github/workflows/      # CI/CD
└── manifest.json           # PWA config
```

## License

MIT
