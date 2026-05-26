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

