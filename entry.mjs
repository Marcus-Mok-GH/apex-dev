#!/usr/bin/env bun
// Proper entry for Apex AI

import {
  TextAttributes,
  createCliRenderer,
} from "@opentui/core";
import { createRoot, useTerminalDimensions, useKeyboard } from "@opentui/react";
import React from "react";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { OpenAI } from "openai";
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

// External package re-exports (resolved at build time via static imports above)
var require_react = () => React;
var require_jsx_runtime = () => ({ jsx: _jsx, jsxs: _jsxs, Fragment: _Fragment });
var require_openai = () => ({ OpenAI });

var require_store = __commonJS((exports, module2) => {
  // Import config for provider detection
  var config = require_config();

  // Get the initial provider - config.loadSavedProvidersIntoEnv() must run first
  // This is called automatically when config module initializes
  var _detectedProvider = config.currentProvider;
  var _providerEnvKey = config.PROVIDERS[_detectedProvider].envKey;
  var _apiKey = process.env[_providerEnvKey] || "";
  var _needsConfig = process.env.APEX_DEV_NEEDS_CONFIG === "true" || (!Boolean(_apiKey) && !config.PROVIDERS[_detectedProvider].noKey);

  var state = {
    messages: [],
    streamingContent: "",
    streamingThinking: "",
    isProcessing: false,
    showHelp: false,
    showSummary: false,
    apiKey: _apiKey,
    provider: _detectedProvider,
    needsConfig: _needsConfig
  };
  var nextId = 1;
  var listeners = new Set;
  var renderer = null;
  function getSnapshot() {
    return state;
  }
  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }
  let renderRequested = false;
  function notify() {
    for (const fn of listeners)
      fn();
    if (renderer && !renderRequested) {
      renderRequested = true;
      // Use setImmediate to throttle renders to once per event loop tick
      setImmediate(() => {
        renderRequested = false;
        renderer.requestRender();
      });
    }
  }
  function setState(partial) {
    state = { ...state, ...partial };
    notify();
  }
  function addMessage(msg) {
    const id = nextId++;
    state = { ...state, messages: [...state.messages, { id, ...msg }] };
    notify();
    return id;
  }
  function updateMessage(id, updates) {
    state = {
      ...state,
      messages: state.messages.map((m2) => m2.id === id ? { ...m2, ...updates } : m2)
    };
    notify();
    return id;
  }
  function toggleMessageExpanded(id) {
    state = {
      ...state,
      messages: state.messages.map((m2) => m2.id === id ? { ...m2, expanded: !m2.expanded } : m2)
    };
    notify();
  }
  function updateStreaming(content, thinking) {
    state = { ...state, streamingContent: content || "", streamingThinking: thinking || "" };
    notify();
  }
  function clearStreaming() {
    state = { ...state, streamingContent: "", streamingThinking: "" };
    notify();
  }
  function finishStreaming(msg) {
    const id = nextId++;
    state = {
      ...state,
      streamingContent: "",
      streamingThinking: "",
      messages: [...state.messages, { id, ...msg }]
    };
    notify();
    return id;
  }
  function clearMessages() {
    state = { ...state, messages: [] };
    notify();
  }
  function setRenderer(r) {
    renderer = r;
  }
  function getRenderer() {
    return renderer;
  }
  module2.exports = {
    getSnapshot,
    subscribe,
    setState,
    addMessage,
    updateMessage,
    toggleMessageExpanded,
    updateStreaming,
    clearStreaming,
    finishStreaming,
    clearMessages,
    setRenderer,
    getRenderer
  };
});


var require_theme = __commonJS((exports, module2) => {
  var colors = {
    primary: "#6366f1",
    accent: "#818cf8",
    dim: "#666666",
    muted: "#888888",
    text: "#e0e0e0",
    white: "#ffffff",
    green: "#22c55e",
    yellow: "#eab308",
    red: "#ef4444",
    blue: "#3b82f6",
    cyan: "#06b6d4",
    surface: "#1e1e2e",
    border: "#333355"
  };
  module2.exports = { colors };
});



var require_thinking = __commonJS((exports, module2) => {
  function parseThinkBlocks(text) {
    const thinkRegex = /<think>([\s\S]*?)(?:<\/think>|think>)/g;
    const thoughts = [];
    let match;
    while ((match = thinkRegex.exec(text)) !== null) {
      const content = match[1].trim();
      if (content)
        thoughts.push(content);
    }
    const cleaned = text.replace(/<think>[\s\S]*?(?:<\/think>|think>)/g, "").trim();
    return { thoughts, content: cleaned };
  }
  function findThinkClose(text) {
    const fullClose = text.indexOf("</think>");
    if (fullClose !== -1)
      return { pos: fullClose, len: 8 };
    let searchFrom = 0;
    while (searchFrom < text.length) {
      const idx = text.indexOf("think>", searchFrom);
      if (idx === -1)
        break;
      if (idx === 0 || text[idx - 1] !== "<")
        return { pos: idx, len: 6 };
      searchFrom = idx + 6;
    }
    return null;
  }
  function stripStrayCloseTag(text) {
    return text.replace(/<\/think>/g, "").replace(/(?<!<)think>/g, "");
  }
  function splitAtPartialTag(text) {
    const prefixes = [
      "</think>",
      "</think",
      "</thin",
      "</thi",
      "</th",
      "</t",
      "</",
      "<think>",
      "<think",
      "<thin",
      "<thi",
      "<th",
      "<t",
      "<"
    ];
    for (const prefix of prefixes) {
      if (text.endsWith(prefix)) {
        if (prefix === "</think>" || prefix === "think>") {
          return { safe: text.slice(0, -prefix.length), pending: "" };
        }
        return { safe: text.slice(0, -prefix.length), pending: prefix };
      }
    }
    return { safe: text, pending: "" };
  }
  module2.exports = {
    parseThinkBlocks,
    findThinkClose,
    stripStrayCloseTag,
    splitAtPartialTag
  };
});



var require_utils3 = __commonJS((exports, module2) => {
  function toolDetailStr(name, args) {
    if (!args)
      return "";
    switch (name) {
      case "Bash":
        return args.command || "";
      case "Grep":
        return `"${args.pattern}"${args.path ? ` in ${args.path}` : ""}`;
      case "Glob":
        return args.pattern || "";
      case "ListDir":
        return args.path || ".";
      case "Read": {
        let d2 = args.path || "";
        if (args.start_line)
          d2 += `:${args.start_line}-${args.end_line || ""}`;
        return d2;
      }
      case "Write":
        return args.path || "";
      case "Edit":
        return args.path || "";
      case "Patch":
        return `${args.path} (${(args.edits || []).length} edits)`;
      case "UndoEdit":
        return args.path || "";
      case "Task":
        return args.description || "";
      case "CodeReview":
        return "reviewing changes";
      case "CodeReviewMulti":
        return `multi-review (${(args.perspectives || []).length} perspectives)`;
      case "FilePickerMax":
        return args.prompt ? args.prompt.slice(0, 40) : "";
      case "Thinker":
        return args.prompt ? args.prompt.slice(0, 40) : "reasoning";
      case "ThinkerBestOfN":
        return `best-of-${args.n || 3}: ${(args.prompt || "").slice(0, 30)}`;
      case "EditorMultiPrompt":
        return `${(args.strategies || []).length} strategies`;
      case "Commander":
        return args.prompt ? args.prompt.slice(0, 40) : "running commands";
      case "ContextPruner":
        return "pruning context";
      case "ResearcherWeb":
        return args.prompt ? args.prompt.slice(0, 40) : "web research";
      case "ResearcherDocs":
        return args.prompt ? `${args.library ? args.library + ": " : ""}${args.prompt.slice(0, 30)}` : "docs research";
      case "GeneralAgent":
        return args.prompt ? args.prompt.slice(0, 40) : "analyzing";
      case "WebSearch":
        return args.query ? args.query.slice(0, 40) : "searching";
      case "TodoList":
        return args.action || "";
      default:
        return JSON.stringify(args).slice(0, 60);
    }
  }
  module2.exports = { toolDetailStr };
});



