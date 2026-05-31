var import_theme3 = __toESM(require_theme(), 1);
var import_config2 = __toESM(require_config(), 1);
var jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function Welcome() {
  const { isNarrow } = useLayout();
  return /* @__PURE__ */ jsx_runtime3.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: 1, marginTop: 1, marginBottom: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.white,
        attributes: TextAttributes.BOLD,
        content: "How can I help?"
      }),
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.dim,
        content: isNarrow ? `Type a message or /help` : `Apex can read, edit, run commands, and review your code. Use /help to see shortcuts.`
      }),
      !isNarrow ? /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.dim,
        style: { marginTop: 0 },
        content: `Shortcuts · /help · /files · /diff · /cost · /quit · Max ${import_config2.MAX_TOOL_ITERATIONS} iterations`
      }) : null
    ]
  });
}

