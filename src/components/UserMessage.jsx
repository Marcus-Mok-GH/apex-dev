var import_theme4 = __toESM(require_theme(), 1);
var jsx_runtime4 = __toESM(require_jsx_runtime(), 1);

function UserMessage({ content }) {
  const { indent } = useLayout();
  const msgLines = (content || "").split("\n");

  return /* @__PURE__ */ jsx_runtime4.jsxs("box", {
    style: { flexDirection: "row", marginTop: 1 },
    children: [
      // Left accent bar (Codebuff-style visual anchor)
      /* @__PURE__ */ jsx_runtime4.jsx("text", {
        fg: import_theme4.colors.blue,
        content: "▎"
      }),
      /* @__PURE__ */ jsx_runtime4.jsxs("box", {
        style: { flexDirection: "column", paddingLeft: 1 },
        children: [
          /* @__PURE__ */ jsx_runtime4.jsx("text", {
            fg: import_theme4.colors.blue,
            attributes: TextAttributes.BOLD,
            content: "You"
          }),
          msgLines.map((line, i) => /* @__PURE__ */ jsx_runtime4.jsx("text", {
            fg: import_theme4.colors.text,
            content: line
          }, i))
        ]
      })
    ]
  });
}
