var import_theme5 = __toESM(require_theme(), 1);
var jsx_runtime5 = __toESM(require_jsx_runtime(), 1);

function AssistantMessage({ content, isStreaming }) {
  const { indent, isCompact, isNarrow, width } = useLayout();
  const codeIndent = isCompact ? 0 : isNarrow ? 1 : 2;
  const codeAreaWidth = Math.max(width - indent - codeIndent, 12);
  const separatorWidth = Math.min(codeAreaWidth, isCompact ? 24 : isNarrow ? 44 : 76);
  const c = import_theme5.colors;

  if (!content) return null;

  const lines = content.split("\n");
  const rendered = [];
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = "";

  function renderCodeBlock(lang, codeL, keyStr, isOpen) {
    const langLabel = lang || "code";
    const headerLabel = " " + langLabel + " ";
    const ruleLen = Math.max(separatorWidth - headerLabel.length - 3, 1);
    const ruleFill = "─".repeat(ruleLen);
    const footerFill = "─".repeat(Math.max(separatorWidth - 2, 1));

    return /* @__PURE__ */ jsx_runtime5.jsxs("box", {
      style: { flexDirection: "column", paddingLeft: codeIndent, marginTop: 1, marginBottom: 0 },
      children: [
        /* @__PURE__ */ jsx_runtime5.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.border, children: "╭─" }),
            /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.accent, attributes: TextAttributes.BOLD, children: headerLabel }),
            /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.border, children: ruleFill + (isOpen ? "" : "╮") }),
          ]
        }),
        codeL.map((cl, j2) => /* @__PURE__ */ jsx_runtime5.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.border, children: "│" }),
            /* @__PURE__ */ jsx_runtime5.jsx("span", {
              fg: c.dim,
              children: " " + String(j2 + 1).padStart(isNarrow ? 2 : 3) + "  "
            }),
            /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.text, children: cl }),
          ]
        }, j2)),
        !isOpen
          ? /* @__PURE__ */ jsx_runtime5.jsxs("text", {
              children: [
                /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.border, children: "╰" }),
                /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.border, children: footerFill + "╯" }),
              ]
            })
          : /* @__PURE__ */ jsx_runtime5.jsxs("text", {
              children: [
                /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.border, children: "│" }),
                /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.primary, children: " ▌" }),
              ]
            }),
      ]
    }, keyStr);
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```") && !inCodeBlock) {
      inCodeBlock = true;
      codeLang = line.slice(3).trim() || "code";
      codeLines = [];
    } else if (line.startsWith("```") && inCodeBlock) {
      inCodeBlock = false;
      rendered.push(renderCodeBlock(codeLang, codeLines, `code-${i}`, false));
    } else if (inCodeBlock) {
      codeLines.push(line);
    } else {
      const isHeading = /^#{1,3} /.test(line);
      if (isHeading) {
        const headingText = line.replace(/^#+\s*/, "");
        rendered.push(/* @__PURE__ */ jsx_runtime5.jsxs("text", {
          style: { marginTop: 1 },
          children: [
            /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.primary, children: "▍ " }),
            /* @__PURE__ */ jsx_runtime5.jsx("span", {
              fg: c.text,
              attributes: TextAttributes.BOLD,
              children: headingText
            }),
          ]
        }, `line-${i}`));
      } else {
        const processed = line.replace(/`([^`]+)`/g, "\xAB$1\xBB");
        if (processed.includes("\xAB")) {
          const parts = processed.split(/\xAB|\xBB/);
          rendered.push(/* @__PURE__ */ jsx_runtime5.jsx("text", {
            children: parts.map((part, j2) =>
              j2 % 2 === 0
                ? /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.text, children: part }, j2)
                : /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.accent, children: part }, j2)
            )
          }, `line-${i}`));
        } else {
          rendered.push(/* @__PURE__ */ jsx_runtime5.jsx("text", {
            children: /* @__PURE__ */ jsx_runtime5.jsx("span", { fg: c.text, children: line })
          }, `line-${i}`));
        }
      }
    }
  }

  if (inCodeBlock && codeLines.length > 0) {
    rendered.push(renderCodeBlock(codeLang, codeLines, "code-tail", true));
  }

  return /* @__PURE__ */ jsx_runtime5.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: indent },
    children: [
      rendered,
      isStreaming && !inCodeBlock ? /* @__PURE__ */ jsx_runtime5.jsx("text", {
        fg: c.primary,
        content: "▌"
      }) : null
    ]
  });
}