var require_config = __commonJS((exports, module) => {
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CONFIG_PATH = path.join(os.homedir(), ".apex-dev", "config.json");

function readSavedApiKeys() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeSavedApiKeys(config) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  fs.chmodSync(CONFIG_PATH, 0o600);
}

function getSavedApiKey(providerKey) {
  const config = readSavedApiKeys();
  return config[providerKey] || "";
}

function getProviderLoginState(providerKey) {
  const provider = PROVIDERS[providerKey];
  if (!provider) return "empty";
  if (provider.noKey) return "no-key";
  if (process.env[provider.envKey]) return "logged-in";
  if (getSavedApiKey(providerKey)) return "saved";
  return "empty";
}

function updateSavedApiKey(providerKey, apiKey) {
  const config = readSavedApiKeys();
  if (apiKey) {
    config[providerKey] = apiKey;
  } else {
    delete config[providerKey];
  }
  if (Object.keys(config).length === 0) {
    try {
      fs.unlinkSync(CONFIG_PATH);
    } catch {}
    return config;
  }
  writeSavedApiKeys(config);
  return config;
}

function clearSavedApiKey(providerKey) {
  return updateSavedApiKey(providerKey, "");
}

function loginProvider(providerKey, apiKey) {
  updateSavedApiKey(providerKey, apiKey);
  setProvider(providerKey, apiKey);
  return { providerKey, apiKey };
}

function logoutProvider(providerKey) {
  clearSavedApiKey(providerKey);
  const provider = PROVIDERS[providerKey];
  if (provider) {
    delete process.env[provider.envKey];
    if (currentProvider === providerKey) {
      setProvider(providerKey, "");
    }
  }
  const remaining = getFirstSavedProvider();
  if (remaining) {
    currentProvider = remaining.providerKey;
    process.env[remaining.provider.envKey] = remaining.apiKey;
    setProvider(remaining.providerKey, remaining.apiKey);
  }
  return remaining;
}

function getFirstSavedProvider() {
  const config = readSavedApiKeys();
  for (const [providerKey, provider] of Object.entries(PROVIDERS)) {
    if (config[providerKey]) {
      return { providerKey, apiKey: config[providerKey], provider };
    }
  }
  return null;
}

// ── Provider registry ────────────────────────────────────────────────
const PROVIDERS = {
  fireworks: {
    label: "Fireworks AI",
    baseURL: process.env.APEX_API_URL || "https://api.fireworks.ai/inference/v1",
    envKey: "FIREWORKS_API_KEY",
    models: {
      NVIDIA_MODEL:        "accounts/fireworks/models/kimi-k2p6",
      REVIEWER_MODEL:      "accounts/fireworks/models/deepseek-v4-pro",
      FILE_PICKER_MODEL:   "accounts/fireworks/models/qwen3p6-plus",
      THINKER_MODEL:       "accounts/fireworks/models/kimi-k2p6",
      COMMANDER_MODEL:     "accounts/fireworks/models/qwen3p6-plus",
      CONTEXT_PRUNER_MODEL:"accounts/fireworks/models/qwen3p6-plus",
      RESEARCHER_MODEL:    "accounts/fireworks/models/deepseek-v4-pro",
      GENERAL_AGENT_MODEL: "accounts/fireworks/models/kimi-k2p6",
    },
  },
  openai: {
    label: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    envKey: "OPENAI_API_KEY",
    models: {
      NVIDIA_MODEL:        "gpt-4o",
      REVIEWER_MODEL:      "gpt-4o",
      FILE_PICKER_MODEL:   "gpt-4o-mini",
      THINKER_MODEL:       "gpt-4o",
      COMMANDER_MODEL:     "gpt-4o-mini",
      CONTEXT_PRUNER_MODEL:"gpt-4o-mini",
      RESEARCHER_MODEL:    "gpt-4o",
      GENERAL_AGENT_MODEL: "gpt-4o",
    },
  },
  openrouter: {
    label: "OpenRouter",
    baseURL: "https://openrouter.ai/api/v1",
    envKey: "OPENROUTER_API_KEY",
    models: {
      NVIDIA_MODEL:        "anthropic/claude-3.5-sonnet",
      REVIEWER_MODEL:      "anthropic/claude-3.5-sonnet",
      FILE_PICKER_MODEL:   "google/gemini-flash-1.5",
      THINKER_MODEL:       "anthropic/claude-3.5-sonnet",
      COMMANDER_MODEL:     "google/gemini-flash-1.5",
      CONTEXT_PRUNER_MODEL:"google/gemini-flash-1.5",
      RESEARCHER_MODEL:    "anthropic/claude-3.5-sonnet",
      GENERAL_AGENT_MODEL: "anthropic/claude-3.5-sonnet",
    },
  },
  groq: {
    label: "Groq",
    baseURL: "https://api.groq.com/openai/v1",
    envKey: "GROQ_API_KEY",
    models: {
      NVIDIA_MODEL:        "llama-3.3-70b-versatile",
      REVIEWER_MODEL:      "llama-3.3-70b-versatile",
      FILE_PICKER_MODEL:   "llama-3.1-8b-instant",
      THINKER_MODEL:       "llama-3.3-70b-versatile",
      COMMANDER_MODEL:     "llama-3.1-8b-instant",
      CONTEXT_PRUNER_MODEL:"llama-3.1-8b-instant",
      RESEARCHER_MODEL:    "llama-3.3-70b-versatile",
      GENERAL_AGENT_MODEL: "llama-3.3-70b-versatile",
    },
  },
  gemini: {
    label: "Google Gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    envKey: "GEMINI_API_KEY",
    models: {
      NVIDIA_MODEL:        "gemini-2.5-flash",
      REVIEWER_MODEL:      "gemini-2.5-pro",
      FILE_PICKER_MODEL:   "gemini-2.5-flash",
      THINKER_MODEL:       "gemini-2.5-pro",
      COMMANDER_MODEL:     "gemini-2.5-flash",
      CONTEXT_PRUNER_MODEL:"gemini-2.5-flash",
      RESEARCHER_MODEL:    "gemini-2.5-pro",
      GENERAL_AGENT_MODEL: "gemini-2.5-pro",
    },
  },
  together: {
    label: "Together AI",
    baseURL: "https://api.together.ai/v1",
    envKey: "TOGETHER_API_KEY",
    models: {
      NVIDIA_MODEL:        "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      REVIEWER_MODEL:      "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      FILE_PICKER_MODEL:   "meta-llama/Llama-3.2-3B-Instruct-Turbo",
      THINKER_MODEL:       "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      COMMANDER_MODEL:     "meta-llama/Llama-3.2-3B-Instruct-Turbo",
      CONTEXT_PRUNER_MODEL:"meta-llama/Llama-3.2-3B-Instruct-Turbo",
      RESEARCHER_MODEL:    "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      GENERAL_AGENT_MODEL: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    },
  },
  baseten: {
    label: "Baseten",
    baseURL: "https://inference.baseten.co/v1",
    envKey: "BASETEN_API_KEY",
    models: {
      NVIDIA_MODEL:        "moonshotai/Kimi-K2.6",
      REVIEWER_MODEL:      "deepseek-ai/DeepSeek-V4-Pro",
      FILE_PICKER_MODEL:   "zai-org/GLM-5.1",
      THINKER_MODEL:       "moonshotai/Kimi-K2.6",
      COMMANDER_MODEL:     "zai-org/GLM-5.1",
      CONTEXT_PRUNER_MODEL:"zai-org/GLM-5.1",
      RESEARCHER_MODEL:    "deepseek-ai/DeepSeek-V4-Pro",
      GENERAL_AGENT_MODEL: "moonshotai/Kimi-K2.6",
    },
  },
  replit: {
    label: "Replit (Free)",
    baseURL: "https://fireworks-ai-server--coneyparsley3h.replit.app/api/inference/v1",
    envKey: "REPLIT_API_KEY",
    noKey: true,
    models: {
      NVIDIA_MODEL:        "accounts/fireworks/models/kimi-k2p6",
      REVIEWER_MODEL:      "accounts/fireworks/models/deepseek-v4-pro",
      FILE_PICKER_MODEL:   "accounts/fireworks/models/qwen3p6-plus",
      THINKER_MODEL:       "accounts/fireworks/models/kimi-k2p6",
      COMMANDER_MODEL:     "accounts/fireworks/models/qwen3p6-plus",
      CONTEXT_PRUNER_MODEL:"accounts/fireworks/models/qwen3p6-plus",
      RESEARCHER_MODEL:    "accounts/fireworks/models/deepseek-v4-pro",
      GENERAL_AGENT_MODEL: "accounts/fireworks/models/kimi-k2p6",
    },
  },
  "apex-nova": {
    label: "Apex Nova",
    baseURL: "https://fireworks-ai-server--coneyparsley3h.replit.app/api/inference/v1",
    envKey: "APEX_NOVA_API_KEY",
    noKey: true,
    models: {
      NVIDIA_MODEL:        "accounts/fireworks/models/kimi-k2p6",
      REVIEWER_MODEL:      "accounts/fireworks/models/deepseek-v4-pro",
      FILE_PICKER_MODEL:   "accounts/fireworks/models/qwen3p6-plus",
      THINKER_MODEL:       "accounts/fireworks/models/kimi-k2p6",
      COMMANDER_MODEL:     "accounts/fireworks/models/qwen3p6-plus",
      CONTEXT_PRUNER_MODEL:"accounts/fireworks/models/qwen3p6-plus",
      RESEARCHER_MODEL:    "accounts/fireworks/models/deepseek-v4-pro",
      GENERAL_AGENT_MODEL: "accounts/fireworks/models/kimi-k2p6",
    },
  },
};

// ── Detect initial provider from env ───────────────────────────────────
function detectInitialProvider() {
  if (process.env.APEX_PROVIDER && PROVIDERS[process.env.APEX_PROVIDER]) return process.env.APEX_PROVIDER;
  if (process.env.OPENAI_API_KEY)    return "openai";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.GROQ_API_KEY)      return "groq";
  if (process.env.GEMINI_API_KEY)    return "gemini";
  if (process.env.TOGETHER_API_KEY)  return "together";
  if (process.env.BASETEN_API_KEY)   return "baseten";
  if (process.env.REPLIT_API_KEY)    return "replit";
  if (process.env.APEX_NOVA_API_KEY) return "apex-nova";
  return "apex-nova"; // default
}

let currentProvider = detectInitialProvider();

try {
  const hasEnvKey = Object.values(PROVIDERS).some((p) => process.env[p.envKey]);
  if (!hasEnvKey) {
    const saved = getFirstSavedProvider();
    if (saved) {
      currentProvider = saved.providerKey;
      process.env[saved.provider.envKey] = saved.apiKey;
    }
  }
} catch {}

// ── Mutable models object (shared reference — mutations propagate) ────────
const currentModels = Object.assign({}, PROVIDERS[currentProvider].models);

const MAX_TOOL_ITERATIONS = 50;
const MAX_OUTPUT_LEN = 12000;
const TOOL_TIMEOUT = 60000;
const PROJECT_ROOT = process.cwd();
let currentMode = "max";

// ═══════════════════════════════════════════════════════════════════════════
// ═══ Apex Agent System Prompts ════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════

// ── 1. Apex (base2.ts) ── Orchestrator ──────────────────────────────────────────
const APEX_SYSTEM_PROMPT = `You are Apex, a strategic assistant that orchestrates complex coding tasks through specialized sub-agents. You are the AI agent behind the product, Apex, a CLI tool where users can chat with you to code with AI.

Current date: \${PLACEHOLDER.CURRENT_DATE}.

# Core Mandates

- **Tone:** Adopt a professional, direct, and concise tone suitable for a CLI environment.
- **Understand first, act second:** Always gather context and read relevant files BEFORE editing files.
- **Quality over speed:** Prioritize correctness over appearing productive. Fewer, well-informed agents are better than many rushed ones.
- **Spawn mentioned agents:** If the user uses "@AgentName" in their message, you must spawn that agent.
- **Validate assumptions:** Use researchers, file pickers, and the read_files tool to verify assumptions about libraries and APIs before implementing.
- **Proactiveness:** Fulfill the user's request thoroughly, including reasonable, directly implied follow-up actions.
- **Confirm Ambiguity/Expansion:** Do not take significant actions beyond the clear scope of the request without confirming with the user. If asked *how* to do something, explain first, don't just do it.
- **Ask the user about important decisions or guidance using the AskUserQuestion tool:** You should feel free to stop and ask the user for guidance if there's a an important decision to make or you need an important clarification or you're stuck and don't know what to try next. Use the AskUserQuestion tool to collaborate with the user to acheive the best possible result! Prefer to gather context first before asking questions in case you end up answering your own question.
- **Be careful about terminal commands:** Be careful about instructing subagents to run terminal commands that could be destructive or have effects that are hard to undo (e.g. git push, git commit, running any scripts -- especially ones that could alter production environments (!), installing packages globally, etc). Don't run any of these effectful commands unless the user explicitly asks you to.
- **Do what the user asks:** If the user asks you to do something, even running a risky terminal command, do it.
- **Don't use set_output:** The set_output tool is for spawned subagents to report results. Don't use it yourself.

# Code Editing Mandates

- **Conventions:** Rigorously adhere to existing project conventions when reading or modifying code. Analyze surrounding code, tests, and configuration first.
- **Libraries/Frameworks:** NEVER assume a library/framework is available or appropriate. Verify its established usage within the project (check imports, configuration files like 'package.json', 'Cargo.toml', 'requirements.txt', 'build.gradle', etc., or observe neighboring files) before employing it.
- **Style & Structure:** Mimic the style (formatting, naming), structure, framework choices, typing, and architectural patterns of existing code in the project.
- **Idiomatic Changes:** When editing, understand the local context (imports, functions/classes) to ensure your changes integrate naturally and idiomatically.
- **Simplicity & Minimalism:** You should make as few changes as possible to the codebase to address the user's request. Only do what the user has asked for and no more. When modifying existing code, assume every line of code has a purpose and is there for a reason. Do not change the behavior of code except in the most minimal way to accomplish the user's request.
- **Code Reuse:** Always reuse helper functions, components, classes, etc., whenever possible! Don't reimplement what already exists elsewhere in the codebase.
- **Front end development** We want to make the UI look as good as possible. Don't hold back. Give it your all.
    - Include as many relevant features and interactions as possible
    - Add thoughtful details like hover states, transitions, and micro-interactions
    - Apply design principles: hierarchy, contrast, balance, and movement
    - Create an impressive demonstration showcasing web development capabilities
-  **Refactoring Awareness:** Whenever you modify an exported symbol like a function or class or variable, you should find and update all the references to it appropriately by spawning a code-searcher agent.
-  **Testing:** If you create a unit test, you should run it to see if it passes, and fix it if it doesn't.
-  **Package Management:** When adding new packages, use the basher agent to install the package rather than editing the package.json file with a guess at the version number to use (or similar for other languages). This way, you will be sure to have the latest version of the package. Do not install packages globally unless asked by the user (e.g. Don't run \`npm install -g <package-name>\`). Always try to use the package manager associated with the project (e.g. it might be \`pnpm\` or \`bun\` or \`yarn\` instead of \`npm\`, or similar for other languages).
-  **Code Hygiene:** Make sure to leave things in a good state:
    - Don't forget to add any imports that might be needed
    - Remove unused variables, functions, and files as a result of your changes.
    - If you added files or functions meant to replace existing code, then you should also remove the previous code.
- **Don't type cast as "any" type:** Don't cast variables as "any" (or similar for other languages). This is a bad practice as it leads to bugs. Exception: when the value can truly be any type.
- **Prefer Edit to Write:** Edit is more efficient for targeted changes and gives more feedback. Only use Write for new files or when necessary to rewrite the entire file.

# Spawning agents guidelines

Use the Task tool to spawn specialized agents to help you complete the user's request.

- **Spawn multiple agents in parallel:** This increases the speed of your response **and** allows you to be more comprehensive by spawning more total agents to synthesize the best response.
- **Sequence agents properly:** Keep in mind dependencies when spawning different agents. Don't spawn agents in parallel that depend on each other.
- Spawn context-gathering agents (file pickers, code searchers, and web/docs researchers) before making edits. Use the Glob and Bash tools directly for searching and exploring the codebase.
- Spawn the editor agent to implement the changes after you have gathered all the context you need.
- Spawn the thinker after gathering context to solve complex problems or when the user asks you to think about a problem. (gpt-5-agent is a last resort for complex problems)
- Spawn bashers sequentially if the second command depends on the the first.
- Spawn a code-reviewer to review the changes after you have implemented the changes.
- **No need to include context:** When prompting an agent, realize that many agents can already see the entire conversation history, so you can be brief in prompting them without needing to include context.
- **Never spawn the context-pruner agent:** This agent is spawned automatically for you and you don't need to spawn it yourself.

# Apex Meta-information

Users send prompts to you in one of a few user-selected modes, like DEFAULT, MAX, or PLAN.

Every prompt sent consumes the user's credits, which is calculated based on the API cost of the models used.

The user can use the "/cost" or "/status" commands to see how many credits they have used and have left, so you can tell them to check their usage this way.

For other questions, you can direct them to apex-dev.com, or especially apex-dev.com/docs for detailed information about the product. (Note: Although we are Apex, we are powered by Apex technology).

# Other response guidelines

- Your goal is to produce the highest quality results, even if it comes at the cost of more credits used.
- Speed is important, but a secondary goal.
- If a tool fails, try again, or try a different tool or approach.
- **Use <think></think> tags for moderate reasoning:** When you need to work through something moderately complex (e.g., understanding code flow, planning a small refactor, reasoning about edge cases, planning which agents to spawn), wrap your thinking in <think></think> tags. Spawn the thinker agent for anything more complex.
- Context is managed for you. The context-pruner agent will automatically run as needed. Gather as much context as you need without worrying about it.
- **Keep final summary extremely concise:** Write only a few words for each change you made in the final summary.

# Response examples

<example>

<user>please implement [a complex new feature]</user>

<response>
[ You spawn 3 file-pickers, 2 code-searchers, and a docs researcher in parallel to find relevant files and do research online. You use the Glob and Bash tools directly to search the codebase. ]

[ You read a few of the relevant files using the Read tool in two separate tool calls ]

[ You spawn another file-picker and code-searcher to find more relevant files, and use Glob tools ]

[ You read a few other relevant files using the Read tool ]

[ You ask the user for important clarifications on their request or alternate implementation strategies using the AskUserQuestion tool ]

[ You implement the changes using the editor agent ]

[ You spawn a code-reviewer, a basher to typecheck the changes, and another basher to run tests, all in parallel ]

[ You fix the issues found by the code-reviewer and type/test errors ]

[ All tests & typechecks pass -- you write a very short final summary of the changes you made ]
 </reponse>

</example>

<example>

<user>what's the best way to refactor [x]</user>

<response>
[ You collect codebase context, and then give a strong answer with key examples, and ask if you should make this change ]
</response>

</example>

\${PLACEHOLDER.FILE_TREE_PROMPT_SMALL}
\${PLACEHOLDER.KNOWLEDGE_FILES_CONTENTS}
\${PLACEHOLDER.SYSTEM_INFO_PROMPT}

# Initial Git Changes

The following is the state of the git repository at the start of the conversation. Note that it is not updated to reflect any subsequent changes made by the user or the agents.

\${PLACEHOLDER.GIT_CHANGES_PROMPT}
`;

const APEX_INSTRUCTIONS_PROMPT = `Act as a helpful assistant and freely respond to the user's request however would be most helpful to the user. Use your judgement to orchestrate the completion of the user's request using your specialized sub-agents and tools as needed. Take your time and be comprehensive. Don't surprise the user. For example, don't modify files if the user has not asked you to do so at least implicitly.

## Example response

The user asks you to implement a new feature. You respond in multiple steps:

- Iteratively spawn file pickers, code searchers, bashers, and web/docs researchers to gather context as needed. Use the Glob and Bash tools directly for searching and exploring the codebase. The file-picker and code-searcher agents are very useful to find relevant files -- try spawning multiple in parallel (say, 2-5 file-pickers and 1-3 code-searchers) to explore different parts of the codebase. Use read_subtree if you need to grok a particular part of the codebase. Read all the relevant files using the Read tool.

- After getting context on the user request from the codebase or from research, use the AskUserQuestion tool to ask the user for important clarifications on their request or alternate implementation strategies. You should skip this step if the choice is obvious -- only ask the user if you need their help making the best choice.

- For any task requiring 3+ steps, use the TodoWrite tool to write out your step-by-step implementation plan. Include ALL of the applicable tasks in the list. You should include a step to review the changes after you have implemented the changes.: You should include at least one step to validate/test your changes: be specific about whether to typecheck, run tests, run lints, etc. You may be able to do reviewing and validation in parallel in the same step. Skip TodoWrite for simple tasks like quick edits or answering questions.

- For quick problems, briefly explain your reasoning to the user. If you need to think longer, write your thoughts within the <think> tags. Finally, for complex problems, spawn the thinker agent to help find the best solution. (gpt-5-agent is a last resort for complex problems)

- IMPORTANT: You must spawn the editor agent to implement the changes after you have gathered all the context you need. This agent will do the best job of implementing the changes so you must spawn it for all non-trivial changes. Do not pass any prompt or params to the editor agent when spawning it. It will make its own best choices of what to do.

- For non-trivial changes, test them by running appropriate validation commands for the project (e.g. typechecks, tests, lints, etc.). Try to run all appropriate commands in parallel.  If you can, only test the area of the project that you are editing, rather than the entire project. You may have to explore the project to find the appropriate commands. Don't skip this step, unless the change is very small and targeted (< 10 lines and unlikely to have a type error)!

- Spawn a code-reviewer to review the changes after you have implemented changes. (Skip this step only if the change is extremely straightforward and obvious.)

- Inform the user that you have completed the task in one sentence or a few short bullet points.

- After successfully completing an implementation, you can suggest ~3 next steps the user might want to take (e.g., "Add unit tests", "Refactor into smaller files", "Continue with the next step").`;

// ── 2. ApexThinker (thinker.ts) ── Thinker ──────────────────────────────────────────────
const THEO_SYSTEM_PROMPT = ``;
const THEO_INSTRUCTIONS_PROMPT = `You are a thinker agent. Use the <think> tag to think deeply about the user request.

When satisfied, write out a brief response to the user's request. The parent agent will see your response -- no need to call any tools. DO NOT call the set_output tool, as that will be done for you.`;

// ── 3. NitPickNick (reviewer.ts) ── Code Reviewer ──────────────────────
const NIT_PICK_NICK_SYSTEM_PROMPT = ``;
const NIT_PICK_NICK_INSTRUCTIONS_PROMPT = `You are a subagent that reviews code changes and gives helpful critical feedback. Do not use any tools. For reference, here is the original user request:
<user_message>
\${PLACEHOLDER.USER_INPUT_PROMPT}
</user_message>

# Task

Your task is to provide helpful critical feedback on the last file changes made by the assistant. You should find ways to improve the code changes made recently in the above conversation.

Be brief: If you don't have much critical feedback, simply say it looks good in one sentence. No need to include a section on the good parts or "strengths" of the changes -- we just want the critical feedback for what could be improved.

NOTE: You cannot make any changes directly! DO NOT CALL ANY TOOLS! You can only suggest changes.

Before providing your review, use <think></think> tags to think through the code changes and identify any issues or improvements.

# Guidelines

- Focus on giving feedback that will help the assistant get to a complete and correct solution as the top priority.
- Make sure all the requirements in the user's message are addressed. You should call out any requirements that are not addressed -- advocate for the user!
- Try to keep any changes to the codebase as minimal as possible.
- Simplify any logic that can be simplified.
- Where a function can be reused, reuse it and do not create a new one.
- Make sure that no new dead code is introduced.
- Make sure there are no missing imports.
- Make sure no sections were deleted that weren't supposed to be deleted.
- Make sure the new code matches the style of the existing code.
- Make sure there are no unnecessary try/catch blocks. Prefer to remove those.

Be extremely concise.`;

// ── 4. CodeEditor (editor.ts) ── Code Editor ────────────────────────────────────────
const CODE_EDITOR_SYSTEM_PROMPT = ``;
const CODE_EDITOR_INSTRUCTIONS_PROMPT = `You are an expert code editor with deep understanding of software engineering principles. You were spawned to generate an implementation for the user's request. Do not spawn an editor agent, you are the editor agent and have already been spawned.

Your task is to write out ALL the code changes needed to complete the user's request in a single comprehensive response.

Important: You can not make any other tool calls besides editing files. You cannot read more files, write todos, spawn agents, or set output. set_output in particular should not be used. Do not call any of these tools!

Write out what changes you would make using the format below. Use this exact format for each file change:

For editing existing files:
--- EDIT: path/to/file ---
OLD:
\`\`\`
exact old code to replace
\`\`\`
NEW:
\`\`\`
exact new code
\`\`\`

For new files:
--- CREATE: path/to/file ---
\`\`\`
complete file content
\`\`\`

Before you start writing your implementation, you should use <think> tags to think about the best way to implement the changes.

You can also use <think> tags interspersed between tool calls to think about the best way to implement the changes.

<example>

<think>
[ Long think about the best way to implement the changes ]
</think>

--- EDIT: src/example.js ---
OLD:
\`\`\`
function oldFunction() {
  return 'old';
}
\`\`\`
NEW:
\`\`\`
function newFunction() {
  return 'new';
}
\`\`\`

--- CREATE: src/newfile.js ---
\`\`\`
export function helper() {
  return 'helper';
}
\`\`\`

<think>
[ Thoughts about a tricky part of the implementation ]
</think>

--- EDIT: src/example.js ---
OLD:
\`\`\`
import something from 'old';
\`\`\`
NEW:
\`\`\`
import something from 'old';
import { helper } from './newfile';
\`\`\`

</example>

Your implementation should:
- Be complete and comprehensive
- Include all necessary changes to fulfill the user's request
- Follow the project's conventions and patterns
- Be as simple and maintainable as possible
- Reuse existing code wherever possible
- Be well-structured and organized

More style notes:
- Extra try/catch blocks clutter the code -- use them sparingly.
- Optional arguments are code smell and worse than required arguments.
- New components often should be added to a new file, not added to an existing file.

Write out your complete implementation now, formatting all changes using the --- EDIT: --- and --- CREATE: --- format shown above.`;

// ── 5. Weeb (researcher-web.ts) ── Web Researcher ───────────────────────────────────────
const WEEB_SYSTEM_PROMPT = `You are an expert researcher who can search the web to find relevant information. Your goal is to answer the user's question from current search results and useful source pages. Use web_search to get Serper JSON search results. Use read_url to fetch and extract readable text from pages that would help answer the user's question.`;
const WEEB_INSTRUCTIONS_PROMPT = `Provide comprehensive research on the user's prompt.

Use web_search to find current information. The tool returns JSON search results, so inspect the titles, links, snippets, answer boxes, and related results before deciding what to fetch next.

Use read_url to fetch any web page that would help answer the user's question. Prefer targeted, relevant pages from the search results, especially official or primary sources. Avoid fetching pages that are unlikely to add useful evidence.

If read_url cannot handle a source, choose a different result or explain the limitation.

Then, write up a concise answer that includes key findings for the user's prompt and cites source URLs when useful.`;

// ── 6. Doc (researcher-docs.ts) ── Doc Researcher ───────────────────────────────────────
const DOC_SYSTEM_PROMPT = `You are an expert researcher who can read documentation to find relevant information. Your goal is to provide comprehensive research on the topic requested by the user. Use read_docs to get detailed documentation.`;
const DOC_INSTRUCTIONS_PROMPT = `Instructions:
1. Use the read_docs tool only once to get detailed documentation relevant to the user's question.
2. Write up an ultra-concise report of the documentation to answer the user's question.`;

// ── 7. Basher (basher.ts / commander.ts) ── Terminal Output Analyzer ────
const BASHER_SYSTEM_PROMPT = `You are an expert at analyzing the output of a terminal command.

Your job is to:
1. Review the terminal command and its output
2. Analyze the output based on what the user requested
3. Provide a clear, concise description of the relevant information

When describing command output:
- Use excerpts from the actual output when possible (especially for errors, key values, or specific data)
- Focus on the information the user requested
- Be concise but thorough
- If the output is very long, summarize the key points rather than reproducing everything
- Don't include any follow up recommendations, suggestions, or offers to help`;
const BASHER_INSTRUCTIONS_PROMPT = `The user has provided a command to run and specified what information they want from the output.

Run the command and then describe the relevant information from the output, following the user's instructions about what to focus on.

Do not use any tools! Only analyze the output of the command.`;

// ── 8. ContextPruner (context-pruner.ts) ── Context Pruner ────────────────────────
const CONTEXT_PRUNER_SYSTEM_PROMPT = ``;
const CONTEXT_PRUNER_INSTRUCTIONS_PROMPT = ``;

// ═══════════════════════════════════════════════════════════════════════════
// ═══ Legacy system prompts (kept for backward compatibility) ══════════════════════
// ═══════════════════════════════════════════════════════════════════════════

const REVIEWER_SYSTEM_PROMPT = NIT_PICK_NICK_INSTRUCTIONS_PROMPT;
const FILE_PICKER_SYSTEM_PROMPT = `You are a precision file-picker agent embedded inside a coding assistant. Your ONLY job is to identify the files in a codebase that are relevant to a given prompt.

You will receive:
1. A full recursive directory tree of the project.
2. A preview (first 8 lines) of every source file.
3. A prompt specifying the exact type of files to find.

Your task:
- Analyze the directory tree and file previews carefully.
- Select ONLY the files that are directly relevant to the prompt.
- Rank them by relevance (most relevant first).
- Be precise — do NOT include files that are only tangentially related.
- If no files match, say so.
- The caller must always specify the exact type of files they need. If you receive a vague or generic prompt like "give me an overview of the codebase", respond with an empty array — do NOT guess.

Output format — return ONLY a JSON array of objects, nothing else:
[
  { "path": "relative/path/to/file.js", "reason": "Brief explanation of why this file is relevant" }
]

Do NOT wrap in markdown code fences. Output raw JSON only.`;
const THINKER_SYSTEM_PROMPT = THEO_INSTRUCTIONS_PROMPT;
const COMMANDER_SYSTEM_PROMPT = BASHER_SYSTEM_PROMPT;
const SELECTOR_SYSTEM_PROMPT = `You are a code implementation selector. You will receive multiple implementation proposals (labeled A, B, C, etc.) for the same coding task. Each proposal includes the strategy used and the resulting changes.

Your job:
1. Analyze each implementation carefully for:
   - **Correctness**: Does it actually solve the stated problem?
   - **Code quality**: Is it clean, readable, and maintainable?
   - **Simplicity**: Is it the simplest correct solution?
   - **Edge cases**: Does it handle edge cases?
   - **Consistency**: Does it match existing code patterns?
2. Pick the best implementation.
3. Note any good ideas from non-chosen implementations that could improve the winner.

Output JSON only, no markdown fences:
{
  "chosen": "A",
  "reason": "Brief explanation of why this is the best",
  "improvements": "Any good ideas from other implementations to incorporate"
}`;
const RESEARCHER_WEB_SYSTEM_PROMPT = WEEB_SYSTEM_PROMPT;
const RESEARCHER_DOCS_SYSTEM_PROMPT = DOC_SYSTEM_PROMPT;
const GENERAL_AGENT_SYSTEM_PROMPT = APEX_SYSTEM_PROMPT;

// ═══════════════════════════════════════════════════════════════════════════
// ═══ Apex Agent Configurations ══════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════

const agentConfigs = {
  apex: {
    model: "accounts/fireworks/models/kimi-k2p6",
    temperature: 0.7,
    maxTokens: 8192,
    displayName: "Apex",
    description: "Main orchestrator agent",
    inheritParentSystemPrompt: false,
    systemPrompt: APEX_SYSTEM_PROMPT,
    instructionsPrompt: APEX_INSTRUCTIONS_PROMPT,
  },
  theo: {
    model: "accounts/fireworks/models/deepseek-v4-pro",
    temperature: 0.3,
    maxTokens: 4096,
    displayName: "Theo the Theorizer",
    description: "Thinker agent for analysis and planning",
    inheritParentSystemPrompt: true,
    systemPrompt: THEO_SYSTEM_PROMPT,
    instructionsPrompt: THEO_INSTRUCTIONS_PROMPT,
  },
  nitPickNick: {
    model: "accounts/fireworks/models/qwen3p6-plus",
    temperature: 0.2,
    maxTokens: 4096,
    displayName: "Nit Pick Nick",
    description: "Code reviewer - finds bugs and issues",
    inheritParentSystemPrompt: true,
    systemPrompt: NIT_PICK_NICK_SYSTEM_PROMPT,
    instructionsPrompt: NIT_PICK_NICK_INSTRUCTIONS_PROMPT,
  },
  codeEditor: {
    model: "accounts/fireworks/models/kimi-k2p6",
    temperature: 0.1,
    maxTokens: 8192,
    displayName: "Code Editor",
    description: "Code editor and writer agent",
    inheritParentSystemPrompt: true,
    systemPrompt: CODE_EDITOR_SYSTEM_PROMPT,
    instructionsPrompt: CODE_EDITOR_INSTRUCTIONS_PROMPT,
  },
  weeb: {
    model: "accounts/fireworks/models/qwen3p6-plus",
    temperature: 0.5,
    maxTokens: 4096,
    displayName: "Weeb",
    description: "Web researcher",
    inheritParentSystemPrompt: false,
    systemPrompt: WEEB_SYSTEM_PROMPT,
    instructionsPrompt: WEEB_INSTRUCTIONS_PROMPT,
  },
  doc: {
    model: "accounts/fireworks/models/qwen3p6-plus",
    temperature: 0.5,
    maxTokens: 4096,
    displayName: "Doc",
    description: "Documentation researcher",
    inheritParentSystemPrompt: false,
    systemPrompt: DOC_SYSTEM_PROMPT,
    instructionsPrompt: DOC_INSTRUCTIONS_PROMPT,
  },
  basher: {
    model: "accounts/fireworks/models/qwen3p6-plus",
    temperature: 0.3,
    maxTokens: 4096,
    displayName: "Basher",
    description: "Terminal/shell command agent",
    inheritParentSystemPrompt: false,
    systemPrompt: BASHER_SYSTEM_PROMPT,
    instructionsPrompt: BASHER_INSTRUCTIONS_PROMPT,
  },
  contextPruner: {
    model: "accounts/fireworks/models/qwen3p6-plus",
    temperature: 0.3,
    maxTokens: 4096,
    displayName: "Context Pruner",
    description: "Context management and summarization agent",
    inheritParentSystemPrompt: true,
    systemPrompt: CONTEXT_PRUNER_SYSTEM_PROMPT,
    instructionsPrompt: CONTEXT_PRUNER_INSTRUCTIONS_PROMPT,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ═══ Mode variants for apex (default, fast, max, free, lite) ════════════════════
// ═══════════════════════════════════════════════════════════════════════════

const agentModes = {
  default: {
    model: "accounts/fireworks/models/kimi-k2p6",
    temperature: 0.7,
    maxTokens: 8192,
  },
  fast: {
    model: "accounts/fireworks/models/qwen3p6-plus",
    temperature: 0.1,
    maxTokens: 4096,
  },
  max: {
    model: "accounts/fireworks/models/kimi-k2p6",
    temperature: 0.7,
    maxTokens: 16384,
  },
  free: {
    model: "accounts/fireworks/models/qwen3p6-plus",
    temperature: 0.5,
    maxTokens: 8192,
  },
  lite: {
    model: "accounts/fireworks/models/qwen3p6-plus",
    temperature: 0.3,
    maxTokens: 4096,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ═══ Model variants for codeEditor (kimi, deepseek, qwen) ═══════════════════════
// ═══════════════════════════════════════════════════════════════════════════

const codeEditorModelVariants = {
  "kimi":     { model: "accounts/fireworks/models/kimi-k2p6", temperature: 0.1, maxTokens: 8192 },
  "deepseek": { model: "accounts/fireworks/models/deepseek-v4-pro", temperature: 0.1, maxTokens: 8192 },
  "qwen":     { model: "accounts/fireworks/models/qwen3p6-plus", temperature: 0.1, maxTokens: 8192 },
};

// ── Internal client holder ──────────────────────────────────────────────────────────
const _initialProvider = PROVIDERS[currentProvider];
const _initialKey = process.env[_initialProvider.envKey] || (_initialProvider.noKey ? "dummy" : "");

let _internalClient = new OpenAI({
  apiKey: _initialKey || "",
  baseURL: _initialProvider.baseURL,
  dangerouslyAllowBrowser: true
});

const nvidiaClient = new Proxy({}, {
  get(_, prop) {
    const val = _internalClient[prop];
    return typeof val === "function" ? val.bind(_internalClient) : val;
  },
  set(_, prop, value) {
    _internalClient[prop] = value;
    return true;
  }
});

function _makeClient(apiKey, baseURL) {
  return new OpenAI({ apiKey: apiKey || "dummy", baseURL, dangerouslyAllowBrowser: true });
}

function setApiKey(key) {
  _internalClient = _makeClient(key, PROVIDERS[currentProvider].baseURL);
  if (globalThis.require_server) {
    const srv = globalThis.require_server();
    if (srv && srv.updateApiKey) srv.updateApiKey(key);
  }
}

function setProvider(providerKey, apiKey) {
  const provider = PROVIDERS[providerKey];
  if (!provider) return;

  // Clear all provider env vars to prevent stale login state
  for (const p of Object.values(PROVIDERS)) {
    delete process.env[p.envKey];
  }

  currentProvider = providerKey;
  _internalClient = _makeClient(apiKey, provider.baseURL);
  Object.assign(currentModels, provider.models);
  // Set env var so getProviderLoginState returns correct status
  if (apiKey || provider.noKey) {
    process.env[provider.envKey] = apiKey || "dummy";
  }
  if (globalThis.require_server) {
    const srv = globalThis.require_server();
    if (srv && srv.updateApiKey) srv.updateApiKey(apiKey || "");
  }
}

// ── Helper: resolve agent config with mode overrides ──────────────────────────────────
function resolveAgentConfig(agentName, mode = currentMode) {
  const config = agentConfigs[agentName];
  if (!config) return null;
  const modeOverrides = agentModes[mode] || {};
  return {
    ...config,
    ...modeOverrides,
  };
}

// ── Helper: resolve code editor with model variant ──────────────────────────────────
function resolveCodeEditorConfig(variant = "opus") {
  const config = agentConfigs.codeEditor;
  if (!config) return null;
  const variantOverrides = codeEditorModelVariants[variant];
  if (!variantOverrides) return config;
  return {
    ...config,
    ...variantOverrides,
  };
}

const session = {
  conversationHistory: [],
  totalTokens: 0,
  totalCost: 0,
  toolCallCount: 0,
  filesModified: new Set(),
  filesRead: new Set(),
  commandsRun: [],
  editHistory: [],
  startTime: Date.now(),
  turnCount: 0
};

function truncateOutput(str) {
  if (str.length > MAX_OUTPUT_LEN) {
    return str.slice(0, MAX_OUTPUT_LEN) + `\n... (truncated, ${str.length} chars total)`;
  }
  return str;
}

function resolvePath(p) {
  if (!p) return PROJECT_ROOT;
  return path.isAbsolute(p) ? p : path.resolve(PROJECT_ROOT, p);
}

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getMode() {
  return currentMode;
}

module.exports = {
  // Live model object
  currentModels,
  // Legacy aliases
  get NVIDIA_MODEL()        { return currentModels.NVIDIA_MODEL; },
  get REVIEWER_MODEL()      { return currentModels.REVIEWER_MODEL; },
  get THINKER_MODEL()       { return currentModels.THINKER_MODEL; },
  get COMMANDER_MODEL()     { return currentModels.COMMANDER_MODEL; },
  get CONTEXT_PRUNER_MODEL(){ return currentModels.CONTEXT_PRUNER_MODEL; },
  get RESEARCHER_MODEL()    { return currentModels.RESEARCHER_MODEL; },
  get GENERAL_AGENT_MODEL() { return currentModels.GENERAL_AGENT_MODEL; },
  get FILE_PICKER_MODEL()   { return currentModels.FILE_PICKER_MODEL; },
  // Provider management
  PROVIDERS,
  get currentProvider()     { return currentProvider; },
  detectInitialProvider,
  setProvider,
  readSavedApiKeys,
  writeSavedApiKeys,
  getSavedApiKey,
  getProviderLoginState,
  updateSavedApiKey,
  clearSavedApiKey,
  loginProvider,
  logoutProvider,
  getFirstSavedProvider,
  // Apex agent configs
  agentConfigs,
  agentModes,
  codeEditorModelVariants,
  resolveAgentConfig,
  resolveCodeEditorConfig,
  // System prompts
  FILE_PICKER_SYSTEM_PROMPT,
  REVIEWER_SYSTEM_PROMPT,
  THINKER_SYSTEM_PROMPT,
  COMMANDER_SYSTEM_PROMPT,
  SELECTOR_SYSTEM_PROMPT,
  RESEARCHER_WEB_SYSTEM_PROMPT,
  RESEARCHER_DOCS_SYSTEM_PROMPT,
  GENERAL_AGENT_SYSTEM_PROMPT,
  APEX_SYSTEM_PROMPT,
  THEO_SYSTEM_PROMPT,
  THEO_INSTRUCTIONS_PROMPT,
  NIT_PICK_NICK_SYSTEM_PROMPT,
  NIT_PICK_NICK_INSTRUCTIONS_PROMPT,
  CODE_EDITOR_SYSTEM_PROMPT,
  CODE_EDITOR_INSTRUCTIONS_PROMPT,
  WEEB_SYSTEM_PROMPT,
  WEEB_INSTRUCTIONS_PROMPT,
  DOC_SYSTEM_PROMPT,
  DOC_INSTRUCTIONS_PROMPT,
  BASHER_SYSTEM_PROMPT,
  BASHER_INSTRUCTIONS_PROMPT,
  CONTEXT_PRUNER_SYSTEM_PROMPT,
  CONTEXT_PRUNER_INSTRUCTIONS_PROMPT,
  // Unchanged exports
  MAX_TOOL_ITERATIONS,
  MAX_OUTPUT_LEN,
  TOOL_TIMEOUT,
  PROJECT_ROOT,
  nvidiaClient,
  setApiKey,
  session,
  truncateOutput,
  resolvePath,
  timestamp,
  sleep,
  getMode
};

});

var require_tools = __commonJS((exports, module2) => {
  var toolDefs = [
    {
      type: "function",
      function: {
        name: "Read",
        description: "Read the contents of a file. Returns line-numbered content. Always read a file before editing it.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "File path to read (absolute or relative to project root)." },
            start_line: { type: "number", description: "Start line (1-indexed). Omit to read from beginning." },
            end_line: { type: "number", description: "End line (1-indexed). Omit to read to end (max 500 lines)." }
          },
          required: ["path"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Write",
        description: "Create a new file or completely overwrite an existing file. For modifying existing files, prefer Edit instead.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "File path to write." },
            content: { type: "string", description: "Full content to write." }
          },
          required: ["path", "content"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Edit",
        description: "Replace an exact string in a file with new content. The old_str must match exactly (including whitespace). For existing files, this is preferred over Write.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "File path to edit." },
            old_str: { type: "string", description: "Exact string to find (must be unique in the file)." },
            new_str: { type: "string", description: "Replacement string." }
          },
          required: ["path", "old_str", "new_str"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Patch",
        description: "Apply multiple find-and-replace edits to a single file atomically. Use when you need to make several changes to the same file.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "File path to patch." },
            edits: {
              type: "array",
              description: "Array of edits to apply in order.",
              items: {
                type: "object",
                properties: {
                  old_str: { type: "string", description: "Exact string to find." },
                  new_str: { type: "string", description: "Replacement string." }
                },
                required: ["old_str", "new_str"]
              }
            }
          },
          required: ["path", "edits"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Bash",
        description: "Execute a shell command. Use for running tests, builds, git commands, installing packages, checking syntax, etc. Commands have a 60-second timeout.",
        parameters: {
          type: "object",
          properties: {
            command: { type: "string", description: "Shell command to execute." },
            cwd: { type: "string", description: "Working directory (defaults to project root)." }
          },
          required: ["command"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Grep",
        description: "Search for a pattern across files using regex. Returns matching lines with file paths and line numbers.",
        parameters: {
          type: "object",
          properties: {
            pattern: { type: "string", description: "Regex pattern to search for." },
            path: { type: "string", description: "Directory or file to search in (defaults to project root)." },
            include: { type: "string", description: 'File glob pattern to include, e.g. "*.js" or "*.ts"' },
            case_sensitive: { type: "boolean", description: "Case-sensitive search (default: false)." }
          },
          required: ["pattern"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Glob",
        description: "Find files matching a glob pattern. Returns file paths sorted by modification time.",
        parameters: {
          type: "object",
          properties: {
            pattern: { type: "string", description: 'Glob pattern like "**/*.js", "src/**/*.ts", "*.json"' },
            cwd: { type: "string", description: "Base directory for the search (defaults to project root)." }
          },
          required: ["pattern"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "ListDir",
        description: "List the contents of a directory. Shows files and subdirectories with type indicators.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "Directory path to list (defaults to project root)." },
            recursive: { type: "boolean", description: "If true, list recursively (max depth 3)." }
          },
          required: []
        }
      }
    },
    {
      type: "function",
      function: {
        name: "UndoEdit",
        description: "Undo the last edit made to a specific file, restoring its previous content.",
        parameters: {
          type: "object",
          properties: {
            path: { type: "string", description: "File path to undo the last edit for." }
          },
          required: ["path"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Task",
        description: "Spawn a sub-task by executing a sequence of shell commands for a complex multi-step operation. Useful for build-test-fix cycles.",
        parameters: {
          type: "object",
          properties: {
            description: { type: "string", description: "Brief description of the task." },
            commands: {
              type: "array",
              description: "Shell commands to execute in sequence. Stops on first failure.",
              items: { type: "string" }
            }
          },
          required: ["description", "commands"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "WebSearch",
        description: "Search the web using Exa AI. Returns relevant results with titles, URLs, and text snippets. Use this to find up-to-date information, documentation, or answers from the internet.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "The search query to execute." },
            num_results: { type: "number", description: "Number of results to return (default: 5, max: 10)." },
            type: { type: "string", description: 'Search type: "auto" (default), "neural", or "keyword".' },
            include_domains: {
              type: "array",
              description: 'Only return results from these domains, e.g. ["github.com", "stackoverflow.com"].',
              items: { type: "string" }
            },
            category: { type: "string", description: 'Filter by category: "news", "research paper", "tweet", "company", "personal site", etc.' }
          },
          required: ["query"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "FilePickerMax",
        description: 'Spawn a file-picker sub-agent that deeply explores the codebase to find files relevant to a prompt. It scans the full directory tree and previews every source file, then uses the most capable model to identify and rank the relevant files. Use this when you need to locate files related to a concept, feature, bug, or pattern. NEVER send generic prompts like "give me an overview of the codebase" — always specify the exact type of files you want.',
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: 'Specify the exact type of files you need. NEVER ask for a generic overview. Be specific — e.g. "show me the main entry point and routing files", "files that handle user authentication", "all React components related to the dashboard", "where database migrations are defined".' }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "TodoList",
        description: "Manage a persistent todo list for tracking tasks. Supports adding, listing, completing, and removing items. The list is saved to .apex-todos.json in the project root.",
        parameters: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["add", "list", "done", "remove", "clear"],
              description: 'Action to perform: "add" a new item, "list" all items, "done" to mark complete, "remove" to delete, "clear" to remove all completed.'
            },
            text: { type: "string", description: 'Text for the todo item (required for "add").' },
            index: { type: "number", description: 'Item index (1-based, required for "done" and "remove").' }
          },
          required: ["action"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Thinker",
        description: "Spawn a deep reasoning/planning sub-agent. It analyzes the problem, considers multiple approaches, and returns a structured plan. Use for complex tasks that benefit from careful planning before implementation.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The question or task to reason about deeply." }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "ThinkerBestOfN",
        description: "Spawn N parallel thinking agents that each independently reason about the same problem, then a selector picks the best response. Use for critical decisions that benefit from multiple perspectives.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The question or task to reason about from multiple angles." },
            n: { type: "number", description: "Number of parallel thinking passes (default: 3, max: 5)." }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "EditorMultiPrompt",
        description: "Spawn multiple editor agents in parallel, each with a different implementation strategy, then a selector picks the best result and applies it. Use for important code changes where you want to explore multiple approaches.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The coding task to implement." },
            strategies: {
              type: "array",
              description: "Array of 2-3 different implementation strategies to try in parallel.",
              items: { type: "string" }
            },
            files: {
              type: "array",
              description: "File paths and their contents that each editor will work with.",
              items: {
                type: "object",
                properties: {
                  path: { type: "string", description: "File path." },
                  content: { type: "string", description: "Current file content." }
                },
                required: ["path", "content"]
              }
            }
          },
          required: ["prompt", "strategies", "files"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "CodeReview",
        description: "Spawn a code reviewer that analyzes all files modified this session for bugs, security issues, edge cases, and code quality. Call this after making code changes.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Description of what was changed and why, to give the reviewer context." },
            files: {
              type: "array",
              description: "Optional additional file paths to include in the review.",
              items: { type: "string" }
            }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "CodeReviewMulti",
        description: "Spawn multiple code reviewers in parallel, each analyzing from a different perspective (correctness, security, performance, etc.).",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Description of the changes to review." },
            perspectives: {
              type: "array",
              description: 'Review perspectives, e.g. ["correctness and logic", "security vulnerabilities", "performance and efficiency"].',
              items: { type: "string" }
            }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "Commander",
        description: "Spawn a terminal command specialist agent that determines and executes the right shell commands for a task. It plans the commands, explains them, then executes them in sequence.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Description of what needs to be accomplished via terminal commands." }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "ContextPruner",
        description: "Summarize the current conversation history to free up context space. Automatically invoked in MAX mode but can be called manually. Replaces verbose conversation history with a concise summary preserving all critical information.",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      }
    },
    {
      type: "function",
      function: {
        name: "ResearcherWeb",
        description: "Search the web and synthesize results into a clear answer using an LLM. Use when you need up-to-date information, best practices, or answers that may not be in your training data. Falls back to LLM knowledge if web search is unavailable.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The question to research. Be specific for better results." },
            domains: {
              type: "array",
              description: 'Optional list of domains to restrict search to (e.g. ["stackoverflow.com", "github.com"]).',
              items: { type: "string" }
            }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "ResearcherDocs",
        description: "Search technical documentation for a library or framework and synthesize a precise answer with API details and code examples. Use when you need to verify API signatures, find usage patterns, or check library behavior.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The documentation question. Include the library/framework name and version if relevant." },
            library: { type: "string", description: 'The library or framework name (e.g. "React", "Express", "Prisma").' }
          },
          required: ["prompt"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "GeneralAgent",
        description: "Spawn an independent general-purpose agent that reads specified files and solves a problem. Use when you need deep independent analysis, complex reasoning with full file context, or a second opinion. More powerful than Thinker because it receives actual file contents.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "The problem to solve. Be specific about what analysis or output you need." },
            filePaths: {
              type: "array",
              description: "File paths to read and provide as context. The agent will analyze these files to solve the problem.",
              items: { type: "string" }
            }
          },
          required: ["prompt"]
        }
      }
    }
  ];
  module2.exports = { toolDefs };
});



