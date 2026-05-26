var import_react14 = __toESM(require_react(), 1);
var import_theme7 = __toESM(require_theme(), 1);
var jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
var FRAMES = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
function Spinner({ label }) {
  const [frame, setFrame] = import_react14.useState(0);
  const timerRef = import_react14.useRef(null);
  import_react14.useEffect(() => {
    timerRef.current = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
    }, 80);
    return () => clearInterval(timerRef.current);
  }, []);
  return /* @__PURE__ */ jsx_runtime7.jsxs("text", {
    children: [
      /* @__PURE__ */ jsx_runtime7.jsx("span", {
        fg: import_theme7.colors.accent,
        children: FRAMES[frame]
      }),
      label ? /* @__PURE__ */ jsx_runtime7.jsx("span", {
        fg: import_theme7.colors.dim,
        children: " " + label
      }) : null
    ]
  });
}

