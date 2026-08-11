var import_react15 = __toESM(require_react(), 1);
var import_theme12 = __toESM(require_theme(), 1);
var jsx_runtime12 = __toESM(require_jsx_runtime(), 1);

var CMD_LIST = [
  { cmd: "/help", desc: "Show help menu" },
  { cmd: "/compact", desc: "Summarize context" },
  { cmd: "/files", desc: "Show file tree" },
  { cmd: "/clear", desc: "Clear conversation" },
  { cmd: "/cost", desc: "Show session stats" },
  { cmd: "/undo", desc: "Undo last edit" },
  { cmd: "/diff", desc: "Show git diff" },
  { cmd: "/git", desc: "Run a git command" },
  { cmd: "/quit", desc: "Exit" },
];

function fuzzyScore(cmdStr, query) {
  const c = cmdStr.slice(1).toLowerCase();
  const q = query.toLowerCase();
  if (!q) return 1;
  if (c.startsWith(q)) return 3;
  if (c.includes(q)) return 2;
  let ci = 0;
  for (const ch of q) {
    const found = c.indexOf(ch, ci);
    if (found === -1) return 0;
    ci = found + 1;
  }
  return 1;
}

function InputBar({ disabled, onSubmit, inputRef: externalInputRef }) {
  const internalInputRef = import_react15.useRef(null);
  const inputRef = externalInputRef || internalInputRef;
  const { isNarrow } = useLayout();
  const [inputValue, setInputValue] = import_react15.useState("");
  const [selectedIdx, setSelectedIdx] = import_react15.useState(0);
  const showPicker = !disabled && inputValue.startsWith("/");
  const query = showPicker ? inputValue.slice(1) : "";

  const filtered = import_react15.useMemo(() => {
    if (!showPicker) return [];
    return CMD_LIST
      .map((c) => ({ ...c, score: fuzzyScore(c.cmd, query) }))
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [showPicker, query]);

  import_react15.useEffect(() => {
    setSelectedIdx(0);
  }, [filtered.length, query]);

  function selectCommand(cmd) {
    if (!cmd) return;
    setInputValue(cmd.cmd + " ");
  }

  useKeyboard((key) => {
    if (!showPicker || filtered.length === 0) return;
    if (key.name === "down") setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    else if (key.name === "up") setSelectedIdx((i) => Math.max(i - 1, 0));
    else if (key.name === "tab") selectCommand(filtered[selectedIdx]);
  });

  const handleSubmit = (value) => {
    if (showPicker && filtered.length > 0) {
      selectCommand(filtered[selectedIdx]);
      return;
    }
    const trimmed = value.trim();
    if (!trimmed) return;
    setInputValue("");
    onSubmit(trimmed);
  };

  const c = import_theme12.colors;
  const inputBorderColor = disabled ? c.border : showPicker ? c.primary : c.borderStrong;
  const hint = isNarrow
    ? "ctrl+c to exit"
    : showPicker
      ? "↑↓ navigate  ·  tab/enter select  ·  ctrl+c exit"
      : "ctrl+c exit";
  const placeholder = disabled ? "setting up…" : isNarrow ? "message apex…" : "ask apex anything, or /command";

  return /* @__PURE__ */ jsx_runtime12.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: 2, paddingRight: 2, paddingBottom: 1 },
    children: [
      showPicker && filtered.length > 0 ? /* @__PURE__ */ jsx_runtime12.jsxs("box", {
        style: { flexDirection: "column", paddingLeft: 2, paddingRight: 2, borderStyle: "single", borderColor: c.border, marginBottom: 1 },
        children: [
          /* @__PURE__ */ jsx_runtime12.jsxs("text", {
            children: [
              /* @__PURE__ */ jsx_runtime12.jsx("span", { fg: c.accent, attributes: TextAttributes.BOLD, children: "commands" }),
              /* @__PURE__ */ jsx_runtime12.jsx("span", { fg: c.dim, children: "  ·  ↑↓ navigate  tab select" })
            ]
          }),
          filtered.map((item, idx) => {
            const isActive = idx === selectedIdx;
            return /* @__PURE__ */ jsx_runtime12.jsxs("box", {
              style: { flexDirection: "row" },
              onMouseDown: () => selectCommand(item),
              children: [
                /* @__PURE__ */ jsx_runtime12.jsx("text", { fg: isActive ? c.primary : c.border, children: isActive ? "› " : "  " }),
                /* @__PURE__ */ jsx_runtime12.jsx("text", { fg: isActive ? c.text : c.muted, attributes: isActive ? TextAttributes.BOLD : 0, children: item.cmd }),
                /* @__PURE__ */ jsx_runtime12.jsx("text", { fg: c.dim, children: "  " + item.desc })
              ]
            }, item.cmd);
          })
        ]
      }) : null,
      /* @__PURE__ */ jsx_runtime12.jsxs("box", {
        style: { flexDirection: "row", paddingLeft: 1, paddingRight: 1, borderStyle: "single", borderColor: inputBorderColor },
        children: [
          /* @__PURE__ */ jsx_runtime12.jsx("text", { fg: disabled ? c.dim : c.primary, attributes: disabled ? 0 : TextAttributes.BOLD, children: "›  " }),
          /* @__PURE__ */ jsx_runtime12.jsx("input", { ref: inputRef, focused: !disabled, value: inputValue, onChange: setInputValue, placeholder, onSubmit: handleSubmit, fg: c.text, style: { flexGrow: 1 } }),
          !isNarrow ? /* @__PURE__ */ jsx_runtime12.jsx("text", { fg: c.dim, children: "  " + hint }) : null
        ]
      })
    ]
  });
}
