var import_react15 = __toESM(require_react(), 1);
var import_theme12 = __toESM(require_theme(), 1);
var jsx_runtime12 = __toESM(require_jsx_runtime(), 1);

function InputBar({ disabled, onSubmit, inputRef: externalInputRef }) {
  const internalInputRef = import_react15.useRef(null);
  const inputRef = externalInputRef || internalInputRef;
  const { isNarrow, width } = useLayout();

  const handleSubmit = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (inputRef.current) inputRef.current.value = "";
    onSubmit(trimmed);
  };

  const hint = isNarrow ? "Ctrl+C · /" : "Ctrl+C exit · /help · /files";
  const placeholder = disabled
    ? "setup in progress..."
    : isNarrow
      ? "Message or /cmd"
      : "Ask Apex anything, or use /commands";

  return /* @__PURE__ */ jsx_runtime12.jsx("box", {
    style: { flexDirection: "column", paddingLeft: 1, paddingRight: 1, paddingBottom: 1 },
    children: /* @__PURE__ */ jsx_runtime12.jsxs("box", {
      style: {
        flexDirection: "row",
        paddingLeft: 1,
        paddingRight: 1,
        borderStyle: "rounded",
        borderColor: disabled ? import_theme12.colors.dim : import_theme12.colors.border,
        backgroundColor: disabled ? import_theme12.colors.surface : undefined
      },
      children: [
        /* @__PURE__ */ jsx_runtime12.jsx("text", {
          fg: disabled ? import_theme12.colors.dim : import_theme12.colors.primary,
          attributes: disabled ? 0 : TextAttributes.BOLD,
          content: "❯ "
        }),
        /* @__PURE__ */ jsx_runtime12.jsx("input", {
          ref: inputRef,
          focused: !disabled,
          placeholder,
          onSubmit: handleSubmit,
          fg: import_theme12.colors.text,
          style: { flexGrow: 1 }
        }),
        /* @__PURE__ */ jsx_runtime12.jsx("text", {
          fg: import_theme12.colors.dim,
          content: "  " + hint
        })
      ]
    })
  });
}
