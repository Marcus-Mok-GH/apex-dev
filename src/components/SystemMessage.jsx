var import_theme10 = __toESM(require_theme(), 1);
var import_store3 = __toESM(require_store(), 1);
var jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
function SystemMessage({ message }) {
  const { isNarrow, smallIndent } = useLayout();
  const { id, content = "", label, expanded } = message;
  if (!content)
    return null;
  const lines = content.split(`
`);
  const maxPreview = isNarrow ? 3 : 6;
  const displayLines = expanded ? lines : lines.slice(0, maxPreview);
  const isTruncated = !expanded && lines.length > maxPreview;
  return /* @__PURE__ */ jsx_runtime10.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: smallIndent, marginTop: 1 },
    onMouseDown: () => import_store3.toggleMessageExpanded(id),
    children: [
      label ? /* @__PURE__ */ jsx_runtime10.jsx("text", {
        fg: import_theme10.colors.accent,
        attributes: TextAttributes.BOLD,
        content: label
      }) : null,
      displayLines.map((line, i) => /* @__PURE__ */ jsx_runtime10.jsx("text", {
        fg: import_theme10.colors.muted,
        content: line
      }, i)),
      isTruncated ? /* @__PURE__ */ jsx_runtime10.jsx("text", {
        fg: import_theme10.colors.dim,
        content: isNarrow ? `+${lines.length - maxPreview} more (tap)` : `... +${lines.length - maxPreview} more lines (click to expand)`
      }) : null
    ]
  });
}

