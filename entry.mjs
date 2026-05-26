// @bun
// Proper entry for Apex AI

import {
  TextAttributes,
  createCliRenderer,
} from "@opentui/core";
import { createRoot, useTerminalDimensions, useKeyboard } from "@opentui/react";
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

// External package CJS wrappers
var require_react = __commonJS((exports, module) => {
  module.exports = __require("react");
});
var require_jsx_runtime = __commonJS((exports, module) => {
  module.exports = __require("react/jsx-runtime");
});
var require_openai = __commonJS((exports, module) => {
  module.exports = __require("openai");
});

var require_store = __commonJS((exports, module2) => {
  var state = {
    messages: [],
    streamingContent: "",
    streamingThinking: "",
    isProcessing: false,
    showHelp: false,
    showSummary: false
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

var require_config = __commonJS((exports, module2) => {
  var OpenAI = require_openai();
  var NVIDIA_MODEL = "z-ai/glm4.7";
  var REVIEWER_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1.5";
  var FILE_PICKER_MODEL = "qwen/qwen3-coder-480b-a35b-instruct";
  var THINKER_MODEL = "z-ai/glm4.7";
  var COMMANDER_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1.5";
  var CONTEXT_PRUNER_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1.5";
  var RESEARCHER_MODEL = "nvidia/llama-3.3-nemotron-super-49b-v1.5";
  var GENERAL_AGENT_MODEL = "z-ai/glm4.7";
  var MAX_TOOL_ITERATIONS = 50;
  var MAX_OUTPUT_LEN = 12000;
  var TOOL_TIMEOUT = 60000;
  var PROJECT_ROOT = process.cwd();
  var currentMode = "max";
  var REVIEWER_SYSTEM_PROMPT = `You are a senior code reviewer. An AI coding assistant just made changes to a codebase. Your job is to review those changes thoroughly and report issues. Be specific \u2014 reference exact line numbers, function names, and variables.

The caller must always specify the exact files and changes to review. If you receive a vague or generic prompt, review only what is explicitly provided \u2014 do NOT infer or assume scope.

Focus on:
1. **Bugs & logic errors** \u2014 incorrect conditions, off-by-one, null/undefined risks, race conditions
2. **Security** \u2014 exposed secrets, injection risks, unsafe operations
3. **Edge cases** \u2014 unhandled inputs, missing error handling at boundaries
4. **Code quality** \u2014 naming, readability, dead code, unnecessary complexity
5. **Correctness** \u2014 does the code actually fulfil the stated intent?

If everything looks good, say so briefly. If there are problems, list them clearly with severity (critical / warning / nit). You have no tools; your only output is this review.`;
  var FILE_PICKER_SYSTEM_PROMPT = `You are a precision file-picker agent embedded inside a coding assistant. Your ONLY job is to identify the files in a codebase that are relevant to a given prompt.

You will receive:
1. A full recursive directory tree of the project.
2. A preview (first 8 lines) of every source file.
3. A prompt specifying the exact type of files to find.

Your task:
- Analyze the directory tree and file previews carefully.
- Select ONLY the files that are directly relevant to the prompt.
- Rank them by relevance (most relevant first).
- Be precise \u2014 do NOT include files that are only tangentially related.
- If no files match, say so.
- The caller must always specify the exact type of files they need. If you receive a vague or generic prompt like "give me an overview of the codebase", respond with an empty array \u2014 do NOT guess.

Output format \u2014 return ONLY a JSON array of objects, nothing else:
[
  { "path": "relative/path/to/file.js", "reason": "Brief explanation of why this file is relevant" }
]

Do NOT wrap in markdown code fences. Output raw JSON only.`;
  var THINKER_SYSTEM_PROMPT = `You are Theo the Theorizer, a deep reasoning and planning agent inside a coding assistant. Your job is to think carefully about coding tasks and produce clear, actionable plans.

You will receive the conversation history and a specific question or task to reason about.

Your process:
1. Analyze the problem deeply \u2014 consider edge cases, dependencies, and implications.
2. If it's a coding task, plan which files need changes and in what order.
3. Consider multiple approaches and trade-offs.
4. Output a clear, structured response with your reasoning and recommendations.

Be concise but thorough. Focus on actionable insights, not obvious observations. If you identify risks or potential issues, flag them clearly.`;
  var COMMANDER_SYSTEM_PROMPT = `You are a terminal command specialist agent. Your job is to determine the right shell commands to accomplish a goal and explain what they do.

You will receive a task description. Output a JSON array of commands to execute:
[
  { "command": "the shell command", "description": "what this does and why" }
]

Rules:
- Only suggest safe, non-destructive commands unless explicitly asked for destructive operations.
- Never suggest commands that expose secrets or credentials.
- Prefer specific, targeted commands over broad ones.
- Include error handling where appropriate (e.g., using || or checking exit codes).
- Output raw JSON only, no markdown fences.`;
  var CONTEXT_PRUNER_SYSTEM_PROMPT = `You are a context management agent. Your job is to summarize a long conversation history into a concise but complete summary that preserves all important information.

Preserve:
1. All file paths that were read, modified, or created.
2. Key decisions and their rationale.
3. Errors encountered and how they were resolved.
4. The current state of the task (what's done, what's remaining).
5. Any important code snippets or patterns discussed.

Output a structured summary with sections:
- **Task**: What the user asked for
- **Progress**: What has been done so far
- **Files Modified**: List of files changed
- **Key Decisions**: Important choices made
- **Current State**: Where things stand now
- **Remaining**: What still needs to be done (if anything)

Be concise but lose no critical details. This summary replaces the full conversation.`;
  var SELECTOR_SYSTEM_PROMPT = `You are a code implementation selector. You will receive multiple implementation proposals (labeled A, B, C, etc.) for the same coding task. Each proposal includes the strategy used and the resulting changes.

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
  var RESEARCHER_WEB_SYSTEM_PROMPT = `You are a web research specialist embedded in a coding assistant. You receive web search results and synthesize them into a clear, accurate answer.

Rules:
1. Extract the most relevant information from results. Cite sources with URLs.
2. Be specific and actionable \u2014 code examples and exact details over generic advice.
3. If results don't contain the answer, say so clearly and share what you know from training data.
4. Prefer recent/authoritative sources. Note when information may be outdated.
5. Keep answers concise but thorough \u2014 developers are your audience.
6. Do NOT use <think> tags or internal reasoning blocks in your response. Output your answer directly.`;
  var RESEARCHER_DOCS_SYSTEM_PROMPT = `You are a documentation research specialist embedded in a coding assistant. You receive documentation search results and synthesize them into a precise, practical answer.

Rules:
1. Extract exact API signatures, parameter types, return values, and defaults.
2. Include code examples that can be used directly \u2014 prefer showing code over describing it.
3. Note version-specific behavior when relevant.
4. Highlight common pitfalls, gotchas, and deprecation warnings.
5. If the docs don't cover the question, say so and provide your best guidance from training data.
6. Do NOT use <think> tags or internal reasoning blocks in your response. Output your answer directly.`;
  var GENERAL_AGENT_SYSTEM_PROMPT = `You are a general-purpose coding agent. You receive file contents and conversation context, then produce a thorough, actionable response.

Your strengths:
1. Deep analysis \u2014 read and reason about complex codebases, trace call chains, identify patterns.
2. Problem solving \u2014 identify root causes, suggest fixes, plan multi-step implementations.
3. Code generation \u2014 write complete, working code that matches existing project conventions.

Be direct and comprehensive. Provide actual solutions, not descriptions of what to do. If you identify issues or risks, flag them clearly with severity.`;
  var nvidiaClient = new OpenAI({
    apiKey: process.env.APEX_API_KEY || "local-proxy",
    baseURL: process.env.APEX_API_URL || "https://apex-api-ten.vercel.app/v1"
  });
  var session = {
    conversationHistory: [],
    totalTokens: 0,
    totalCost: 0,
    toolCallCount: 0,
    filesModified: new Set,
    filesRead: new Set,
    commandsRun: [],
    editHistory: [],
    startTime: Date.now(),
    turnCount: 0
  };
  function truncateOutput(str) {
    if (str.length > MAX_OUTPUT_LEN) {
      return str.slice(0, MAX_OUTPUT_LEN) + `
... (truncated, ${str.length} chars total)`;
    }
    return str;
  }
  var path2 = __require("path");
  function resolvePath(p) {
    if (!p)
      return PROJECT_ROOT;
    return path2.isAbsolute(p) ? p : path2.resolve(PROJECT_ROOT, p);
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
  module2.exports = {
    NVIDIA_MODEL,
    REVIEWER_MODEL,
    THINKER_MODEL,
    COMMANDER_MODEL,
    CONTEXT_PRUNER_MODEL,
    RESEARCHER_MODEL,
    GENERAL_AGENT_MODEL,
    MAX_TOOL_ITERATIONS,
    MAX_OUTPUT_LEN,
    TOOL_TIMEOUT,
    PROJECT_ROOT,
    FILE_PICKER_MODEL,
    FILE_PICKER_SYSTEM_PROMPT,
    REVIEWER_SYSTEM_PROMPT,
    THINKER_SYSTEM_PROMPT,
    COMMANDER_SYSTEM_PROMPT,
    CONTEXT_PRUNER_SYSTEM_PROMPT,
    SELECTOR_SYSTEM_PROMPT,
    RESEARCHER_WEB_SYSTEM_PROMPT,
    RESEARCHER_DOCS_SYSTEM_PROMPT,
    GENERAL_AGENT_SYSTEM_PROMPT,
    nvidiaClient,
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
        description: 'Spawn a file-picker sub-agent that deeply explores the codebase to find files relevant to a prompt. It scans the full directory tree and previews every source file, then uses the most capable model to identify and rank the relevant files. Use this when you need to locate files related to a concept, feature, bug, or pattern. NEVER send generic prompts like "give me an overview of the codebase" \u2014 always specify the exact type of files you want.',
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: 'Specify the exact type of files you need. NEVER ask for a generic overview. Be specific \u2014 e.g. "show me the main entry point and routing files", "files that handle user authentication", "all React components related to the dashboard", "where database migrations are defined".' }
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
  var { PROJECT_ROOT, MAX_TOOL_ITERATIONS } = require_config();
  function buildSystemPrompt() {
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
    return `You are Apex AI, a strategic coding assistant that orchestrates complex tasks through specialized sub-agents. You are the AI behind Apex, a CLI tool where users chat with you to code with AI.

# Core Mandates

- **Understand first, act second:** Always gather context and read relevant files BEFORE editing. Use sub-agents (FilePickerMax, Grep, Read) to verify assumptions before implementing.
- **Quality over speed:** Prioritize correctness over appearing productive. Fewer, well-informed sub-agent calls are better than many rushed ones.
- **Tone:** Professional, direct, and concise. Suitable for a CLI environment.
- **Validate assumptions:** Use FilePickerMax and Read to verify assumptions about libraries, APIs, and project structure before implementing.
- **Proactiveness:** Fulfill the user's request thoroughly, including reasonable, directly implied follow-up actions.
- **Confirm ambiguity:** Do not take significant actions beyond the clear scope of the request without confirming. If asked *how* to do something, explain first, don't just do it.
- **Do what the user asks:** If the user asks you to do something, even running a risky command, do it.
- **If a tool fails, try again or try a different tool.** Don't give up after one attempt.
- **Act on errors.** If the user pastes an error or stack trace, locate the source, identify root cause, and fix it. Never punt back with "try checking X."
- **Nothing is automatic.** The agent loop is a thin shell \u2014 it only executes tool calls you explicitly make. No code review, no context pruning, no validation happens unless YOU call the corresponding tool.
- **Use <think></think> tags for moderate reasoning.** Call the Thinker sub-agent for anything more complex.

# Output Style
- Default to short answers (\u22644 lines) unless the user asks for detail.
- No unnecessary preamble or postamble. Don't narrate obvious steps.
- After working on files, just stop \u2014 don't summarize what you did unless asked.
- No emojis unless the user uses them first.
- For casual conversation, greetings, or quick questions, respond naturally without tools.
- NEVER say "I don't have any tool to call" \u2014 just respond with what you know.

# Code Editing Mandates

- **Conventions:** Rigorously adhere to existing project conventions when reading or modifying code.
- **Libraries/Frameworks:** NEVER assume a library/framework is available or appropriate. Verify its established usage within the project first (check package.json, neighboring files).
- **Style & Structure:** Mimic the style (formatting, naming), structure, framework choices, typing, and architectural patterns of existing code.
- **Simplicity & Minimalism:** Make as few changes as possible. When modifying existing code, assume every line has a purpose. Do not change behavior except in the most minimal way.
- **Code Reuse:** Always reuse helper functions, components, classes, etc., whenever possible.
- **Refactoring Awareness:** Whenever you modify an exported symbol, find and update all references to it.
- **Testing:** If you create a test, run it to see if it passes, and fix it if it doesn't.
- **Code Hygiene:** Add needed imports, remove unused variables/functions/files, remove replaced code. Do NOT add comments unless the user asks or correctness requires it.

# Safety & Side Effects
- Never expose secrets, API keys, tokens, or credentials.
- Be careful about terminal commands that could be destructive or hard to undo (e.g. \`git push\`, \`git commit\`, \`rm -rf\`, \`git reset --hard\`). Don't run these unless the user explicitly asks.
- Don't add new dependencies without confirming the user wants them.

# Sub-Agent Orchestration

You have specialized sub-agents available as tools. **Nothing happens automatically \u2014 you are responsible for orchestrating ALL sub-agent work through your own tool calls.** No code review, no context pruning, no validation runs unless YOU explicitly call the appropriate tool. Sub-agents are specialists \u2014 they produce better, more thorough results than you chaining basic tools manually.

## Available Sub-Agents

**Context Gathering:**
- **FilePickerMax** \u2014 Scans the full codebase to find files relevant to a prompt. Use instead of manually chaining Glob/Grep/ListDir. Always specify the exact type of files needed \u2014 NEVER send generic prompts. Spawn 2-5 of these in parallel for different aspects of the codebase.
- **ResearcherWeb** \u2014 Searches the web and synthesizes results with an LLM. Use when you need up-to-date information, best practices, or answers that may not be in your training data. Falls back to LLM knowledge if web search is unavailable.
- **ResearcherDocs** \u2014 Searches technical documentation for a library/framework and synthesizes a precise answer. Use when you need to verify API signatures, find usage patterns, or check library behavior.

**Reasoning & Planning:**
- **Thinker** \u2014 Deep reasoning and planning. Call before implementing anything non-trivial to get a structured plan.
- **ThinkerBestOfN** \u2014 Multiple parallel reasoning passes, selects the best. Use for critical decisions that benefit from diverse perspectives.
- **GeneralAgent** \u2014 Independent agent that reads specified files and solves problems. More powerful than Thinker because it receives actual file contents. Use when you need deep independent analysis, complex reasoning with full file context, or a second opinion.

**Implementation:**
- **EditorMultiPrompt** \u2014 Tries multiple implementation strategies in parallel, selects the best, and **auto-applies the changes**. Use for important code changes where you want to explore multiple approaches.
- **Commander** \u2014 Terminal command specialist. Plans and executes shell commands for a goal. Use instead of calling Bash directly for multi-step operations.

**Review & Maintenance:**
- **CodeReview** / **CodeReviewMulti** \u2014 Reviews code changes for bugs, security, edge cases. You MUST call one of these yourself after making code changes.
- **ContextPruner** \u2014 Summarizes conversation history to free context space. Call when the conversation is getting long.

## How to Orchestrate (use your judgment)

**Phase 1 \u2014 Context Gathering:**
- Spawn multiple FilePickerMax in parallel for different aspects of the codebase (e.g. one for "entry points and routing", one for "authentication files", one for "test files").
- Use Read to read all relevant files. For complex tasks, read 12-20 files to build a thorough understanding.
- Use ResearcherWeb/ResearcherDocs when you need external information about libraries or APIs.
- Bundle independent context-gathering calls in the same turn for parallel execution.

**Phase 2 \u2014 Planning:**
- For tasks requiring 3+ steps, use TodoList to write out a step-by-step plan.
- Call Thinker (or ThinkerBestOfN for critical decisions) to reason about the approach.
- Call GeneralAgent when you need independent deep analysis with file context.

**Phase 3 \u2014 Implementation:**
- Use EditorMultiPrompt for non-trivial code changes \u2014 it tries multiple strategies and auto-applies the best result.
- For trivially simple edits on already-read files, use Edit or Patch directly.
- Use Write only for creating new files.

**Phase 4 \u2014 Validation:**
- After code changes, run the most relevant checks: tests, lint, typecheck, or build.
- Use Commander for multi-step validation. Use Bash for single commands.
- If checks fail, fix and re-run. If blocked, clearly state what's failing.

**Phase 5 \u2014 Review:**
- After making code changes, call CodeReview or CodeReviewMulti yourself to review the changes. Nothing runs automatically.
- If the review finds issues, fix them and re-validate.

## When to Skip Sub-Agents and Act Directly
- Reading a single known file path (just use Read)
- A single targeted grep for a known pattern (just use Grep)
- A quick one-line bash command (just use Bash)
- Answering a question from memory/context (just respond)
- Trivially simple edits where the file is already read and understood

## Parallel Execution Rules
- Bundle independent tool calls in the same turn \u2014 this is critical for speed.
- Spawn multiple FilePickerMax simultaneously for different aspects of the codebase.
- Run independent Read calls in parallel.
- **Don't spawn dependent agents in parallel** \u2014 e.g. don't spawn EditorMultiPrompt at the same time as FilePickerMax, since editing depends on context.
- After implementation, run tests AND typechecks in parallel.

# Tool Usage (basic tools)
- Use Read to understand files before modifying them. NEVER modify a file you haven't read.
- Use Edit for surgical changes to existing files (preferred over Write).
- Use Patch for multiple edits to the same file.
- Use Write only for creating new files.
- Use Bash for simple, single commands. Use Commander for multi-step operations.
- Use Grep/Glob/ListDir for quick, targeted lookups. Use FilePickerMax for broad codebase discovery.
- Use TodoList to track multi-step plans.
- Don't ask for permission to use tools \u2014 just use them.

# Environment
Working directory: ${PROJECT_ROOT}
OS: ${process.platform}
Node: ${process.version}${projectInfo}${gitInfo}
Maximum tool iterations per turn: ${MAX_TOOL_ITERATIONS}`;
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
  module2.exports = { startServer, getServerURL, getPort };
});

var require_toolExecutors = __commonJS((exports, module2) => {
  var fs2 = __require("fs");
  var path2 = __require("path");
  var https = __require("https");
  var { execSync } = __require("child_process");
  var {
    PROJECT_ROOT,
    TOOL_TIMEOUT,
    REVIEWER_MODEL,
    REVIEWER_SYSTEM_PROMPT,
    FILE_PICKER_MODEL,
    FILE_PICKER_SYSTEM_PROMPT,
    THINKER_MODEL,
    THINKER_SYSTEM_PROMPT,
    COMMANDER_MODEL,
    COMMANDER_SYSTEM_PROMPT,
    CONTEXT_PRUNER_MODEL,
    CONTEXT_PRUNER_SYSTEM_PROMPT,
    SELECTOR_SYSTEM_PROMPT,
    RESEARCHER_MODEL,
    GENERAL_AGENT_MODEL,
    RESEARCHER_WEB_SYSTEM_PROMPT,
    RESEARCHER_DOCS_SYSTEM_PROMPT,
    GENERAL_AGENT_SYSTEM_PROMPT,
    NVIDIA_MODEL,
    nvidiaClient,
    session,
    truncateOutput,
    resolvePath,
    sleep
  } = require_config();
  var { parseThinkBlocks } = require_thinking();
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
        if (err.status === 404 && params.model !== NVIDIA_MODEL && attempt < 2) {
          params = { ...params, model: NVIDIA_MODEL };
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
        results.push(r.startsWith("Error") ? `\u2717 Edit ${op.path}: ${r}` : `\u2713 Edit ${op.path}`);
      } else if (op.type === "create") {
        const r = await executeFn("Write", { path: op.path, content: op.content });
        results.push(r.startsWith("Error") ? `\u2717 Create ${op.path}: ${r}` : `\u2713 Create ${op.path}`);
      }
    }
    return results;
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
          const lines = content.split(`
`);
          const start = Math.max(0, (args.start_line || 1) - 1);
          const end = args.end_line ? Math.min(lines.length, args.end_line) : Math.min(lines.length, start + 500);
          const slice = lines.slice(start, end);
          const numbered = slice.map((l, i) => `${start + i + 1}: ${l}`).join(`
`);
          session.filesRead.add(filePath);
          if (end < lines.length) {
            return truncateOutput(numbered) + `
(showing lines ${start + 1}-${end} of ${lines.length})`;
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
          const lines = args.content.split(`
`).length;
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
          const oldLines = args.old_str.split(`
`);
          const newLines = args.new_str.split(`
`);
          let diff = `Edited: ${filePath}
`;
          oldLines.forEach((l) => diff += `- ${l}
`);
          newLines.forEach((l) => diff += `+ ${l}
`);
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
          return `Patched: ${filePath}
${results.join(`
`)}`;
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
            const stdout = err.stdout || "";
            const stderr = err.stderr || "";
            const exitCode = err.status || 1;
            return truncateOutput(`Exit code: ${exitCode}
${stdout}
${stderr}`.trim());
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
            const files = output.trim().split(`
`).map((f) => path2.relative(cwd, f)).sort();
            return files.join(`
`);
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
          return truncateOutput(lines.join(`
`) || "(empty directory)");
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
              results.push(`\u2713 ${cmd}
${output.trim()}`);
              session.commandsRun.push(cmd);
            } catch (err) {
              results.push(`\u2717 ${cmd}
Exit code: ${err.status}
${(err.stdout || "").trim()}
${(err.stderr || "").trim()}`);
              session.commandsRun.push(cmd);
              break;
            }
          }
          return truncateOutput(`Task: ${args.description}
${"\u2500".repeat(40)}
${results.join(`

`)}`);
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
                    let entry = `${i + 1}. **${r.title || "Untitled"}**
   ${r.url}`;
                    if (r.publishedDate)
                      entry += `
   Published: ${r.publishedDate.split("T")[0]}`;
                    if (r.author)
                      entry += `
   Author: ${r.author}`;
                    if (r.text)
                      entry += `
   ${r.text.trim().slice(0, 500)}`;
                    else if (r.highlights && r.highlights.length)
                      entry += `
   ${r.highlights[0].trim().slice(0, 300)}`;
                    return entry;
                  }).join(`

`);
                  resolve3(truncateOutput(`Web Search Results (${json.results.length}):
${"\u2500".repeat(40)}
${formatted}`));
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
            tree = tree.split(`
`).map((f) => path2.relative(PROJECT_ROOT, f) || ".").join(`
`);
          } catch {
            tree = "(failed to scan directory tree)";
          }
          const sourceExts = /\.(js|ts|jsx|tsx|py|rb|go|rs|java|c|cpp|h|hpp|css|scss|html|svelte|vue|json|yaml|yml|toml|md|sql|sh|bash|env|cfg|ini|xml)$/i;
          const allFiles = tree.split(`
`).filter((f) => sourceExts.test(f));
          const previews = [];
          for (const relFile of allFiles.slice(0, 200)) {
            const absFile = path2.resolve(PROJECT_ROOT, relFile);
            try {
              const stat = fs2.statSync(absFile, { throwIfNoEntry: false });
              if (!stat || stat.isDirectory() || stat.size > 512 * 1024)
                continue;
              const content = fs2.readFileSync(absFile, "utf-8");
              const first8 = content.split(`
`).slice(0, 8).join(`
`);
              previews.push(`--- ${relFile} ---
${first8}`);
            } catch {}
          }
          const pickerMessages = [
            { role: "system", content: FILE_PICKER_SYSTEM_PROMPT },
            {
              role: "user",
              content: `# Prompt
${args.prompt}

# Directory Tree
${tree}

# File Previews (first 8 lines each)
${previews.join(`

`)}`
            }
          ];
          try {
            const header = `FilePickerMax Results
${"\u2500".repeat(40)}
`;
            const streamCb = onStream ? (text) => onStream(truncateOutput(header + text)) : null;
            const raw = await streamCompletion({
              model: FILE_PICKER_MODEL,
              messages: pickerMessages,
              max_tokens: 4096,
              temperature: 0.2
            }, streamCb) || "[]";
            return truncateOutput(header + raw);
          } catch (apiErr) {
            return `Error: FilePickerMax failed \u2014 ${apiErr.message}`;
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
            return todos2.map((t2, i) => `${i + 1}. [${t2.done ? "x" : " "}] ${t2.text}${t2.done ? " \u2713" : ""}`).join(`
`);
          };
          const todos = loadTodos();
          switch (args.action) {
            case "add": {
              if (!args.text)
                return 'Error: "text" is required for add action.';
              todos.push({ text: args.text, done: false, created: Date.now() });
              saveTodos(todos);
              return `Added item ${todos.length}: ${args.text}

${formatTodos(todos)}`;
            }
            case "list":
              return formatTodos(todos);
            case "done": {
              const idx = (args.index || 0) - 1;
              if (idx < 0 || idx >= todos.length)
                return `Error: Invalid index. Use 1-${todos.length}.`;
              todos[idx].done = true;
              saveTodos(todos);
              return `Completed: ${todos[idx].text}

${formatTodos(todos)}`;
            }
            case "remove": {
              const idx = (args.index || 0) - 1;
              if (idx < 0 || idx >= todos.length)
                return `Error: Invalid index. Use 1-${todos.length}.`;
              const removed = todos.splice(idx, 1)[0];
              saveTodos(todos);
              return `Removed: ${removed.text}

${formatTodos(todos)}`;
            }
            case "clear": {
              const before = todos.length;
              const remaining = todos.filter((t2) => !t2.done);
              saveTodos(remaining);
              return `Cleared ${before - remaining.length} completed item(s).

${formatTodos(remaining)}`;
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
            return "CodeReview skipped \u2014 no files were modified this session.";
          }
          const fileContents = [];
          for (const filePath of allFiles) {
            if (!fs2.existsSync(filePath)) {
              fileContents.push(`--- ${filePath} ---
[File not found]`);
              continue;
            }
            const stat = fs2.statSync(filePath);
            if (stat.isDirectory())
              continue;
            const content = fs2.readFileSync(filePath, "utf-8");
            fileContents.push(`--- ${path2.relative(PROJECT_ROOT, filePath) || filePath} ---
${content}`);
          }
          let gitDiff = "";
          try {
            gitDiff = execSync("git diff 2>/dev/null", { encoding: "utf-8", cwd: PROJECT_ROOT, timeout: 1e4 }).trim();
          } catch {}
          const reviewMessages = [
            {
              role: "system",
              content: REVIEWER_SYSTEM_PROMPT
            },
            {
              role: "user",
              content: `# What was changed
${args.prompt}

# Modified files (${allFiles.size})

${fileContents.join(`

`)}${gitDiff ? `

# Git diff
\`\`\`diff
${gitDiff}
\`\`\`` : ""}`
            }
          ];
          try {
            const header = `Code Review (${REVIEWER_MODEL}) \u2014 ${allFiles.size} file(s)
${"\u2500".repeat(40)}
`;
            const streamCb = onStream ? (text) => onStream(truncateOutput(header + text)) : null;
            const reviewText = await streamCompletion({
              model: REVIEWER_MODEL,
              messages: reviewMessages,
              max_tokens: 4096,
              temperature: 0.3
            }, streamCb) || "(No response from reviewer)";
            return truncateOutput(header + reviewText);
          } catch (apiErr) {
            return `Error: Code review failed \u2014 ${apiErr.message}`;
          }
        }
        case "Thinker": {
          const historyContext = session.conversationHistory.slice(-10).map((m2) => `[${m2.role}]: ${(m2.content || "").slice(0, 500)}`).join(`
`);
          const thinkerMessages = [
            { role: "system", content: THINKER_SYSTEM_PROMPT },
            {
              role: "user",
              content: `# Recent conversation context
${historyContext}

# Task to reason about
${args.prompt}`
            }
          ];
          try {
            const header = `Thinker (${THINKER_MODEL})
${"\u2500".repeat(40)}
`;
            const streamCb = onStream ? (text) => onStream(truncateOutput(header + text)) : null;
            const result = await streamCompletion({
              model: THINKER_MODEL,
              messages: thinkerMessages,
              max_tokens: 4096,
              temperature: 0.4
            }, streamCb) || "(No response from thinker)";
            return truncateOutput(header + result);
          } catch (apiErr) {
            return `Error: Thinker failed \u2014 ${apiErr.message}`;
          }
        }
        case "ThinkerBestOfN": {
          const n = Math.min(5, Math.max(2, args.n || 3));
          const historyCtx = session.conversationHistory.slice(-10).map((m2) => `[${m2.role}]: ${(m2.content || "").slice(0, 500)}`).join(`
`);
          const header = `Best-of-${n} Thinker (MAX mode)
${"\u2500".repeat(40)}
`;
          if (onStream)
            onStream(header + `Spawning ${n} parallel thinking agents...`);
          const thinkPromises = [];
          for (let i = 0;i < n; i++) {
            const label = String.fromCharCode(65 + i);
            thinkPromises.push(streamCompletion({
              model: THINKER_MODEL,
              messages: [
                { role: "system", content: THINKER_SYSTEM_PROMPT + `

You are Thinker ${label}. Approach this from a unique angle. Be creative and thorough.` },
                {
                  role: "user",
                  content: `# Context
${historyCtx}

# Task
${args.prompt}`
                }
              ],
              max_tokens: 3072,
              temperature: 0.7 + i * 0.1
            }, null).then((result) => ({ label, result })));
          }
          let thoughts;
          try {
            thoughts = await Promise.all(thinkPromises);
          } catch (apiErr) {
            return `Error: ThinkerBestOfN failed \u2014 ${apiErr.message}`;
          }
          if (onStream)
            onStream(header + `All ${n} thinkers completed. Selecting best response...`);
          const thoughtsFormatted = thoughts.map((t2) => `## Thought ${t2.label}
${t2.result || "(empty)"}`).join(`

`);
          try {
            const selectorResult = await streamCompletion({
              model: REVIEWER_MODEL,
              messages: [
                {
                  role: "system",
                  content: `You are a thought selector. You will receive ${n} different reasoning responses to the same question. Pick the best one based on depth, correctness, clarity, and actionability. Output JSON only:
{ "chosen": "A", "reason": "why this is best" }`
                },
                { role: "user", content: `# Original question
${args.prompt}

${thoughtsFormatted}` }
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
            const result = `${header}Selected: Thought ${chosen}${reason ? ` \u2014 ${reason}` : ""}

${winningThought.result}`;
            if (onStream)
              onStream(truncateOutput(result));
            return truncateOutput(result);
          } catch (apiErr) {
            const result = `${header}Selector failed, using Thought A:

${thoughts[0].result}`;
            return truncateOutput(result);
          }
        }
        case "EditorMultiPrompt": {
          const strategies = args.strategies || ["straightforward implementation", "alternative approach"];
          const filesCtx = (args.files || []).map((f) => `--- ${f.path} ---
${f.content}`).join(`

`);
          const header = `Multi-Prompt Editor (${strategies.length} strategies)
${"\u2500".repeat(40)}
`;
          if (onStream)
            onStream(header + `Spawning ${strategies.length} parallel editor agents...`);
          const editorPromises = strategies.map((strategy, i) => {
            const label = String.fromCharCode(65 + i);
            return streamCompletion({
              model: NVIDIA_MODEL,
              messages: [
                {
                  role: "system",
                  content: `You are Code Editor ${label}. You implement code changes using a specific strategy. Output your implementation as a series of file edits.

For each file change, output:
--- EDIT: path/to/file ---
OLD:
\`\`\`
exact old code
\`\`\`
NEW:
\`\`\`
new replacement code
\`\`\`

For new files, output:
--- CREATE: path/to/file ---
\`\`\`
full file content
\`\`\`

Be precise. Match existing code style.`
                },
                {
                  role: "user",
                  content: `# Task
${args.prompt}

# Strategy
${strategy}

# Current files
${filesCtx}`
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
            return `Error: EditorMultiPrompt failed \u2014 ${apiErr.message}`;
          }
          if (onStream)
            onStream(header + `All editors completed. Selecting best implementation...`);
          const implFormatted = implementations.map((impl) => `## Implementation ${impl.label} \u2014 Strategy: "${impl.strategy}"
${impl.result}`).join(`

`);
          try {
            const selectorResult = await streamCompletion({
              model: REVIEWER_MODEL,
              messages: [
                { role: "system", content: SELECTOR_SYSTEM_PROMPT },
                {
                  role: "user",
                  content: `# Original task
${args.prompt}

${implFormatted}`
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
              result += `
Reason: ${reason}`;
            if (improvements)
              result += `
Improvements to consider: ${improvements}`;
            const ops = parseEditorOps(winning.result);
            if (ops.length > 0) {
              if (onStream)
                onStream(truncateOutput(result + `

Applying ${ops.length} change(s)...`));
              const applyResults = await applyEditorOps(ops, executeTool);
              result += `

--- Applied Changes ---
${applyResults.join(`
`)}`;
            } else {
              result += `

${winning.result}`;
            }
            if (onStream)
              onStream(truncateOutput(result));
            return truncateOutput(result);
          } catch (apiErr) {
            const fallbackOps = parseEditorOps(implementations[0].result);
            if (fallbackOps.length > 0) {
              const applyResults = await applyEditorOps(fallbackOps, executeTool);
              return truncateOutput(`${header}Selector failed, applied Implementation A:
${applyResults.join(`
`)}`);
            }
            return truncateOutput(`${header}Selector failed, using Implementation A:

${implementations[0].result}`);
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
            return "CodeReviewMulti skipped \u2014 no files were modified.";
          const modFileContents = [];
          for (const fp of modFiles) {
            if (!fs2.existsSync(fp))
              continue;
            const stat = fs2.statSync(fp);
            if (stat.isDirectory())
              continue;
            modFileContents.push(`--- ${path2.relative(PROJECT_ROOT, fp)} ---
${fs2.readFileSync(fp, "utf-8")}`);
          }
          let diffText = "";
          try {
            diffText = execSync("git diff 2>/dev/null", { encoding: "utf-8", cwd: PROJECT_ROOT, timeout: 1e4 }).trim();
          } catch {}
          const header = `Multi-Perspective Code Review (${perspectives.length} reviewers)
${"\u2500".repeat(40)}
`;
          if (onStream)
            onStream(header + `Spawning ${perspectives.length} parallel reviewers...`);
          const reviewPromises = perspectives.map((perspective, i) => {
            const label = String.fromCharCode(65 + i);
            return streamCompletion({
              model: REVIEWER_MODEL,
              messages: [
                {
                  role: "system",
                  content: REVIEWER_SYSTEM_PROMPT + `

Focus specifically on: ${perspective}. You are Reviewer ${label}.`
                },
                {
                  role: "user",
                  content: `# Changes
${args.prompt}

# Files (${modFiles.size})
${modFileContents.join(`

`)}${diffText ? `

# Git diff
\`\`\`diff
${diffText}
\`\`\`` : ""}`
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
            return `Error: CodeReviewMulti failed \u2014 ${apiErr.message}`;
          }
          let result = header;
          for (const review of reviews) {
            result += `
## Reviewer ${review.label} \u2014 ${review.perspective}
${review.result}
`;
          }
          if (onStream)
            onStream(truncateOutput(result));
          return truncateOutput(result);
        }
        case "Commander": {
          const header = `Commander (${COMMANDER_MODEL})
${"\u2500".repeat(40)}
`;
          if (onStream)
            onStream(header + "Planning commands...");
          let commandPlan;
          try {
            commandPlan = await streamCompletion({
              model: COMMANDER_MODEL,
              messages: [
                { role: "system", content: COMMANDER_SYSTEM_PROMPT },
                { role: "user", content: args.prompt }
              ],
              max_tokens: 2048,
              temperature: 0.2
            }, null);
          } catch (apiErr) {
            return `Error: Commander failed \u2014 ${apiErr.message}`;
          }
          let commands;
          try {
            commands = JSON.parse(commandPlan.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
            if (!Array.isArray(commands))
              commands = [commands];
          } catch {
            return truncateOutput(`${header}Failed to parse command plan:
${commandPlan}`);
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
              results.push(`\u2713 ${command}${description ? `
  (${description})` : ""}
${(output || "").trim()}`);
              session.commandsRun.push(command);
            } catch (err) {
              results.push(`\u2717 ${command}
Exit code: ${err.status}
${(err.stdout || "").trim()}
${(err.stderr || "").trim()}`);
              session.commandsRun.push(command);
              break;
            }
          }
          const result = `${header}${results.join(`

`)}`;
          if (onStream)
            onStream(truncateOutput(result));
          return truncateOutput(result);
        }
        case "ContextPruner": {
          if (session.conversationHistory.length < 6) {
            return "Context pruning skipped \u2014 conversation is still short.";
          }
          const header = `Context Pruner
${"\u2500".repeat(40)}
`;
          if (onStream)
            onStream(header + "Summarizing conversation...");
          const historyText = session.conversationHistory.map((m2) => `[${m2.role}]: ${(m2.content || "").slice(0, 1000)}`).join(`
`);
          try {
            const summary = await streamCompletion({
              model: CONTEXT_PRUNER_MODEL,
              messages: [
                { role: "system", content: CONTEXT_PRUNER_SYSTEM_PROMPT },
                { role: "user", content: `# Conversation to summarize (${session.conversationHistory.length} messages)

${historyText}` }
              ],
              max_tokens: 2048,
              temperature: 0.2
            }, null);
            const oldLen = session.conversationHistory.length;
            session.conversationHistory = [
              {
                role: "system",
                content: `[Context Summary \u2014 ${oldLen} messages condensed]
${summary}`
              }
            ];
            const result = `${header}Condensed ${oldLen} messages into summary.

${summary}`;
            if (onStream)
              onStream(truncateOutput(result));
            return truncateOutput(result);
          } catch (apiErr) {
            return `Error: Context pruning failed \u2014 ${apiErr.message}`;
          }
        }
        case "ResearcherWeb": {
          const header = `Web Research (${RESEARCHER_MODEL})
${"\u2500".repeat(40)}
`;
          if (onStream)
            onStream(header + "Searching the web...");
          let searchResults = "";
          const searchArgs = { query: args.prompt, num_results: 5 };
          if (args.domains && args.domains.length)
            searchArgs.include_domains = args.domains;
          try {
            searchResults = await executeTool("WebSearch", searchArgs);
          } catch {
            searchResults = "(Web search unavailable \u2014 answering from knowledge)";
          }
          if (searchResults.startsWith("Error")) {
            searchResults = `(Web search failed: ${searchResults.slice(0, 200)})

Please answer from your training data.`;
          }
          try {
            const streamCb = onStream ? (text) => onStream(truncateOutput(header + text)) : null;
            const result = await streamCompletion({
              model: RESEARCHER_MODEL,
              messages: [
                { role: "system", content: RESEARCHER_WEB_SYSTEM_PROMPT },
                { role: "user", content: `# Question
${args.prompt}

# Web Search Results
${searchResults}` }
              ],
              max_tokens: 4096,
              temperature: 0.3
            }, streamCb) || "(No response from researcher)";
            return truncateOutput(header + result);
          } catch (apiErr) {
            return `Error: ResearcherWeb failed \u2014 ${apiErr.message}`;
          }
        }
        case "ResearcherDocs": {
          const header = `Docs Research (${RESEARCHER_MODEL})
${"\u2500".repeat(40)}
`;
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
              searchResults = "(Documentation search unavailable \u2014 answering from knowledge)";
            }
          }
          if (!searchResults || searchResults.startsWith("Error")) {
            searchResults = "(No documentation results found \u2014 answering from knowledge)";
          }
          try {
            const streamCb = onStream ? (text) => onStream(truncateOutput(header + text)) : null;
            const result = await streamCompletion({
              model: RESEARCHER_MODEL,
              messages: [
                { role: "system", content: RESEARCHER_DOCS_SYSTEM_PROMPT },
                {
                  role: "user",
                  content: `# Question
${args.prompt}${args.library ? `
Library: ${args.library}` : ""}

# Documentation Search Results
${searchResults}`
                }
              ],
              max_tokens: 4096,
              temperature: 0.2
            }, streamCb) || "(No response from researcher)";
            return truncateOutput(header + result);
          } catch (apiErr) {
            return `Error: ResearcherDocs failed \u2014 ${apiErr.message}`;
          }
        }
        case "GeneralAgent": {
          const header = `General Agent (${GENERAL_AGENT_MODEL})
${"\u2500".repeat(40)}
`;
          if (onStream)
            onStream(header + "Reading files and analyzing...");
          const MAX_TOTAL_CHARS = 50000;
          let totalChars = 0;
          const fileContents = [];
          for (const fp of args.filePaths || []) {
            const absPath = resolvePath(fp);
            const stat = fs2.statSync(absPath, { throwIfNoEntry: false });
            if (!stat || stat.isDirectory()) {
              fileContents.push(`--- ${fp} ---
[Not found or is a directory]`);
              continue;
            }
            if (stat.size > 256 * 1024) {
              fileContents.push(`--- ${fp} ---
[File too large: ${(stat.size / 1024).toFixed(0)}KB \u2014 skipped]`);
              continue;
            }
            const content = fs2.readFileSync(absPath, "utf-8");
            if (totalChars + content.length > MAX_TOTAL_CHARS) {
              const remaining = MAX_TOTAL_CHARS - totalChars;
              if (remaining > 500) {
                fileContents.push(`--- ${fp} ---
${content.slice(0, remaining)}
[Truncated \u2014 context limit reached]`);
              }
              totalChars = MAX_TOTAL_CHARS;
              break;
            }
            fileContents.push(`--- ${fp} ---
${content}`);
            totalChars += content.length;
          }
          const historyCtx = session.conversationHistory.slice(-8).map((m2) => `[${m2.role}]: ${(m2.content || "").slice(0, 400)}`).join(`
`);
          const userContent = [
            `# Task
${args.prompt}`,
            fileContents.length > 0 ? `
# Files (${fileContents.length})
${fileContents.join(`

`)}` : "",
            historyCtx ? `
# Recent conversation
${historyCtx}` : ""
          ].filter(Boolean).join(`
`);
          try {
            const streamCb = onStream ? (text) => onStream(truncateOutput(header + text)) : null;
            const result = await streamCompletion({
              model: GENERAL_AGENT_MODEL,
              messages: [
                { role: "system", content: GENERAL_AGENT_SYSTEM_PROMPT },
                { role: "user", content: userContent }
              ],
              max_tokens: 4096,
              temperature: 0.4
            }, streamCb) || "(No response from agent)";
            return truncateOutput(header + result);
          } catch (apiErr) {
            return `Error: GeneralAgent failed \u2014 ${apiErr.message}`;
          }
        }
        default:
          return `Unknown tool: ${name}`;
      }
    } catch (err) {
      return `Error executing ${name}: ${err.message}`;
    }
  }
  module2.exports = { executeTool };
});

var require_agent = __commonJS((exports, module2) => {
  var {
    NVIDIA_MODEL,
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
      const systemPrompt = buildSystemPrompt();
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
              model: NVIDIA_MODEL,
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
            if (attempt < maxRetries && apiErr.status >= 400 && apiErr.status < 500) {
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
        store.addMessage({ role: "system", content: `\u26A0 Reached maximum tool iterations (${MAX_TOOL_ITERATIONS}). Stopping.` });
      }
      session.totalTokens += turnTokens;
    } catch (err) {
      store.clearStreaming();
      let errorMsg = `Error: ${err.message}`;
      if (err.status) {
        errorMsg += `
Status: ${err.status}`;
      }
      if (!process.env.NVIDIA_API_KEY) {
        errorMsg += `
Set the NVIDIA_API_KEY environment variable with your API key from build.nvidia.com`;
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
  var { PROJECT_ROOT, session, resolvePath } = require_config();
  var { executeTool } = require_toolExecutors();
  var store = require_store();
  async function handleSlashCommand(input) {
    const [cmd, ...rest] = input.split(" ");
    const arg = rest.join(" ");
    switch (cmd) {
      case "/help":
        store.setState({ showHelp: true });
        break;
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
        store.addMessage({ role: "system", content: parts.join(`
`), label: "Session Stats" });
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

var import_react11 = __toESM(require_react(), 1);
var import_store = __toESM(require_store(), 1);
function useStore() {
  return import_react11.useSyncExternalStore(import_store.subscribe, import_store.getSnapshot);
}

var import_react13 = __toESM(require_react(), 1);
var import_theme = __toESM(require_theme(), 1);
var import_config = __toESM(require_config(), 1);

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
  return /* @__PURE__ */ jsx_runtime.jsx("box", {
    style: { flexDirection: "row", paddingLeft: 1, paddingRight: 1 },
    children: /* @__PURE__ */ jsx_runtime.jsxs("text", {
      children: [
        /* @__PURE__ */ jsx_runtime.jsx("span", {
          fg: import_theme.colors.primary,
          attributes: TextAttributes.BOLD,
          children: "\u26A1 Apex"
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
          children: isNarrow && cwd.length > 12 ? cwd.slice(0, 12) + "\u2026" : cwd
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
    style: { flexDirection: "column", paddingLeft: 1, marginTop: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.white,
        attributes: TextAttributes.BOLD,
        content: "How can I help?"
      }),
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.dim,
        content: isNarrow ? `Max ${import_config2.MAX_TOOL_ITERATIONS} iterations` : `Tools available \xB7 Max ${import_config2.MAX_TOOL_ITERATIONS} iterations per turn`
      })
    ]
  });
}

var import_theme4 = __toESM(require_theme(), 1);
var jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
function UserMessage({ content }) {
  return /* @__PURE__ */ jsx_runtime4.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: 1, marginTop: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime4.jsx("text", {
        fg: import_theme4.colors.blue,
        attributes: TextAttributes.BOLD,
        content: "You"
      }),
      /* @__PURE__ */ jsx_runtime4.jsx("text", {
        fg: import_theme4.colors.text,
        content: content || ""
      })
    ]
  });
}

var import_theme5 = __toESM(require_theme(), 1);
var jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
function AssistantMessage({ content, isStreaming }) {
  const { indent, isNarrow, width } = useLayout();
  const codeIndent = isNarrow ? 1 : 2;
  const separatorWidth = Math.min(width - indent - codeIndent, isNarrow ? 40 : 60);
  if (!content)
    return null;
  const lines = content.split(`
`);
  const rendered = [];
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = "";
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```") && !inCodeBlock) {
      inCodeBlock = true;
      codeLang = line.slice(3).trim() || "code";
      codeLines = [];
    } else if (line.startsWith("```") && inCodeBlock) {
      inCodeBlock = false;
      rendered.push(/* @__PURE__ */ jsx_runtime5.jsxs("box", {
        style: { flexDirection: "column", paddingLeft: codeIndent, marginTop: 0 },
        children: [
          /* @__PURE__ */ jsx_runtime5.jsx("text", {
            fg: import_theme5.colors.dim,
            content: `\u2500\u2500 ${codeLang} \u2500\u2500`
          }),
          codeLines.map((cl, j2) => /* @__PURE__ */ jsx_runtime5.jsxs("text", {
            children: [
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                fg: import_theme5.colors.dim,
                children: String(j2 + 1).padStart(isNarrow ? 2 : 3) + " \u2502 "
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                fg: import_theme5.colors.text,
                children: cl
              })
            ]
          }, j2)),
          /* @__PURE__ */ jsx_runtime5.jsx("text", {
            fg: import_theme5.colors.dim,
            content: "\u2500".repeat(Math.max(separatorWidth, 10))
          })
        ]
      }, `code-${i}`));
    } else if (inCodeBlock) {
      codeLines.push(line);
    } else {
      const processed = line.replace(/`([^`]+)`/g, "\xAB$1\xBB");
      if (processed.includes("\xAB")) {
        const parts = processed.split(/\u00AB|\u00BB/);
        rendered.push(/* @__PURE__ */ jsx_runtime5.jsx("text", {
          children: parts.map((part, j2) => j2 % 2 === 0 ? /* @__PURE__ */ jsx_runtime5.jsx("span", {
            fg: import_theme5.colors.text,
            children: part
          }, j2) : /* @__PURE__ */ jsx_runtime5.jsx("span", {
            fg: import_theme5.colors.cyan,
            children: part
          }, j2))
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
  if (inCodeBlock && codeLines.length > 0) {
    rendered.push(/* @__PURE__ */ jsx_runtime5.jsxs("box", {
      style: { flexDirection: "column", paddingLeft: codeIndent },
      children: [
        /* @__PURE__ */ jsx_runtime5.jsx("text", {
          fg: import_theme5.colors.dim,
          content: `\u2500\u2500 ${codeLang} \u2500\u2500`
        }),
        codeLines.map((cl, j2) => /* @__PURE__ */ jsx_runtime5.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime5.jsx("span", {
              fg: import_theme5.colors.dim,
              children: String(j2 + 1).padStart(isNarrow ? 2 : 3) + " \u2502 "
            }),
            /* @__PURE__ */ jsx_runtime5.jsx("span", {
              fg: import_theme5.colors.text,
              children: cl
            })
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
        content: "\u258A"
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
        content: "\u2500".repeat(Math.max(width - 2, 10))
      });
    default:
      return null;
  }
}
function ChatArea({ messages, streamingContent, streamingThinking, isProcessing }) {
  const { indent } = useLayout();
  // Memoize messages to prevent unnecessary re-renders of the entire list
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
    // Use a fixed key for the scrollbox to prevent it from being recreated
    key: "main-chat-scroll",
    children: /* @__PURE__ */ jsx_runtime11.jsxs("box", {
      style: { flexDirection: "column" },
      children: [
        /* @__PURE__ */ jsx_runtime11.jsx(Welcome, {}),
        renderedMessages,
        streamingThinking ? /* @__PURE__ */ jsx_runtime11.jsx("box", {
          style: { paddingLeft: 2, marginTop: 0 },
          children: /* @__PURE__ */ jsx_runtime11.jsxs("text", {
            fg: import_theme11.colors.dim,
            attributes: TextAttributes.ITALIC,
            children: [
              /* @__PURE__ */ jsx_runtime11.jsx("span", {
                fg: import_theme11.colors.dim,
                children: "\u25B8 Thinking: "
              }),
              /* @__PURE__ */ jsx_runtime11.jsx("span", {
                fg: import_theme11.colors.dim,
                children: streamingThinking.slice(-100)
              })
            ]
          })
        }) : null,
        streamingContent ? /* @__PURE__ */ jsx_runtime11.jsx("box", {
          style: { flexDirection: "column", marginTop: 0 },
          children: /* @__PURE__ */ jsx_runtime11.jsx(AssistantMessage, {
            content: streamingContent,
            isStreaming: true
          })
        }) : null,
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
  const { isNarrow } = useLayout();
  const handleSubmit = (value) => {
    const trimmed = value.trim();
    if (!trimmed)
      return;
    if (inputRef.current)
      inputRef.current.value = "";
    onSubmit(trimmed);
  };
  return /* @__PURE__ */ jsx_runtime12.jsxs("box", {
    style: { flexDirection: "column" },
    children: [
      /* @__PURE__ */ jsx_runtime12.jsx("text", {
        fg: import_theme12.colors.dim,
        style: { paddingLeft: isNarrow ? 1 : 2 },
        content: isNarrow ? "^C exit \xB7 /help" : "Ctrl+C to exit \xB7 /help for commands"
      }),
      /* @__PURE__ */ jsx_runtime12.jsxs("box", {
        style: { flexDirection: "row", paddingLeft: 1 },
        children: [
          /* @__PURE__ */ jsx_runtime12.jsx("text", {
            fg: import_theme12.colors.primary,
            content: "\u276F "
          }),
          /* @__PURE__ */ jsx_runtime12.jsx("input", {
            ref: inputRef,
            focused: !disabled,
            placeholder: disabled ? "Processing..." : "Type a message...",
            onSubmit: handleSubmit,
            fg: import_theme12.colors.text,
            style: { flexGrow: 1 }
          })
        ]
      })
    ]
  });
}

var import_theme13 = __toESM(require_theme(), 1);
var import_config3 = __toESM(require_config(), 1);
var jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
function StatusBar({ isProcessing }) {
  const { isNarrow } = useLayout();
  const elapsed = ((Date.now() - import_config3.session.startTime) / 1000 / 60).toFixed(1);
  return /* @__PURE__ */ jsx_runtime13.jsx("box", {
    style: { flexDirection: "row", paddingLeft: isNarrow ? 1 : 2, paddingRight: isNarrow ? 1 : 2 },
    children: /* @__PURE__ */ jsx_runtime13.jsxs("text", {
      children: [
        /* @__PURE__ */ jsx_runtime13.jsxs("span", {
          fg: import_theme13.colors.dim,
          children: [
            elapsed,
            "min"
          ]
        }),
        /* @__PURE__ */ jsx_runtime13.jsx("span", {
          fg: import_theme13.colors.dim,
          children: " \xB7 "
        }),
        /* @__PURE__ */ jsx_runtime13.jsxs("span", {
          fg: import_theme13.colors.dim,
          children: [
            import_config3.session.turnCount,
            " turns"
          ]
        }),
        !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.dim,
              children: " \xB7 "
            }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: [
                import_config3.session.toolCallCount,
                " tools"
              ]
            })
          ]
        }) : null,
        !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.dim,
              children: " \xB7 "
            }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: [
                import_config3.session.totalTokens.toLocaleString(),
                " tok"
              ]
            })
          ]
        }) : null,
        /* @__PURE__ */ jsx_runtime13.jsx("span", {
          fg: import_theme13.colors.dim,
          children: " \xB7 "
        }),
        /* @__PURE__ */ jsx_runtime13.jsx("span", {
          fg: import_theme13.colors.dim,
          children: "$" + import_config3.session.totalCost.toFixed(4)
        }),
        import_config3.session.filesModified.size > 0 && !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.dim,
              children: " \xB7 "
            }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.yellow,
              children: [
                import_config3.session.filesModified.size,
                " files modified"
              ]
            })
          ]
        }) : null,
        isProcessing ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.dim,
              children: " \xB7 "
            }),
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.accent,
              children: isNarrow ? "..." : "processing"
            })
          ]
        }) : null
      ]
    })
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
  Session: ${parts.join(" \xB7 ")}
`);
  console.log(`  Goodbye! \u2726
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
  return /* @__PURE__ */ jsx_runtime15.jsxs("box", {
    style: { flexDirection: "column", flexGrow: 1 },
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
        disabled: state.isProcessing || state.showHelp,
        onSubmit: handleInput
      }),
      state.showHelp ? /* @__PURE__ */ jsx_runtime15.jsx(HelpModal, {
        onClose: () => import_store5.setState({ showHelp: false }),
        onCommand: handleHelpCommand
      }) : null
    ]
  });
}


// main
var jsx_runtime_main = __toESM(require_jsx_runtime(), 1);
var import_store_main = __toESM(require_store(), 1);
async function main() {
  if (process.env.APEX_LOCAL_SERVER === "1") {
    const { startServer } = __toESM(require_server(), 1);
    await startServer();
  }
  const renderer = await createCliRenderer({
    useAlternateScreen: true,
    exitOnCtrlC: false,
    useMouse: true,
  });
  import_store_main.setRenderer(renderer);
  const root = createRoot(renderer);
  root.render(jsx_runtime_main.jsx(App, {}));
  renderer.start();
}
main().catch((err) => {
  console.error("Failed to start Apex:", err);
  process.exit(1);
});
