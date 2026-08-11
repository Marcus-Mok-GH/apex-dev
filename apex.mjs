#!/usr/bin/env node
import { TextAttributes, createCliRenderer } from "@opentui/core";
import { createRoot, useTerminalDimensions, useKeyboard } from "@opentui/react";
import React from "react";
import * as ReactJSXRuntime from "react/jsx-runtime";
import OpenAI from "openai";
import { createRequire } from "module";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const __require_impl = createRequire(import.meta.url);

globalThis.__require = __require_impl;
globalThis.__commonJS = function (cb) {
  let mod;
  return function () {
    if (!mod) {
      mod = { exports: {} };
      cb(mod.exports, mod);
    }
    return mod.exports;
  };
};
globalThis.__toESM = function (mod, isNode) {
  if (mod && mod.__esModule) return mod;
  const obj = mod != null ? mod : {};
  if (!("default" in obj))
    Object.defineProperty(obj, "default", { enumerable: true, value: mod });
  return obj;
};

globalThis.require_react = function () { return React; };
globalThis.require_jsx_runtime = function () { return ReactJSXRuntime; };
globalThis.require_openai = function () { return OpenAI; };

globalThis.TextAttributes = TextAttributes;
globalThis.createCliRenderer = createCliRenderer;
globalThis.createRoot = createRoot;
globalThis.useTerminalDimensions = useTerminalDimensions;
globalThis.useKeyboard = useKeyboard;

// Load all modules in dependency order into a shared scope
// Provide require/module/exports in global scope for CJS-style files
globalThis.require = __require_impl;

const srcFiles = [
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
  "src/app.jsx",
];

for (const file of srcFiles) {
  const code = readFileSync(resolve(__dirname, file), "utf-8");
  // Files with module.exports use CJS pattern directly — wrap in __commonJS
  if (/\bmodule\.exports\s*=/.test(code)) {
    const baseName = file.replace(/^src\//, "").replace(/\.(js|jsx)$/, "").split("/").pop();
    (0, eval)(`var require_${baseName} = __commonJS(function(exports, module) { ${code} })`);
  } else {
    (0, eval)(code);
  }
}

const App = globalThis._App;

async function main() {
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

  const FinalApp = App || globalThis._App;
  const root = createRoot(renderer);
  root.render(ReactJSXRuntime.jsx(FinalApp, {}));
  renderer.start();
}

main().catch((err) => {
  console.error("Failed to start Apex:", err);
  process.exit(1);
});
