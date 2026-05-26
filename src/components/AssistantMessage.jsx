var import_theme5 = __toESM(require_theme(), 1);
var jsx_runtime5 = __toESM(require_jsx_runtime(), 1);
function AssistantMessage({ content, isStreaming }) {
  const { indent, isNarrow, width } = useLayout();
  const codeIndent = isNarrow ? 1 : 2;
  const separatorWidth = Math.min(width - indent - codeIndent, isNarrow ? 40 : 60);
  if (!content)
    return null;
  const lines = content.split(`
`);
  const rendered = [];
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = "";
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```") && !inCodeBlock) {
      inCodeBlock = true;
      codeLang = line.slice(3).trim() || "code";
      codeLines = [];
    } else if (line.startsWith("```") && inCodeBlock) {
      inCodeBlock = false;
      rendered.push(/* @__PURE__ */ jsx_runtime5.jsxs("box", {
        style: { flexDirection: "column", paddingLeft: codeIndent, marginTop: 0 },
        children: [
          /* @__PURE__ */ jsx_runtime5.jsx("text", {
            fg: import_theme5.colors.dim,
            content: `\u2500\u2500 ${codeLang} \u2500\u2500`
          }),
          codeLines.map((cl, j2) => /* @__PURE__ */ jsx_runtime5.jsxs("text", {
            children: [
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                fg: import_theme5.colors.dim,
                children: String(j2 + 1).padStart(isNarrow ? 2 : 3) + " \u2502 "
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                fg: import_theme5.colors.text,
                children: cl
              })
            ]
          }, j2)),
          /* @__PURE__ */ jsx_runtime5.jsx("text", {
            fg: import_theme5.colors.dim,
            content: "\u2500".repeat(Math.max(separatorWidth, 10))
          })
        ]
      }, `code-${i}`));
    } else if (inCodeBlock) {
      codeLines.push(line);
    } else {
      const processed = line.replace(/`([^`]+)`/g, "\xAB$1\xBB");
      if (processed.includes("\xAB")) {
        const parts = processed.split(/\u00AB|\u00BB/);
        rendered.push(/* @__PURE__ */ jsx_runtime5.jsx("text", {
          children: parts.map((part, j2) => j2 % 2 === 0 ? /* @__PURE__ */ jsx_runtime5.jsx("span", {
            fg: import_theme5.colors.text,
            children: part
          }, j2) : /* @__PURE__ */ jsx_runtime5.jsx("span", {
            fg: import_theme5.colors.cyan,
            children: part
          }, j2))
        }, `line-${i}`));
      } else {
        rendered.push(/* @__PURE__ */ jsx_runtime5.jsx("text", {
          children: /* @__PURE__ */ jsx_runtime5.jsx("span", {
            fg: import_theme5.colors.text,
            children: line
          })
        }, `line-${i}`));
      }
    }
  }
  if (inCodeBlock && codeLines.length > 0) {
    rendered.push(/* @__PURE__ */ jsx_runtime5.jsxs("box", {
      style: { flexDirection: "column", paddingLeft: codeIndent },
      children: [
        /* @__PURE__ */ jsx_runtime5.jsx("text", {
          fg: import_theme5.colors.dim,
          content: `\u2500\u2500 ${codeLang} \u2500\u2500`
        }),
        codeLines.map((cl, j2) => /* @__PURE__ */ jsx_runtime5.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime5.jsx("span", {
              fg: import_theme5.colors.dim,
              children: String(j2 + 1).padStart(isNarrow ? 2 : 3) + " \u2502 "
            }),
            /* @__PURE__ */ jsx_runtime5.jsx("span", {
              fg: import_theme5.colors.text,
              children: cl
            })
          ]
        }, j2))
      ]
    }, "code-tail"));
  }
  return /* @__PURE__ */ jsx_runtime5.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: indent },
    children: [
      rendered,
      isStreaming ? /* @__PURE__ */ jsx_runtime5.jsx("text", {
        fg: import_theme5.colors.accent,
        content: "\u258A"
      }) : null
    ]
  });
}

