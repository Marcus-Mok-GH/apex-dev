var import_theme4 = __toESM(require_theme(), 1);
var jsx_runtime4 = __toESM(require_jsx_runtime(), 1);

function UserMessage({ content }) {
  const { indent } = useLayout();
  const msgLines = (content || "").split("\n");

  return /* @__PURE__ */ jsx_runtime4.jsxs("box", {
    style: { flexDirection: "row", marginTop: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime4.jsx("text", {
        fg: import_theme4.colors.primary,
        content: "▎"
      }),
      /* @__PURE__ */ jsx_runtime4.jsxs("box", {
        style: { flexDirection: "column", paddingLeft: 1 },
        children: [
          /* @__PURE__ */ jsx_runtime4.jsx("text", {
            fg: import_theme4.colors.primary,
            attributes: TextAttributes.BOLD,
            content: "you"
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
