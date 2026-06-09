var import_react14 = __toESM(require_react(), 1);
var import_theme7 = __toESM(require_theme(), 1);
var jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
// Elegant arc spinner — matches codebuff's clean aesthetic
var FRAMES = ["◜", "◠", "◝", "◞", "◡", "◟"];
function Spinner({ label }) {
  const [frame, setFrame] = import_react14.useState(0);
  const timerRef = import_react14.useRef(null);
  import_react14.useEffect(() => {
    timerRef.current = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
    }, 100);
    return () => clearInterval(timerRef.current);
  }, []);
  return /* @__PURE__ */ jsx_runtime7.jsxs("text", {
    children: [
      /* @__PURE__ */ jsx_runtime7.jsx("span", {
        fg: import_theme7.colors.primary,
        attributes: TextAttributes.BOLD,
        children: FRAMES[frame]
      }),
      label ? /* @__PURE__ */ jsx_runtime7.jsx("span", {
        fg: import_theme7.colors.muted,
        children: " " + label
      }) : null
    ]
  });
}

