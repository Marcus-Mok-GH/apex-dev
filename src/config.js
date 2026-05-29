var require_config = __commonJS((exports, module2) => {
  var OpenAI = require_openai();

  // ── Provider registry ────────────────────────────────────────────────────
  var PROVIDERS = {
    fireworks: {
      label: "Fireworks AI",
      baseURL: process.env.APEX_API_URL || "https://api.fireworks.ai/inference/v1",
      envKey: "FIREWORKS_API_KEY",
      models: {
        // Main agent — most capable, 1M-ctx, strong tool use
        NVIDIA_MODEL:        "deepseek-ai/deepseek-v4-pro",
        // Code review & multi-impl selector — code-specialized 480B model
        REVIEWER_MODEL:      "fireworks/qwen3-coder-480b-a35b-instruct",
        // File picker — ultra-cheap flash model ($0.14/M), simple JSON output
        FILE_PICKER_MODEL:   "deepseek-ai/deepseek-v4-flash",
        // Deep reasoning/planning — R1 chain-of-thought model
        THINKER_MODEL:       "fireworks/deepseek-r1",
        // Command planning — fast flash model, simple JSON output
        COMMANDER_MODEL:     "deepseek-ai/deepseek-v4-flash",
        // Context summarization — fast flash model
        CONTEXT_PRUNER_MODEL:"deepseek-ai/deepseek-v4-flash",
        // Web/docs research synthesis — strong general model
        RESEARCHER_MODEL:    "fireworks/deepseek-v3p2",
        // General analysis with file context — large analytical model
        GENERAL_AGENT_MODEL: "fireworks/qwen3-235b-a22b",
      },
    },
    openai: {
      label: "OpenAI",
      baseURL: "https://api.openai.com/v1",
      envKey: "OPENAI_API_KEY",
      models: {
        // Main agent — GPT-5.5, flagship model
        NVIDIA_MODEL:        "gpt-5.5",
        // Code review & selector — GPT-5.4 for strong code analysis
        REVIEWER_MODEL:      "gpt-5.4",
        // File picker — lightweight 5.3 for simple JSON output
        FILE_PICKER_MODEL:   "gpt-5.3",
        // Deep reasoning — o3 is OpenAI's best reasoning model (temp stripped automatically)
        THINKER_MODEL:       "o3",
        // Command planning — lightweight 5.3, fast and cheap
        COMMANDER_MODEL:     "gpt-5.3",
        // Context summarization — lightweight 5.3, fast and cheap
        CONTEXT_PRUNER_MODEL:"gpt-5.3",
        // Research synthesis — GPT-5.4 for quality synthesis
        RESEARCHER_MODEL:    "gpt-5.4",
        // General analysis — GPT-5.4
        GENERAL_AGENT_MODEL: "gpt-5.4",
      },
    },
    openrouter: {
      label: "OpenRouter",
      baseURL: "https://openrouter.ai/api/v1",
      envKey: "OPENROUTER_API_KEY",
      models: {
        // Main agent — latest Claude Opus, best overall capability
        NVIDIA_MODEL:        "anthropic/claude-opus-4.8",
        // Code review & selector — Sonnet: capable, lower cost than Opus
        REVIEWER_MODEL:      "anthropic/claude-sonnet-4.6",
        // File picker — Haiku: fastest and cheapest, reliable JSON output
        FILE_PICKER_MODEL:   "anthropic/claude-haiku-4.5",
        // Deep reasoning — Opus for best multi-step analysis
        THINKER_MODEL:       "anthropic/claude-opus-4.8",
        // Command planning — Haiku: fast and cheap
        COMMANDER_MODEL:     "anthropic/claude-haiku-4.5",
        // Context summarization — Haiku: fast and cheap
        CONTEXT_PRUNER_MODEL:"anthropic/claude-haiku-4.5",
        // Research synthesis — Sonnet: good balance of quality and cost
        RESEARCHER_MODEL:    "anthropic/claude-sonnet-4.6",
        // General analysis — Sonnet: strong, cost-efficient
        GENERAL_AGENT_MODEL: "anthropic/claude-sonnet-4.6",
      },
    },
    groq: {
      label: "Groq",
      baseURL: "https://api.groq.com/openai/v1",
      envKey: "GROQ_API_KEY",
      models: {
        // Main agent — stable 70B production model, very fast on Groq hardware
        NVIDIA_MODEL:        "llama-3.3-70b-versatile",
        // Code review & selector — Llama 4 Scout, newest and most capable
        REVIEWER_MODEL:      "meta-llama/llama-4-scout-17b-16e-instruct",
        // File picker — 8B instant: 750+ tok/s, cheapest option
        FILE_PICKER_MODEL:   "llama-3.1-8b-instant",
        // Deep reasoning — Llama 4 Scout for best available reasoning on Groq
        THINKER_MODEL:       "meta-llama/llama-4-scout-17b-16e-instruct",
        // Command planning — 8B instant: ultra-fast JSON output
        COMMANDER_MODEL:     "llama-3.1-8b-instant",
        // Context summarization — 8B instant: ultra-fast
        CONTEXT_PRUNER_MODEL:"llama-3.1-8b-instant",
        // Research synthesis — stable 70B versatile
        RESEARCHER_MODEL:    "llama-3.3-70b-versatile",
        // General analysis — Llama 4 Scout: newest capabilities
        GENERAL_AGENT_MODEL: "meta-llama/llama-4-scout-17b-16e-instruct",
      },
    },
    gemini: {
      label: "Google Gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      envKey: "GEMINI_API_KEY",
      models: {
        // Main agent — 2.5 Pro: most capable stable model, 1M context
        NVIDIA_MODEL:        "gemini-2.5-pro",
        // Code review & selector — Pro for deep code analysis
        REVIEWER_MODEL:      "gemini-2.5-pro",
        // File picker — Flash Lite: lowest latency and cost in 2.5 family
        FILE_PICKER_MODEL:   "gemini-2.5-flash-lite",
        // Deep reasoning — Pro with built-in thinking capability
        THINKER_MODEL:       "gemini-2.5-pro",
        // Command planning — Flash Lite: fast and cheap
        COMMANDER_MODEL:     "gemini-2.5-flash-lite",
        // Context summarization — Flash Lite: fast and cheap
        CONTEXT_PRUNER_MODEL:"gemini-2.5-flash-lite",
        // Research synthesis — Flash: balanced speed and quality
        RESEARCHER_MODEL:    "gemini-2.5-flash",
        // General analysis — Pro for deep multi-file reasoning
        GENERAL_AGENT_MODEL: "gemini-2.5-pro",
      },
    },
    together: {
      label: "Together AI",
      baseURL: "https://api.together.ai/v1",
      envKey: "TOGETHER_API_KEY",
      models: {
        // Main agent — DeepSeek V4 Pro: most capable, 512K context
        NVIDIA_MODEL:        "deepseek-ai/DeepSeek-V4-Pro",
        // Code review & selector — Qwen 3.5 397B: large model, strong at analysis
        REVIEWER_MODEL:      "Qwen/Qwen3.5-397B-A17B",
        // File picker — Qwen 3.5 9B: cheapest option ($0.10/M), simple JSON
        FILE_PICKER_MODEL:   "Qwen/Qwen3.5-9B",
        // Deep reasoning — DeepSeek V4 Pro: best reasoning on Together
        THINKER_MODEL:       "deepseek-ai/DeepSeek-V4-Pro",
        // Command planning — Qwen 3.5 9B: fast and cheap
        COMMANDER_MODEL:     "Qwen/Qwen3.5-9B",
        // Context summarization — Qwen 3.5 9B: fast and cheap
        CONTEXT_PRUNER_MODEL:"Qwen/Qwen3.5-9B",
        // Research synthesis — Qwen 3.6 Plus: capable, good for synthesis
        RESEARCHER_MODEL:    "Qwen/Qwen3.6-Plus",
        // General analysis — Qwen 3.5 397B: large, thorough analysis
        GENERAL_AGENT_MODEL: "Qwen/Qwen3.5-397B-A17B",
      },
    },
    anthropic: {
      label: "Anthropic",
      baseURL: "https://api.anthropic.com/v1",
      envKey: "ANTHROPIC_API_KEY",
      // Anthropic uses x-api-key header; apiKey is passed via defaultHeaders
      authHeader: "x-api-key",
      extraHeaders: { "anthropic-version": "2023-06-01" },
      models: {
        // Main agent — Claude Opus 4.8: most capable, best tool use and long context
        NVIDIA_MODEL:        "claude-opus-4-8",
        // Code review & selector — Sonnet 4.6: strong at code analysis, lower cost
        REVIEWER_MODEL:      "claude-sonnet-4-6",
        // File picker — Sonnet 4.6: reliable JSON output
        FILE_PICKER_MODEL:   "claude-sonnet-4-6",
        // Deep reasoning — Opus 4.8 for best multi-step planning and analysis
        THINKER_MODEL:       "claude-opus-4-8",
        // Command planning — Sonnet 4.6: fast, good at structured output
        COMMANDER_MODEL:     "claude-sonnet-4-6",
        // Context summarization — Sonnet 4.6
        CONTEXT_PRUNER_MODEL:"claude-sonnet-4-6",
        // Research synthesis — Sonnet 4.6: quality balance for synthesis tasks
        RESEARCHER_MODEL:    "claude-sonnet-4-6",
        // General analysis — Sonnet 4.6: strong and cost-efficient
        GENERAL_AGENT_MODEL: "claude-sonnet-4-6",
      },
    },
  };
  // ── Detect initial provider from env ─────────────────────────────────────
  function detectInitialProvider() {
    if (process.env.APEX_PROVIDER && PROVIDERS[process.env.APEX_PROVIDER]) return process.env.APEX_PROVIDER;
    if (process.env.ANTHROPIC_API_KEY)  return "anthropic";
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
  var _initialKey = process.env[_initialProvider.envKey] || "no-key";

  // ── Internal client holder ────────────────────────────────────────────────
  // The OpenAI SDK v6 does NOT allow mutating .apiKey or .baseURL after
  // construction. Instead we keep a var (_internalClient) and swap it out
  // with a new instance on provider change. The Proxy below forwards every
  // property access to whatever _internalClient currently holds, so all
  // modules that destructured `nvidiaClient` keep working transparently.
  var _internalClient = _makeClient(_initialKey, _initialProvider.baseURL, _initialProvider);
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

  function _makeClient(apiKey, baseURL, provider) {
    const key = apiKey || "no-key";
    // Anthropic (and any provider with authHeader) uses a custom auth header
    // instead of the standard "Authorization: Bearer <key>" scheme.
    if (provider && provider.authHeader) {
      return new OpenAI({
        apiKey: "no-key",           // suppress SDK's own Authorization header
        baseURL,
        dangerouslyAllowBrowser: true,
        defaultHeaders: {
          [provider.authHeader]: key,
          ...(provider.extraHeaders || {})
        }
      });
    }
    return new OpenAI({ apiKey: key, baseURL, dangerouslyAllowBrowser: true });
  }

  function setApiKey(key) {
    _internalClient = _makeClient(key, PROVIDERS[currentProvider].baseURL, PROVIDERS[currentProvider]);
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
    _internalClient = _makeClient(apiKey, provider.baseURL, provider);
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
  // Strip parameters that OpenAI o-series reasoning models (o1, o3, o4-mini, etc.)
  // do not accept. These models use a fixed temperature and ignore top_p.
  function sanitizeForModel(params) {
    const model = params.model || "";
    if (/^o[0-9]/.test(model)) {
      const { temperature, top_p, ...rest } = params;
      return rest;
    }
    return params;
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
    detectInitialProvider,
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
    getMode,
    sanitizeForModel
  };
});
