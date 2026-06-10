var import_theme3 = __toESM(require_theme(), 1);
var import_config2 = __toESM(require_config(), 1);
var jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function Welcome() {
  const { isNarrow } = useLayout();
  const c = import_theme3.colors;

  const cmds = isNarrow
    ? ["/help", "/quit"]
    : ["/help", "/files", "/diff", "/cost", "/compact", "/quit"];

  return /* @__PURE__ */ jsx_runtime3.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: 2, marginTop: 2, marginBottom: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime3.jsxs("text", {
        children: [
          /* @__PURE__ */ jsx_runtime3.jsx("span", {
            fg: c.primary,
            attributes: TextAttributes.BOLD,
            children: "◆"
          }),
          /* @__PURE__ */ jsx_runtime3.jsx("span", {
            fg: c.white,
            attributes: TextAttributes.BOLD,
            children: "  What should we build?"
          }),
        ]
      }),
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: c.muted,
        style: { marginTop: 0 },
        content: isNarrow
          ? "Describe your task or type a command."
          : "Read files, write code, run commands — describe what you need and I'll handle it."
      }),
      /* @__PURE__ */ jsx_runtime3.jsxs("text", {
        style: { marginTop: 1 },
        children: cmds.map((cmd, i) =>
          /* @__PURE__ */ jsx_runtime3.jsxs(jsx_runtime3.Fragment, {
            children: [
              i > 0 ? /* @__PURE__ */ jsx_runtime3.jsx("span", { fg: c.border, children: "  " }) : null,
              /* @__PURE__ */ jsx_runtime3.jsx("span", { fg: c.dim, children: cmd }),
            ]
          }, cmd)
        ),
      }),
    ]
  });
}
