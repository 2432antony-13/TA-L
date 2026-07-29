import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');

// 简单的 .env 解析器
const envContent = fs.readFileSync(envPath, 'utf-8').replace(/^\uFEFF/, ''); // 移除 BOM
const env = {};
envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim();
    }
});

const apiKey = env['DEEPSEEK_API_KEY'] || env['VITE_DEEPSEEK_API_KEY'];
const model = env['DEEPSEEK_MODEL'] || env['VITE_DEEPSEEK_MODEL'] || 'deepseek-chat';

if (!apiKey || apiKey === 'your_deepseek_api_key_here') {
    console.error('❌ 未在 .env 中配置有效的 DEEPSEEK_API_KEY！');
    process.exit(1);
}

console.log(`🔍 正在测试 DeepSeek API (模型: ${model})...`);

try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: 'Hello, are you working?' }],
            stream: false
        })
    });

    if (res.ok) {
        const data = await res.json();
        console.log('✅ DeepSeek API 测试成功！Key 和模型配置正常工作。');
        console.log('🤖 DeepSeek AI 回复:', data.choices[0].message.content.trim());
    } else {
        const errorText = await res.text();
        console.error(`❌ API 请求失败 (状态码 ${res.status}):`, errorText);
    }
} catch (err) {
    console.error('❌ 网络请求错误:', err.message);
}
