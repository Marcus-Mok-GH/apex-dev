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

