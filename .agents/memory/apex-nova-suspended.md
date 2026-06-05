---
name: Apex Nova backend suspended
description: The apex-nova and replit free provider backends share a suspended Fireworks AI account; they are unavailable.
---

# Apex Nova / Replit Free Backend — Suspended

## Rule
Do not use `apex-nova` or `replit` as the default provider. Their shared backend (`https://fireworks-ai-server--coneyparsley3h.replit.app/api/inference/v1`) uses a Fireworks AI account (`sircheck85`) that is suspended.

**Why:** Any chat completion request returns `"Account sircheck85 is suspended, possibly due to reaching the monthly spending limit"`. Using either as the default causes every user message to fail.

**How to apply:** Default provider is set to `"openai"` in `detectInitialProvider()` in `src/config.js`. Both providers are labeled "(Unavailable)" in their `label` fields. Users are shown the provider config screen and must enter their own API key.
