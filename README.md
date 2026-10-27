<p><img src="docs/assets/tony.gif" width="112" height="112" alt="Tony 24 · TA-L"></p>

**简体中文** · [繁體中文](docs/i18n/README.zh-TW.md) · [English](docs/i18n/README.en.md)

# TA-L

**用牌面叙事，打开另一种观察视角。**

结合手势交互、三牌阵与 AI 流式解读的塔罗应用。支持理性与共情两种回应风格，帮助整理问题与行动方向。

[在线入口](https://www.taro24.fun) · [任务](https://github.com/2432antony-13/TA-L/issues) · [文档](docs/README.md)

## 当前状态

可运行的产品原型。摄像头在浏览器本地处理；AI 解读需要服务端密钥。历史按设备区分，不能视为账户认证。

## 快速开始

Node.js 22；密钥只放服务端。模型默认值以 api/reading.js 为准，目前为 deepseek-v4-flash。

```bash
npm ci
# Copy .env.example to .env.local; set DEEPSEEK_API_KEY server-side
npm run dev
# http://localhost:5176
npm run lint
npm run build
```

## 能力与范围

手势与键鼠抽牌；人格偏好访谈；流式解读与追问；设备级历史。

内容用于娱乐与反思；牌面象征、用户事实和条件性建议必须区分。

[源码](src/) · [文档](docs/README.md)

仓库首页与产品界面提供 **简体中文 / 繁體中文 / English**。采用 Q 版 **Tony 24** 标识，GitHub 显示 GIF，产品使用 SVG/CSS 动画。

[语言覆盖与原文边界](docs/LOCALIZATION.md)
