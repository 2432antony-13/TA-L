<p><img src="../assets/tony.gif" width="112" height="112" alt="Tony 24 · TA-L"></p>

[简体中文](../../README.md) · **繁體中文** · [English](../../docs/i18n/README.en.md)

# TA-L

**用牌面敘事，打開另一種觀察視角。**

結合手勢互動、三牌陣與 AI 串流解讀的塔羅應用程式。支援理性與共情兩種回應風格，幫助整理問題與行動方向。

[線上入口](https://www.taro24.fun) · [任務](https://github.com/2432antony-13/TA-L/issues) · [文件](../../docs/README.md)

## 目前狀態

可執行的產品原型。攝影機在瀏覽器本機處理；AI 解讀需要伺服器端金鑰。歷史依裝置區分，不能視為帳戶驗證。

## 快速開始

Node.js 22；金鑰只放伺服器端。模型預設值以 api/reading.js 為準，目前為 deepseek-v4-flash。

```bash
npm ci
# Copy .env.example to .env.local; set DEEPSEEK_API_KEY server-side
npm run dev
# http://localhost:5176
npm run lint
npm run build
```

## 能力與範圍

手勢與鍵鼠抽牌；人格偏好訪談；串流解讀與追問；裝置級歷史。

內容用於娛樂與反思；牌面象徵、使用者事實和條件性建議必須區分。

[原始碼](../../src/) · [文件](../../docs/README.md)

倉庫首頁與產品介面提供 **简体中文 / 繁體中文 / English**。採用 Q 版 **Tony 24** 標識，GitHub 顯示 GIF，產品使用 SVG/CSS 動畫。

[語言覆蓋與原文範圍](../LOCALIZATION.md)
