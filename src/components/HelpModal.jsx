var import_theme14 = __toESM(require_theme(), 1);
var jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
var { getProviderLoginState } = require_config();
var store = require_store();

function getCommandsForState() {
  const provider = store.getSnapshot().provider;
  const loginState = getProviderLoginState(provider);
  const isLoggedIn = loginState === "logged-in" || loginState === "saved";
  
  const baseCommands = [
    { cmd: "/help", desc: "Show this menu" },
    { cmd: "/compact", desc: "Compact/summarize conversation context" },
    { cmd: "/files", desc: "Show project file tree" },
    { cmd: "/clear", desc: "Clear conversation" },
    { cmd: "/cost", desc: "Show session stats" },
    { cmd: "/undo", desc: "Undo last edit" },
    { cmd: "/diff", desc: "Show git diff" },
    { cmd: "/git <cmd>", desc: "Run a git command" },
  ];
  
  if (isLoggedIn) {
    baseCommands.splice(1, 0, { cmd: "/logout", desc: `Logout from ${provider}` });
  } else {
    baseCommands.splice(1, 0, { cmd: "/login", desc: "Login to a provider" });
  }
  
  baseCommands.push({ cmd: "/quit", desc: "Exit" });
  return baseCommands;
}

var COMMANDS = getCommandsForState();
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