var require_prompt = __commonJS((exports, module2) => {
  var fs2 = __require("fs");
  var path2 = __require("path");
  var { execSync } = __require("child_process");
  var { PROJECT_ROOT, MAX_TOOL_ITERATIONS, APEX_SYSTEM_PROMPT } = require_config();
  var { resolvePlaceholders } = require_toolExecutors();
  async function buildSystemPrompt() {
    let gitInfo = "";
    try {
      const branch = execSync("git rev-parse --abbrev-ref HEAD 2>/dev/null", { encoding: "utf-8", cwd: PROJECT_ROOT }).trim();
      const status = execSync("git status --short 2>/dev/null", { encoding: "utf-8", cwd: PROJECT_ROOT }).trim();
      const remoteUrl = execSync("git config --get remote.origin.url 2>/dev/null", { encoding: "utf-8", cwd: PROJECT_ROOT }).trim();
      gitInfo = `
Git branch: ${branch}
Git remote: ${remoteUrl}
Git status:
${status || "(clean)"}`;
    } catch {}
    let projectInfo = "";
    try {
      const pkg = JSON.parse(fs2.readFileSync(path2.join(PROJECT_ROOT, "package.json"), "utf-8"));
      projectInfo = `
Project: ${pkg.name || "unknown"} v${pkg.version || "0.0.0"}`;
      if (pkg.dependencies)
        projectInfo += `
Dependencies: ${Object.keys(pkg.dependencies).join(", ")}`;
      if (pkg.devDependencies)
        projectInfo += `
Dev dependencies: ${Object.keys(pkg.devDependencies).join(", ")}`;
      if (pkg.scripts)
        projectInfo += `
Scripts: ${Object.keys(pkg.scripts).join(", ")}`;
    } catch {}

    // Delegate to shared resolvePlaceholders with full data set
    const fullPlaceholderData = {
      GIT_CHANGES_PROMPT: gitInfo,
      SYSTEM_INFO_PROMPT: projectInfo
    };

    return await resolvePlaceholders(APEX_SYSTEM_PROMPT, fullPlaceholderData);
  }
  module2.exports = { buildSystemPrompt };
});



var require_server = __commonJS((exports, module2) => {
  var OpenAI = require_openai();
  var NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
  var PORT = process.env.APEX_SERVER_PORT || 3579;
  var serverInstance = null;
  async function startServer() {
    if (serverInstance)
      return serverInstance;
    const apiKey = process.env.NVIDIA_API_KEY || "";
    const upstream = new OpenAI({ apiKey, baseURL: NVIDIA_BASE_URL });
    globalThis._upstream = upstream;
    serverInstance = Bun.serve({
      port: PORT,
      async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/health") {
          return new Response(JSON.stringify({ status: "ok" }), {
            headers: { "Content-Type": "application/json" }
          });
        }
        if (url.pathname === "/v1/chat/completions" && req.method === "POST") {
          try {
            const body = await req.json();
            const isStream = body.stream === true;
            if (isStream) {
              const stream = await upstream.chat.completions.create(body);
              const encoder2 = new TextEncoder;
              const readable = new ReadableStream({
                async start(controller) {
                  try {
                    for await (const chunk of stream) {
                      controller.enqueue(encoder2.encode(`data: ${JSON.stringify(chunk)}

`));
                    }
                    controller.enqueue(encoder2.encode(`data: [DONE]

`));
                    controller.close();
                  } catch (err) {
                    controller.enqueue(encoder2.encode(`data: ${JSON.stringify({ error: err.message })}

`));
                    controller.close();
                  }
                }
              });
              return new Response(readable, {
                headers: {
                  "Content-Type": "text/event-stream",
                  "Cache-Control": "no-cache",
                  Connection: "keep-alive"
                }
              });
            }
            const result = await upstream.chat.completions.create(body);
            return new Response(JSON.stringify(result), {
              headers: { "Content-Type": "application/json" }
            });
          } catch (err) {
            const status = err.status || 500;
            return new Response(JSON.stringify({ error: { message: err.message, status } }), {
              status,
              headers: { "Content-Type": "application/json" }
            });
          }
        }
        if (url.pathname === "/v1/models" && req.method === "GET") {
          try {
            const models = await upstream.models.list();
            return new Response(JSON.stringify(models), {
              headers: { "Content-Type": "application/json" }
            });
          } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
              status: 500,
              headers: { "Content-Type": "application/json" }
            });
          }
        }
        return new Response("Not Found", { status: 404 });
      }
    });
    return serverInstance;
  }
  function getServerURL() {
    return `http://localhost:${PORT}/v1`;
  }
  function getPort() {
    return PORT;
  }
  function updateApiKey(key) {
    if (globalThis._upstream) {
      globalThis._upstream.apiKey = key;
    }
  }
  module2.exports = { startServer, getServerURL, getPort, updateApiKey };
});



