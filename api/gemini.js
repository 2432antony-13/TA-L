// api/gemini.js — 纯流式代理（Edge Runtime）
export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    const envOrigins = (process.env.ALLOWED_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
    const allowedOrigins = [
        'https://taro-sepia.vercel.app',
        'https://www.taro24.fun',
        'https://taro24.fun',
        ...envOrigins,
        'http://localhost:5173',
        'http://localhost:4173',
    ];

    const origin = req.headers.get('origin');
    const isAllowed = allowedOrigins.includes(origin);

    const corsHeaders = {
        'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Device-Id',
    };

    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });

    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
        const url = new URL(req.url);
        const isFast = url.searchParams.get('fast') === '1';
        const GEMINI_MODEL = isFast
            ? 'gemini-2.5-flash'
            : (process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash');

        if (!GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: 'API Key not configured' }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const requestBody = await req.json();
        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

        const googleResponse = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!googleResponse.ok) {
            const errorText = await googleResponse.text();
            return new Response(errorText, { status: googleResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(googleResponse.body, {
            headers: {
                ...corsHeaders,
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
            },
        });

    } catch (error) {
        console.error('Fatal error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}