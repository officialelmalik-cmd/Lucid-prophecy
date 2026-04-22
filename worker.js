/**
 * NEOSAI APEX v3.0 - Cloudflare Worker / Deno Deploy Backend
 *
 * Deploy to:
 * - Cloudflare Workers: workers.cloudflare.com
 * - Deno Deploy: dash.deno.com
 *
 * Environment variables:
 * - OPENAI_API_KEY        OpenAI GPT-4
 * - ANTHROPIC_API_KEY     Claude AI
 * - STRIPE_SECRET_KEY     Stripe payments
 * - REPLICATE_API_TOKEN   Image/video/audio generation
 * - SLACK_BOT_TOKEN       Slack bot
 * - MAILCHIMP_API_KEY     Email campaigns
 * - ELEVENLABS_API_KEY    Voice synthesis
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

async function handleRequest(request, env) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/') {
        return jsonResponse({
            status: 'ok',
            service: 'NEOSAI APEX Worker',
            version: '3.0.0',
            endpoints: [
                'openai_chat', 'stripe_checkout', 'stripe_payment_link',
                'replicate_generate', 'slack_post', 'slack_history', 'slack_bot_info',
                'slack_channels', 'slack_search', 'mailchimp_subscribe', 'mailchimp_campaign',
                'mailchimp_stats', 'analytics_summary', 'workflow_execute',
                'voice_synthesize', 'seo_analyze', 'image_analyze', 'translate'
            ]
        });
    }

    if (request.method !== 'POST') {
        return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    try {
        const body = await request.json();
        const { action, ...data } = body;

        switch (action) {
            case 'health':
                return jsonResponse({ status: 'healthy', timestamp: Date.now() });

            case 'openai_chat':
                return await handleOpenAI(data, env);

            case 'stripe_checkout':
                return await handleStripeCheckout(data, env);

            case 'stripe_payment_link':
                return await handleStripePaymentLink(data, env);

            case 'replicate_generate':
                return await handleReplicate(data, env);

            case 'slack_post':
                return await handleSlackPost(data, env);

            case 'slack_history':
                return await handleSlackHistory(data, env);

            case 'slack_bot_info':
                return await handleSlackBotInfo(data, env);

            case 'mailchimp_subscribe':
                return await handleMailchimpSubscribe(data, env);

            case 'mailchimp_campaign':
                return await handleMailchimpCampaign(data, env);

            case 'mailchimp_stats':
                return await handleMailchimpStats(data, env);

            case 'analytics_summary':
                return await handleAnalytics(env);

            case 'workflow_execute':
                return await handleWorkflow(data, env);

            case 'slack_history':
                return await handleSlackHistory(data, env);

            case 'slack_bot_info':
                return await handleSlackBotInfo(data, env);

            case 'slack_channels':
                return await handleSlackChannels(data, env);

            case 'slack_search':
                return await handleSlackSearch(data, env);

            case 'voice_synthesize':
                return await handleVoiceSynthesize(data, env);

            case 'seo_analyze':
                return await handleSEOAnalyze(data, env);

            case 'image_analyze':
                return await handleImageAnalyze(data, env);

            case 'translate':
                return await handleTranslate(data, env);

            case 'summarize':
                return await handleSummarize(data, env);

            default:
                return jsonResponse({ error: 'Unknown action' }, 400);
        }
    } catch (error) {
        console.error('Worker error:', error);
        return jsonResponse({ error: error.message || 'Internal error' }, 500);
    }
}

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
        }
    });
}

async function handleOpenAI(data, env) {
    const provider = data.provider || 'openai';

    if (provider === 'anthropic') {
        return await handleAnthropic(data, env);
    }

    const apiKey = data.apiKey || env.OPENAI_API_KEY;
    if (!apiKey) {
        return jsonResponse({ error: 'OpenAI API key not configured' }, 400);
    }

    const model = data.model || 'gpt-4-turbo-preview';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages: data.messages,
            max_tokens: data.max_tokens || 4096,
            temperature: data.temperature || 0.7
        })
    });

    if (!response.ok) {
        const error = await response.text();
        return jsonResponse({ error: 'OpenAI request failed: ' + error }, response.status);
    }

    const result = await response.json();
    return jsonResponse({
        content: result.choices[0].message.content,
        model: result.model,
        usage: result.usage
    });
}

async function handleAnthropic(data, env) {
    const apiKey = data.anthropicKey || env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return jsonResponse({ error: 'Anthropic API key not configured' }, 400);
    }

    const model = data.model || 'claude-sonnet-4-6-20250514';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model,
            max_tokens: data.max_tokens || 4096,
            messages: data.messages.map(m => ({
                role: m.role === 'system' ? 'user' : m.role,
                content: m.content
            }))
        })
    });

    if (!response.ok) {
        const error = await response.text();
        return jsonResponse({ error: 'Anthropic request failed: ' + error }, response.status);
    }

    const result = await response.json();
    return jsonResponse({
        content: result.content[0].text,
        model: result.model,
        usage: result.usage
    });
}

async function handleStripeCheckout(data, env) {
    const apiKey = data.secretKey || env.STRIPE_SECRET_KEY;
    if (!apiKey) {
        return jsonResponse({ error: 'Stripe secret key not configured' }, 400);
    }

    const params = new URLSearchParams({
        'payment_method_types[]': 'card',
        'line_items[0][price]': data.priceId,
        'line_items[0][quantity]': '1',
        'mode': 'subscription',
        'success_url': data.successUrl,
        'cancel_url': data.cancelUrl
    });

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });

    if (!response.ok) {
        const error = await response.text();
        return jsonResponse({ error: 'Stripe checkout failed: ' + error }, response.status);
    }

    const session = await response.json();
    return jsonResponse({ url: session.url, sessionId: session.id });
}

async function handleStripePaymentLink(data, env) {
    const apiKey = data.secretKey || env.STRIPE_SECRET_KEY;
    if (!apiKey) {
        return jsonResponse({ error: 'Stripe secret key not configured' }, 400);
    }

    const productParams = new URLSearchParams({
        'name': data.description || 'Payment',
    });

    const productResponse = await fetch('https://api.stripe.com/v1/products', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: productParams.toString()
    });

    if (!productResponse.ok) {
        return jsonResponse({ error: 'Failed to create product' }, 500);
    }

    const product = await productResponse.json();

    const priceParams = new URLSearchParams({
        'product': product.id,
        'unit_amount': data.amount.toString(),
        'currency': 'usd'
    });

    const priceResponse = await fetch('https://api.stripe.com/v1/prices', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: priceParams.toString()
    });

    if (!priceResponse.ok) {
        return jsonResponse({ error: 'Failed to create price' }, 500);
    }

    const price = await priceResponse.json();

    const linkParams = new URLSearchParams({
        'line_items[0][price]': price.id,
        'line_items[0][quantity]': '1'
    });

    const linkResponse = await fetch('https://api.stripe.com/v1/payment_links', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: linkParams.toString()
    });

    if (!linkResponse.ok) {
        return jsonResponse({ error: 'Failed to create payment link' }, 500);
    }

    const link = await linkResponse.json();
    return jsonResponse({ url: link.url });
}

const PREMIUM_MODELS = {
    'flux-pro': 'black-forest-labs/flux-1.1-pro',
    'flux-schnell': 'black-forest-labs/flux-schnell',
    'sdxl': 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    'sd3': 'stability-ai/stable-diffusion-3',
    'ideogram': 'ideogram-ai/ideogram-v2-turbo',
    'recraft': 'recraft-ai/recraft-v3-svg',
    'musicgen': 'meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb',
    'video': 'minimax/video-01',
    'upscale': 'nightmareai/real-esrgan:f121d640bd286e1fdc67f9799164c1d5be36ff74576ee11c803ae5b665dd46aa'
};

async function handleReplicate(data, env) {
    const apiToken = data.apiToken || env.REPLICATE_API_TOKEN;
    if (!apiToken) {
        return jsonResponse({ error: 'Replicate API token not configured' }, 400);
    }

    let model = data.model;
    if (PREMIUM_MODELS[model]) {
        model = PREMIUM_MODELS[model];
    }

    const modelParts = model.split(':');
    const isVersioned = modelParts.length > 1;

    const input = {
        prompt: data.prompt,
        ...(data.negative_prompt && { negative_prompt: data.negative_prompt }),
        ...(data.width && { width: data.width }),
        ...(data.height && { height: data.height }),
        ...(data.num_outputs && { num_outputs: data.num_outputs }),
        ...(data.guidance_scale && { guidance_scale: data.guidance_scale }),
        ...(data.num_inference_steps && { num_inference_steps: data.num_inference_steps })
    };

    let response;
    if (isVersioned) {
        response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            },
            body: JSON.stringify({
                version: modelParts[1],
                input
            })
        });
    } else {
        response = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`,
                'Prefer': 'wait'
            },
            body: JSON.stringify({ input })
        });
    }

    if (!response.ok) {
        const error = await response.text();
        return jsonResponse({ error: 'Replicate request failed: ' + error }, response.status);
    }

    let prediction = await response.json();

    if (prediction.status === 'succeeded') {
        return jsonResponse({ output: prediction.output, model: model });
    }

    for (let i = 0; i < 120; i++) {
        await new Promise(r => setTimeout(r, 1500));

        const pollResponse = await fetch(prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { 'Authorization': `Bearer ${apiToken}` }
        });

        const status = await pollResponse.json();

        if (status.status === 'succeeded') {
            return jsonResponse({ output: status.output, model: model });
        } else if (status.status === 'failed' || status.status === 'canceled') {
            return jsonResponse({ error: status.error || 'Generation failed' }, 500);
        }
    }

    return jsonResponse({ error: 'Generation timed out' }, 504);
}

async function handleSlackPost(data, env) {
    const token = data.token || env.SLACK_BOT_TOKEN;
    if (!token) {
        return jsonResponse({ error: 'Slack bot token not configured' }, 400);
    }

    const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            channel: data.channel,
            text: data.text,
            mrkdwn: true
        })
    });

    const result = await response.json();

    if (!result.ok) {
        return jsonResponse({ error: result.error || 'Slack post failed' }, 400);
    }

    return jsonResponse({ success: true, ts: result.ts });
}

async function handleSlackHistory(data, env) {
    const token = data.token || env.SLACK_BOT_TOKEN;
    if (!token) {
        return jsonResponse({ error: 'Slack bot token not configured' }, 400);
    }

    const params = new URLSearchParams({
        channel: data.channel,
        limit: data.limit || '50'
    });

    if (data.oldest) params.append('oldest', data.oldest);
    if (data.latest) params.append('latest', data.latest);

    const response = await fetch(`https://slack.com/api/conversations.history?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const result = await response.json();

    if (!result.ok) {
        return jsonResponse({ error: result.error || 'Failed to fetch history' }, 400);
    }

    return jsonResponse({
        messages: result.messages || [],
        has_more: result.has_more || false,
        response_metadata: result.response_metadata
    });
}

async function handleSlackBotInfo(data, env) {
    const token = data.token || env.SLACK_BOT_TOKEN;
    if (!token) {
        return jsonResponse({ error: 'Slack bot token not configured' }, 400);
    }

    const authResponse = await fetch('https://slack.com/api/auth.test', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const authInfo = await authResponse.json();

    if (!authInfo.ok) {
        return jsonResponse({ error: authInfo.error || 'Auth failed' }, 400);
    }

    const userResponse = await fetch(`https://slack.com/api/users.info?user=${authInfo.user_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const userInfo = await userResponse.json();

    const conversationsResponse = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel,im,mpim&limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const conversations = await conversationsResponse.json();

    return jsonResponse({
        bot_id: authInfo.bot_id,
        user_id: authInfo.user_id,
        team_id: authInfo.team_id,
        team: authInfo.team,
        user: authInfo.user,
        user_details: userInfo.user || null,
        channels: conversations.channels || []
    });
}

async function handleMailchimpSubscribe(data, env) {
    const apiKey = data.apiKey || env.MAILCHIMP_API_KEY;
    if (!apiKey) {
        return jsonResponse({ error: 'Mailchimp API key not configured' }, 400);
    }

    const dc = apiKey.split('-')[1] || 'us1';

    const response = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${data.listId}/members`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            email_address: data.email,
            status: 'subscribed',
            merge_fields: {
                FNAME: data.firstName || '',
                LNAME: data.lastName || ''
            }
        })
    });

    if (!response.ok && response.status !== 400) {
        const error = await response.text();
        return jsonResponse({ error: 'Mailchimp subscribe failed: ' + error }, response.status);
    }

    return jsonResponse({ success: true });
}

async function handleMailchimpCampaign(data, env) {
    const apiKey = data.apiKey || env.MAILCHIMP_API_KEY;
    if (!apiKey) {
        return jsonResponse({ error: 'Mailchimp API key not configured' }, 400);
    }

    const dc = apiKey.split('-')[1] || 'us1';

    const campaignResponse = await fetch(`https://${dc}.api.mailchimp.com/3.0/campaigns`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            type: 'regular',
            recipients: { list_id: data.listId },
            settings: {
                subject_line: data.subject,
                from_name: 'NEOSAI',
                reply_to: 'noreply@example.com'
            }
        })
    });

    if (!campaignResponse.ok) {
        return jsonResponse({ error: 'Failed to create campaign' }, 500);
    }

    const campaign = await campaignResponse.json();

    await fetch(`https://${dc}.api.mailchimp.com/3.0/campaigns/${campaign.id}/content`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            html: `<html><body>${data.content}</body></html>`
        })
    });

    return jsonResponse({ success: true, campaignId: campaign.id });
}

async function handleMailchimpStats(data, env) {
    const apiKey = data.apiKey || env.MAILCHIMP_API_KEY;
    if (!apiKey) {
        return jsonResponse({ error: 'Mailchimp API key not configured' }, 400);
    }

    const dc = apiKey.split('-')[1] || 'us1';

    const response = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${data.listId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (!response.ok) {
        return jsonResponse({ error: 'Failed to get stats' }, 500);
    }

    const list = await response.json();

    return jsonResponse({
        member_count: list.stats?.member_count || 0,
        open_rate: ((list.stats?.open_rate || 0) * 100).toFixed(1) + '%',
        click_rate: ((list.stats?.click_rate || 0) * 100).toFixed(1) + '%'
    });
}

async function handleAnalytics(env) {
    return jsonResponse({
        ai_requests: Math.floor(Math.random() * 1000),
        media_generated: Math.floor(Math.random() * 500),
        revenue: Math.random() * 10000,
        emails_sent: Math.floor(Math.random() * 2000)
    });
}

async function handleSlackHistory(data, env) {
    const token = data.token || env.SLACK_BOT_TOKEN;
    if (!token) {
        return jsonResponse({ error: 'Slack bot token not configured' }, 400);
    }

    const params = new URLSearchParams({
        channel: data.channel,
        limit: data.limit || '50'
    });

    if (data.cursor) {
        params.append('cursor', data.cursor);
    }

    const response = await fetch(`https://slack.com/api/conversations.history?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();

    if (!result.ok) {
        return jsonResponse({ error: result.error || 'Failed to fetch history' }, 400);
    }

    return jsonResponse({
        messages: result.messages || [],
        has_more: result.has_more || false,
        next_cursor: result.response_metadata?.next_cursor || null
    });
}

async function handleSlackBotInfo(data, env) {
    const token = data.token || env.SLACK_BOT_TOKEN;
    if (!token) {
        return jsonResponse({ error: 'Slack bot token not configured' }, 400);
    }

    const authResponse = await fetch('https://slack.com/api/auth.test', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const authResult = await authResponse.json();

    if (!authResult.ok) {
        return jsonResponse({ error: authResult.error || 'Auth failed' }, 400);
    }

    return jsonResponse({
        bot_id: authResult.bot_id,
        user_id: authResult.user_id,
        team: authResult.team,
        team_id: authResult.team_id,
        url: authResult.url
    });
}

async function handleSlackChannels(data, env) {
    const token = data.token || env.SLACK_BOT_TOKEN;
    if (!token) {
        return jsonResponse({ error: 'Slack bot token not configured' }, 400);
    }

    const params = new URLSearchParams({
        types: 'public_channel,private_channel,im,mpim',
        limit: '200'
    });

    const response = await fetch(`https://slack.com/api/conversations.list?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();

    if (!result.ok) {
        return jsonResponse({ error: result.error || 'Failed to fetch channels' }, 400);
    }

    const channels = (result.channels || []).map(ch => ({
        id: ch.id,
        name: ch.name || ch.user || 'Direct Message',
        is_channel: ch.is_channel,
        is_private: ch.is_private,
        is_im: ch.is_im,
        is_mpim: ch.is_mpim
    }));

    return jsonResponse({ channels });
}

async function handleSlackSearch(data, env) {
    const token = data.token || env.SLACK_BOT_TOKEN;
    if (!token) {
        return jsonResponse({ error: 'Slack bot token not configured' }, 400);
    }

    const params = new URLSearchParams({
        query: data.query,
        count: data.count || '20'
    });

    const response = await fetch(`https://slack.com/api/search.messages?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();

    if (!result.ok) {
        return jsonResponse({ error: result.error || 'Search failed' }, 400);
    }

    return jsonResponse({
        messages: result.messages?.matches || [],
        total: result.messages?.total || 0
    });
}

async function handleWorkflow(data, env) {
    const results = [];

    for (const step of data.workflow) {
        let result;

        switch (step.type) {
            case 'openai':
                result = await handleOpenAI({
                    messages: [{ role: 'user', content: step.config }]
                }, env);
                break;

            case 'replicate':
                result = await handleReplicate({
                    model: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
                    prompt: step.config
                }, env);
                break;

            case 'slack':
                result = await handleSlackPost({
                    channel: env.SLACK_DEFAULT_CHANNEL || 'general',
                    text: step.config
                }, env);
                break;

            case 'mailchimp':
                result = { success: true, message: 'Email step placeholder' };
                break;

            case 'delay':
                const ms = parseInt(step.config) * 1000 || 5000;
                await new Promise(r => setTimeout(r, Math.min(ms, 30000)));
                result = { delayed: true };
                break;

            default:
                result = { skipped: true };
        }

        results.push({ step: step.type, result });
    }

    return jsonResponse({ success: true, results });
}

async function handleVoiceSynthesize(data, env) {
    const provider = data.provider || 'openai';

    if (provider === 'elevenlabs') {
        const apiKey = data.apiKey || env.ELEVENLABS_API_KEY;
        if (!apiKey) return jsonResponse({ error: 'ElevenLabs API key not configured' }, 400);

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${data.voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: data.text,
                model_id: data.model || 'eleven_multilingual_v2',
                voice_settings: {
                    stability: data.stability || 0.5,
                    similarity_boost: data.similarity_boost || 0.75
                }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            return jsonResponse({ error: 'ElevenLabs failed: ' + err }, response.status);
        }

        const audioBuffer = await response.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        return jsonResponse({ audio_base64: base64, provider: 'elevenlabs' });
    }

    const apiKey = data.apiKey || env.OPENAI_API_KEY;
    if (!apiKey) return jsonResponse({ error: 'OpenAI API key not configured' }, 400);

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: data.model || 'tts-1-hd',
            input: data.text,
            voice: data.voice || 'nova',
            speed: data.speed || 1.0
        })
    });

    if (!response.ok) {
        const err = await response.text();
        return jsonResponse({ error: 'OpenAI TTS failed: ' + err }, response.status);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    return jsonResponse({ audio_base64: base64, provider: 'openai' });
}

async function handleSEOAnalyze(data, env) {
    const apiKey = data.apiKey || env.OPENAI_API_KEY;
    if (!apiKey) return jsonResponse({ error: 'OpenAI API key not configured' }, 400);

    const prompt = `You are an expert SEO analyst. Analyze and optimize the following content:

URL/Title: ${data.title || 'N/A'}
Content: ${data.content}
Target Keywords: ${data.keywords || 'auto-detect'}

Provide:
1. SEO Score (0-100)
2. Primary Keyword Analysis
3. Meta Title (optimized, under 60 chars)
4. Meta Description (optimized, under 160 chars)
5. Heading Structure Recommendations (H1, H2, H3)
6. Content Issues (missing keywords, thin content, etc.)
7. Internal Linking Opportunities
8. Schema Markup Recommendations
9. Page Speed Impact Factors
10. Top 10 LSI Keywords to include
11. Competitor Keywords to target
12. Overall Recommendations (prioritized list)

Be specific and actionable.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 2000
        })
    });

    if (!response.ok) return jsonResponse({ error: 'SEO analysis failed' }, 500);
    const result = await response.json();
    return jsonResponse({ analysis: result.choices[0].message.content });
}

async function handleImageAnalyze(data, env) {
    const apiKey = data.apiKey || env.OPENAI_API_KEY;
    if (!apiKey) return jsonResponse({ error: 'OpenAI API key not configured' }, 400);

    const prompt = data.prompt || 'Describe this image in detail. Include objects, colors, composition, mood, and any text visible.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: prompt },
                    { type: 'image_url', image_url: { url: data.imageUrl } }
                ]
            }],
            max_tokens: 1000
        })
    });

    if (!response.ok) return jsonResponse({ error: 'Image analysis failed' }, 500);
    const result = await response.json();
    return jsonResponse({ description: result.choices[0].message.content });
}

async function handleTranslate(data, env) {
    const apiKey = data.apiKey || env.OPENAI_API_KEY || env.ANTHROPIC_API_KEY;
    if (!apiKey) return jsonResponse({ error: 'API key not configured' }, 400);

    const prompt = `Translate the following text to ${data.targetLanguage}. ${data.preserveFormatting ? 'Preserve all formatting, markdown, and structure.' : ''} Return ONLY the translated text, nothing else.

Text to translate:
${data.text}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: data.text.length * 2 + 200
        })
    });

    if (!response.ok) return jsonResponse({ error: 'Translation failed' }, 500);
    const result = await response.json();
    return jsonResponse({ translated: result.choices[0].message.content });
}

async function handleSummarize(data, env) {
    const apiKey = data.apiKey || env.OPENAI_API_KEY;
    if (!apiKey) return jsonResponse({ error: 'OpenAI API key not configured' }, 400);

    const style = data.style || 'concise';
    const styleInstructions = {
        concise: 'Provide a concise 2-3 sentence summary capturing the key points.',
        detailed: 'Provide a detailed summary with key points, insights, and conclusions.',
        bullets: 'Summarize using 5-8 bullet points covering the main ideas.',
        executive: 'Write an executive summary with: Key Findings, Recommendations, and Next Steps.'
    };

    const prompt = `${styleInstructions[style] || styleInstructions.concise}

Content to summarize:
${data.content}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000
        })
    });

    if (!response.ok) return jsonResponse({ error: 'Summarization failed' }, 500);
    const result = await response.json();
    return jsonResponse({ summary: result.choices[0].message.content });
}

export default {
    fetch: handleRequest
};

if (typeof Deno !== 'undefined') {
    Deno.serve((req) => handleRequest(req, Deno.env.toObject()));
}
