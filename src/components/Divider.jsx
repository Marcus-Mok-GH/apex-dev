var import_theme2 = __toESM(require_theme(), 1);
var jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function Divider() {
  const { width } = useLayout();
  const cols = Math.min(width - 4, 120);
  return /* @__PURE__ */ jsx_runtime2.jsx("text", {
    fg: import_theme2.colors.border,
    style: { paddingLeft: 2, paddingRight: 2 },
    content: "·  ".repeat(Math.max(Math.floor(cols / 3), 8))
  });
}
