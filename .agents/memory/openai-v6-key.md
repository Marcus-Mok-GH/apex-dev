---
name: OpenAI SDK v6 empty key
description: OpenAI SDK v6.42.0 throws at constructor time if apiKey is empty string; "dummy" must always be used as fallback.
---

# OpenAI SDK v6 — Empty apiKey throws at construction

## Rule
When constructing `new OpenAI({ apiKey, ... })`, never pass an empty string `""` for `apiKey`. Always use `"dummy"` (or any non-empty string) as the fallback when no real key is available.

**Why:** OpenAI SDK v6.42.0 added a strict constructor check: `if (!apiKey && !adminAPIKey && !workloadIdentity) throw`. An empty string is falsy, so it triggers this throw at module initialization time — crashing the app before the UI even starts.

**How to apply:** In config.js, the initial client creation should read:
```js
const _initialKey = process.env[_initialProvider.envKey] || "dummy";
```
Not `|| (_initialProvider.noKey ? "dummy" : "")` which produced `""` for providers without `noKey: true`.
