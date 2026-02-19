import { kv } from '@vercel/kv';

export const config = {
    runtime: 'edge',
};

// 允许的来源
const getCorsHeaders = (req) => {
    const envOrigins = (process.env.ALLOWED_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
    const allowedOrigins = [
        'https://taro-sepia.vercel.app',
        'https://www.taro24.fun',
        ...envOrigins,
        'http://localhost:5173',
        'http://localhost:4173',
    ];
    const origin = req.headers.get('origin');
    const isAllowed = allowedOrigins.includes(origin);

    return {
        'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Device-Id',
    };
};

export default async function handler(req) {
    const corsHeaders = getCorsHeaders(req);

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { sessionId, question, answer, action } = body;
        const deviceId = req.headers.get('x-device-id');

        // 只处理 save 动作
        if (action === 'save') {
            if (!deviceId || !sessionId || !question || !answer) {
                return new Response('Missing required fields', { status: 400, headers: corsHeaders });
            }

            const kvKey = `user_history:${deviceId}`;

            // 1. 获取用户所有历史记录
            const historyList = await kv.lrange(kvKey, 0, -1);

            // 2. 查找对应 sessionId 的记录
            const index = historyList.findIndex(item => item.id === sessionId);

            if (index !== -1) {
                const record = historyList[index];

                // 3. 更新记录
                if (!record.followUps) {
                    record.followUps = [];
                }
                record.followUps.push({ q: question, a: answer });

                // 4. 写回 KV
                await kv.lset(kvKey, index, record);

                console.log(`[FollowUpSave] Saved follow-up for session ${sessionId}`);

                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } else {
                console.warn(`[FollowUpSave] Session ${sessionId} not found for device ${deviceId}`);
                return new Response('Session not found', { status: 404, headers: corsHeaders });
            }
        }

        return new Response('Invalid action', { status: 400, headers: corsHeaders });

    } catch (error) {
        console.error('[FollowUpSave] Error:', error);
        return new Response(JSON.stringify({ error: `Internal Server Error: ${error.message}` }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
