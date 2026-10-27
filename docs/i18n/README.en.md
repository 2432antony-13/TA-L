<p><img src="../assets/tony.gif" width="112" height="112" alt="Tony 24 · TA-L"></p>

[简体中文](../../README.md) · [繁體中文](../../docs/i18n/README.zh-TW.md) · **English**

# TA-L

**Use symbolic stories to explore another perspective.**

A tarot application combining gestures, a three-card spread and streamed AI readings. Analytical and empathetic response styles help users reflect on questions and possible actions.

[Live entry](https://www.taro24.fun) · [Issues](https://github.com/2432antony-13/TA-L/issues) · [Docs](../../docs/README.md)

## Current status

A runnable product prototype. Camera processing stays in the browser; AI readings require a server-side key. Device-based history is not account authentication.

## Quick start

Node.js 22; keep keys on the server. api/reading.js defines the model default, currently deepseek-v4-flash.

```bash
npm ci
# Copy .env.example to .env.local; set DEEPSEEK_API_KEY server-side
npm run dev
# http://localhost:5176
npm run lint
npm run build
```

## Capabilities and scope

Gesture and pointer card selection; preference interviews; streamed readings and follow-ups; device history.

For entertainment and reflection. Card symbolism, user-provided facts and conditional suggestions must remain distinct.

[Source](../../src/) · [Docs](../../docs/README.md)

The repository homepage and product interface offer **简体中文 / 繁體中文 / English**. The **Tony 24** mascot uses GIF on GitHub and SVG/CSS in the product.

[Language coverage and original content](../LOCALIZATION.md)
