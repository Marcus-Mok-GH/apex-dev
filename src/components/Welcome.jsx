var import_theme3 = __toESM(require_theme(), 1);
var jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function Welcome() {
  const { isCompact, isNarrow } = useLayout();
  const c = import_theme3.colors;

  return /* @__PURE__ */ jsx_runtime3.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: isCompact ? 1 : 3, paddingRight: isCompact ? 1 : 2, marginTop: isCompact ? 1 : 2, marginBottom: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime3.jsxs("text", {
        children: [
          /* @__PURE__ */ jsx_runtime3.jsx("span", {
            fg: c.primary,
            attributes: TextAttributes.BOLD,
            children: "✦"
          }),
          /* @__PURE__ */ jsx_runtime3.jsx("span", {
            fg: c.dim,
            children: "  APEX AI  ·  TERMINAL AGENT"
          })
        ]
      }),
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: c.white,
        attributes: TextAttributes.BOLD,
        style: { marginTop: 1 },
        content: isNarrow ? "What are we building?" : "What are we building today?"
      }),
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: c.muted,
        content: isNarrow
          ? "Describe a task and Apex will take it from here."
          : "Describe a task. Apex can inspect files, write code, run commands, and review the result."
      }),
      /* @__PURE__ */ jsx_runtime3.jsxs("text", {
        style: { marginTop: 1 },
        children: [
          /* @__PURE__ */ jsx_runtime3.jsx("span", { fg: c.borderStrong, children: "quick start  " }),
          /* @__PURE__ */ jsx_runtime3.jsx("span", { fg: c.accent, children: "/help" }),
          /* @__PURE__ */ jsx_runtime3.jsx("span", { fg: c.dim, children: "  ·  " }),
          /* @__PURE__ */ jsx_runtime3.jsx("span", { fg: c.accent, children: "/files" }),
          !isNarrow ? /* @__PURE__ */ jsx_runtime3.jsxs(jsx_runtime3.Fragment, {
            children: [
              /* @__PURE__ */ jsx_runtime3.jsx("span", { fg: c.dim, children: "  ·  " }),
              /* @__PURE__ */ jsx_runtime3.jsx("span", { fg: c.accent, children: "/diff" }),
              /* @__PURE__ */ jsx_runtime3.jsx("span", { fg: c.dim, children: "  ·  " }),
              /* @__PURE__ */ jsx_runtime3.jsx("span", { fg: c.accent, children: "/cost" })
            ]
          }) : null
        ]
      })
    ]
  });
}
