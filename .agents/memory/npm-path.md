---
name: npm PATH fix
description: How npm/node/npx are made available in the Bash tool executor on Replit's Nix environment.
---

# npm PATH Fix

## Problem
In Replit's Nix environment, `npm`, `node`, and `npx` are NOT in the default PATH. Only `socket-npm` (a security-scanning wrapper) is in PATH. `execSync` in the Bash executor inherits this limited PATH, so `npm` commands fail with "command not found".

## Solution (in src/toolExecutors.js)
At module initialization, detect the Node.js bin directory by:
1. Running `which socket-npm` to find the wrapper script
2. Reading its shebang line (`#!/nix/store/.../bin/node`)
3. Extracting the bin directory path

Then set `AUGMENTED_PATH = nodeBinDir + ':' + process.env.PATH` and pass `env: { ...process.env, PATH: AUGMENTED_PATH }` to every `execSync` call in the Bash tool.

**Why:** The Nix store hash in the node path changes with updates, so hardcoding it is fragile. Deriving it from `socket-npm`'s shebang is robust.

## Verified working
- npm: 10.9.3
- node: v22.19.0
- npx: 10.9.3
- Node.js installed at `/nix/store/51gywl5jn4nna7al9waj142pw4vfhy0k-nodejs-22.19.0/bin/` (hash may change)