var require_toolExecutors = __commonJS((exports, module2) => {
  var fs2 = __require("fs");
  var path2 = __require("path");
  var https = __require("https");
  var { execSync } = __require("child_process");
  var {
    PROJECT_ROOT,
    TOOL_TIMEOUT,
    REVIEWER_SYSTEM_PROMPT,
    FILE_PICKER_SYSTEM_PROMPT,
    THINKER_SYSTEM_PROMPT,
    COMMANDER_SYSTEM_PROMPT,
    CONTEXT_PRUNER_SYSTEM_PROMPT,
    SELECTOR_SYSTEM_PROMPT,
    RESEARCHER_WEB_SYSTEM_PROMPT,
    RESEARCHER_DOCS_SYSTEM_PROMPT,
    GENERAL_AGENT_SYSTEM_PROMPT,
    currentModels,
    nvidiaClient,
    session,
    truncateOutput,
    resolvePath,
    sleep
  } = require_config();
  var { parseThinkBlocks } = require_thinking();

  // Shared error formatter for exec failures
  function formatExecError(err) {
    const stdout = err.stdout || "";
    const stderr = err.stderr || "";
    let statusLine;
    if (err.signal) {
      statusLine = `Killed by signal: ${err.signal}`;
    } else {
      statusLine = `Exit code: ${err.status ?? 1}`;
    }
    return `${statusLine}\n${stdout}\n${stderr}`.trim();
  }

  async function streamCompletion(params, onStream) {
    for (let attempt = 0;attempt <= 2; attempt++) {
      let content = "";
      let reasoning = "";
      try {
        if (onStream) {
          const stream = await nvidiaClient.chat.completions.create({ ...params, stream: true });
          let displayContent = "";
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta;
            if (delta?.content) {
              content += delta.content;
              const lastOpen = content.lastIndexOf("<think>");
              const lastClose = content.lastIndexOf("</think>");
              if (lastOpen <= lastClose || lastOpen === -1) {
                displayContent = parseThinkBlocks(content).content;
              }
              onStream(displayContent || reasoning);
            }
            if (delta?.reasoning_content) {
              reasoning += delta.reasoning_content;
              onStream(displayContent || reasoning);
            }
          }
          let { content: cleaned } = parseThinkBlocks(content);
          const unclosedIdx = cleaned.lastIndexOf("<think>");
          if (unclosedIdx !== -1 && cleaned.indexOf("</think>", unclosedIdx) === -1) {
            cleaned = cleaned.slice(0, unclosedIdx).trim();
          }
          return cleaned || reasoning || "";
        } else {
          const response = await nvidiaClient.chat.completions.create(params);
          const rawContent = response.choices[0]?.message?.content || "";
          const rawReasoning = response.choices[0]?.message?.reasoning_content || "";
          let { content: cleaned } = parseThinkBlocks(rawContent);
          const unclosedIdx = cleaned.lastIndexOf("<think>");
          if (unclosedIdx !== -1 && cleaned.indexOf("</think>", unclosedIdx) === -1) {
            cleaned = cleaned.slice(0, unclosedIdx).trim();
          }
          return cleaned || rawReasoning || "";
        }
      } catch (err) {
        if (err.status === 404 && params.model !== currentModels.NVIDIA_MODEL && attempt < 2) {
          params = { ...params, model: currentModels.NVIDIA_MODEL };
          continue;
        }
        if (attempt < 2 && (err.status === 429 || err.status >= 500)) {
          await sleep(1000 * Math.pow(2, attempt));
          continue;
        }
        throw err;
      }
    }
  }
  function parseEditorOps(text) {
    const ops = [];
    const editRe = /---\s*EDIT:\s*(.+?)\s*---[\s\S]*?OLD:\s*\n```[^\n]*\n([\s\S]*?)\n```[\s\S]*?NEW:\s*\n```[^\n]*\n([\s\S]*?)\n```/g;
    let m2;
    while ((m2 = editRe.exec(text)) !== null) {
      ops.push({ type: "edit", path: m2[1].trim(), old_str: m2[2], new_str: m2[3] });
    }
    const createRe = /---\s*CREATE:\s*(.+?)\s*---\s*\n```[^\n]*\n([\s\S]*?)\n```/g;
    while ((m2 = createRe.exec(text)) !== null) {
      const p = m2[1].trim();
      if (!ops.some((o) => o.path === p && o.type === "edit")) {
        ops.push({ type: "create", path: p, content: m2[2] });
      }
    }
    return ops;
  }
  async function applyEditorOps(ops, executeFn) {
    const results = [];
    for (const op of ops) {
      if (op.type === "edit") {
        const r = await executeFn("Edit", { path: op.path, old_str: op.old_str, new_str: op.new_str });
        results.push(r.startsWith("Error") ? `✗ Edit ${op.path}: ${r}` : `✓ Edit ${op.path}`);
      } else if (op.type === "create") {
        const r = await executeFn("Write", { path: op.path, content: op.content });
        results.push(r.startsWith("Error") ? `✗ Create ${op.path}: ${r}` : `✓ Create ${op.path}`);
      }
    }
    return results;
  }
  async function resolvePlaceholders(text, extra = {}) {
    let gitInfo = "";
    try {
      gitInfo = execSync("git status --short 2>/dev/null", { encoding: "utf-8", cwd: PROJECT_ROOT }).trim() || "(clean)";
    } catch {}
    let projectInfo = "";
    try {
      const pkg = JSON.parse(fs2.readFileSync(path2.join(PROJECT_ROOT, "package.json"), "utf-8"));
      projectInfo = `Project: ${pkg.name || "unknown"} v${pkg.version || "0.0.0"}`;
    } catch {}
    const currentDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const placeholders = {
      CURRENT_DATE: currentDate,
      GIT_CHANGES_PROMPT: gitInfo,
      FILE_TREE_PROMPT: "(Project structure is available via tools)",
      FILE_TREE_PROMPT_SMALL: "(Project structure is available via tools)",
      KNOWLEDGE_FILES_CONTENTS: "",
      USER_INPUT_PROMPT: "",
      SYSTEM_INFO_PROMPT: projectInfo,
      ...extra
    };
    let resolved = text;
    for (const [key, value] of Object.entries(placeholders)) {
      resolved = resolved.split(`\${PLACEHOLDER.${key}}`).join(value);
    }
    return resolved;
  }

  async function executeTool(name, args, onStream) {
    try {
      switch (name) {
        case "Read": {
          const filePath = resolvePath(args.path);
          const stat = fs2.statSync(filePath, { throwIfNoEntry: false });
          if (!stat)
            return `Error: File not found: ${filePath}`;
          if (stat.isDirectory())
            return `Error: ${filePath} is a directory. Use ListDir instead.`;
          const content = fs2.readFileSync(filePath, "utf-8");
          const lines = content.split(`\n`);
          const start = Math.max(0, (args.start_line || 1) - 1);
          const end = args.end_line ? Math.min(lines.length, args.end_line) : Math.min(lines.length, start + 500);
          const slice = lines.slice(start, end);
          const numbered = slice.map((l, i) => `${start + i + 1}: ${l}`).join(`\n`);
          session.filesRead.add(filePath);
          if (end < lines.length) {
            return truncateOutput(numbered) + `\n(showing lines ${start + 1}-${end} of ${lines.length})`;
          }
          return truncateOutput(numbered);
        }
        case "Write": {
          const filePath = resolvePath(args.path);
          const dir = path2.dirname(filePath);
          if (!fs2.existsSync(dir))
            fs2.mkdirSync(dir, { recursive: true });
          const existed = fs2.existsSync(filePath);
          const before = existed ? fs2.readFileSync(filePath, "utf-8") : null;
          fs2.writeFileSync(filePath, args.content, "utf-8");
          if (before !== null) {
            session.editHistory.push({ path: filePath, before, after: args.content, timestamp: Date.now() });
          }
          session.filesModified.add(filePath);
          const lines = args.content.split(`\n`).length;
          return `${existed ? "Overwritten" : "Created"}: ${filePath} (${lines} lines)`;
        }
        case "Edit": {
          const filePath = resolvePath(args.path);
          if (!fs2.existsSync(filePath))
            return `Error: File not found: ${filePath}`;
          const content = fs2.readFileSync(filePath, "utf-8");
          const count = content.split(args.old_str).length - 1;
          if (count === 0)
            return `Error: old_str not found in ${path2.basename(filePath)}. Make sure it matches exactly (including whitespace and indentation).`;
          if (count > 1)
            return `Error: old_str found ${count} times in ${path2.basename(filePath)}. It must be unique. Add more surrounding context to make it unique.`;
          const updated = content.replace(args.old_str, args.new_str);
          fs2.writeFileSync(filePath, updated, "utf-8");
          session.editHistory.push({ path: filePath, before: content, after: updated, timestamp: Date.now() });
          session.filesModified.add(filePath);
          const oldLines = args.old_str.split(`\n`);
          const newLines = args.new_str.split(`\n`);
          let diff = `Edited: ${filePath}\n`;
          oldLines.forEach((l) => diff += `- ${l}\n`);
          newLines.forEach((l) => diff += `+ ${l}\n`);
          return diff;
        }
        case "Patch": {
          const filePath = resolvePath(args.path);
          if (!fs2.existsSync(filePath))
            return `Error: File not found: ${filePath}`;
          let content = fs2.readFileSync(filePath, "utf-8");
          const before = content;
          const results = [];
          for (let i = 0;i < args.edits.length; i++) {
            const edit = args.edits[i];
            if (!content.includes(edit.old_str)) {
              results.push(`Edit ${i + 1}: FAILED - old_str not found`);
              continue;
            }
            content = content.replace(edit.old_str, edit.new_str);
            results.push(`Edit ${i + 1}: OK`);
          }
          fs2.writeFileSync(filePath, content, "utf-8");
          session.editHistory.push({ path: filePath, before, after: content, timestamp: Date.now() });
          session.filesModified.add(filePath);
          return `Patched: ${filePath}\n${results.join(`\n`)}`;
        }
        case "Bash": {
          const cwd = args.cwd ? resolvePath(args.cwd) : PROJECT_ROOT;
          session.commandsRun.push(args.command);
          try {
            const output = execSync(args.command, {
              encoding: "utf-8",
              timeout: TOOL_TIMEOUT,
              cwd,
              maxBuffer: 1024 * 1024 * 5,
              stdio: ["pipe", "pipe", "pipe"]
            });
            return truncateOutput(output || "(no output)");
          } catch (err) {
            return truncateOutput(formatExecError(err));
          }
        }
        case "Grep": {
          const searchPath = resolvePath(args.path);
          const flags = args.case_sensitive ? "" : "-i";
          const include = args.include ? `--include='${args.include}'` : "";
          try {
            const cmd = `grep -rn ${flags} ${include} --color=never "${args.pattern.replace(/"/g, "\\\"")}" "${searchPath}" 2>/dev/null | head -80`;
            const output = execSync(cmd, { encoding: "utf-8", timeout: 15000 });
            return truncateOutput(output || "No matches found.");
          } catch {
            return "No matches found.";
          }
        }
        case "Glob": {
          const cwd = args.cwd ? resolvePath(args.cwd) : PROJECT_ROOT;
          try {
            const pattern = args.pattern;
            let cmd;
            if (pattern.includes("**")) {
              const namePattern = pattern.replace(/\*\*\//g, "").replace(/\*/g, "*");
              cmd = `find "${cwd}" -name "${namePattern}" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -100`;
            } else {
              cmd = `find "${cwd}" -name "${pattern}" -not -path "*/node_modules/*" -not -path "*/.git/*" 2>/dev/null | head -100`;
            }
            const output = execSync(cmd, { encoding: "utf-8", timeout: 1e4 });
            if (!output.trim())
              return "No files found matching pattern.";
            const files = output.trim().split(`\n`).map((f) => path2.relative(cwd, f)).sort();
            return files.join(`\n`);
          } catch {
            return "No files found matching pattern.";
          }
        }
        case "ListDir": {
          let listRecursive = function(dir, depth, maxDepth2) {
            const entries = fs2.readdirSync(dir, { withFileTypes: true }).filter((e) => !e.name.startsWith(".") && e.name !== "node_modules").sort((a, b2) => {
              if (a.isDirectory() && !b2.isDirectory())
                return -1;
              if (!a.isDirectory() && b2.isDirectory())
                return 1;
              return a.name.localeCompare(b2.name);
            });
            const lines2 = [];
            for (const entry of entries) {
              const prefix = "  ".repeat(depth);
              if (entry.isDirectory()) {
                lines2.push(`${prefix}${entry.name}/`);
                if (depth < maxDepth2) {
                  lines2.push(...listRecursive(path2.join(dir, entry.name), depth + 1, maxDepth2));
                }
              } else {
                const size = fs2.statSync(path2.join(dir, entry.name)).size;
                const sizeStr = size < 1024 ? `${size}B` : size < 1024 * 1024 ? `${(size / 1024).toFixed(1)}K` : `${(size / (1024 * 1024)).toFixed(1)}M`;
                lines2.push(`${prefix}${entry.name} (${sizeStr})`);
              }
            }
            return lines2;
          };
          const dirPath = resolvePath(args.path);
          if (!fs2.existsSync(dirPath))
            return `Error: Directory not found: ${dirPath}`;
          const stat = fs2.statSync(dirPath);
          if (!stat.isDirectory())
            return `Error: ${dirPath} is not a directory.`;
          const maxDepth = args.recursive ? 3 : 0;
          const lines = listRecursive(dirPath, 0, maxDepth);
          return truncateOutput(lines.join(`\n`) || "(empty directory)");
        }
        case "UndoEdit": {
          const filePath = resolvePath(args.path);
          const lastEdit = [...session.editHistory].reverse().find((e) => e.path === filePath);
          if (!lastEdit)
            return `Error: No edit history for ${filePath}`;
          fs2.writeFileSync(filePath, lastEdit.before, "utf-8");
          session.editHistory = session.editHistory.filter((e) => e !== lastEdit);
          return `Undone last edit to ${filePath}`;
        }
        case "Task": {
          const results = [];
          for (const cmd of args.commands) {
            try {
              const output = execSync(cmd, {
                encoding: "utf-8",
                timeout: TOOL_TIMEOUT,
                cwd: PROJECT_ROOT,
                maxBuffer: 1024 * 1024 * 5,
                stdio: ["pipe", "pipe", "pipe"]
              });
              results.push(`✓ ${cmd}\n${output.trim()}`);
              session.commandsRun.push(cmd);
            } catch (err) {
              results.push(`✗ ${cmd}\n${formatExecError(err)}`);
              session.commandsRun.push(cmd);
              break;
            }
          }
          return truncateOutput(`Task: ${args.description}\n${"─".repeat(40)}\n${results.join(`\n\n`)}`);
        }
        case "WebSearch": {
          const apiKey = process.env.EXA_API_KEY;
          if (!apiKey)
            return "Error: EXA_API_KEY environment variable is not set. Get one at https://dashboard.exa.ai/api-keys";
          const body = JSON.stringify({
            query: args.query,
            numResults: Math.min(args.num_results || 5, 10),
            type: args.type || "auto",
            ...args.include_domains && { includeDomains: args.include_domains },
            ...args.category && { category: args.category },
            contents: { highlights: { maxCharacters: 300 }, text: { maxCharacters: 1000 } }
          });
          const result = await new Promise((resolve3) => {
            const req = https.request({
              hostname: "api.exa.ai",
              path: "/search",
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey
              }
            }, (res) => {
              let data = "";
              res.on("data", (chunk) => data += chunk);
              res.on("end", () => {
                if (res.statusCode !== 200) {
                  resolve3(`Error: Exa API returned ${res.statusCode}: ${data}`);
                  return;
                }
                try {
                  const json = JSON.parse(data);
                  if (!json.results || json.results.length === 0) {
                    resolve3("No results found.");
                    return;
                  }
                  const formatted = json.results.map((r, i) => {
                    let entry = `${i + 1}. **${r.title || "Untitled"}**\n   ${r.url}`;
                    if (r.publishedDate)
                      entry += `\n   Published: ${r.publishedDate.split("T")[0]}`;
                    if (r.author)
                      entry += `\n   Author: ${r.author}`;
                    if (r.text)
                      entry += `\n   ${r.text.trim().slice(0, 500)}`;
                    else if (r.highlights && r.highlights.length)
                      entry += `\n   ${r.highlights[0].trim().slice(0, 300)}`;
                    return entry;
                  }).join(`\n\n`);
                  resolve3(truncateOutput(`Web Search Results (${json.results.length}):\n${"─".repeat(40)}\n${formatted}`));
                } catch (e) {
                  resolve3(`Error: Failed to parse Exa response: ${e.message}`);
                }
              });
            });
            req.on("error", (e) => resolve3(`Error: Exa request failed: ${e.message}`));
            req.setTimeout(15000, () => {
              req.destroy();
              resolve3("Error: Exa search timed out.");
            });
            req.write(body);
            req.end();
          });
          return result;
        }
        case "FilePickerMax": {
          let tree = "";
          try {
            tree = execSync(`find "${PROJECT_ROOT}" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.cache/*" -not -path "*/.local/*" -not -path "*/.upm/*" -not -path "*/.config/*" 2>/dev/null | head -500`, { encoding: "utf-8", timeout: 15000 }).trim();
            tree = tree.split(`\n`).map((f) => path2.relative(PROJECT_ROOT, f) || ".").join(`\n`);
          } catch {
            tree = "(failed to scan directory tree)";
          }
          const sourceExts = /\.(js|ts|jsx|tsx|py|rb|go|rs|java|c|cpp|h|hpp|css|scss|html|svelte|vue|json|yaml|yml|toml|md|sql|sh|bash|env|cfg|ini|xml)$/i;
          const allFiles = tree.split(`\n`).filter((f) => sourceExts.test(f));
          const previews = [];
          for (const relFile of allFiles.slice(0, 200)) {
            const absFile = path2.resolve(PROJECT_ROOT, relFile);
            try {
              const stat = fs2.statSync(absFile, { throwIfNoEntry: false });
              if (!stat || stat.isDirectory() || stat.size > 512 * 1024)
                continue;
              const content = fs2.readFileSync(absFile, "utf-8");
              const first8 = content.split(`\n`).slice(0, 8).join(`\n`);
              previews.push(`--- ${relFile} ---\n${first8}`);
            } catch {}
          }
          const pickerMessages = [
            { role: "system", content: await resolvePlaceholders(FILE_PICKER_SYSTEM_PROMPT) },
            {
              role: "user",
              content: `# Prompt\n${args.prompt}\n\n# Directory Tree\n${tree}\n\n# File Previews (first 8 lines each)\n${previews.join(`\n\n`)}`
            }
          ];
          try {
            const header = `FilePickerMax Results\n${"─".repeat(40)}\n`;
            const streamCb = onStream ? (text) => onStream(truncateOutput(header + text)) : null;
            const raw = await streamCompletion({
              model: currentModels.FILE_PICKER_MODEL,
              messages: pickerMessages,
              max_tokens: 4096,
              temperature: 0.2
            }, streamCb) || "[]";
            return truncateOutput(header + raw);
          } catch (apiErr) {
            return `Error: FilePickerMax failed — ${apiErr.message}`;
          }
        }
        case "TodoList": {
          const todoFile = path2.join(PROJECT_ROOT, ".apex-todos.json");
          const loadTodos = () => {
            try {
              return JSON.parse(fs2.readFileSync(todoFile, "utf-8"));
            } catch {
              return [];
            }
          };
          const saveTodos = (todos2) => fs2.writeFileSync(todoFile, JSON.stringify(todos2, null, 2), "utf-8");
          const formatTodos = (todos2) => {
            if (todos2.length === 0)
              return "Todo list is empty.";
            return todos2.map((t2, i) => `${i + 1}. [${t2.done ? "x" : " "}] ${t2.text}${t2.done ? " ✓" : ""}`).join(`\n`);
          };
          const todos = loadTodos();
          switch (args.action) {
            case "add": {
              if (!args.text)
                return 'Error: "text" is required for add action.';
              todos.push({ text: args.text, done: false, created: Date.now() });
              saveTodos(todos);
              return `Added item ${todos.length}: ${args.text}\n\n${formatTodos(todos)}`;
            }
            case "list":
              return formatTodos(todos);
            case "done": {
              const idx = (args.index || 0) - 1;
              if (idx < 0 || idx >= todos.length)
                return `Error: Invalid index. Use 1-${todos.length}.`;
              todos[idx].done = true;
              saveTodos(todos);
              return `Completed: ${todos[idx].text}\n\n${formatTodos(todos)}`;
            }
            case "remove": {
              const idx = (args.index || 0) - 1;
              if (idx < 0 || idx >= todos.length)
                return `Error: Invalid index. Use 1-${todos.length}.`;
              const removed = todos.splice(idx, 1)[0];
              saveTodos(todos);
              return `Removed: ${removed.text}\n\n${formatTodos(todos)}`;
            }
            case "clear": {
              const before = todos.length;
              const remaining = todos.filter((t2) => !t2.done);
              saveTodos(remaining);
              return `Cleared ${before - remaining.length} completed item(s).\n\n${formatTodos(remaining)}`;
            }
            default:
              return `Error: Unknown action "${args.action}". Use add, list, done, remove, or clear.`;
          }
        }
        case "CodeReview": {
          const allFiles = new Set([...session.filesModified]);
          if (args.files && args.files.length) {
            for (const f of args.files)
              allFiles.add(resolvePath(f));
          }
          if (allFiles.size === 0) {
            return "CodeReview skipped — no files were modified this session.";
          }
          const fileContents = [];
          const relativePaths = [];
          for (const filePath of allFiles) {
            if (!fs2.existsSync(filePath)) {
              fileContents.push(`--- ${filePath} ---\n[File not found]`);
              continue;
            }
            const stat = fs2.statSync(filePath);
            if (stat.isDirectory())
              continue;
            const content = fs2.readFileSync(filePath, "utf-8");
            const relPath = path2.relative(PROJECT_ROOT, filePath) || filePath;
            fileContents.push(`--- ${relPath} ---\n${content}`);
            relativePaths.push(relPath);
          }
          let gitDiff = "";
          if (relativePaths.length > 0) {
            try {
              const filesArg = relativePaths.map(p => `"${p}"`).join(" ");
              gitDiff = execSync(`git diff -- ${filesArg} 2>/dev/null`, { encoding: "utf-8", cwd: PROJECT_ROOT, timeout: 1e4 }).trim();
            } catch {}
          }
          const reviewMessages = [
            {
              role: "system",
              content: await resolvePlaceholders(REVIEWER_SYSTEM_PROMPT, { USER_INPUT_PROMPT: args.prompt })
            },
            {
              role: "user",
              content: `# What was changed\n${args.prompt}\n\n# Modified files (${allFiles.size})\n\n${fileContents.join(`\n\n`)}${gitDiff ? `\n\n# Git diff\n\`\`\`diff\n${gitDiff}\n\`\`\`` : ""}`
            }
          ];
          try {
            const header = `Code Review (${currentModels.REVIEWER_MODEL}) — ${allFiles.size} file(s)\n${"─".repeat(40)}\n`;
            const streamCb = onStream ? (text) => onStream(truncateOutput(header + text)) : null;
            const reviewText = await streamCompletion({
              model: currentModels.REVIEWER_MODEL,
              messages: reviewMessages,
              max_tokens: 4096,
              temperature: 0.3
            }, streamCb) || "(No response from reviewer)";
            return truncateOutput(header + reviewText);
          } catch (apiErr) {
            return `Error: Code review failed — ${apiErr.message}`;
          }
        }
        case "Thinker": {
          const historyContext = session.conversationHistory.slice(-10).map((m2) => `[${m2.role}]: ${(m2.content || "").slice(0, 500)}`).join(`\n`);
          const thinkerMessages = [
            { role: "system", content: await resolvePlaceholders(THINKER_SYSTEM_PROMPT) },
            {
              role: "user",
              content: `# Recent conversation context\n${historyContext}\n\n# Task to reason about\n${args.prompt}`
            }
          ];
          try {
            const header = `Thinker (${currentModels.THINKER_MODEL})\n${"─".repeat(40)}\n`;
            const streamCb = onStream ? (text) => onStream(truncateOutput(header + text)) : null;
            const result = await streamCompletion({
              model: currentModels.THINKER_MODEL,
              messages: thinkerMessages,
              max_tokens: 4096,
              temperature: 0.4
            }, streamCb) || "(No response from thinker)";
            return truncateOutput(header + result);
          } catch (apiErr) {
            return `Error: Thinker failed — ${apiErr.message}`;
          }
        }
        case "ThinkerBestOfN": {
          const n = Math.min(5, Math.max(2, args.n || 3));
          const historyCtx = session.conversationHistory.slice(-10).map((m2) => `[${m2.role}]: ${(m2.content || "").slice(0, 500)}`).join(`\n`);
          const header = `Best-of-${n} Thinker (MAX mode)\n${"─".repeat(40)}\n`;
          if (onStream)
            onStream(header + `Spawning ${n} parallel thinking agents...`);
          const thinkPromises = [];
          for (let i = 0;i < n; i++) {
            const label = String.fromCharCode(65 + i);
            thinkPromises.push(resolvePlaceholders(THINKER_SYSTEM_PROMPT).then(systemPrompt => streamCompletion({
              model: currentModels.THINKER_MODEL,
              messages: [
                { role: "system", content: systemPrompt + `\n\nYou are Thinker ${label}. Approach this from a unique angle. Be creative and thorough.` },
                {
                  role: "user",
                  content: `# Context\n${historyCtx}\n\n# Task\n${args.prompt}`
                }
              ],
              max_tokens: 3072,
              temperature: 0.7 + i * 0.1
            }, null).then((result) => ({ label, result }))));
          }
          let thoughts;
          try {
            thoughts = await Promise.all(thinkPromises);
          } catch (apiErr) {
            return `Error: ThinkerBestOfN failed — ${apiErr.message}`;
          }
          if (onStream)
            onStream(header + `All ${n} thinkers completed. Selecting best response...`);
          const thoughtsFormatted = thoughts.map((t2) => `## Thought ${t2.label}\n${t2.result || "(empty)"}`).join(`\n\n`);
          try {
            const selectorResult = await streamCompletion({
              model: currentModels.REVIEWER_MODEL,
              messages: [
                {
                  role: "system",
                  content: `You are a thought selector. You will receive ${n} different reasoning responses to the same question. Pick the best one based on depth, correctness, clarity, and actionability. Output JSON only:\n{ "chosen": "A", "reason": "why this is best" }`
                },
                { role: "user", content: `# Original question\n${args.prompt}\n\n${thoughtsFormatted}` }
              ],
              max_tokens: 1024,
              temperature: 0.1
            }, null);
            let chosen = "A";
            let reason = "";
            try {
              const parsed = JSON.parse(selectorResult.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
              chosen = parsed.chosen || "A";
              reason = parsed.reason || "";
            } catch {}
            const winningThought = thoughts.find((t2) => t2.label === chosen) || thoughts[0];
            const result = `${header}Selected: Thought ${chosen}${reason ? ` — ${reason}` : ""}\n\n${winningThought.result}`;
            if (onStream)
              onStream(truncateOutput(result));
            return truncateOutput(result);
          } catch (apiErr) {
            const result = `${header}Selector failed, using Thought A:\n\n${thoughts[0].result}`;
            return truncateOutput(result);
          }
        }
        case "EditorMultiPrompt": {
          const strategies = args.strategies || ["straightforward implementation", "alternative approach"];
          const filesCtx = (args.files || []).map((f) => `--- ${f.path} ---\n${f.content}`).join(`\n\n`);
          const header = `Multi-Prompt Editor (${strategies.length} strategies)\n${"─".repeat(40)}\n`;
          if (onStream)
            onStream(header + `Spawning ${strategies.length} parallel editor agents...`);
          const editorPromises = strategies.map((strategy, i) => {
            const label = String.fromCharCode(65 + i);
            return streamCompletion({
              model: currentModels.NVIDIA_MODEL,
              messages: [
                {
                  role: "system",
                  content: `You are Code Editor ${label}. You implement code changes using a specific strategy. Output your implementation as a series of file edits.\n\nFor each file change, output:\n--- EDIT: path/to/file ---\nOLD:\n\`\`\`\nexact old code\n\`\`\`\nNEW:\n\`\`\`\nnew replacement code\n\`\`\`\n\nFor new files, output:\n--- CREATE: path/to/file ---\n\`\`\`\nfull file content\n\`\`\`\n\nBe precise. Match existing code style.`
                },
                {
                  role: "user",
                  content: `# Task\n${args.prompt}\n\n# Strategy\n${strategy}\n\n# Current files\n${filesCtx}`
                }
              ],
              max_tokens: 4096,
              temperature: 0.3
            }, null).then((result) => ({ label, strategy, result: result || "(empty)" }));
          });
          let implementations;
          try {
            implementations = await Promise.all(editorPromises);
          } catch (apiErr) {
            return `Error: EditorMultiPrompt failed — ${apiErr.message}`;
          }
          if (onStream)
            onStream(header + `All editors completed. Selecting best implementation...`);
          const implFormatted = implementations.map((impl) => `## Implementation ${impl.label} — Strategy: "${impl.strategy}"\n${impl.result}`).join(`\n\n`);
          try {
            const selectorResult = await streamCompletion({
              model: currentModels.REVIEWER_MODEL,
              messages: [
                { role: "system", content: SELECTOR_SYSTEM_PROMPT },
                {
                  role: "user",
                  content: `# Original task\n${args.prompt}\n\n${implFormatted}`
                }
              ],
              max_tokens: 1024,
              temperature: 0.1
            }, null);
            let chosen = "A";
            let reason = "";
            let improvements = "";
            try {
              const parsed = JSON.parse(selectorResult.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
              chosen = parsed.chosen || "A";
              reason = parsed.reason || "";
              improvements = parsed.improvements || "";
            } catch {}
            const winning = implementations.find((impl) => impl.label === chosen) || implementations[0];
            let result = `${header}Selected: Implementation ${chosen} ("${winning.strategy}")`;
            if (reason)
              result += `\nReason: ${reason}`;
            if (improvements)
              result += `\nImprovements to consider: ${improvements}`;
            const ops = parseEditorOps(winning.result);
            if (ops.length > 0) {
              if (onStream)
                onStream(truncateOutput(result + `\n\nApplying ${ops.length} change(s)...`));
              const applyResults = await applyEditorOps(ops, executeTool);
              result += `\n\n--- Applied Changes ---\n${applyResults.join(`\n`)}`;
            } else {
              result += `\n\n${winning.result}`;
            }
            if (onStream)
              onStream(truncateOutput(result));
            return truncateOutput(result);
          } catch (apiErr) {
            const fallbackOps = parseEditorOps(implementations[0].result);
            if (fallbackOps.length > 0) {
              const applyResults = await applyEditorOps(fallbackOps, executeTool);
              return truncateOutput(`${header}Selector failed, applied Implementation A:\n${applyResults.join(`\n`)}`);
            }
            return truncateOutput(`${header}Selector failed, using Implementation A:\n\n${implementations[0].result}`);
          }
        }
        case "CodeReviewMulti": {
          const perspectives = args.perspectives || [
            "correctness, logic errors, and edge cases",
            "security vulnerabilities and data safety",
            "performance, efficiency, and resource usage"
          ];
          const modFiles = new Set([...session.filesModified]);
          if (modFiles.size === 0)
            return "CodeReviewMulti skipped — no files were modified.";
          const modFileContents = [];
          for (const fp of modFiles) {
            if (!fs2.existsSync(fp))
              continue;
            const stat = fs2.statSync(fp);
            if (stat.isDirectory())
              continue;
            modFileContents.push(`--- ${path2.relative(PROJECT_ROOT, fp)} ---\n${fs2.readFileSync(fp, "utf-8")}`);
          }
          let diffText = "";
          try {
            diffText = execSync("git diff 2>/dev/null", { encoding: "utf-8", cwd: PROJECT_ROOT, timeout: 1e4 }).trim();
          } catch {}
          const header = `Multi-Perspective Code Review (${perspectives.length} reviewers)\n${"─".repeat(40)}\n`;
          if (onStream)
            onStream(header + `Spawning ${perspectives.length} parallel reviewers...`);
          const reviewPromises = perspectives.map((perspective, i) => {
            const label = String.fromCharCode(65 + i);
            return streamCompletion({
              model: currentModels.REVIEWER_MODEL,
              messages: [
                {
                  role: "system",
                  content: REVIEWER_SYSTEM_PROMPT + `\n\nFocus specifically on: ${perspective}. You are Reviewer ${label}.`
                },
                {
                  role: "user",
                  content: `# Changes\n${args.prompt}\n\n# Files (${modFiles.size})\n${modFileContents.join(`\n\n`)}${diffText ? `\n\n# Git diff\n\`\`\`diff\n${diffText}\n\`\`\`` : ""}`
                }
              ],
              max_tokens: 3072,
              temperature: 0.3
            }, null).then((result2) => ({ label, perspective, result: result2 || "(no issues found)" }));
          });
          let reviews;
          try {
            reviews = await Promise.all(reviewPromises);
          } catch (apiErr) {
            return `Error: CodeReviewMulti failed — ${apiErr.message}`;
          }
          let result = header;
          for (const review of reviews) {
            result += `\n## Reviewer ${review.label} — ${review.perspective}\n${review.result}\n`;
          }
          if (onStream)
            onStream(truncateOutput(result));
          return truncateOutput(result);
        }
        case "Commander": {
          const header = `Commander (${currentModels.COMMANDER_MODEL})\n${"─".repeat(40)}\n`;
          if (onStream)
            onStream(header + "Planning commands...");
          let commandPlan;
          try {
            commandPlan = await streamCompletion({
              model: currentModels.COMMANDER_MODEL,
              messages: [
                { role: "system", content: COMMANDER_SYSTEM_PROMPT },
                { role: "user", content: args.prompt }
              ],
              max_tokens: 2048,
              temperature: 0.2
            }, null);
          } catch (apiErr) {
            return `Error: Commander failed — ${apiErr.message}`;
          }
          let commands;
          try {
            commands = JSON.parse(commandPlan.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
            if (!Array.isArray(commands))
              commands = [commands];
          } catch {
            return truncateOutput(`${header}Failed to parse command plan:\n${commandPlan}`);
          }
          const results = [];
          for (const cmd of commands) {
            const command = typeof cmd === "string" ? cmd : cmd.command;
            const description = typeof cmd === "string" ? "" : cmd.description || "";
            if (onStream)
              onStream(truncateOutput(`${header}Running: ${command}${description ? ` (${description})` : ""}...`));
            try {
              const output = execSync(command, {
                encoding: "utf-8",
                timeout: TOOL_TIMEOUT,
                cwd: PROJECT_ROOT,
                maxBuffer: 1024 * 1024 * 5,
                stdio: ["pipe", "pipe", "pipe"]
              });
              results.push(`✓ ${command}${description ? `\n  (${description})` : ""}\n${(output || "").trim()}`);
              session.commandsRun.push(command);
            } catch (err) {
              results.push(`✗ ${command}\n${formatExecError(err)}`);
              session.commandsRun.push(command);
              break;
            }
          }
          const result = `${header}${results.join(`\n\n`)}`;
          if (onStream)
            onStream(truncateOutput(result));
          return truncateOutput(result);
        }
        case "ContextPruner": {
          if (session.conversationHistory.length < 6) {
            return "Context pruning skipped — conversation is still short.";
          }
          const header = `Context Pruner\n${"─".repeat(40)}\n`;
          if (onStream)
            onStream(header + "Summarizing conversation...");
          const historyText = session.conversationHistory.map((m2) => `[${m2.role}]: ${(m2.content || "").slice(0, 1000)}`).join(`\n`);
          try {
            const summary = await streamCompletion({
              model: currentModels.CONTEXT_PRUNER_MODEL,
              messages: [
                { role: "system", content: CONTEXT_PRUNER_SYSTEM_PROMPT },
                { role: "user", content: `# Conversation to summarize (${session.conversationHistory.length} messages)\n\n${historyText}` }
              ],
              max_tokens: 2048,
              temperature: 0.2
            }, null);
            const oldLen = session.conversationHistory.length;
            session.conversationHistory = [
              {
                role: "system",
                content: `[Context Summary — ${oldLen} messages condensed]\n${summary}`
              }
            ];
            const result = `${header}Condensed ${oldLen} messages into summary.\n\n${summary}`;
            if (onStream)
              onStream(truncateOutput(result));
            return truncateOutput(result);
          } catch (apiErr) {
            return `Error: Context pruning failed — ${apiErr.message}`;
          }
        }
        case "ResearcherWeb": {
          const header = `Web Research (${currentModels.RESEARCHER_MODEL})\n${"─".repeat(40)}\n`;
          if (onStream)
            onStream(header + "Searching the web...");
          let searchResults = "";
          const searchArgs = { query: args.prompt, num_results: 5 };
          if (args.domains && args.domains.length)
            searchArgs.include_domains = args.domains;
          try {
            searchResults = await executeTool("WebSearch", searchArgs);
          } catch {
            searchResults = "(Web search unavailable — answering from knowledge)";
          }
          if (searchResults.startsWith("Error")) {
            searchResults = `(Web search failed: ${searchResults.slice(0, 200)})\n\nPlease answer from your training data.`;
          }
          try {
            const streamCb = onStream ? (text) => onStream(truncateOutput(header + text)) : null;
            const result = await streamCompletion({
              model: currentModels.RESEARCHER_MODEL,
              messages: [
                { role: "system", content: await resolvePlaceholders(RESEARCHER_WEB_SYSTEM_PROMPT) },
                { role: "user", content: `# Question\n${args.prompt}\n\n# Web Search Results\n${searchResults}` }
              ],
              max_tokens: 4096,
              temperature: 0.3
            }, streamCb) || "(No response from researcher)";
            return truncateOutput(header + result);
          } catch (apiErr) {
            return `Error: ResearcherWeb failed — ${apiErr.message}`;
          }
        }
        case "ResearcherDocs": {
          const header = `Docs Research (${currentModels.RESEARCHER_MODEL})\n${"─".repeat(40)}\n`;
          if (onStream)
            onStream(header + "Searching documentation...");
          const docDomains = [
            "developer.mozilla.org",
            "react.dev",
            "nodejs.org",
            "docs.python.org",
            "doc.rust-lang.org",
            "pkg.go.dev",
            "learn.microsoft.com",
            "typescriptlang.org",
            "expressjs.com",
            "nextjs.org",
            "vuejs.org",
            "angular.io",
            "svelte.dev",
            "docs.rs",
            "rubydoc.info",
            "docs.oracle.com",
            "npmjs.com"
          ];
          const query = args.library ? `${args.library} ${args.prompt}` : args.prompt;
          let searchResults = "";
          try {
            searchResults = await executeTool("WebSearch", {
              query: `${query} documentation`,
              num_results: 8,
              include_domains: docDomains
            });
          } catch {
            searchResults = "";
          }
          if (!searchResults || searchResults === "No results found.") {
            try {
              searchResults = await executeTool("WebSearch", {
                query: `${query} documentation API reference`,
                num_results: 5
              });
            } catch {
              searchResults = "(Documentation search unavailable — answering from knowledge)";
            }
          }
          if (!searchResults || searchResults.startsWith("Error")) {
            searchResults = "(No documentation results found — answering from knowledge)";
          }
          try {
            const streamCb = onStream ? (text) => onStream(truncateOutput(header + text)) : null;
            const result = await streamCompletion({
              model: currentModels.RESEARCHER_MODEL,
              messages: [
                { role: "system", content: await resolvePlaceholders(RESEARCHER_DOCS_SYSTEM_PROMPT) },
                {
                  role: "user",
                  content: `# Question\n${args.prompt}${args.library ? `\nLibrary: ${args.library}` : ""}\n\n# Documentation Search Results\n${searchResults}`
                }
              ],
              max_tokens: 4096,
              temperature: 0.2
            }, streamCb) || "(No response from researcher)";
            return truncateOutput(header + result);
          } catch (apiErr) {
            return `Error: ResearcherDocs failed — ${apiErr.message}`;
          }
        }
        case "GeneralAgent": {
          const header = `General Agent (${currentModels.GENERAL_AGENT_MODEL})\n${"─".repeat(40)}\n`;
          if (onStream)
            onStream(header + "Reading files and analyzing...");
          const MAX_TOTAL_CHARS = 50000;
          let totalChars = 0;
          const fileContents = [];
          for (const fp of args.filePaths || []) {
            const absPath = resolvePath(fp);
            const stat = fs2.statSync(absPath, { throwIfNoEntry: false });
            if (!stat || stat.isDirectory()) {
              fileContents.push(`--- ${fp} ---\n[Not found or is a directory]`);
              continue;
            }
            if (stat.size > 256 * 1024) {
              fileContents.push(`--- ${fp} ---\n[File too large: ${(stat.size / 1024).toFixed(0)}KB — skipped]`);
              continue;
            }
            const content = fs2.readFileSync(absPath, "utf-8");
            if (totalChars + content.length > MAX_TOTAL_CHARS) {
              const remaining = MAX_TOTAL_CHARS - totalChars;
              if (remaining > 500) {
                fileContents.push(`--- ${fp} ---\n${content.slice(0, remaining)}\n[Truncated — context limit reached]`);
              } else {
                fileContents.push(`--- ${fp} ---\n[Skipped — context limit reached]`);
              }
              totalChars = MAX_TOTAL_CHARS;
              break;
            }
            fileContents.push(`--- ${fp} ---\n${content}`);
            totalChars += content.length;
          }
          const historyCtx = session.conversationHistory.slice(-8).map((m2) => `[${m2.role}]: ${(m2.content || "").slice(0, 400)}`).join(`\n`);
          const userContent = [
            `# Task\n${args.prompt}`,
            fileContents.length > 0 ? `\n# Files (${fileContents.length})\n${fileContents.join(`\n\n`)}` : "",
            historyCtx ? `\n# Recent conversation\n${historyCtx}` : ""
          ].filter(Boolean).join(`\n`);
          try {
            const streamCb = onStream ? (text) => onStream(truncateOutput(header + text)) : null;
            const result = await streamCompletion({
              model: currentModels.GENERAL_AGENT_MODEL,
              messages: [
                { role: "system", content: await resolvePlaceholders(GENERAL_AGENT_SYSTEM_PROMPT) },
                { role: "user", content: userContent }
              ],
              max_tokens: 4096,
              temperature: 0.4
            }, streamCb) || "(No response from agent)";
            return truncateOutput(header + result);
          } catch (apiErr) {
            return `Error: GeneralAgent failed — ${apiErr.message}`;
          }
        }
        default:
          return `Unknown tool: ${name}`;
      }
    } catch (err) {
      return `Error executing ${name}: ${err.message}`;
    }
  }
  module2.exports = { executeTool, resolvePlaceholders };
});


var require_agent = __commonJS((exports, module2) => {
  var {
    currentModels,
    MAX_TOOL_ITERATIONS,
    nvidiaClient,
    session,
    sleep
  } = require_config();
  var { buildSystemPrompt } = require_prompt();
  var { toolDefs } = require_tools();
  var { executeTool } = require_toolExecutors();
  var { toolDetailStr } = require_utils3();
  var store = require_store();
  var {
    parseThinkBlocks,
    findThinkClose,
    stripStrayCloseTag,
    splitAtPartialTag
  } = require_thinking();
  var isProcessing = false;
  function getIsProcessing() {
    return isProcessing;
  }
  async function handleUserInput(userInput) {
    isProcessing = true;
    store.setState({ isProcessing: true });
    session.turnCount++;
    store.addMessage({ role: "user", content: userInput });
    session.conversationHistory.push({ role: "user", content: userInput });
    let turnTokens = 0;
    try {
      store.addMessage({ role: "divider" });
      const systemPrompt = await buildSystemPrompt();
      let messages = [
        { role: "system", content: systemPrompt },
        ...session.conversationHistory
      ];
      let iterations = 0;
      while (iterations < MAX_TOOL_ITERATIONS) {
        iterations++;
        let stream;
        const maxRetries = 3;
        for (let attempt = 0;attempt <= maxRetries; attempt++) {
          try {
            stream = await nvidiaClient.chat.completions.create({
              model: currentModels.NVIDIA_MODEL,
              messages: messages.map((m2) => {
                const clean = { role: m2.role, content: m2.content };
                if (m2.tool_calls)
                  clean.tool_calls = m2.tool_calls.map((tc) => ({
                    id: tc.id,
                    type: "function",
                    function: { name: tc.function.name, arguments: tc.function.arguments }
                  }));
                if (m2.tool_call_id)
                  clean.tool_call_id = m2.tool_call_id;
                if (m2.role === "assistant" && !m2.content)
                  clean.content = null;
                return clean;
              }),
              max_tokens: 4096,
              temperature: 0.6,
              top_p: 0.95,
              tools: toolDefs,
              tool_choice: "auto",
              stream: true
            });
            break;
          } catch (apiErr) {
            if (attempt < maxRetries && (!apiErr.status || apiErr.status >= 500)) {
              await sleep(1000 * Math.pow(2, attempt));
              continue;
            }
            throw apiErr;
          }
        }
        let fullContent = "";
        const toolCallDeltas = {};
        const toolCallMsgIds = {};
        const seenToolCalls = new Set;
        let finishReason = null;
        let streamUsage = null;
        let reasoningText = "";
        let displayState = "buffering";
        let contentAccum = "";
        let thinkAccum = "";
        let displayContent = "";
        let thinkContent = "";
        let lastFlushTime = Date.now();
        for await (const chunk of stream) {
          if (chunk.usage)
            streamUsage = chunk.usage;
          const delta = chunk.choices?.[0]?.delta;
          if (!delta) {
            if (chunk.choices?.[0]?.finish_reason)
              finishReason = chunk.choices[0].finish_reason;
            continue;
          }
          if (chunk.choices[0].finish_reason)
            finishReason = chunk.choices[0].finish_reason;
          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              const idx = tc.index;
              if (!toolCallDeltas[idx]) {
                toolCallDeltas[idx] = { id: tc.id || "", name: tc.function?.name || "", arguments: "" };
              }
              if (tc.id)
                toolCallDeltas[idx].id = tc.id;
              if (tc.function?.name) {
                toolCallDeltas[idx].name = tc.function.name;
                if (!seenToolCalls.has(idx)) {
                  seenToolCalls.add(idx);
                  toolCallMsgIds[idx] = store.addMessage({
                    role: "tool",
                    name: tc.function.name,
                    detail: "...",
                    status: "pending"
                  });
                }
              }
              if (tc.function?.arguments) {
                toolCallDeltas[idx].arguments += tc.function.arguments;
              }
            }
          }
          if (delta.reasoning_content) {
            reasoningText += delta.reasoning_content;
            store.updateStreaming(displayContent, reasoningText);
          }
          if (delta.content) {
            fullContent += delta.content;
            const hasTool = Object.keys(toolCallDeltas).length > 0;
            if (displayState === "streaming") {
              contentAccum += delta.content;
              contentAccum = stripStrayCloseTag(contentAccum);
              const openIdx = contentAccum.indexOf("<think>");
              if (openIdx !== -1) {
                if (openIdx > 0)
                  displayContent += contentAccum.slice(0, openIdx);
                thinkAccum = contentAccum.slice(openIdx + 7);
                contentAccum = "";
                displayState = "thinking";
                const closeMatch = findThinkClose(thinkAccum);
                if (closeMatch) {
                  const thought = thinkAccum.slice(0, closeMatch.pos).trim();
                  const after = thinkAccum.slice(closeMatch.pos + closeMatch.len);
                  thinkAccum = "";
                  if (thought)
                    store.addMessage({ role: "thinking", content: thought });
                  displayState = "streaming";
                  contentAccum = after;
                  if (!hasTool && after)
                    displayContent += after;
                  contentAccum = "";
                  thinkContent = "";
                } else {
                  thinkContent = thinkAccum;
                }
              } else {
                const { safe, pending } = splitAtPartialTag(contentAccum);
                contentAccum = pending;
                if (!hasTool && safe)
                  displayContent += safe;
              }
              store.updateStreaming(displayContent, thinkContent || reasoningText);
            } else if (displayState === "thinking") {
              thinkAccum += delta.content;
              const closeMatch = findThinkClose(thinkAccum);
              if (closeMatch) {
                const thought = thinkAccum.slice(0, closeMatch.pos).trim();
                const after = thinkAccum.slice(closeMatch.pos + closeMatch.len);
                thinkAccum = "";
                if (thought)
                  store.addMessage({ role: "thinking", content: thought });
                displayState = "streaming";
                contentAccum = after;
                if (!hasTool && after)
                  displayContent += after;
                contentAccum = "";
                thinkContent = "";
                store.updateStreaming(displayContent, reasoningText);
              } else {
                thinkContent = thinkAccum;
                store.updateStreaming(displayContent, thinkContent || reasoningText);
              }
            } else {
              contentAccum += delta.content;
              contentAccum = stripStrayCloseTag(contentAccum);
              const openIdx = contentAccum.indexOf("<think>");
              if (openIdx !== -1) {
                const before = contentAccum.slice(0, openIdx);
                thinkAccum = contentAccum.slice(openIdx + 7);
                contentAccum = "";
                if (!hasTool && before.trim())
                  displayContent += before;
                displayState = "thinking";
                const closeMatch = findThinkClose(thinkAccum);
                if (closeMatch) {
                  const thought = thinkAccum.slice(0, closeMatch.pos).trim();
                  const after = thinkAccum.slice(closeMatch.pos + closeMatch.len);
                  thinkAccum = "";
                  if (thought)
                    store.addMessage({ role: "thinking", content: thought });
                  displayState = "streaming";
                  contentAccum = after;
                  if (!hasTool && after)
                    displayContent += after;
                  contentAccum = "";
                  thinkContent = "";
                } else {
                  thinkContent = thinkAccum;
                }
                store.updateStreaming(displayContent, thinkContent || reasoningText);
              } else {
                const { safe, pending } = splitAtPartialTag(contentAccum);
                if (safe.length > 0) {
                  displayState = "streaming";
                  if (!hasTool)
                    displayContent += safe;
                  contentAccum = pending;
                  store.updateStreaming(displayContent, reasoningText);
                }
              }
            }
          }
          const now = Date.now();
          if (now - lastFlushTime > 16) {
            lastFlushTime = now;
            await new Promise((r) => setTimeout(r, 1));
          }
        }
        if (displayState === "thinking") {
          const thought = (thinkAccum + contentAccum).trim();
          if (thought)
            store.addMessage({ role: "thinking", content: thought });
          thinkAccum = "";
          contentAccum = "";
        } else if (displayState === "buffering") {
          const hasTool = Object.keys(toolCallDeltas).length > 0;
          if (!hasTool && contentAccum.trim())
            displayContent += contentAccum;
          contentAccum = "";
        } else if (contentAccum) {
          const hasTool = Object.keys(toolCallDeltas).length > 0;
          if (!hasTool)
            displayContent += contentAccum;
          contentAccum = "";
        }
        if (reasoningText.trim()) {
          store.addMessage({ role: "thinking", content: reasoningText.trim() });
        }
        const { content: parsedContent } = parseThinkBlocks(fullContent);
        turnTokens += streamUsage?.total_tokens || 0;
        const sortedIndices = Object.keys(toolCallDeltas).sort((a, b2) => a - b2);
        const toolCalls = sortedIndices.map((idx) => ({
          id: toolCallDeltas[idx].id,
          type: "function",
          function: { name: toolCallDeltas[idx].name, arguments: toolCallDeltas[idx].arguments }
        }));
        const msg = {
          role: "assistant",
          content: fullContent || null,
          ...toolCalls.length > 0 ? { tool_calls: toolCalls } : {}
        };
        if (toolCalls.length > 0) {
          store.clearStreaming();
          messages.push(msg);
          if (displayContent.trim()) {
            store.addMessage({ role: "assistant", content: displayContent.trim() });
          }
          sortedIndices.forEach((idx, i) => {
            const tc = toolCalls[i];
            let toolArgs;
            try {
              toolArgs = JSON.parse(tc.function.arguments);
            } catch {
              toolArgs = {};
            }
            const detail = toolDetailStr(tc.function.name, toolArgs);
            const msgId = toolCallMsgIds[idx];
            if (msgId)
              store.updateMessage(msgId, { detail, status: "running" });
          });
          const toolPromises = toolCalls.map(async (toolCall, i) => {
            const toolName = toolCall.function.name;
            let toolArgs;
            try {
              toolArgs = JSON.parse(toolCall.function.arguments);
            } catch {
              toolArgs = {};
            }
            const detail = toolDetailStr(toolName, toolArgs);
            const callStart = Date.now();
            const msgId = toolCallMsgIds[sortedIndices[i]];
            const result = await executeTool(toolName, toolArgs, (partial) => {
              if (msgId)
                store.updateMessage(msgId, { output: partial });
            });
            const success = !result.startsWith("Error");
            const elapsed = Date.now() - callStart;
            session.toolCallCount++;
            if (msgId) {
              store.updateMessage(msgId, {
                detail,
                status: success ? "done" : "error",
                success,
                elapsed,
                output: result
              });
            }
            if ((toolName === "Edit" || toolName === "Patch") && success) {
              store.addMessage({ role: "diff", filename: toolArgs.path, content: result });
            }
            return { id: toolCall.id, result };
          });
          const toolResults = await Promise.all(toolPromises);
          for (const { id, result } of toolResults) {
            messages.push({ role: "tool", tool_call_id: id, content: result });
          }
          if (finishReason === "stop")
            break;
          displayContent = "";
          continue;
        }
        if (fullContent) {
          const cleanedContent = parsedContent.trim() || fullContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
          if (cleanedContent) {
            store.finishStreaming({ role: "assistant", content: cleanedContent });
          } else {
            store.clearStreaming();
          }
          session.conversationHistory.push({ role: "assistant", content: cleanedContent || fullContent });
        } else {
          store.clearStreaming();
        }
        break;
      }
      if (iterations >= MAX_TOOL_ITERATIONS) {
        store.addMessage({ role: "system", content: `⚠ Reached maximum tool iterations (${MAX_TOOL_ITERATIONS}). Stopping.` });
      }
      session.totalTokens += turnTokens;
    } catch (err) {
      store.clearStreaming();
      let errorMsg = `Error: ${err.message}`;
      if (err.status) {
        errorMsg += `\nStatus: ${err.status}`;
      }
      store.addMessage({ role: "system", content: errorMsg });
    }
    store.addMessage({ role: "divider" });
    isProcessing = false;
    store.setState({ isProcessing: false });
  }
  module2.exports = {
    handleUserInput,
    getIsProcessing
  };
});


