var import_theme3 = __toESM(require_theme(), 1);
var import_config2 = __toESM(require_config(), 1);
var jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function Welcome() {
  const { isNarrow } = useLayout();
  return /* @__PURE__ */ jsx_runtime3.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: 2, marginTop: 1, marginBottom: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.white,
        attributes: TextAttributes.BOLD,
        content: "What are we building?"
      }),
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.dim,
        style: { marginTop: 0 },
        content: isNarrow
          ? "Type a message or /help"
          : "Read, edit, run shell commands, npm, and review code — just describe what you need."
      }),
      !isNarrow ? /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.dim,
        style: { marginTop: 0 },
        content: "/help  /files  /diff  /cost  /quit"
      }) : null
    ]
  });
}
