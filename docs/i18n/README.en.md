<p>
  <img align="right" src="../assets/tony.gif" width="12%" alt="Tony 24 · TA-L" />
  <img src="../assets/hero.png" width="85%" alt="TA-L · Turn a card draw into a starting point for reflection and a thoughtful conversation." />
</p>

<br clear="all" />

[简体中文](../../README.md) · [繁體中文](README.zh-TW.md) · **English**

# TA-L

**Turn a card draw into a starting point for reflection and a thoughtful conversation.**

TA-L combines gesture-based card selection, a three-card spread and AI conversation. Bring a specific question, choose a rational or empathetic response style, and use card narratives to explore perspectives on the past, present and future. Follow-up questions help turn vague feelings into actions you could consider. A night-sky setting and card animations support an immersive experience designed for entertainment and self-reflection.

## Who it is for

- People who want to use card narratives to explore questions, thoughts and feelings.
- People who want to choose between a practical, rational response and a warmer, empathetic style.
- Developers exploring hand gestures, card animation and streaming AI conversation.

## 7 core capabilities

### 1. A full deck and three-card spread

Draw three distinct cards from a 78-card deck, with upright and reversed orientations, arranged as past, present and future. Receive a connected spread for one question rather than three unrelated descriptions.

**Status：** Deck, selection and reveal flows implemented.

### 2. Gesture, mouse and keyboard controls

Optionally enable the camera to point, move and close your hand when choosing cards. Mouse and keyboard controls accompany the shuffle and reveal animations. Choose an interaction method that suits your device and complete a draw without enabling the camera.

**Status：** Gestures are recognised locally in the browser; camera permission is required.

### 3. Rational and empathetic response styles

Choose a rational style focused on reasoning and possible actions, or an empathetic style focused on feelings and considerate expression. Explore the same cards in a style suited to your current needs; the choice informs both readings and follow-ups.

**Status：** Implemented; a style choice is not a personality diagnosis.

### 4. An optional preference interview

Answer 10 multiple-choice questions about how you think and respond to situations, or skip the interview and go straight to your question and draw. Let the reading consider preferences you chose to share. Profiles are stored by language in the current browser and can be revisited or recreated.

**Status：** Interview implemented; model-generated profiles require server configuration. Failed requests or an unexpected output format fall back to a local rule-based profile.

### 5. Streaming AI readings

Send the question, card positions and orientations, response style and optional profile to a server-side model. Read the answer as it arrives, with loading, failure and retry handling. Receive an interpretation and conditional suggestions grounded in the current spread, without exposing hidden model reasoning.

**Status：** Requires a server-side model key; new readings use the selected language.

### 6. Context-aware follow-up questions

After a reading, choose a suggested question or write your own. The conversation retains the original question, cards and reading for up to three follow-up rounds. Explore a specific thought without drawing again. Cancel a streaming follow-up or retry after a failure.

**Status：** Implemented; requires the reading service, with storage configured separately.

### 7. History for the current device

With Redis configured, save the question, cards, style, reading and follow-ups. Open recent records in a sidebar keyed to the current device identifier. Revisit earlier questions and responses. The API returns the latest 20 records and retains up to 50.

**Status：** Requires history storage; a device identifier is not account authentication or cross-device sync.

## From start to outcome

1. Choose Simplified Chinese, Traditional Chinese or English, followed by a rational or empathetic style.
2. Complete or skip the preference interview and enter a specific question you would like to explore.
3. Use gestures or mouse and keyboard to select and reveal three cards, then read the streamed interpretation.
4. Ask about details that matter to you. When storage is configured, revisit the session in the history sidebar.

## Current status

- A runnable product prototype with a public entry point; implemented flows cover card selection, interviews, readings, follow-ups and device-level history.
- AI readings and model-generated profiles need a server-side key. Profile generation falls back to local rules if a request fails or the output format is unexpected. History needs Redis; starting the frontend alone does not configure those services.
- The interface, card text and requests for new readings support three languages. Existing history keeps the language in which it was generated.

## Quick start

Node.js 22. Copy .env.example to .env.local and set DEEPSEEK_API_KEY on the server. History requires Redis separately. The Vite development server proxies readings; history APIs need the corresponding server runtime.

```bash
npm ci
# Copy .env.example to .env.local
# Set DEEPSEEK_API_KEY on the server
npm run dev
# http://localhost:5176
npm run lint
npm test
npm run build
```

## Scope and limits

- Cards support entertainment and reflection; they cannot establish future events or replace professional judgement. Separate user facts, card symbolism and conditional suggestions.
- Camera frames are processed locally for gestures. AI requests send the question, cards and selected preferences to the server and model service.
- Device identifiers do not authenticate a person. Without Redis configuration, the history API does not provide persistence.

## Documentation and project management

[Try the app](https://www.taro24.fun) · [Product and developer docs](../README.md) · [Language coverage](../LOCALIZATION.md) · [Project tasks](https://github.com/2432antony-13/TA-L/issues) · [Checks](https://github.com/2432antony-13/TA-L/actions)
