var import_theme13 = __toESM(require_theme(), 1);
var import_config3 = __toESM(require_config(), 1);
var jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
function StatusBar({ isProcessing }) {
  const { isNarrow } = useLayout();
  const elapsed = ((Date.now() - import_config3.session.startTime) / 1000 / 60).toFixed(1);
  return /* @__PURE__ */ jsx_runtime13.jsx("box", {
    style: { flexDirection: "row", paddingLeft: isNarrow ? 1 : 2, paddingRight: isNarrow ? 1 : 2 },
    children: /* @__PURE__ */ jsx_runtime13.jsxs("text", {
      children: [
        /* @__PURE__ */ jsx_runtime13.jsxs("span", {
          fg: import_theme13.colors.dim,
          children: [
            elapsed,
            "min"
          ]
        }),
        /* @__PURE__ */ jsx_runtime13.jsx("span", {
          fg: import_theme13.colors.dim,
          children: " \xB7 "
        }),
        /* @__PURE__ */ jsx_runtime13.jsxs("span", {
          fg: import_theme13.colors.dim,
          children: [
            import_config3.session.turnCount,
            " turns"
          ]
        }),
        !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.dim,
              children: " \xB7 "
            }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: [
                import_config3.session.toolCallCount,
                " tools"
              ]
            })
          ]
        }) : null,
        !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.dim,
              children: " \xB7 "
            }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: [
                import_config3.session.totalTokens.toLocaleString(),
                " tok"
              ]
            })
          ]
        }) : null,
        /* @__PURE__ */ jsx_runtime13.jsx("span", {
          fg: import_theme13.colors.dim,
          children: " \xB7 "
        }),
        /* @__PURE__ */ jsx_runtime13.jsx("span", {
          fg: import_theme13.colors.dim,
          children: "$" + import_config3.session.totalCost.toFixed(4)
        }),
        import_config3.session.filesModified.size > 0 && !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.dim,
              children: " \xB7 "
            }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.yellow,
              children: [
                import_config3.session.filesModified.size,
                " files modified"
              ]
            })
          ]
        }) : null,
        isProcessing ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.dim,
              children: " \xB7 "
            }),
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.accent,
              children: isNarrow ? "..." : "processing"
            })
          ]
        }) : null
      ]
    })
  });
}

