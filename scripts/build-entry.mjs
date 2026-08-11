#!/usr/bin/env node
// Regenerates entry.mjs from src/ source files

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SRC = resolve(ROOT, "src");
const pkgVersion = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf-8")).version;

const HEADER = `#!/usr/bin/env bun
// Proper entry for Apex AI

import {
  TextAttributes,
  createCliRenderer,
} from "@opentui/core";
import { createRoot, useTerminalDimensions, useKeyboard } from "@opentui/react";
import React from "react";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import OpenAI from "openai";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __require = import.meta.require;
var APEX_VERSION = ${JSON.stringify(pkgVersion)};

// External package re-exports (resolved at build time via static imports above)
var require_react = () => React;
var require_jsx_runtime = () => ({ jsx: _jsx, jsxs: _jsxs, Fragment: _Fragment });
var require_openai = () => OpenAI;

`;

const FOOTER = `

async function main2() {
  if (process.env.APEX_LOCAL_SERVER === "1") {
    const srv = globalThis.require_server ? globalThis.require_server() : null;
    if (srv && srv.startServer) await srv.startServer();
  }

  const renderer = await createCliRenderer({
    useAlternateScreen: true,
    exitOnCtrlC: false,
    useMouse: true,
  });

  const store = globalThis.require_store ? globalThis.require_store() : null;
  if (store && store.setRenderer) store.setRenderer(renderer);

  const root = createRoot(renderer);
  root.render(require_jsx_runtime().jsx(App, {}));
  renderer.start();
}

main2().catch((err) => {
  console.error("Failed to start Apex:", err);
  process.exit(1);
});
`;

const SRC_ORDER = [
  "src/store.js",
  "src/theme.js",
  "src/thinking.js",
  "src/utils.js",
  "src/config.js",
  "src/tools.js",
  "src/prompt.js",
  "src/server.js",
  "src/toolExecutors.js",
  "src/agent.js",
  "src/commands.js",
  "src/hooks/useLayout.js",
  "src/hooks/useStore.js",
  "src/components/Header.jsx",
  "src/components/Divider.jsx",
  "src/components/Welcome.jsx",
  "src/components/UserMessage.jsx",
  "src/components/AssistantMessage.jsx",
  "src/components/ThinkBlock.jsx",
  "src/components/ToolCallItem.jsx",
  "src/components/Spinner.jsx",
  "src/components/DiffView.jsx",
  "src/components/SystemMessage.jsx",
  "src/components/ChatArea.jsx",
  "src/components/InputBar.jsx",
  "src/components/StatusBar.jsx",
  "src/components/HelpModal.jsx",
  "src/components/ProviderSelector.jsx",
  "src/components/ApiKeyModal.jsx",
  "src/app.jsx",
];

function buildEntry() {
  let output = HEADER;

  for (const file of SRC_ORDER) {
    const code = readFileSync(resolve(ROOT, file), "utf-8");
    if (/\bmodule\.exports\s*=/.test(code)) {
      const baseName = file
        .replace(/^src\//, "")
        .replace(/\.(js|jsx)$/, "")
        .split("/")
        .pop();
      output += `var require_${baseName} = __commonJS((exports, module) => {\n${code}\n});\n\n`;
    } else {
      output += code + "\n\n";
    }
  }

  output += FOOTER;
  writeFileSync(resolve(ROOT, "entry.mjs"), output);
  console.log("entry.mjs regenerated successfully.");
}

buildEntry();
