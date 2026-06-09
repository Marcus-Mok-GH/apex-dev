var import_theme4 = __toESM(require_theme(), 1);
var jsx_runtime4 = __toESM(require_jsx_runtime(), 1);

function UserMessage({ content }) {
  const { indent } = useLayout();
  const c = import_theme4.colors;
  const msgLines = (content || "").split("\n");

  return /* @__PURE__ */ jsx_runtime4.jsxs("box", {
    style: { flexDirection: "row", marginTop: 1, paddingLeft: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime4.jsx("text", {
        fg: c.primary,
        content: "┃"
      }),
      /* @__PURE__ */ jsx_runtime4.jsxs("box", {
        style: { flexDirection: "column", paddingLeft: 2 },
        children: [
          /* @__PURE__ */ jsx_runtime4.jsxs("text", {
            children: [
              /* @__PURE__ */ jsx_runtime4.jsx("span", {
                fg: c.blue,
                attributes: TextAttributes.BOLD,
                children: "you"
              }),
            ]
          }),
          msgLines.map((line, i) => /* @__PURE__ */ jsx_runtime4.jsx("text", {
            fg: c.text,
            content: line
          }, i))
        ]
      })
    ]
  });
}
