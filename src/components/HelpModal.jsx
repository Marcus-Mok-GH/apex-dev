var import_theme14 = __toESM(require_theme(), 1);
var jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
var COMMANDS = [
  { cmd: "/help", desc: "Show this menu" },
  { cmd: "/compact", desc: "Summarize conversation context" },
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
  "Esc closes overlays",
  "Ask to run npm, bun, pnpm, or yarn commands — all supported",
  "Apex manages the AI service configuration automatically",
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
var PACKAGE_MANAGERS = ["npm", "bun", "pnpm", "yarn"];
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
  const { isNarrow, isCompact } = useLayout();
  useKeyboard((key) => {
    if (key.name === "escape" || key.name === "q") {
      onClose();
    }
  });
  return /* @__PURE__ */ jsx_runtime14.jsxs("box", {
    zIndex: 100,
    border: true,
    borderColor: import_theme14.colors.primary,
    backgroundColor: "#0c0c0c",
    title: isCompact ? " help " : " apex help ",
    titleAlignment: "center",
    style: {
      position: "absolute",
      top: 2,
      left: isCompact ? 0 : isNarrow ? 1 : 4,
      bottom: 2,
      right: isCompact ? 0 : isNarrow ? 1 : 4,
      padding: 1,
      flexDirection: "column"
    },
    children: [
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.accent,
        attributes: TextAttributes.BOLD,
        content: "commands"
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
                fg: import_theme14.colors.primary,
                children: cmd.padEnd(isCompact ? 10 : isNarrow ? 12 : 16)
              }),
              /* @__PURE__ */ jsx_runtime14.jsx("span", {
                fg: import_theme14.colors.muted,
                children: desc
              })
            ]
          })
        }, cmd))
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.accent,
        attributes: TextAttributes.BOLD,
        style: { marginTop: 1 },
        content: "package managers"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.muted,
        content: PACKAGE_MANAGERS.join("  ·  ")
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.accent,
        attributes: TextAttributes.BOLD,
        style: { marginTop: 1 },
        content: "tools"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.muted,
        content: TOOLS.join("  ·  ")
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.accent,
        attributes: TextAttributes.BOLD,
        style: { marginTop: 1 },
        content: "sub-agents"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.muted,
        content: SUBAGENTS.join("  ·  ")
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.dim,
        content: "  * = MAX mode only"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.accent,
        attributes: TextAttributes.BOLD,
        style: { marginTop: 1 },
        content: "tips"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("box", {
        style: { flexDirection: "column" },
        children: QUICK_TIPS.map((tip) => /* @__PURE__ */ jsx_runtime14.jsx("text", {
          fg: import_theme14.colors.dim,
          content: `· ${tip}`
        }, tip))
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.dim,
        style: { marginTop: 1 },
        content: isCompact ? "tips · esc/q closes" : "esc or q to close"
      })
    ]
  });
}
