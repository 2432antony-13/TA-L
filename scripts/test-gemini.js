import https from 'https';
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

const apiKey = env['VITE_GEMINI_API_KEY'];
const model = env['VITE_GEMINI_MODEL'] || 'gemini-1.5-pro';

if (!apiKey) {
    console.error('❌ 未在 .env 中找到 VITE_GEMINI_API_KEY');
    process.exit(1);
}

console.log(`🔍 正在测试模型: ${model}...`);

const data = JSON.stringify({
    contents: [{
        parts: [{ text: "Hello, are you working?" }]
    }]
});

const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('✅ API 测试成功！Key 和模型配置正确。');
            try {
                const response = JSON.parse(body);
                console.log('🤖 AI 回复:', response.candidates[0].content.parts[0].text.trim());
            } catch (e) {
                console.log('⚠️ 无法解析响应，但状态码为 200。');
            }
        } else {
            console.error(`❌ API 请求失败 (状态码 ${res.statusCode})`);
            console.error('错误详情:', body);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ 网络请求错误:', error.message);
});

req.write(data);
req.end();
