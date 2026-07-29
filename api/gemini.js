// api/gemini.js — 纯流式代理（Edge Runtime，兼容 DeepSeek API 与 Gemini API）
export const config = {
    runtime: 'edge',
};

function extractPrompt(requestBody) {
    if (!requestBody) return '';
    if (typeof requestBody === 'string') return requestBody;
    if (requestBody.messages && Array.isArray(requestBody.messages)) {
        return requestBody.messages;
    }
    if (requestBody.contents && Array.isArray(requestBody.contents)) {
        const parts = requestBody.contents.flatMap(c => c.parts || []);
        return parts.map(p => p.text).filter(Boolean).join('\n');
    }
    return JSON.stringify(requestBody);
}

export default async function handler(req) {
    const envOrigins = (process.env.ALLOWED_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
    const allowedOrigins = [
        'https://taro-sepia.vercel.app',
        'https://www.taro24.fun',
        'https://taro24.fun',
        ...envOrigins,
        'http://localhost:5173',
        'http://localhost:4173',
        'http://localhost:5176',
    ];

    const origin = req.headers.get('origin');
    const isAllowed = allowedOrigins.includes(origin);

    const corsHeaders = {
        'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Device-Id, X-Follow-Up',
    };

    if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });

    try {
        const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

        const requestBody = await req.json();

        // 优先使用 DeepSeek API
        if (DEEPSEEK_API_KEY && DEEPSEEK_API_KEY !== 'your_deepseek_api_key_here') {
            const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || process.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat';
            const prompt = extractPrompt(requestBody);

            const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];

            const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                },
                body: JSON.stringify({
                    model: DEEPSEEK_MODEL,
                    messages: messages,
                    stream: true,
                    temperature: requestBody.generationConfig?.temperature || 0.7,
                }),
            });

            if (!deepseekResponse.ok) {
                const errorText = await deepseekResponse.text();
                console.error('DeepSeek API Error:', errorText);
                return new Response(errorText, {
                    status: deepseekResponse.status,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 将 DeepSeek OpenAI 流转换为前端兼容的 SSE 格式
            const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            let buffer = '';
            let isThinking = false;
            let hasSentThinkingClose = false;

            const transformedStream = deepseekResponse.body.pipeThrough(new TransformStream({
                transform(chunk, controller) {
                    buffer += decoder.decode(chunk, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;
                        if (trimmed === 'data: [DONE]') {
                            if (isThinking && !hasSentThinkingClose) {
                                const closeTag = '\n</Thinking>\n\n';
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: closeTag }] } }] })}\n\n`));
                                hasSentThinkingClose = true;
                            }
                            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                            continue;
                        }

                        if (trimmed.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(trimmed.slice(6));
                                const delta = data.choices?.[0]?.delta || {};
                                let textToEmit = '';

                                if (delta.reasoning_content) {
                                    if (!isThinking) {
                                        isThinking = true;
                                        textToEmit += '<Thinking>\n';
                                    }
                                    textToEmit += delta.reasoning_content;
                                }

                                if (delta.content) {
                                    if (isThinking && !hasSentThinkingClose) {
                                        textToEmit = '\n</Thinking>\n\n' + textToEmit;
                                        hasSentThinkingClose = true;
                                    }
                                    textToEmit += delta.content;
                                }

                                if (textToEmit) {
                                    const payload = {
                                        candidates: [{
                                            content: {
                                                parts: [{ text: textToEmit }]
                                            }
                                        }]
                                    };
                                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
                                }
                            } catch (e) {
                                // 忽略单行 JSON 解析错误
                            }
                        }
                    }
                },
                flush(controller) {
                    if (buffer.trim() && buffer.trim().startsWith('data: ')) {
                        try {
                            const data = JSON.parse(buffer.trim().slice(6));
                            const text = data.choices?.[0]?.delta?.content;
                            if (text) {
                                const payload = { candidates: [{ content: { parts: [{ text }] } }] };
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
                            }
                        } catch (e) {}
                    }
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                }
            }));

            return new Response(transformedStream, {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache, no-transform',
                    'Connection': 'keep-alive',
                    'X-Accel-Buffering': 'no',
                },
            });
        }

        // 降级使用 Gemini API
        const url = new URL(req.url);
        const isFast = url.searchParams.get('fast') === '1';
        const GEMINI_MODEL = isFast
            ? 'gemini-2.5-flash'
            : (process.env.GEMINI_MODEL || process.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash');

        if (!GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: 'DeepSeek API Key 及 Gemini API Key 均未配置' }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

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