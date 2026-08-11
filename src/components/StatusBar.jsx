var import_react_sb = __toESM(require_react(), 1);
var import_theme13 = __toESM(require_theme(), 1);
var import_config3 = __toESM(require_config(), 1);
var import_store3 = __toESM(require_store(), 1);
var jsx_runtime13 = __toESM(require_jsx_runtime(), 1);

var SB_SPINNER_FRAMES = import_theme13.SPINNER_FRAMES;

function StatusBar({ isProcessing }) {
  const { isNarrow } = useLayout();
  const snapshot = import_config3.session;
  const state = import_store3.getSnapshot();
  const c = import_theme13.colors;

  const [tick, setTick] = import_react_sb.useState(0);
  import_react_sb.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const [spinFrame, setSpinFrame] = import_react_sb.useState(0);
  import_react_sb.useEffect(() => {
    if (!isProcessing) return;
    const id = setInterval(() => setSpinFrame((f) => (f + 1) % SB_SPINNER_FRAMES.length), 100);
    return () => clearInterval(id);
  }, [isProcessing]);

  const elapsed = ((Date.now() - snapshot.startTime) / 1000 / 60).toFixed(1);
  const tokStr = snapshot.totalTokens >= 1000
    ? (snapshot.totalTokens / 1000).toFixed(1) + "k"
    : String(snapshot.totalTokens);
  const providerLabel = state.provider
    ? import_config3.PROVIDERS[state.provider]?.label || state.provider
    : "unknown";

  const sep = /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: c.borderStrong, children: "  ·  " });

  return /* @__PURE__ */ jsx_runtime13.jsxs("box", {
    style: { flexDirection: "row", paddingLeft: 2, paddingRight: 2, paddingTop: 1, paddingBottom: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime13.jsx("box", {
        style: { flexGrow: 1 },
        children: isProcessing
          ? /* @__PURE__ */ jsx_runtime13.jsxs("text", {
              children: [
                /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: c.primary, attributes: TextAttributes.BOLD, children: SB_SPINNER_FRAMES[spinFrame] }),
                /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: c.blue, attributes: TextAttributes.BOLD, children: "  working" }),
                !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: c.dim, children: "  ·  esc to cancel" }) : null
              ]
            })
          : /* @__PURE__ */ jsx_runtime13.jsxs("text", {
              children: [
                /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: c.muted, children: elapsed + "m" }),
                sep,
                /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: c.muted, children: snapshot.turnCount + " turn" + (snapshot.turnCount !== 1 ? "s" : "") }),
                !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
                  children: [
                    sep,
                    /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: c.muted, children: tokStr + " tok" }),
                    sep,
                    /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: c.muted, children: "$" + snapshot.totalCost.toFixed(4) })
                  ]
                }) : null
              ]
            })
      }),
      !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs("text", {
        children: [
          /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: c.dim, children: providerLabel }),
          /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: c.borderStrong, children: "  " }),
          /* @__PURE__ */ jsx_runtime13.jsx("span", { fg: isProcessing ? c.yellow : c.green, children: isProcessing ? "◉" : "●" })
        ]
      }) : null
    ]
  });
}
