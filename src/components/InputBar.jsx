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