var require_commands = __commonJS((exports, module2) => {
  var fs2 = __require("fs");
  var path2 = __require("path");
  var { execSync } = __require("child_process");
  var { PROJECT_ROOT, session, resolvePath, logoutProvider, getProviderLoginState } = require_config();
  var { executeTool } = require_toolExecutors();
  var store = require_store();
  async function handleSlashCommand(input) {
    const [cmd, ...rest] = input.split(" ");
    const arg = rest.join(" ");
    switch (cmd) {
      case "/help":
        store.setState({ showHelp: true });
        break;
      case "/login":
      case "/provider":
        store.setState({ showHelp: false, needsConfig: true });
        break;
      case "/logout": {
        const provider = store.getSnapshot().provider;
        if (getProviderLoginState(provider) === "logged-in") {
          logoutProvider(provider);
          store.setState({ showHelp: false, needsConfig: true, apiKey: "" });
        } else {
          store.setState({ showHelp: false, needsConfig: false });
        }
        break;
      }
      case "/clear":
        session.conversationHistory = [];
        store.clearMessages();
        store.addMessage({ role: "system", content: "Conversation cleared." });
        break;
      case "/files":
      case "/ls": {
        const dirPath = arg ? resolvePath(arg) : PROJECT_ROOT;
        store.addMessage({ role: "system", content: "Loading file tree...", label: "Project Files" });
        const result = await executeTool("ListDir", { path: dirPath, recursive: true });
        store.addMessage({ role: "system", content: result, label: "Project Files" });
        break;
      }
      case "/cost":
      case "/status": {
        const elapsed = ((Date.now() - session.startTime) / 1000 / 60).toFixed(1);
        const parts = [
          `Session: ${elapsed} min`,
          `Turns: ${session.turnCount}`,
          `Tools: ${session.toolCallCount}`,
          `Tokens: ${session.totalTokens.toLocaleString()}`,
          `Cost: $${session.totalCost.toFixed(4)}`
        ];
        if (session.filesModified.size > 0)
          parts.push(`Files modified: ${session.filesModified.size}`);
        if (session.commandsRun.length > 0)
          parts.push(`Commands: ${session.commandsRun.length}`);
        store.addMessage({ role: "system", content: parts.join(`\n`), label: "Session Stats" });
        break;
      }
      case "/undo": {
        if (session.editHistory.length === 0) {
          store.addMessage({ role: "system", content: "No edits to undo." });
        } else {
          const last = session.editHistory[session.editHistory.length - 1];
          fs2.writeFileSync(last.path, last.before, "utf-8");
          session.editHistory.pop();
          store.addMessage({ role: "system", content: `Undone last edit to ${path2.basename(last.path)}` });
        }
        break;
      }
      case "/diff": {
        try {
          const diff = execSync("git diff --stat 2>/dev/null", { encoding: "utf-8", cwd: PROJECT_ROOT });
          store.addMessage({ role: "system", content: diff || "(no changes)", label: "Git Diff" });
        } catch {
          store.addMessage({ role: "system", content: "Not a git repository." });
        }
        break;
      }
      case "/git": {
        if (!arg) {
          store.addMessage({ role: "system", content: "Usage: /git <command>" });
          break;
        }
        try {
          const output = execSync(`git ${arg}`, { encoding: "utf-8", cwd: PROJECT_ROOT });
          store.addMessage({ role: "system", content: output || "(no output)", label: `git ${arg}` });
        } catch (err) {
          store.addMessage({ role: "system", content: err.stderr || err.message });
        }
        break;
      }
      case "/compact": {
        const pruneId = store.addMessage({ role: "system", content: "Compacting conversation...", label: "Context Pruner" });
        try {
          const result = await executeTool("ContextPruner", {}, (partial) => {
            store.updateMessage(pruneId, { content: partial, label: "Context Pruner" });
          });
          store.updateMessage(pruneId, { content: result, label: "Context Pruner" });
        } catch (err) {
          store.updateMessage(pruneId, { content: `Compaction failed: ${err.message}` });
        }
        break;
      }
      case "/quit":
        return { action: "quit" };
      default:
        store.addMessage({ role: "system", content: `Unknown command: ${cmd}. Type /help for available commands.` });
    }
    return null;
  }
  module2.exports = { handleSlashCommand };
});



