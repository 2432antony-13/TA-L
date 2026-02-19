// api/history.js
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
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Device-Id',
    };
};

export default async function handler(req) {
    const corsHeaders = getCorsHeaders(req);

    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    const deviceId = req.headers.get('x-device-id');
    if (!deviceId) {
        return new Response(JSON.stringify({ error: 'Missing Device ID' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    const kvKey = `user_history:${deviceId}`;

    try {
        // GET: 获取历史记录
        if (req.method === 'GET') {
            // 获取列表，默认获取最近 20 条
            const history = await kv.lrange(kvKey, 0, 19);
            return new Response(JSON.stringify(history), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // POST: 保存新的记录
        if (req.method === 'POST') {
            const body = await req.json();

            // 数据验证
            if (!body.timestamp || !body.question) {
                return new Response(JSON.stringify({ error: 'Invalid data' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 添加 ID
            const record = {
                id: crypto.randomUUID(),
                ...body,
                updatedAt: Date.now()
            };

            // 推入列表头部
            await kv.lpush(kvKey, record);

            // 保留最近 50 条，删除多余的
            await kv.ltrim(kvKey, 0, 49);

            return new Response(JSON.stringify({ success: true, record }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });

    } catch (error) {
        console.error('KV Error:', error);
        return new Response(JSON.stringify({ error: 'Database Error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
