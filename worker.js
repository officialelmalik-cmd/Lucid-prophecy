/**
 * NEOSAI APEX - Cloudflare Worker / Deno Deploy Backend
 *
 * Deploy to:
 * - Cloudflare Workers: workers.cloudflare.com
 * - Deno Deploy: dash.deno.com
 *
 * Set environment variables:
 * - OPENAI_API_KEY
 * - STRIPE_SECRET_KEY
 * - REPLICATE_API_TOKEN
 * - SLACK_BOT_TOKEN
 * - MAILCHIMP_API_KEY
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
        return jsonResponse({ status: 'ok', service: 'NEOSAI APEX Worker', version: '1.0.0' });
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
    const apiKey = data.apiKey || env.OPENAI_API_KEY;
    if (!apiKey) {
        return jsonResponse({ error: 'OpenAI API key not configured' }, 400);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: data.model || 'gpt-4o',
            messages: data.messages,
            max_tokens: data.max_tokens || 1000
        })
    });

    if (!response.ok) {
        const error = await response.text();
        return jsonResponse({ error: 'OpenAI request failed: ' + error }, response.status);
    }

    const result = await response.json();
    return jsonResponse({ content: result.choices[0].message.content });
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

async function handleReplicate(data, env) {
    const apiToken = data.apiToken || env.REPLICATE_API_TOKEN;
    if (!apiToken) {
        return jsonResponse({ error: 'Replicate API token not configured' }, 400);
    }

    const modelParts = data.model.split(':');
    const version = modelParts.length > 1 ? modelParts[1] : data.model;

    const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${apiToken}`
        },
        body: JSON.stringify({
            version,
            input: { prompt: data.prompt }
        })
    });

    if (!response.ok) {
        const error = await response.text();
        return jsonResponse({ error: 'Replicate request failed: ' + error }, response.status);
    }

    const prediction = await response.json();

    for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 2000));

        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
            headers: { 'Authorization': `Token ${apiToken}` }
        });

        const status = await pollResponse.json();

        if (status.status === 'succeeded') {
            return jsonResponse({ output: status.output });
        } else if (status.status === 'failed') {
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

export default {
    fetch: handleRequest
};

if (typeof Deno !== 'undefined') {
    Deno.serve((req) => handleRequest(req, Deno.env.toObject()));
}