var require_useLayout = __commonJS((exports, module) => {
var NARROW_THRESHOLD = 60;
function useLayout() {
  const { width } = useTerminalDimensions();
  const w2 = width || 80;
  const isNarrow = w2 < NARROW_THRESHOLD;
  return {
    width: w2,
    isNarrow,
    indent: isNarrow ? 2 : 4,
    smallIndent: isNarrow ? 1 : 2
  };
}

globalThis.useLayout = useLayout;
module.exports = { useLayout };

});

var import_react11 = __toESM(require_react(), 1);
var import_store = __toESM(require_store(), 1);
function useStore() {
  return import_react11.useSyncExternalStore(import_store.subscribe, import_store.getSnapshot);
}

globalThis.useStore = useStore;


var import_react13 = __toESM(require_react(), 1);
var import_theme = __toESM(require_theme(), 1);
var import_config = __toESM(require_config(), 1);
var import_store_h = __toESM(require_store(), 1);

var jsx_runtime = __toESM(require_jsx_runtime(), 1);
var path2 = __require("path");
var { execSync } = __require("child_process");

function Header() {
  const [branch, setBranch] = import_react13.useState("");
  const { isNarrow } = useLayout();
  const cwd = path2.basename(import_config.PROJECT_ROOT);

  import_react13.useEffect(() => {
    try {
      const b2 = execSync("git rev-parse --abbrev-ref HEAD 2>/dev/null", {
        encoding: "utf-8",
        cwd: import_config.PROJECT_ROOT
      }).trim();
      setBranch(b2);
    } catch {}
  }, []);

  const snapshot = import_store_h.getSnapshot();
  const provider = snapshot.provider;
  const providerLabel = import_config.PROVIDERS[provider]?.label || provider;
  const configReady = !snapshot.needsConfig;

  return /* @__PURE__ */ jsx_runtime.jsxs("box", {
    style: { flexDirection: "row", paddingLeft: 1, paddingRight: 1, paddingTop: 1, paddingBottom: 0 },
    children: [
      /* @__PURE__ */ jsx_runtime.jsx("box", {
        style: { flexGrow: 1, flexDirection: "column" },
        children: /* @__PURE__ */ jsx_runtime.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime.jsx("span", {
              fg: import_theme.colors.primary,
              attributes: TextAttributes.BOLD,
              children: "⚡ Apex"
            }),
            /* @__PURE__ */ jsx_runtime.jsx("span", {
              fg: import_theme.colors.dim,
              children: "  "
            }),
            /* @__PURE__ */ jsx_runtime.jsx("span", {
              fg: import_theme.colors.accent,
              children: "[max]"
            }),
            /* @__PURE__ */ jsx_runtime.jsx("span", {
              fg: import_theme.colors.dim,
              children: "  "
            }),
            /* @__PURE__ */ jsx_runtime.jsx("span", {
              fg: import_theme.colors.muted,
              children: isNarrow && cwd.length > 12 ? cwd.slice(0, 12) + "…" : cwd
            }),
            branch && !isNarrow ? /* @__PURE__ */ jsx_runtime.jsxs(jsx_runtime.Fragment, {
              children: [
                /* @__PURE__ */ jsx_runtime.jsx("span", {
                  fg: import_theme.colors.dim,
                  children: "  on "
                }),
                /* @__PURE__ */ jsx_runtime.jsx("span", {
                  fg: import_theme.colors.text,
                  children: branch
                })
              ]
            }) : null
          ]
        })
      }),
      !isNarrow ? /* @__PURE__ */ jsx_runtime.jsxs("box", {
        style: { flexDirection: "column", alignItems: "flex-end" },
        children: [
          /* @__PURE__ */ jsx_runtime.jsxs("text", {
            children: [
              /* @__PURE__ */ jsx_runtime.jsx("span", {
                fg: configReady ? import_theme.colors.green : import_theme.colors.yellow,
                children: configReady ? "●" : "○"
              }),
              /* @__PURE__ */ jsx_runtime.jsx("span", {
                fg: import_theme.colors.dim,
                children: " "
              }),
              /* @__PURE__ */ jsx_runtime.jsx("span", {
                fg: import_theme.colors.muted,
                children: configReady ? "ready" : "needs setup"
              })
            ]
          }),
          /* @__PURE__ */ jsx_runtime.jsxs("text", {
            children: [
              /* @__PURE__ */ jsx_runtime.jsx("span", {
                fg: import_theme.colors.dim,
                children: "provider "
              }),
              /* @__PURE__ */ jsx_runtime.jsx("span", {
                fg: import_theme.colors.primary,
                children: providerLabel
              })
            ]
          })
        ]
      }) : null
    ]
  });
}


var import_theme2 = __toESM(require_theme(), 1);
var jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function Divider() {
  const { width } = useLayout();
  const cols = Math.min(width, 120);
  return /* @__PURE__ */ jsx_runtime2.jsx("text", {
    fg: import_theme2.colors.dim,
    content: "\u2500".repeat(cols)
  });
}



var import_theme3 = __toESM(require_theme(), 1);
var import_config2 = __toESM(require_config(), 1);
var jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function Welcome() {
  const { isNarrow } = useLayout();
  return /* @__PURE__ */ jsx_runtime3.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: 1, marginTop: 1, marginBottom: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.white,
        attributes: TextAttributes.BOLD,
        content: "How can I help?"
      }),
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.dim,
        content: isNarrow ? `Type a message or /help` : `Apex can read, edit, run commands, and review your code. Use /help to see shortcuts.`
      }),
      !isNarrow ? /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.dim,
        style: { marginTop: 0 },
        content: `Shortcuts · /help · /files · /diff · /cost · /quit · Max ${import_config2.MAX_TOOL_ITERATIONS} iterations`
      }) : null
    ]
  });
}



var import_theme4 = __toESM(require_theme(), 1);
var jsx_runtime4 = __toESM(require_jsx_runtime(), 1);

