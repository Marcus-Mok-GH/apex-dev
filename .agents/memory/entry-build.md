---
name: Entry build process
description: How src/ changes get applied — entry.mjs is a generated bundle, not a live loader.
---

# Apex AI — Entry Build Process

The workflow runs `bun entry.mjs`, which is a **pre-generated bundle** assembled from all files in `src/`.

**How to apply src/ changes:**

1. Edit files in `src/` (components, theme, config, etc.)
2. Run `bun scripts/build-entry.mjs` to regenerate `entry.mjs`
3. Restart the `Start application` workflow

**Why:** `entry.mjs` is built by `scripts/build-entry.mjs`, which concatenates `src/` files in a defined order (SRC_ORDER array) with a runtime header/footer. It is NOT a dynamic loader — it bakes in the source at build time.

**apex.mjs** is an alternative entry that reads `src/` files dynamically via `readFileSync` + `eval`. It would pick up changes without a rebuild, but the configured workflow uses `entry.mjs`.
