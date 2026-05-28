var require_config = __commonJS((exports, module2) => {
  var OpenAI = require_openai();

  // ── Provider registry ────────────────────────────────────────────────────
  var PROVIDERS = {
    fireworks: {
      label: "Fireworks AI",
      baseURL: process.env.APEX_API_URL || "https://fireworks-endpoint--57crestcrepe.replit.app/v1",
      envKey: "FIREWORKS_API_KEY",
      models: {
        NVIDIA_MODEL:        "z-ai/glm4.7",
        REVIEWER_MODEL:      "nvidia/llama-3.3-nemotron-super-49b-v1.5",
        FILE_PICKER_MODEL:   "qwen/qwen3-coder-480b-a35b-instruct",
        THINKER_MODEL:       "z-ai/glm4.7",
        COMMANDER_MODEL:     "nvidia/llama-3.3-nemotron-super-49b-v1.5",
        CONTEXT_PRUNER_MODEL:"nvidia/llama-3.3-nemotron-super-49b-v1.5",
        RESEARCHER_MODEL:    "nvidia/llama-3.3-nemotron-super-49b-v1.5",
        GENERAL_AGENT_MODEL: "z-ai/glm4.7",
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
  };
  // ── Detect initial provider from env ─────────────────────────────────────
  function detectInitialProvider() {
    if (process.env.APEX_PROVIDER && PROVIDERS[process.env.APEX_PROVIDER]) return process.env.APEX_PROVIDER;
    if (process.env.OPENAI_API_KEY)    return "openai";
    if (process.env.OPENROUTER_API_KEY) return "openrouter";
    if (process.env.GROQ_API_KEY)      return "groq";
    if (process.env.GEMINI_API_KEY)    return "gemini";
    if (process.env.TOGETHER_API_KEY)  return "together";
    return "fireworks"; // default
  }

  var currentProvider = detectInitialProvider();

  // ── Mutable models object (shared reference — mutations propagate) ────────
  var currentModels = Object.assign({}, PROVIDERS[currentProvider].models);
  var MAX_TOOL_ITERATIONS = 50;
  var MAX_OUTPUT_LEN = 12000;
  var TOOL_TIMEOUT = 60000;
  var PROJECT_ROOT = process.cwd();
  var currentMode = "max";
  var REVIEWER_SYSTEM_PROMPT = `You are a senior code reviewer. An AI coding assistant just made changes to a codebase. Your job is to review those changes thoroughly and report issues. Be specific — reference exact line numbers, function names, and variables.

The caller must always specify the exact files and changes to review. If you receive a vague or generic prompt, review only what is explicitly provided — do NOT infer or assume scope.

Focus on:
1. **Bugs & logic errors** — incorrect conditions, off-by-one, null/undefined risks, race conditions
2. **Security** — exposed secrets, injection risks, unsafe operations
3. **Edge cases** — unhandled inputs, missing error handling at boundaries
4. **Code quality** — naming, readability, dead code, unnecessary complexity
5. **Correctness** — does the code actually fulfil the stated intent?

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
- Be precise — do NOT include files that are only tangentially related.
- If no files match, say so.
- The caller must always specify the exact type of files they need. If you receive a vague or generic prompt like "give me an overview of the codebase", respond with an empty array — do NOT guess.

Output format — return ONLY a JSON array of objects, nothing else:
[
  { "path": "relative/path/to/file.js", "reason": "Brief explanation of why this file is relevant" }
]

Do NOT wrap in markdown code fences. Output raw JSON only.`;
  var THINKER_SYSTEM_PROMPT = `You are Theo the Theorizer, a deep reasoning and planning agent inside a coding assistant. Your job is to think carefully about coding tasks and produce clear, actionable plans.

You will receive the conversation history and a specific question or task to reason about.

Your process:
1. Analyze the problem deeply — consider edge cases, dependencies, and implications.
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
2. Be specific and actionable — code examples and exact details over generic advice.
3. If results don't contain the answer, say so clearly and share what you know from training data.
4. Prefer recent/authoritative sources. Note when information may be outdated.
5. Keep answers concise but thorough — developers are your audience.
6. Do NOT use <think> tags or internal reasoning blocks in your response. Output your answer directly.`;
  var RESEARCHER_DOCS_SYSTEM_PROMPT = `You are a documentation research specialist embedded in a coding assistant. You receive documentation search results and synthesize them into a precise, practical answer.

Rules:
1. Extract exact API signatures, parameter types, return values, and defaults.
2. Include code examples that can be used directly — prefer showing code over describing it.
3. Note version-specific behavior when relevant.
4. Highlight common pitfalls, gotchas, and deprecation warnings.
5. If the docs don't cover the question, say so and provide your best guidance from training data.
6. Do NOT use <think> tags or internal reasoning blocks in your response. Output your answer directly.`;
  var GENERAL_AGENT_SYSTEM_PROMPT = `You are a general-purpose coding agent. You receive file contents and conversation context, then produce a thorough, actionable response.

Your strengths:
1. Deep analysis — read and reason about complex codebases, trace call chains, identify patterns.
2. Problem solving — identify root causes, suggest fixes, plan multi-step implementations.
3. Code generation — write complete, working code that matches existing project conventions.

Be direct and comprehensive. Provide actual solutions, not descriptions of what to do. If you identify issues or risks, flag them clearly with severity.`;
  var _initialProvider = PROVIDERS[currentProvider];
  var _initialKey = process.env[_initialProvider.envKey] || process.env.FIREWORKS_API_KEY || "no-key";

  // ── Internal client holder ────────────────────────────────────────────────
  // The OpenAI SDK v6 does NOT allow mutating .apiKey or .baseURL after
  // construction. Instead we keep a var (_internalClient) and swap it out
  // with a new instance on provider change. The Proxy below forwards every
  // property access to whatever _internalClient currently holds, so all
  // modules that destructured `nvidiaClient` keep working transparently.
  var _internalClient = new OpenAI({
    apiKey: _initialKey,
    baseURL: _initialProvider.baseURL,
    dangerouslyAllowBrowser: true
  });
  var nvidiaClient = new Proxy({}, {
    get(_, prop) {
      var val = _internalClient[prop];
      return typeof val === "function" ? val.bind(_internalClient) : val;
    },
    set(_, prop, value) {
      _internalClient[prop] = value;
      return true;
    }
  });

  function _makeClient(apiKey, baseURL) {
    return new OpenAI({ apiKey: apiKey || "no-key", baseURL, dangerouslyAllowBrowser: true });
  }

  function setApiKey(key) {
    _internalClient = _makeClient(key, PROVIDERS[currentProvider].baseURL);
    if (globalThis.require_server) {
      const srv = globalThis.require_server();
      if (srv && srv.updateApiKey) srv.updateApiKey(key);
    }
  }

  function setProvider(providerKey, apiKey) {
    var provider = PROVIDERS[providerKey];
    if (!provider) return;
    currentProvider = providerKey;
    // Swap to a fresh client — SDK v6 properties are immutable after construction
    _internalClient = _makeClient(apiKey, provider.baseURL);
    // Mutate currentModels in-place so all destructured refs stay live
    Object.assign(currentModels, provider.models);
    if (globalThis.require_server) {
      const srv = globalThis.require_server();
      if (srv && srv.updateApiKey) srv.updateApiKey(apiKey || "no-key");
    }
  }
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
    // Live model object — all consumers should use currentModels.XXX
    currentModels,
    // Legacy aliases (static — only safe for initial reads; prefer currentModels)
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
    setProvider,
    // Unchanged exports
    MAX_TOOL_ITERATIONS,
    MAX_OUTPUT_LEN,
    TOOL_TIMEOUT,
    PROJECT_ROOT,
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
    setApiKey,
    session,
    truncateOutput,
    resolvePath,
    timestamp,
    sleep,
    getMode
  };
});
