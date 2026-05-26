var import_theme4 = __toESM(require_theme(), 1);
var jsx_runtime4 = __toESM(require_jsx_runtime(), 1);
function UserMessage({ content }) {
  return /* @__PURE__ */ jsx_runtime4.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: 1, marginTop: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime4.jsx("text", {
        fg: import_theme4.colors.blue,
        attributes: TextAttributes.BOLD,
        content: "You"
      }),
      /* @__PURE__ */ jsx_runtime4.jsx("text", {
        fg: import_theme4.colors.text,
        content: content || ""
      })
    ]
  });
}

