import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '../.env');

const envContent = fs.readFileSync(envPath, 'utf-8').replace(/^\uFEFF/, '');
const env = {};
envContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim();
    }
});

const apiKey = env['DEEPSEEK_API_KEY'];
const model = env['DEEPSEEK_MODEL'] || 'deepseek-chat';

const samplePrompt = `
# Role
你是塔罗解读引擎，当前模式：T（理性分析师）

# Context
## 提问
我最近工作遇到了瓶颈，换工作还是继续坚持？

## 牌阵
过去·现在·未来三牌阵 | 
过去位：宝剑三（正位）
现在位：权杖八（逆位）
未来位：星星（正位）

# Task
请先在 <Thinking> 标签中简要分析（包括牌面关联、元素分析、逻辑推演），然后进行正式解读。

<Thinking>
...简要分析思考过程...
</Thinking>

## 1. 客观局势剖析
## 2. 逻辑演进脉络
## 3. 务实行动策略

风格要求：
- 保持高度的客观与理性，注重因果关系的分析与元素生克的推演。
- 语言风格严谨、冷峻、务实。

最后附上2个建议追问（JSON格式）：
\`\`\`json
{"suggested_questions": ["如果跳槽，什么行业更合适？", "当前岗位还有哪些未被挖掘的增长空间？"]}
\`\`\`
`;

console.log("🔮 正在使用 DeepSeek 运行【塔罗牌实测样例】...\n");

try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: samplePrompt }],
            stream: true,
            temperature: 0.7
        })
    });

    if (!res.ok) {
        console.error('❌ 请求失败:', await res.text());
        process.exit(1);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
                try {
                    const json = JSON.parse(trimmed.slice(6));
                    const text = json.choices?.[0]?.delta?.content || '';
                    if (text) {
                        process.stdout.write(text);
                        fullText += text;
                    }
                } catch (e) {}
            }
        }
    }

    console.log("\n\n------------------------------------------------");
    console.log("✅ 实测样例运行完成！回答长度:", fullText.length, "字符");

} catch (err) {
    console.error("❌ 发生错误:", err.message);
}
