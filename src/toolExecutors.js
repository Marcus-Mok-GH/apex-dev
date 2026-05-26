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

