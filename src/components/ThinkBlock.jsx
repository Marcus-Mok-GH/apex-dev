var import_theme6 = __toESM(require_theme(), 1);
var jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
function ThinkBlock({ content, expanded, onToggle }) {
  const { isNarrow, smallIndent } = useLayout();
  if (!content)
    return null;
  const lines = content.split(`
`);
  const maxPreview = isNarrow ? 2 : 4;
  const displayLines = expanded ? lines : lines.slice(0, maxPreview);
  const isTruncated = !expanded && lines.length > maxPreview;
  return /* @__PURE__ */ jsx_runtime6.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: smallIndent, marginTop: 0 },
    onMouseDown: onToggle,
    children: [
      /* @__PURE__ */ jsx_runtime6.jsx("text", {
        fg: import_theme6.colors.dim,
        attributes: TextAttributes.ITALIC,
        content: "\u25B8 Thinking"
      }),
      displayLines.map((line, i) => line.trim() ? /* @__PURE__ */ jsx_runtime6.jsx("text", {
        fg: import_theme6.colors.dim,
        attributes: TextAttributes.ITALIC,
        style: { paddingLeft: smallIndent },
        content: line
      }, i) : null),
      isTruncated ? /* @__PURE__ */ jsx_runtime6.jsx("text", {
        fg: import_theme6.colors.dim,
        attributes: TextAttributes.ITALIC,
        style: { paddingLeft: smallIndent },
        content: isNarrow ? `+${lines.length - maxPreview} more (tap)` : `... +${lines.length - maxPreview} more lines (click to expand)`
      }) : null
    ]
  });
}