function UserMessage({ content }) {
  const { indent } = useLayout();
  const msgLines = (content || "").split("\n");

  return /* @__PURE__ */ jsx_runtime4.jsxs("box", {
    style: { flexDirection: "row", marginTop: 1 },
    children: [
      // Left accent bar (Codebuff-style visual anchor)
      /* @__PURE__ */ jsx_runtime4.jsx("text", {
        fg: import_theme4.colors.blue,
        content: "▎"
      }),
      /* @__PURE__ */ jsx_runtime4.jsxs("box", {
        style: { flexDirection: "column", paddingLeft: 1 },
        children: [
          /* @__PURE__ */ jsx_runtime4.jsx("text", {
            fg: import_theme4.colors.blue,
            attributes: TextAttributes.BOLD,
            content: "You"
          }),
          msgLines.map((line, i) => /* @__PURE__ */ jsx_runtime4.jsx("text", {
            fg: import_theme4.colors.text,
            content: line
          }, i))
        ]
      })
    ]
  });
}


var import_theme5 = __toESM(require_theme(), 1);
var jsx_runtime5 = __toESM(require_jsx_runtime(), 1);

function AssistantMessage({ content, isStreaming }) {
  const { indent, isNarrow, width } = useLayout();
  const codeIndent = isNarrow ? 1 : 2;
  // Minimum width guard to prevent negative repeat counts
  const codeAreaWidth = Math.max(width - indent - codeIndent, 10);
  const separatorWidth = Math.min(codeAreaWidth, isNarrow ? 44 : 72);

  if (!content) return null;

  const lines = content.split("\n");
  const rendered = [];
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```") && !inCodeBlock) {
      inCodeBlock = true;
      codeLang = line.slice(3).trim() || "code";
      codeLines = [];
    } else if (line.startsWith("```") && inCodeBlock) {
      inCodeBlock = false;
      // Header: ╭─ language ──────── 
      const langTag = ` ${codeLang} `;
      const headerFill = "─".repeat(Math.max(separatorWidth - langTag.length - 2, 2));
      rendered.push(/* @__PURE__ */ jsx_runtime5.jsxs("box", {
        style: { flexDirection: "column", paddingLeft: codeIndent, marginTop: 1 },
        children: [
          /* @__PURE__ */ jsx_runtime5.jsxs("text", {
            children: [
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                fg: import_theme5.colors.accent,
                children: "╭─"
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                fg: import_theme5.colors.accent,
                attributes: TextAttributes.BOLD,
                children: langTag
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                fg: import_theme5.colors.dim,
                children: headerFill
              })
            ]
          }),
          codeLines.map((cl, j2) => /* @__PURE__ */ jsx_runtime5.jsxs("text", {
            children: [
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                fg: import_theme5.colors.dim,
                children: String(j2 + 1).padStart(isNarrow ? 2 : 3) + " │ "
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                fg: import_theme5.colors.text,
                children: cl
              })
            ]
          }, j2)),
          /* @__PURE__ */ jsx_runtime5.jsx("text", {
            fg: import_theme5.colors.dim,
            content: "╰" + "─".repeat(Math.max(separatorWidth - 1, 9))
          })
        ]
      }, `code-${i}`));
    } else if (inCodeBlock) {
      codeLines.push(line);
    } else {
      // Inline code: `backtick` → cyan
      const processed = line.replace(/`([^`]+)`/g, "\xAB$1\xBB");
      if (processed.includes("\xAB")) {
        const parts = processed.split(/«|»/);
        rendered.push(/* @__PURE__ */ jsx_runtime5.jsx("text", {
          children: parts.map((part, j2) =>
            j2 % 2 === 0
              ? /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: import_theme5.colors.text, children: part }, j2)
              : /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: import_theme5.colors.cyan, children: part }, j2)
          )
        }, `line-${i}`));
      } else {
        rendered.push(/* @__PURE__ */ jsx_runtime5.jsx("text", {
          children: /* @__PURE__ */ jsx_runtime5.jsx("span", {
            fg: import_theme5.colors.text,
            children: line
          })
        }, `line-${i}`));
      }
    }
  }

  // Unclosed code block (streaming mid-block)
  if (inCodeBlock && codeLines.length > 0) {
    const langTag = ` ${codeLang} `;
    const headerFill = "─".repeat(Math.max(separatorWidth - langTag.length - 2, 2));
    rendered.push(/* @__PURE__ */ jsx_runtime5.jsxs("box", {
      style: { flexDirection: "column", paddingLeft: codeIndent, marginTop: 1 },
      children: [
        /* @__PURE__ */ jsx_runtime5.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: import_theme5.colors.accent, children: "╭─" }),
            /* @__PURE__ */ jsx_runtime5.jsx("span", {
              fg: import_theme5.colors.accent,
              attributes: TextAttributes.BOLD,
              children: langTag
            }),
            /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: import_theme5.colors.dim, children: headerFill })
          ]
        }),
        codeLines.map((cl, j2) => /* @__PURE__ */ jsx_runtime5.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime5.jsx("span", {
              fg: import_theme5.colors.dim,
              children: String(j2 + 1).padStart(isNarrow ? 2 : 3) + " │ "
            }),
            /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: import_theme5.colors.text, children: cl })
          ]
        }, j2))
      ]
    }, "code-tail"));
  }

  return /* @__PURE__ */ jsx_runtime5.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: indent },
    children: [
      rendered,
      isStreaming ? /* @__PURE__ */ jsx_runtime5.jsx("text", {
        fg: import_theme5.colors.accent,
        content: "▊"
      }) : null
    ]
  });
}


var import_theme6 = __toESM(require_theme(), 1);
var jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
function ThinkBlock({ content, expanded, onToggle }) {
  const { isNarrow, smallIndent } = useLayout();
  if (!content)
    return null;
  const lines = content.split(`
`);
  const maxPreview = isNarrow ? 2 : 4;
  const displayLines = expanded ? lines : lines.slice(0, maxPreview);
  const isTruncated = !expanded && lines.length > maxPreview;
  return /* @__PURE__ */ jsx_runtime6.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: smallIndent, marginTop: 0 },
    onMouseDown: onToggle,
    children: [
      /* @__PURE__ */ jsx_runtime6.jsx("text", {
        fg: import_theme6.colors.dim,
        attributes: TextAttributes.ITALIC,
        content: "\u25B8 Thinking"
      }),
      displayLines.map((line, i) => line.trim() ? /* @__PURE__ */ jsx_runtime6.jsx("text", {
        fg: import_theme6.colors.dim,
        attributes: TextAttributes.ITALIC,
        style: { paddingLeft: smallIndent },
        content: line
      }, i) : null),
      isTruncated ? /* @__PURE__ */ jsx_runtime6.jsx("text", {
        fg: import_theme6.colors.dim,
        attributes: TextAttributes.ITALIC,
        style: { paddingLeft: smallIndent },
        content: isNarrow ? `+${lines.length - maxPreview} more (tap)` : `... +${lines.length - maxPreview} more lines (click to expand)`
      }) : null
    ]
  });
}



var import_theme8 = __toESM(require_theme(), 1);
var import_store2 = __toESM(require_store(), 1);

var jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
var SUBAGENT_TOOLS = new Set([
  "FilePickerMax",
  "Thinker",
  "ThinkerBestOfN",
  "EditorMultiPrompt",
  "CodeReview",
  "CodeReviewMulti",
  "Commander",
  "ContextPruner",
  "ResearcherWeb",
  "ResearcherDocs",
  "GeneralAgent"
]);
function formatElapsed(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}
function truncate(str, len) {
  return str.length > len ? str.slice(0, len - 3) + "..." : str;
}
function ToolCallItem({ message }) {
  const { indent, isNarrow } = useLayout();
  const truncLen = isNarrow ? 30 : 50;
  const { id, name, detail, status, success, elapsed, output, expanded } = message;
  const isRunning = status === "running" || status === "pending";
  const isSubagent = SUBAGENT_TOOLS.has(name);
  return /* @__PURE__ */ jsx_runtime8.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: indent },
    onMouseDown: () => import_store2.toggleMessageExpanded(id),
    children: [
      /* @__PURE__ */ jsx_runtime8.jsx("box", {
        style: { flexDirection: "row" },
        children: isRunning ? /* @__PURE__ */ jsx_runtime8.jsx(Spinner, {
          label: `[${name}] ${truncate(detail || "...", truncLen)}`
        }) : /* @__PURE__ */ jsx_runtime8.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: success ? import_theme8.colors.green : import_theme8.colors.red,
              children: success ? "\u2713" : "\u2717"
            }),
            isSubagent ? /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: expanded ? " \u25BE" : " \u25B8"
            }) : null,
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: " ["
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.accent,
              children: name
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: "] "
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: truncate(detail || "", truncLen)
            }),
            elapsed != null ? /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: "  " + formatElapsed(elapsed)
            }) : null
          ]
        })
      }),
      expanded && output ? (() => {
        const lines = output.split("\n");
        const maxLines = 20;
        const isTruncated = lines.length > maxLines;
        const displayOutput = isTruncated ? lines.slice(0, maxLines).join("\n") + "\n..." : output;
        
        return isSubagent ? /* @__PURE__ */ jsx_runtime8.jsxs("box", {
          style: { flexDirection: "column", paddingLeft: indent, marginTop: 0, borderStyle: "single", borderColor: import_theme8.colors.border, paddingRight: 1 },
          children: [
            /* @__PURE__ */ jsx_runtime8.jsx("text", {
              fg: import_theme8.colors.dim,
              attributes: TextAttributes.ITALIC,
              style: { marginBottom: 0 },
              children: `\u2500\u2500 ${name} output ${isTruncated ? `(${lines.length} lines, showing ${maxLines})` : ""} \u2500\u2500`
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("text", {
              fg: import_theme8.colors.text,
              content: displayOutput,
              wrapMode: "char"
            })
          ]
        }) : /* @__PURE__ */ jsx_runtime8.jsx("box", {
          style: { paddingLeft: indent, marginTop: 0 },
          children: /* @__PURE__ */ jsx_runtime8.jsx("text", {
            fg: import_theme8.colors.dim,
            content: truncate(displayOutput, 1000),
            wrapMode: "char"
          })
        });
      })() : null
    ]
  });
}



var import_react14 = __toESM(require_react(), 1);
var import_theme7 = __toESM(require_theme(), 1);
var jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
var FRAMES = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
function Spinner({ label }) {
  const [frame, setFrame] = import_react14.useState(0);
  const timerRef = import_react14.useRef(null);
  import_react14.useEffect(() => {
    timerRef.current = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
    }, 80);
    return () => clearInterval(timerRef.current);
  }, []);
  return /* @__PURE__ */ jsx_runtime7.jsxs("text", {
    children: [
      /* @__PURE__ */ jsx_runtime7.jsx("span", {
        fg: import_theme7.colors.accent,
        children: FRAMES[frame]
      }),
      label ? /* @__PURE__ */ jsx_runtime7.jsx("span", {
        fg: import_theme7.colors.dim,
        children: " " + label
      }) : null
    ]
  });
}



var import_theme9 = __toESM(require_theme(), 1);
var jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
var path3 = __require("path");
function DiffView({ filename, content }) {
  const { indent } = useLayout();
  if (!content)
    return null;
  const lines = content.split(`
`);
  return /* @__PURE__ */ jsx_runtime9.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: indent },
    children: [
      /* @__PURE__ */ jsx_runtime9.jsx("text", {
        fg: import_theme9.colors.text,
        attributes: TextAttributes.BOLD,
        content: path3.basename(filename || "")
      }),
      lines.map((line, i) => {
        if (line.startsWith("+")) {
          return /* @__PURE__ */ jsx_runtime9.jsx("text", {
            fg: import_theme9.colors.green,
            content: line
          }, i);
        }
        if (line.startsWith("-")) {
          return /* @__PURE__ */ jsx_runtime9.jsx("text", {
            fg: import_theme9.colors.red,
            content: line
          }, i);
        }
        return null;
      })
    ]
  });
}



var import_theme10 = __toESM(require_theme(), 1);
var import_store3 = __toESM(require_store(), 1);
var jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
function SystemMessage({ message }) {
  const { isNarrow, smallIndent } = useLayout();
  const { id, content = "", label, expanded } = message;
  if (!content)
    return null;
  const lines = content.split(`
