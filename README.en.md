# TA-L

[简体中文](README.md) | [English](README.en.md)

TA-L is a bilingual, gesture-controlled tarot web experience with AI narrative interpretation. It treats card symbolism as a prompt for reflection, not as a factual finding or a guarantee about the future.

[Live app](https://www.taro24.fun) · [Issue tracker](https://github.com/2432antony-13/TA-L/issues)

## Features

- Complete Simplified Chinese and English experience across cards, interview, reading, and follow-ups
- In-browser MediaPipe gesture recognition; camera frames are not uploaded
- Streaming DeepSeek V4 Pro interpretations with rational and empathetic response styles
- Three-card spread, communication-preference profile, follow-ups, and device-level history
- Responsive keyboard, mouse, touch, and gesture interaction

## AI design

Full readings use `deepseek-v4-pro` with thinking enabled and `high` reasoning effort. Fast profile and follow-up requests disable thinking to reduce latency. The server consumes but never forwards or stores the model's `reasoning_content`.

Prompts require the model to distinguish user-provided facts, card symbolism, and conditional interpretation. They prohibit presenting inference as fact. Content is for entertainment, reflection, and inspiration only; it is not psychological, medical, legal, or financial advice.

## Local development

```bash
git clone https://github.com/2432antony-13/TA-L.git
cd TA-L
npm ci
cp .env.example .env.local
npm run dev
```

Add `DEEPSEEK_API_KEY` to `.env.local`, then open `http://localhost:5176`.

```bash
npm run lint
npm run build
```

## Deploy to Vercel

Import the repository and configure:

| Environment variable | Required | Default or purpose |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | Yes | Server-side DeepSeek key |
| `DEEPSEEK_MODEL` | No | `deepseek-v4-pro` |
| `DEEPSEEK_BASE_URL` | No | `https://api.deepseek.com` |
| `DEEPSEEK_REASONING_EFFORT` | No | `high` |
| `UPSTASH_REDIS_REST_URL` | For history | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | For history | Upstash Redis REST token |
| `ALLOWED_ORIGIN` | No | Additional comma-separated origins |

Legacy `KV_REST_API_URL` and `KV_REST_API_TOKEN` variables remain supported. Do not create `VITE_DEEPSEEK_API_KEY`; that naming can expose a secret to the client bundle.

## Stack

React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, MediaPipe Hands, DeepSeek API, Upstash Redis, and Vercel.

## License

Code is available under the [MIT License](LICENSE). Confirm the rights and attribution requirements for any code or media you contribute.
