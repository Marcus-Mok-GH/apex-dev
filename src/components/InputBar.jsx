var import_react15 = __toESM(require_react(), 1);
var import_theme12 = __toESM(require_theme(), 1);
var jsx_runtime12 = __toESM(require_jsx_runtime(), 1);

var CMD_LIST = [
  { cmd: "/help",    desc: "Show help menu" },
  { cmd: "/compact", desc: "Summarize context" },
  { cmd: "/files",   desc: "Show file tree" },
  { cmd: "/clear",   desc: "Clear conversation" },
  { cmd: "/cost",    desc: "Show session stats" },
  { cmd: "/undo",    desc: "Undo last edit" },
  { cmd: "/diff",    desc: "Show git diff" },
  { cmd: "/git",     desc: "Run a git command" },
  { cmd: "/quit",    desc: "Exit" },
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
    const fill = cmd.cmd + " ";
    setInputValue(fill);
  }

  useKeyboard((key) => {
    if (!showPicker || filtered.length === 0) return;
    if (key.name === "down") {
      setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (key.name === "up") {
      setSelectedIdx((i) => Math.max(i - 1, 0));
    } else if (key.name === "tab") {
      selectCommand(filtered[selectedIdx]);
    }
  });

  const handleChange = (val) => {
    setInputValue(val);
  };

  const handleSubmit = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setInputValue("");
    onSubmit(trimmed);
  };

  const hint = isNarrow ? "ctrl+c" : "↑↓ history  ctrl+c exit";
  const placeholder = disabled
    ? "setting up…"
    : isNarrow
      ? "message apex…"
      : "ask apex anything, or /command";

  const colors = import_theme12.colors;
  const inputBorderColor = disabled
    ? colors.border
    : showPicker
      ? colors.primary
      : colors.dim;

  return /* @__PURE__ */ jsx_runtime12.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: 1, paddingRight: 1, paddingBottom: 1 },
    children: [
      showPicker && filtered.length > 0
        ? /* @__PURE__ */ jsx_runtime12.jsxs("box", {
            style: {
              flexDirection: "column",
              paddingLeft: 2,
              paddingRight: 2,
              paddingTop: 0,
              paddingBottom: 0,
              marginBottom: 0,
              borderStyle: "single",
              borderColor: colors.border,
            },
            children: [
              /* @__PURE__ */ jsx_runtime12.jsxs("text", {
                children: [
                  /* @__PURE__ */ jsx_runtime12.jsx("span", { fg: colors.dim, children: "commands" }),
                  /* @__PURE__ */ jsx_runtime12.jsx("span", { fg: colors.dim, children: "  ↑↓ navigate  tab select" }),
                ]
              }),
              filtered.map((item, idx) => {
                const isActive = idx === selectedIdx;
                return /* @__PURE__ */ jsx_runtime12.jsxs("box", {
                  style: { flexDirection: "row" },
                  onMouseDown: () => selectCommand(item),
                  children: [
                    /* @__PURE__ */ jsx_runtime12.jsx("text", {
                      fg: isActive ? colors.primary : colors.border,
                      content: isActive ? "› " : "  "
                    }),
                    /* @__PURE__ */ jsx_runtime12.jsx("text", {
                      fg: isActive ? colors.text : colors.muted,
                      attributes: isActive ? TextAttributes.BOLD : 0,
                      content: item.cmd
                    }),
                    /* @__PURE__ */ jsx_runtime12.jsx("text", {
                      fg: colors.dim,
                      content: "  " + item.desc
                    })
                  ]
                }, item.cmd);
              })
            ]
          })
        : null,
      /* @__PURE__ */ jsx_runtime12.jsxs("box", {
        style: {
          flexDirection: "row",
          paddingLeft: 1,
          paddingRight: 1,
          borderStyle: "single",
          borderColor: inputBorderColor,
        },
        children: [
          /* @__PURE__ */ jsx_runtime12.jsx("text", {
            fg: disabled ? colors.dim : colors.primary,
            attributes: disabled ? 0 : TextAttributes.BOLD,
            content: "›  "
          }),
          /* @__PURE__ */ jsx_runtime12.jsx("input", {
            ref: inputRef,
            focused: !disabled,
            value: inputValue,
            onChange: handleChange,
            placeholder,
            onSubmit: handleSubmit,
            fg: colors.text,
            style: { flexGrow: 1 }
          }),
          /* @__PURE__ */ jsx_runtime12.jsx("text", {
            fg: colors.dim,
            content: "  " + hint
          })
        ]
      })
    ]
  });
}
