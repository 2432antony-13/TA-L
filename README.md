# TA-L

[简体中文](README.md) | [English](README.en.md)

TA-L 是一个支持手势交互与 AI 叙事解读的双语塔罗 Web 应用。它将牌面作为自我观察的媒介，不把模型生成内容包装成事实认定或未来保证。

[在线体验](https://www.taro24.fun) · [问题反馈](https://github.com/2432antony-13/TA-L/issues)

## 功能

- 简体中文与英文一键切换，牌名、牌义、访谈、解读和追问完整双语化
- MediaPipe 浏览器端手势识别，摄像头画面不上传服务器
- **智能解牌**: DeepSeek V4 Flash 流式解读，支持理性与共情两种回应风格
- 三牌阵、人格沟通偏好、连续追问与设备级历史记录
- **隐私保护与极致性能**: 正式解读默认使用 `deepseek-v4-flash`，开启 thinking 并使用 `high` 推理强度；快速画像和追问关闭 thinking 以降低延迟。模型的 `reasoning_content` 仅在服务端消费，不传给浏览器，也不写入历史记录。

提示词要求模型区分用户提供的事实、牌面象征与条件性解释，并禁止把推测表述为事实。应用内容仅供娱乐、反思与灵感启发，不构成心理、医疗、法律或财务建议。

## 本地运行

```bash
git clone https://github.com/2432antony-13/TA-L.git
cd TA-L
npm ci
cp .env.example .env.local
npm run dev
```

在 `.env.local` 中填写 `DEEPSEEK_API_KEY`，然后访问 `http://localhost:5176`。

```bash
npm run lint
npm run build
```

## Vercel 部署

导入本仓库后，至少配置：

| 环境变量 | 必需 | 默认值或说明 |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | 是 | DeepSeek API 密钥，仅放在服务端 |
| `DEEPSEEK_MODEL` | 否 | `deepseek-v4-pro` |
| `DEEPSEEK_BASE_URL` | 否 | `https://api.deepseek.com` |
| `DEEPSEEK_REASONING_EFFORT` | 否 | `high` |
| `UPSTASH_REDIS_REST_URL` | 历史功能 | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | 历史功能 | Upstash Redis REST Token |
| `ALLOWED_ORIGIN` | 否 | 额外允许的来源，逗号分隔 |

兼容旧 Vercel KV 的 `KV_REST_API_URL` 与 `KV_REST_API_TOKEN`。不要创建 `VITE_DEEPSEEK_API_KEY`，否则密钥可能进入前端构建产物。

## 技术栈

React 19、TypeScript、Vite、Tailwind CSS、Framer Motion、MediaPipe Hands、DeepSeek API、Upstash Redis、Vercel。

## 许可

代码采用 [MIT License](LICENSE)。提交代码或素材前，请确认你拥有相应权利并保留必要署名。
