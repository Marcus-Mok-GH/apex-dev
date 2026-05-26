var import_theme9 = __toESM(require_theme(), 1);
var jsx_runtime9 = __toESM(require_jsx_runtime(), 1);
var path3 = __require("path");
function DiffView({ filename, content }) {
  const { indent } = useLayout();
  if (!content)
    return null;
  const lines = content.split(`
`);
  return /* @__PURE__ */ jsx_runtime9.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: indent },
    children: [
      /* @__PURE__ */ jsx_runtime9.jsx("text", {
        fg: import_theme9.colors.text,
        attributes: TextAttributes.BOLD,
        content: path3.basename(filename || "")
      }),
      lines.map((line, i) => {
        if (line.startsWith("+")) {
          return /* @__PURE__ */ jsx_runtime9.jsx("text", {
            fg: import_theme9.colors.green,
            content: line
          }, i);
        }
        if (line.startsWith("-")) {
          return /* @__PURE__ */ jsx_runtime9.jsx("text", {
            fg: import_theme9.colors.red,
            content: line
          }, i);
        }
        return null;
      })
    ]
  });
}

