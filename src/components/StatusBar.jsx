var import_react_sb = __toESM(require_react(), 1);
var import_theme13 = __toESM(require_theme(), 1);
var import_config3 = __toESM(require_config(), 1);
var jsx_runtime13 = __toESM(require_jsx_runtime(), 1);

var SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function StatusBar({ isProcessing }) {
  const { isNarrow } = useLayout();

  // Live elapsed timer — ticks every second
  const [tick, setTick] = import_react_sb.useState(0);
  import_react_sb.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Spinner frame for processing indicator
  const [spinFrame, setSpinFrame] = import_react_sb.useState(0);
  import_react_sb.useEffect(() => {
    if (!isProcessing) return;
    const id = setInterval(() => setSpinFrame((f) => (f + 1) % SPINNER_FRAMES.length), 80);
    return () => clearInterval(id);
  }, [isProcessing]);

  const elapsed = (tick, ((Date.now() - import_config3.session.startTime) / 1000 / 60).toFixed(1));
  const { totalCost, totalTokens, toolCallCount, turnCount, filesModified } = import_config3.session;
  const tokStr = totalTokens >= 1000
    ? (totalTokens / 1000).toFixed(1) + "k"
    : String(totalTokens);

  return /* @__PURE__ */ jsx_runtime13.jsxs("box", {
    style: { flexDirection: "row", paddingLeft: isNarrow ? 1 : 2, paddingRight: isNarrow ? 1 : 2 },
    children: [
      // Left section — session stats
      /* @__PURE__ */ jsx_runtime13.jsx("box", {
        style: { flexGrow: 1 },
        children: /* @__PURE__ */ jsx_runtime13.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: [elapsed, "min"]
            }),
            /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " \xB7 " }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: [turnCount, " turns"]
            }),
            !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
              children: [
                /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " \xB7 " }),
                /* @__PURE__ */ jsx_runtime13.jsxs("span", {
                  fg: import_theme13.colors.dim,
                  children: [toolCallCount, " tools"]
                })
              ]
            }) : null,
            !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
              children: [
                /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " \xB7 " }),
                /* @__PURE__ */ jsx_runtime13.jsxs("span", {
                  fg: import_theme13.colors.dim,
                  children: [tokStr, " tok"]
                })
              ]
            }) : null,
            /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " \xB7 " }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: ["$", totalCost.toFixed(4)]
            }),
            filesModified.size > 0 && !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
              children: [
                /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " \xB7 " }),
                /* @__PURE__ */ jsx_runtime13.jsxs("span", {
                  fg: import_theme13.colors.yellow,
                  children: [filesModified.size, " modified"]
                })
              ]
            }) : null
          ]
        })
      }),
      // Right section — processing state (Codebuff-style)
      isProcessing ? /* @__PURE__ */ jsx_runtime13.jsxs("text", {
        children: [
          /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.accent,
            children: SPINNER_FRAMES[spinFrame]
          }),
          /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.accent,
            children: isNarrow ? " ..." : " thinking  "
          }),
          !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.dim,
            children: "■ Esc"
          }) : null
        ]
      }) : null
    ]
  });
}
