var import_react_sb = __toESM(require_react(), 1);
var import_theme13 = __toESM(require_theme(), 1);
var import_config3 = __toESM(require_config(), 1);
var import_store3 = __toESM(require_store(), 1);
var jsx_runtime13 = __toESM(require_jsx_runtime(), 1);

var SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function StatusBar({ isProcessing }) {
  const { isNarrow } = useLayout();
  const snapshot = import_config3.session;
  const state = import_store3.getSnapshot();

  const [tick, setTick] = import_react_sb.useState(0);
  import_react_sb.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const [spinFrame, setSpinFrame] = import_react_sb.useState(0);
  import_react_sb.useEffect(() => {
    if (!isProcessing) return;
    const id = setInterval(() => setSpinFrame((f) => (f + 1) % SPINNER_FRAMES.length), 80);
    return () => clearInterval(id);
  }, [isProcessing]);

  const elapsed = (tick, ((Date.now() - snapshot.startTime) / 1000 / 60).toFixed(1));
  const tokStr = snapshot.totalTokens >= 1000 ? (snapshot.totalTokens / 1000).toFixed(1) + "k" : String(snapshot.totalTokens);
  const configReady = !state.needsConfig;
  const providerLabel = state.provider ? import_config3.PROVIDERS[state.provider]?.label || state.provider : "unknown";

  return /* @__PURE__ */ jsx_runtime13.jsxs("box", {
    style: { flexDirection: "row", paddingLeft: isNarrow ? 1 : 2, paddingRight: isNarrow ? 1 : 2, paddingBottom: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime13.jsx("box", {
        style: { flexGrow: 1 },
        children: /* @__PURE__ */ jsx_runtime13.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: [elapsed, "min"]
            }),
            /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " · " }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: [snapshot.turnCount, " turns"]
            }),
            !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
              children: [
                /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " · " }),
                /* @__PURE__ */ jsx_runtime13.jsxs("span", {
                  fg: import_theme13.colors.dim,
                  children: [snapshot.toolCallCount, " tools"]
                }),
                /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " · " }),
                /* @__PURE__ */ jsx_runtime13.jsxs("span", {
                  fg: import_theme13.colors.dim,
                  children: [tokStr, " tok"]
                })
              ]
            }) : null,
            /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: import_theme13.colors.dim, children: " · " }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: ["$", snapshot.totalCost.toFixed(4)]
            })
          ]
        })
      }),
      !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs("text", {
        children: [
          /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: configReady ? import_theme13.colors.green : import_theme13.colors.yellow,
            children: configReady ? "●" : "○"
          }),
          /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.dim,
            children: " "
          }),
          /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.muted,
            children: configReady ? providerLabel : "setup required"
          })
        ]
      }) : null,
      isProcessing ? /* @__PURE__ */ jsx_runtime13.jsxs("text", {
        children: [
          /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.accent,
            children: SPINNER_FRAMES[spinFrame]
          }),
          /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.accent,
            children: isNarrow ? " …" : " thinking"
          }),
          !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsx("span", {
            fg: import_theme13.colors.dim,
            children: " · Esc"
          }) : null
        ]
      }) : null
    ]
  });
}