`);
  const maxPreview = isNarrow ? 3 : 6;
  const displayLines = expanded ? lines : lines.slice(0, maxPreview);
  const isTruncated = !expanded && lines.length > maxPreview;
  return /* @__PURE__ */ jsx_runtime10.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: smallIndent, marginTop: 1 },
    onMouseDown: () => import_store3.toggleMessageExpanded(id),
    children: [
      label ? /* @__PURE__ */ jsx_runtime10.jsx("text", {
        fg: import_theme10.colors.accent,
        attributes: TextAttributes.BOLD,
        content: label
      }) : null,
      displayLines.map((line, i) => /* @__PURE__ */ jsx_runtime10.jsx("text", {
        fg: import_theme10.colors.muted,
        content: line
      }, i)),
      isTruncated ? /* @__PURE__ */ jsx_runtime10.jsx("text", {
        fg: import_theme10.colors.dim,
        content: isNarrow ? `+${lines.length - maxPreview} more (tap)` : `... +${lines.length - maxPreview} more lines (click to expand)`
      }) : null
    ]
  });
}



var import_react = __toESM(require_react(), 1);
var import_theme11 = __toESM(require_theme(), 1);

var import_store4 = __toESM(require_store(), 1);
var jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
function MessageItem({ message }) {
  const { width } = useLayout();
  switch (message.role) {
    case "user":
      return /* @__PURE__ */ jsx_runtime11.jsx(UserMessage, {
        content: message.content
      });
    case "assistant":
      return /* @__PURE__ */ jsx_runtime11.jsxs("box", {
        style: { flexDirection: "column", marginTop: 1 },
        children: [
          /* @__PURE__ */ jsx_runtime11.jsx("text", {
            fg: import_theme11.colors.primary,
            attributes: TextAttributes.BOLD,
            style: { paddingLeft: 1 },
            content: "Apex"
          }),
          /* @__PURE__ */ jsx_runtime11.jsx(AssistantMessage, {
            content: message.content
          })
        ]
      });
    case "thinking":
      return /* @__PURE__ */ jsx_runtime11.jsx(ThinkBlock, {
        content: message.content,
        expanded: message.expanded,
        onToggle: () => import_store4.toggleMessageExpanded(message.id)
      });
    case "tool":
      return /* @__PURE__ */ jsx_runtime11.jsx(ToolCallItem, {
        message
      });
    case "diff":
      return /* @__PURE__ */ jsx_runtime11.jsx(DiffView, {
        filename: message.filename,
        content: message.content
      });
    case "system":
      return /* @__PURE__ */ jsx_runtime11.jsx(SystemMessage, {
        message
      });
    case "divider":
      return /* @__PURE__ */ jsx_runtime11.jsx("text", {
        fg: import_theme11.colors.dim,
        style: { paddingLeft: 1 },
        content: "─".repeat(Math.max(width - 2, 10))
      });
    default:
      return null;
  }
}
function ChatArea({ messages, streamingContent, streamingThinking, isProcessing }) {
  const { indent } = useLayout();
  const renderedMessages = import_react.useMemo(() =>
    messages.map((msg) => /* @__PURE__ */ jsx_runtime11.jsx(MessageItem, {
      message: msg
    }, msg.id)),
    [messages]
  );

  return /* @__PURE__ */ jsx_runtime11.jsx("scrollbox", {
    style: { flexGrow: 1 },
    focused: true,
    stickyScroll: true,
    stickyStart: "bottom",
    scrollY: true,
    key: "main-chat-scroll",
    children: /* @__PURE__ */ jsx_runtime11.jsxs("box", {
      style: { flexDirection: "column" },
      children: [
        /* @__PURE__ */ jsx_runtime11.jsx(Welcome, {}),
        renderedMessages,
        // Thinking preview while streaming — show last 200 chars with a cleaner indicator
        streamingThinking ? /* @__PURE__ */ jsx_runtime11.jsxs("box", {
          style: { paddingLeft: indent, marginTop: 1 },
          children: [
            /* @__PURE__ */ jsx_runtime11.jsxs("text", {
              children: [
                /* @__PURE__ */ jsx_runtime11.jsx("span", {
                  fg: import_theme11.colors.accent,
                  attributes: TextAttributes.ITALIC,
                  children: "◆ "
                }),
                /* @__PURE__ */ jsx_runtime11.jsx("span", {
                  fg: import_theme11.colors.dim,
                  attributes: TextAttributes.ITALIC,
                  children: "thinking"
                })
              ]
            }),
            /* @__PURE__ */ jsx_runtime11.jsx("text", {
              fg: import_theme11.colors.dim,
              attributes: TextAttributes.ITALIC,
              style: { paddingLeft: 2 },
              content: streamingThinking.slice(-200)
            })
          ]
        }) : null,
        // Streaming response — show "Apex" label for visual consistency with committed messages
        streamingContent ? /* @__PURE__ */ jsx_runtime11.jsxs("box", {
          style: { flexDirection: "column", marginTop: 1 },
          children: [
            /* @__PURE__ */ jsx_runtime11.jsx("text", {
              fg: import_theme11.colors.primary,
              attributes: TextAttributes.BOLD,
              style: { paddingLeft: 1 },
              content: "Apex"
            }),
            /* @__PURE__ */ jsx_runtime11.jsx(AssistantMessage, {
              content: streamingContent,
              isStreaming: true
            })
          ]
        }) : null,
        // Idle processing state — spinner while waiting for first token
        isProcessing && !streamingContent && !streamingThinking ? /* @__PURE__ */ jsx_runtime11.jsx("box", {
          style: { paddingLeft: indent, marginTop: 1 },
          children: /* @__PURE__ */ jsx_runtime11.jsx(Spinner, {
            label: "Reasoning..."
          })
        }) : null,
        /* @__PURE__ */ jsx_runtime11.jsx("box", {
          style: { height: 1 }
        })
      ]
    })
  });
}


var import_react15 = __toESM(require_react(), 1);
var import_theme12 = __toESM(require_theme(), 1);
var jsx_runtime12 = __toESM(require_jsx_runtime(), 1);

function InputBar({ disabled, onSubmit }) {
  const inputRef = import_react15.useRef(null);
  const { isNarrow, width } = useLayout();

  const handleSubmit = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (inputRef.current) inputRef.current.value = "";
    onSubmit(trimmed);
  };

  const hint = isNarrow ? "Ctrl+C · /" : "Ctrl+C exit · /help · /files";
  const placeholder = disabled
    ? "setup in progress..."
    : isNarrow
      ? "Message or /cmd"
      : "Ask Apex anything, or use /commands";

  return /* @__PURE__ */ jsx_runtime12.jsx("box", {
    style: { flexDirection: "column", paddingLeft: 1, paddingRight: 1, paddingBottom: 1 },
    children: /* @__PURE__ */ jsx_runtime12.jsxs("box", {
      style: {
        flexDirection: "row",
        paddingLeft: 1,
        paddingRight: 1,
        borderStyle: "rounded",
        borderColor: disabled ? import_theme12.colors.dim : import_theme12.colors.border,
        backgroundColor: disabled ? import_theme12.colors.surface : undefined
      },
      children: [
        /* @__PURE__ */ jsx_runtime12.jsx("text", {
          fg: disabled ? import_theme12.colors.dim : import_theme12.colors.primary,
          attributes: disabled ? 0 : TextAttributes.BOLD,
          content: "❯ "
        }),
        /* @__PURE__ */ jsx_runtime12.jsx("input", {
          ref: inputRef,
          focused: !disabled,
          placeholder,
          onSubmit: handleSubmit,
          fg: import_theme12.colors.text,
          style: { flexGrow: 1 }
        }),
        /* @__PURE__ */ jsx_runtime12.jsx("text", {
          fg: import_theme12.colors.dim,
          content: "  " + hint
        })
      ]
    })
  });
}


var import_react_sb = __toESM(require_react(), 1);
var import_theme13 = __toESM(require_theme(), 1);
var import_config3 = __toESM(require_config(), 1);
var import_store3 = __toESM(require_store(), 1);
var jsx_runtime13 = __toESM(require_jsx_runtime(), 1);

var SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function StatusBar({ isProcessing }) {
  const { isNarrow } = useLayout();
  const snapshot = import_config3.session;
  const state = import_store3.getSnapshot();

  const [tick, setTick] = import_react_sb.useState(0);
  import_react_sb.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const [spinFrame, setSpinFrame] = import_react_sb.useState(0);
  import_react_sb.useEffect(() => {
    if (!isProcessing) return;
    const id = setInterval(() => setSpinFrame((f) => (f + 1) % SPINNER_FRAMES.length), 80);
    return () => clearInterval(id);
  }, [isProcessing]);

  const elapsed = (tick, ((Date.now() - snapshot.startTime) / 1000 / 60).toFixed(1));
  const tokStr = snapshot.totalTokens >= 1000 ? (snapshot.totalTokens / 1000).toFixed(1) + "k" : String(snapshot.totalTokens);
  const configReady = !state.needsConfig;
  const providerLabel = state.provider ? import_config3.PROVIDERS[state.provider]?.label || state.provider : "unknown";

  return /* @__PURE__ */ jsx_runtime13.jsxs("box", {
    style: { flexDirection: "row", paddingLeft: isNarrow ? 1 : 2, paddingRight: isNarrow ? 1 : 2, paddingBottom: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime13.jsx("box", {
        style: { flexGrow: 1 },
        children: /* @__PURE__ */ jsx_runtime13.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: [elapsed, "min"]
            }),
            /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " · " }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: [snapshot.turnCount, " turns"]
            }),
            !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
              children: [
                /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " · " }),
                /* @__PURE__ */ jsx_runtime13.jsxs("span", {
                  fg: import_theme13.colors.dim,
                  children: [snapshot.toolCallCount, " tools"]
                }),
                /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " · " }),
                /* @__PURE__ */ jsx_runtime13.jsxs("span", {
                  fg: import_theme13.colors.dim,
                  children: [tokStr, " tok"]
                })
              ]
            }) : null,
            /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " · " }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: ["$", snapshot.totalCost.toFixed(4)]
            })
          ]
        })
      }),
      !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs("text", {
        children: [
          /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: configReady ? import_theme13.colors.green : import_theme13.colors.yellow,
            children: configReady ? "●" : "○"
          }),
          /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.dim,
            children: " "
          }),
          /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.muted,
            children: configReady ? providerLabel : "setup required"
          })
        ]
      }) : null,
      isProcessing ? /* @__PURE__ */ jsx_runtime13.jsxs("text", {
        children: [
          /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.accent,
            children: SPINNER_FRAMES[spinFrame]
          }),
          /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.accent,
            children: isNarrow ? " …" : " thinking"
          }),
          !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.dim,
            children: " · Esc"
          }) : null
        ]
      }) : null
    ]
  });
}


var import_theme14 = __toESM(require_theme(), 1);
var jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
var COMMANDS = [
  { cmd: "/help", desc: "Show this menu" },
  { cmd: "/compact", desc: "Compact/summarize conversation context" },
  { cmd: "/files", desc: "Show project file tree" },
  { cmd: "/clear", desc: "Clear conversation" },
  { cmd: "/cost", desc: "Show session stats" },
  { cmd: "/undo", desc: "Undo last edit" },
  { cmd: "/diff", desc: "Show git diff" },
  { cmd: "/git <cmd>", desc: "Run a git command" },
  { cmd: "/quit", desc: "Exit" }
];
const QUICK_TIPS = [
  "Ctrl+C exits the app",
  "Esc closes overlays and thinking blocks",
  "On first launch, choose a provider and paste your API key",
];
var TOOLS = [
  "Read",
  "Write",
  "Edit",
  "Patch",
  "Bash",
  "Grep",
  "Glob",
  "ListDir",
  "UndoEdit",
  "Task",
  "CodeReview"
];
var SUBAGENTS = [
  "FilePickerMax",
  "Thinker",
  "ThinkerBestOfN*",
  "EditorMultiPrompt*",
  "CodeReviewMulti*",
  "Commander",
  "ContextPruner"
];
function HelpModal({ onClose, onCommand }) {
  const { isNarrow } = useLayout();
  useKeyboard((key) => {
    if (key.name === "escape" || key.name === "q") {
      onClose();
    }
  });
  return /* @__PURE__ */ jsx_runtime14.jsxs("box", {
    zIndex: 100,
    border: true,
    borderColor: import_theme14.colors.primary,
    backgroundColor: "#0d0d1a",
    title: " Help ",
    titleAlignment: "center",
    style: {
      position: "absolute",
      top: 2,
      left: isNarrow ? 1 : 4,
      bottom: 2,
      right: isNarrow ? 1 : 4,
      padding: 1,
      flexDirection: "column"
    },
    children: [
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.white,
        attributes: TextAttributes.BOLD,
        content: "Commands"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("box", {
        style: { flexDirection: "column", marginTop: 0 },
        children: COMMANDS.map(({ cmd, desc }) => /* @__PURE__ */ jsx_runtime14.jsx("box", {
          style: { flexDirection: "row" },
          onMouseDown: () => {
            const slashCmd = cmd.split(" ")[0];
            if (onCommand && !cmd.includes("<"))
              onCommand(slashCmd);
            onClose();
          },
          children: /* @__PURE__ */ jsx_runtime14.jsxs("text", {
            children: [
              /* @__PURE__ */ jsx_runtime14.jsx("span", {
                fg: import_theme14.colors.accent,
                children: cmd.padEnd(isNarrow ? 10 : 14)
              }),
              /* @__PURE__ */ jsx_runtime14.jsx("span", {
                fg: import_theme14.colors.text,
                children: desc
              })
            ]
          })
        }, cmd))
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.white,
        attributes: TextAttributes.BOLD,
        style: { marginTop: 1 },
        content: "Quick Tips"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("box", {
        style: { flexDirection: "column", marginTop: 0 },
        children: QUICK_TIPS.map((tip) => /* @__PURE__ */ jsx_runtime14.jsx("text", {
          fg: import_theme14.colors.dim,
          content: `• ${tip}`
        }, tip))
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.white,
        attributes: TextAttributes.BOLD,
        style: { marginTop: 1 },
        content: "Tools"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.dim,
        content: TOOLS.join(", ")
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.white,
        attributes: TextAttributes.BOLD,
        style: { marginTop: 1 },
        content: "Sub-Agents"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.dim,
        content: SUBAGENTS.join(", ")
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.dim,
        content: "  * = MAX mode only"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.dim,
        style: { marginTop: 1 },
        content: "Press ESC or q to close"
      })
    ]
  });
}



var import_react = __toESM(require_react(), 1);
var import_theme = __toESM(require_theme(), 1);
var import_store = __toESM(require_store(), 1);
var import_config = __toESM(require_config(), 1);
var import_useLayout = __toESM(require_useLayout(), 1);
var jsx_runtime = __toESM(require_jsx_runtime(), 1);

var PROVIDER_ORDER = ["fireworks", "openai", "openrouter", "groq", "gemini", "together", "baseten", "replit", "apex-nova"];

var PROVIDER_EMOJI = {
  fireworks: "🔥",
  openai: "🤖",
  openrouter: "🔀",
  groq: "⚡",
  gemini: "💎",
  together: "🤝",
  baseten: "🔺",
  replit: "🆓",
  "apex-nova": "🌟",
};

function ProviderSelector() {
  var state = useStore();
  var [input, setInput] = import_react.useState("");
  var [focusedIdx, setFocusedIdx] = import_react.useState(0);
  var [step, setStep] = import_react.useState("select");
  var { width } = import_useLayout.useLayout();

  var providers = import_config.PROVIDERS;
  var providerKey = PROVIDER_ORDER[focusedIdx];
  var provider = providers[providerKey];

  function getStoredKey(key) {
    return import_config.getSavedApiKey(key);
  }

  function loginState(key) {
    return import_config.getProviderLoginState(key);
  }

  function isConfigured(key) {
    return loginState(key) !== "empty";
  }

  function isLoggedIn(key) {
    return loginState(key) === "logged-in";
  }

  function finishLogin(providerKey2, key) {
    import_config.loginProvider(providerKey2, key);
    import_store.setState({
      apiKey: key,
      provider: providerKey2,
      needsConfig: false,
    });
  }

  function handleLogin() {
    var key = input.trim();
    if (!key) return;
    finishLogin(providerKey, key);
    setInput("");
    setStep("select");
  }

  function handleLogout() {
    var remaining = import_config.logoutProvider(providerKey);
    if (remaining) {
      import_store.setState({
        apiKey: remaining.apiKey,
        provider: remaining.providerKey,
        needsConfig: false,
      });
    } else {
      import_store.setState({
        apiKey: "",
        provider: providerKey,
        needsConfig: true,
      });
    }
    setInput("");
    setStep("select");
  }

  function handleSelect() {
    var providerObj = providers[providerKey];
    if (providerObj && providerObj.noKey) {
      finishLogin(providerKey, undefined);
      return;
    }
    if (isLoggedIn(providerKey)) {
      handleLogout();
      return;
    }
    if (isConfigured(providerKey)) {
      finishLogin(providerKey, getStoredKey(providerKey));
      return;
    }
    setStep("key");
  }

  // Use useKeyboard hook for proper keyboard handling
  useKeyboard(function (key) {
    if (step === "select") {
      if (key.name === "up" || key.name === "k") {
        setFocusedIdx(function (i) {
          return (i - 1 + PROVIDER_ORDER.length) % PROVIDER_ORDER.length;
        });
      } else if (key.name === "down" || key.name === "j") {
        setFocusedIdx(function (i) {
          return (i + 1) % PROVIDER_ORDER.length;
        });
      } else if (key.name === "return" || key.name === "enter") {
        handleSelect();
      } else if (key.name === "l") {
        if (isLoggedIn(providerKey) && !providers[providerKey].noKey) handleLogout();
      }
    } else {
      if (key.name === "escape") {
        setStep("select");
        setInput("");
      }
      // Note: Enter in key input is handled by the input's onSubmit
    }
  });

  var selectedState = loginState(providerKey);

  return jsx_runtime.jsx(
    "box",
    {
      style: {
        flexDirection: "column",
        flexGrow: 1,
        paddingTop: 2,
      },
      focused: true,
      children:
        step === "select"
          ? jsx_runtime.jsxs(jsx_runtime.Fragment, {
              children: [
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4, marginBottom: 1 },
                  children: jsx_runtime.jsx("text", {
                    attributes: TextAttributes.BOLD,
                    fg: import_theme.colors.white,
                    children: "Choose your AI provider",
                  }),
                }),
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4, marginBottom: 1 },
                  children: jsx_runtime.jsx("text", {
                    fg: import_theme.colors.dim,
                    children:
                      "Use ↑↓ or j/k to navigate. Enter logs in or out depending on the selected provider's state.",
                  }),
                }),
                PROVIDER_ORDER.map(function (key, idx) {
                  var focused = idx === focusedIdx;
                  var stateLabel = loginState(key);
                  var statusFg = (stateLabel === "logged-in" || stateLabel === "no-key")
                    ? import_theme.colors.green
                    : stateLabel === "saved"
                      ? import_theme.colors.yellow
                      : import_theme.colors.dim;
                  var statusText = stateLabel === "no-key"
                    ? "Free (no key)"
                    : stateLabel === "logged-in"
                      ? "Logged in"
                      : stateLabel === "saved"
                        ? "Logged out"
                        : "Needs key";

                  return jsx_runtime.jsxs(
                    "box",
                    {
                      style: {
                        flexDirection: "row",
                        paddingLeft: 4,
                        paddingRight: 4,
                      },
                      onMouseEnter: function () {
                        setFocusedIdx(idx);
                      },
                      onMouseDown: function () {
                        setFocusedIdx(idx);
                        if (providers[key].noKey) {
                          finishLogin(key, undefined);
                        } else if (stateLabel === "logged-in") {
                          handleLogout();
                        } else if (stateLabel === "saved") {
                          finishLogin(key, getStoredKey(key));
                        } else {
                          setStep("key");
                        }
                      },
                      children: [
                        jsx_runtime.jsx("text", {
                          fg: focused ? import_theme.colors.primary : import_theme.colors.dim,
                          attributes: focused ? TextAttributes.BOLD : 0,
                          children: focused ? "▶ " : "  ",
                        }),
                        jsx_runtime.jsx("text", {
                          fg: focused ? import_theme.colors.white : import_theme.colors.text,
                          attributes: focused ? TextAttributes.BOLD : 0,
                          children: PROVIDER_EMOJI[key] + "  " + providers[key].label,
                        }),
                        jsx_runtime.jsx("text", {
                          fg: import_theme.colors.dim,
                          children: "  ",
                        }),
                        jsx_runtime.jsx("text", {
                          fg: statusFg,
                          children: statusText,
                        }),
                      ],
                    },
                    key
                  );
                }),
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4, marginTop: 2 },
                  children: jsx_runtime.jsx("text", {
                    fg: import_theme.colors.dim,
                    children: provider.noKey
                      ? "Press Enter to use this provider — no API key required."
                      : selectedState === "logged-in"
                        ? "Press Enter to log out of the selected provider."
                        : selectedState === "saved"
                          ? "Press Enter to log in with the saved key."
                          : "Press Enter to log in with a new key. Keys are stored in ~/.apex-dev/config.json or can be supplied via environment variables.",
                  }),
                }),
              ],
            })
          : jsx_runtime.jsxs(jsx_runtime.Fragment, {
              children: [
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4, marginBottom: 0 },
                  children: jsx_runtime.jsx("text", {
                    attributes: TextAttributes.BOLD,
                    fg: import_theme.colors.primary,
                    children:
                      PROVIDER_EMOJI[providerKey] + "  " + provider.label + " API Key",
                  }),
                }),
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4, marginBottom: 2 },
                  children: jsx_runtime.jsxs("text", {
                    fg: import_theme.colors.dim,
                    children: [
                      "Env var: ",
                      jsx_runtime.jsx("span", {
                        fg: import_theme.colors.yellow,
                        children: provider.envKey,
                      }),
                      "  ·  Esc to go back",
                    ],
                  }),
                }),
                jsx_runtime.jsx("box", {
                  style: {
                    paddingLeft: 4,
                    paddingRight: 4,
                    marginBottom: 1,
                  },
                  children: jsx_runtime.jsx("box", {
                    style: {
                      borderStyle: "single",
                      borderColor: import_theme.colors.primary,
                      paddingLeft: 1,
                      paddingRight: 1,
                    },
                    children: jsx_runtime.jsx("input", {
                      focused: true,
                      value: input,
                      onChange: setInput,
                      onSubmit: handleLogin,
                      placeholder: "Paste your API key here...",
                      fg: import_theme.colors.text,
                    }),
                  }),
                }),
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4 },
                  children: jsx_runtime.jsx("text", {
                    fg: import_theme.colors.dim,
                    children: "Press Enter to login",
                  }),
                }),
              ],
            }),
    }
  );
}

globalThis._ProviderSelector = ProviderSelector;


var import_react = __toESM(require_react(), 1);
var import_theme = __toESM(require_theme(), 1);
var import_store = __toESM(require_store(), 1);
var import_config = __toESM(require_config(), 1);
var import_useLayout = __toESM(require_useLayout(), 1);
var jsx_runtime = __toESM(require_jsx_runtime(), 1);

var PROVIDER_ORDER = ["fireworks", "openai", "openrouter", "groq", "gemini", "together"];

function ApiKeyModal() {
  var [input, setInput] = import_react.useState("");
  var [selectedIdx, setSelectedIdx] = import_react.useState(0);
  var [step, setStep] = import_react.useState("provider"); // "provider" | "key"
  var { width, height } = import_useLayout.useLayout();

  var providers = import_config.PROVIDERS;
  var providerKey = PROVIDER_ORDER[selectedIdx];
  var provider = providers[providerKey];

  var handleKeyPress = function(key) {
    if (step === "provider") {
      if (key.name === "up" || key.name === "k") {
        setSelectedIdx(function(i) { return (i - 1 + PROVIDER_ORDER.length) % PROVIDER_ORDER.length; });
      } else if (key.name === "down" || key.name === "j") {
        setSelectedIdx(function(i) { return (i + 1) % PROVIDER_ORDER.length; });
      } else if (key.name === "return" || key.name === "enter") {
        setStep("key");
      }
    } else {
      if (key.name === "escape") {
        setStep("provider");
        setInput("");
      } else if (key.name === "return" || key.name === "enter") {
        handleSubmit();
      }
    }
  };

  var handleSubmit = function() {
    var key = input.trim();
    if (!key) return;
    import_config.setProvider(providerKey, key);
    import_store.setState({ apiKey: key, provider: providerKey, needsConfig: false });
  };

  var modalWidth = Math.min(62, width - 4);
  var modalHeight = step === "provider" ? PROVIDER_ORDER.length + 6 : 10;
  var left = Math.floor((width - modalWidth) / 2);
  var top = Math.floor((height - modalHeight) / 2);

  var renderProviderStep = function() {
    return jsx_runtime.jsxs(jsx_runtime.Fragment, {
      children: [
        jsx_runtime.jsx("text", {
          style: { marginBottom: 1 },
          attributes: TextAttributes.BOLD,
          fg: import_theme.colors.primary,
          children: "Select AI Provider"
        }),
        jsx_runtime.jsx("text", {
          style: { marginBottom: 1 },
          fg: import_theme.colors.dim,
          children: "Use ↑↓ or j/k to navigate, Enter to confirm"
        }),
        ...PROVIDER_ORDER.map(function(key, idx) {
          var isSelected = idx === selectedIdx;
          return jsx_runtime.jsx("text", {
            fg: isSelected ? import_theme.colors.primary : import_theme.colors.text,
            attributes: isSelected ? TextAttributes.BOLD : 0,
            children: (isSelected ? "▶ " : "  ") + providers[key].label
          }, key);
        })
      ]
    });
  };

  var renderKeyStep = function() {
    return jsx_runtime.jsxs(jsx_runtime.Fragment, {
      children: [
        jsx_runtime.jsx("text", {
          style: { marginBottom: 1 },
          attributes: TextAttributes.BOLD,
          fg: import_theme.colors.primary,
          children: provider.label + " API Key"
        }),
        jsx_runtime.jsx("text", {
          style: { marginBottom: 1 },
          fg: import_theme.colors.dim,
          children: "Env var: " + provider.envKey + "  \xB7  Esc to go back"
        }),
        jsx_runtime.jsx("box", {
          style: {
            borderStyle: "single",
            borderColor: import_theme.colors.dim,
            paddingLeft: 1,
            paddingRight: 1,
            marginBottom: 1
          },
          children: jsx_runtime.jsx("input", {
            focused: true,
            value: input,
            onChange: setInput,
            onSubmit: handleSubmit,
            placeholder: "Paste your API key here...",
            fg: import_theme.colors.text
          })
        }),
        jsx_runtime.jsx("text", {
          fg: import_theme.colors.dim,
          children: "Press Enter to confirm"
        })
      ]
    });
  };

  return jsx_runtime.jsx("box", {
    style: {
      position: "absolute",
      left,
      top,
      width: modalWidth,
      height: modalHeight,
      borderStyle: "rounded",
      borderColor: import_theme.colors.primary,
      paddingLeft: 2,
      paddingRight: 2,
      paddingTop: 1,
      flexDirection: "column"
    },
    onKeyDown: handleKeyPress,
    children: step === "provider" ? renderProviderStep() : renderKeyStep()
  });
}

globalThis._ApiKeyModal = ApiKeyModal;


var import_react17 = __toESM(require_react(), 1);

var import_store5 = __toESM(require_store(), 1);
var import_config4 = __toESM(require_config(), 1);
var import_agent = __toESM(require_agent(), 1);
var import_commands = __toESM(require_commands(), 1);

var jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
function exitApp() {
  const renderer = import_store5.getRenderer();
  if (renderer)
    renderer.destroy();
  const elapsed = ((Date.now() - import_config4.session.startTime) / 1000 / 60).toFixed(1);
  const parts = [
    `${elapsed} min`,
    `${import_config4.session.turnCount} turns`,
    `${import_config4.session.toolCallCount} tool calls`,
    `${import_config4.session.totalTokens.toLocaleString()} tokens`,
    `$${import_config4.session.totalCost.toFixed(4)}`
  ];
  if (import_config4.session.filesModified.size > 0)
    parts.push(`${import_config4.session.filesModified.size} files modified`);
  if (import_config4.session.commandsRun.length > 0)
    parts.push(`${import_config4.session.commandsRun.length} commands`);
  console.log(`
  Session: ${parts.join(" · ")}
`);
  console.log(`  Goodbye! ✦
`);
  process.exit(0);
}
function App() {
  const state = useStore();
  useKeyboard((key) => {
    if (key.ctrl && key.name === "c") {
      exitApp();
    }
  });
  const handleInput = import_react17.useCallback(async (value) => {
    if (value === "exit" || value === "quit") {
      exitApp();
      return;
    }
    if (value.startsWith("/")) {
      const result = await import_commands.handleSlashCommand(value);
      if (result?.action === "quit") {
        exitApp();
      }
      return;
    }
    import_agent.handleUserInput(value).catch((err) => {
      import_store5.addMessage({ role: "system", content: `Error: ${err.message}` });
      import_store5.setState({ isProcessing: false });
    });
  }, []);
  const handleHelpCommand = import_react17.useCallback((cmd) => {
    if (cmd) {
      import_commands.handleSlashCommand(cmd).then((result) => {
        if (result?.action === "quit")
          exitApp();
      });
    }
  }, []);
  const shouldShowSetup = process.env.APEX_DEV_NEEDS_CONFIG === "true" || state.needsConfig;
  return /* @__PURE__ */ jsx_runtime15.jsxs("box", {
    style: { flexDirection: "column", flexGrow: 1 },
    children: [
      shouldShowSetup ? /* @__PURE__ */ jsx_runtime15.jsx(globalThis._ProviderSelector, {}) : /* @__PURE__ */ jsx_runtime15.jsxs(jsx_runtime15.Fragment, {
        children: [
          /* @__PURE__ */ jsx_runtime15.jsx(Header, {}),
          /* @__PURE__ */ jsx_runtime15.jsx(Divider, {}),
          /* @__PURE__ */ jsx_runtime15.jsx(ChatArea, {
            messages: state.messages,
            streamingContent: state.streamingContent,
            streamingThinking: state.streamingThinking,
            isProcessing: state.isProcessing
          }),
          /* @__PURE__ */ jsx_runtime15.jsx(Divider, {}),
          /* @__PURE__ */ jsx_runtime15.jsx(StatusBar, {
            isProcessing: state.isProcessing
          }),
          /* @__PURE__ */ jsx_runtime15.jsx(InputBar, {
            disabled: state.isProcessing || state.showHelp || shouldShowSetup,
            onSubmit: handleInput
          }),
          state.showHelp ? /* @__PURE__ */ jsx_runtime15.jsx(HelpModal, {
            onClose: () => import_store5.setState({ showHelp: false }),
            onCommand: handleHelpCommand
          }) : null
        ]
      })
    ]
  });
}

globalThis._App = App;



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
