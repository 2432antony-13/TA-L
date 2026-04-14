# 🔮 TA-L — 数字时代的 AI 塔罗牌占卜

**在线体验 → [taro24.fun](https://www.taro24.fun)**

[English](./README.md) | **简体中文**

TA-L 是一个开源的、由 AI 驱动的塔罗牌占卜网页应用。它将人格心理学与传统塔罗牌相结合，为您提供个性化、产生情感共鸣的占卜体验。

---

## ✨ 项目特色

- **基于性格的占卜** — 用户可选择“理性”或“感性”两种回应模式，以此决定 AI 解释卡牌的基调
- **三牌阵列** — 采用“过去 · 现在 · 未来”的经典牌阵结构，AI 会生成连贯这三张牌的叙事
- **专注于情感支持** — 占卜结果旨在提供切实可行的建议以及真实的情感价值
- **由 Google Gemini API 驱动** — 为每一次独特的占卜提供快速且具有语境感知的解读

---

## 🎯 目标受众

适合那些不仅想要随机算命，而且寻求内省、情感明晰，并希望获得能适应自己思考和感受方式的个性化体验的用户。

---

## 🛠️ 技术栈

- **前端**: React + Vite + TypeScript
- **样式**: Tailwind CSS
- **AI**: Google Gemini API
- **部署**: Vercel

---

## 🚀 快速开始

```bash
git clone https://github.com/2432antony-13/TA-L.git
cd TA-L
npm install
```

在根目录下创建一个 `.env` 文件：
```text
GEMINI_API_KEY=你的_api_key
```

然后运行本地开发环境：
```bash
npm run dev
```

---

## 🗺️ 后续计划

- [ ] 集成 Anthropic Claude API 以提供更深度的叙事占卜
- [ ] 更多塔罗牌阵（例如：凯尔特十字牌阵、感情牌阵等）
- [ ] 占卜历史与个人日志功能
- [ ] 多语言支持（i18n）

---

## 📄 开源协议

本项目采用 MIT 协议 — 详情请参见 [LICENSE](./LICENSE) 文件。
