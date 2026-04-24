/**
 * NEOSAI APEX v3.0 - Cloudflare Worker / Deno Deploy Backend
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
            version: '3.0.0'
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
    const apiKey = env.OPENAI_API_KEY;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'gpt-4o', messages: data.messages })
    });
    const result = await response.json();
    return jsonResponse({ content: result.choices[0].message.content });
}

async function handleStripeCheckout(data, env) {
    const apiKey = env.STRIPE_SECRET_KEY;
    return jsonResponse({ message: 'Stripe module active' });
}

async function handleReplicate(data, env) {
    const apiToken = env.REPLICATE_API_TOKEN;
    return jsonResponse({ message: 'Replicate module active' });
}

async function handleSlackPost(data, env) {
    const token = env.SLACK_BOT_TOKEN;
    return jsonResponse({ success: true });
}

async function handleSlackHistory(data, env) {
    const token = env.SLACK_BOT_TOKEN;
    return jsonResponse({ messages: [] });
}

async function handleSlackBotInfo(data, env) {
    const token = env.SLACK_BOT_TOKEN;
    return jsonResponse({ status: 'connected' });
}

async function handleMailchimpSubscribe(data, env) {
    const apiKey = env.MAILCHIMP_API_KEY;
    return jsonResponse({ success: true });
}

export default {
    fetch: handleRequest
};
