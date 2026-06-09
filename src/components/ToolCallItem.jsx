var import_theme8 = __toESM(require_theme(), 1);
var import_store2 = __toESM(require_store(), 1);

var jsx_runtime8 = __toESM(require_jsx_runtime(), 1);
var SUBAGENT_TOOLS = new Set([
  "FilePickerMax",
  "Thinker",
  "ThinkerBestOfN",
  "EditorMultiPrompt",
  "CodeReview",
  "CodeReviewMulti",
  "Commander",
  "ContextPruner",
  "ResearcherWeb",
  "ResearcherDocs",
  "GeneralAgent"
]);
function formatElapsed(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}
function truncate(str, len) {
  const ELLIPSIS = "…";
  return str.length > len ? str.slice(0, len - ELLIPSIS.length) + ELLIPSIS : str;
}
function ToolCallItem({ message }) {
  const { indent, isNarrow } = useLayout();
  const truncLen = isNarrow ? 32 : 60;
  const { id, name, detail, status, success, elapsed, output, expanded } = message;
  const isRunning = status === "running" || status === "pending";
  const isSubagent = SUBAGENT_TOOLS.has(name);
  const c = import_theme8.colors;

  return /* @__PURE__ */ jsx_runtime8.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: indent },
    onMouseDown: () => import_store2.toggleMessageExpanded(id),
    children: [
      /* @__PURE__ */ jsx_runtime8.jsx("box", {
        style: { flexDirection: "row" },
        children: isRunning
          ? /* @__PURE__ */ jsx_runtime8.jsxs("text", {
              children: [
                /* @__PURE__ */ jsx_runtime8.jsx(Spinner, {}),
                /* @__PURE__ */ jsx_runtime8.jsx("span", {
                  fg: c.accent,
                  attributes: TextAttributes.BOLD,
                  children: " " + name
                }),
                /* @__PURE__ */ jsx_runtime8.jsx("span", {
                  fg: c.dim,
                  children: detail ? "  " + truncate(detail, truncLen) : ""
                }),
              ]
            })
          : /* @__PURE__ */ jsx_runtime8.jsxs("text", {
              children: [
                /* @__PURE__ */ jsx_runtime8.jsx("span", {
                  fg: success ? c.green : c.red,
                  children: success ? "✓" : "✗"
                }),
                /* @__PURE__ */ jsx_runtime8.jsx("span", { fg: c.border, children: "  " }),
                /* @__PURE__ */ jsx_runtime8.jsx("span", {
                  fg: c.blue,
                  attributes: TextAttributes.BOLD,
                  children: name
                }),
                detail ? /* @__PURE__ */ jsx_runtime8.jsx("span", {
                  fg: c.muted,
                  children: "  " + truncate(detail, truncLen)
                }) : null,
                elapsed != null ? /* @__PURE__ */ jsx_runtime8.jsx("span", {
                  fg: c.dim,
                  children: "  [" + formatElapsed(elapsed) + "]"
                }) : null,
                isSubagent ? /* @__PURE__ */ jsx_runtime8.jsx("span", {
                  fg: c.dim,
                  children: expanded ? "  ▾" : "  ▸"
                }) : null
              ]
            })
      }),
      expanded && output ? (() => {
        const lines = output.split("\n");
        const maxLines = 20;
        const isTruncated = lines.length > maxLines;
        const displayOutput = isTruncated ? lines.slice(0, maxLines).join("\n") + "\n…" : output;

        return /* @__PURE__ */ jsx_runtime8.jsxs("box", {
          style: { flexDirection: "column", paddingLeft: 3, marginTop: 0 },
          children: [
            /* @__PURE__ */ jsx_runtime8.jsx("text", {
              fg: c.border,
              content: "┄".repeat(36)
            }),
            isTruncated ? /* @__PURE__ */ jsx_runtime8.jsx("text", {
              fg: c.dim,
              content: `${lines.length} lines — showing first ${maxLines}`,
            }) : null,
            /* @__PURE__ */ jsx_runtime8.jsx("text", {
              fg: c.muted,
              content: displayOutput,
              wrapMode: "char"
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("text", {
              fg: c.border,
              content: "┄".repeat(36)
            }),
          ]
        });
      })() : null
    ]
  });
}
