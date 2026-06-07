---
name: Apex Nova backend fix
description: The apex-nova and replit free provider backends previously used a suspended Fireworks AI account via a Replit proxy. apex-nova has been fixed with a new keyless proxy; replit remains unavailable.
---

# Apex Nova / Replit Free Backend — Status

## Apex Nova (FIXED)
`apex-nova` previously pointed to a shared Replit proxy (`https://fireworks-ai-server--coneyparsley3h.replit.app/api/inference/v1`) using a suspended Fireworks AI account (`sircheck85`).

**Fix applied:** `apex-nova` now points to `https://fireworks-proxy-marcusmok.zocomputer.io` — a self-hosted Hyper-backed proxy that requires no API key (`noKey: true`). A custom `fetch` rewrite in the provider config maps the OpenAI SDK's `/chat/completions` → `/api/chat` and `/models` → `/api/models` to match the proxy's non-standard routes. Models updated to latest available on the proxy (kimi-k2.6, deepseek-v4-pro, qwen3.7-max).

## Replit (Still Unavailable)
`replit` still uses the suspended proxy. It remains labeled "(Unavailable)" with `noKey: true` to prevent new users from selecting it. Do not change its `baseURL` without a working replacement backend.
