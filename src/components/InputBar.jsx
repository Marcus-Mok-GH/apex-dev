var import_react15 = __toESM(require_react(), 1);
var import_theme12 = __toESM(require_theme(), 1);
var jsx_runtime12 = __toESM(require_jsx_runtime(), 1);

function InputBar({ disabled, onSubmit }) {
  const inputRef = import_react15.useRef(null);
  const { isNarrow, width } = useLayout();

  const handleSubmit = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (inputRef.current) inputRef.current.value = "";
    onSubmit(trimmed);
  };

  const hint = isNarrow ? "^C · /?" : "Ctrl+C exit  ·  /help";

  return /* @__PURE__ */ jsx_runtime12.jsx("box", {
    style: { flexDirection: "column" },
    children: /* @__PURE__ */ jsx_runtime12.jsxs("box", {
      style: {
        flexDirection: "row",
        paddingLeft: 1,
        paddingRight: 1,
        borderStyle: "rounded",
        borderColor: disabled ? import_theme12.colors.dim : import_theme12.colors.border
      },
      children: [
        // Prompt glyph
        /* @__PURE__ */ jsx_runtime12.jsx("text", {
          fg: disabled ? import_theme12.colors.dim : import_theme12.colors.primary,
          attributes: disabled ? 0 : TextAttributes.BOLD,
          content: "❯ "
        }),
        // Input field
        /* @__PURE__ */ jsx_runtime12.jsx("input", {
          ref: inputRef,
          focused: !disabled,
          placeholder: disabled ? "processing..." : "Type a message or /command",
          onSubmit: handleSubmit,
          fg: import_theme12.colors.text,
          style: { flexGrow: 1 }
        }),
        // Inline hint — right side
        /* @__PURE__ */ jsx_runtime12.jsx("text", {
          fg: import_theme12.colors.dim,
          content: "  " + hint
        })
      ]
    })
  });
}
