#!/usr/bin/env node
import { TextAttributes, createCliRenderer } from "@opentui/core";
import { createRoot, useTerminalDimensions, useKeyboard } from "@opentui/react";
import React from "react";
import * as ReactJSXRuntime from "react/jsx-runtime";
import OpenAI from "openai";
import { createRequire } from "module";

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

// Load all modules in dependency order (each defines its require_ global)
await import("./src/store.js");
await import("./src/theme.js");
await import("./src/thinking.js");
await import("./src/utils.js");
await import("./src/config.js");
await import("./src/tools.js");
await import("./src/prompt.js");
await import("./src/server.js");
await import("./src/toolExecutors.js");
await import("./src/agent.js");
await import("./src/commands.js");

// Load hooks
await import("./src/hooks/useLayout.js");
await import("./src/hooks/useStore.js");

// Load components
await import("./src/components/Header.jsx");
await import("./src/components/Divider.jsx");
await import("./src/components/Welcome.jsx");
await import("./src/components/UserMessage.jsx");
await import("./src/components/AssistantMessage.jsx");
await import("./src/components/ThinkBlock.jsx");
await import("./src/components/ToolCallItem.jsx");
await import("./src/components/Spinner.jsx");
await import("./src/components/DiffView.jsx");
await import("./src/components/SystemMessage.jsx");
await import("./src/components/ChatArea.jsx");
await import("./src/components/InputBar.jsx");
await import("./src/components/StatusBar.jsx");
await import("./src/components/HelpModal.jsx");
await import("./src/components/ApiKeyModal.jsx");

// Load app
const appMod = await import("./src/app.jsx");
const App = appMod.default || appMod.App || globalThis._App;

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
