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
  return str.length > len ? str.slice(0, len - 3) + "..." : str;
}
function ToolCallItem({ message }) {
  const { indent, isNarrow } = useLayout();
  const truncLen = isNarrow ? 32 : 56;
  const { id, name, detail, status, success, elapsed, output, expanded } = message;
  const isRunning = status === "running" || status === "pending";
  const isSubagent = SUBAGENT_TOOLS.has(name);
  return /* @__PURE__ */ jsx_runtime8.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: indent },
    onMouseDown: () => import_store2.toggleMessageExpanded(id),
    children: [
      /* @__PURE__ */ jsx_runtime8.jsx("box", {
        style: { flexDirection: "row" },
        children: isRunning ? /* @__PURE__ */ jsx_runtime8.jsx(Spinner, {
          label: `${name}  ${truncate(detail || "…", truncLen)}`
        }) : /* @__PURE__ */ jsx_runtime8.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: success ? import_theme8.colors.green : import_theme8.colors.red,
              children: success ? "\u2713" : "\u2717"
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: "  "
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.accent,
              attributes: TextAttributes.BOLD,
              children: name
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.muted,
              children: "  " + truncate(detail || "", truncLen)
            }),
            elapsed != null ? /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: "  " + formatElapsed(elapsed)
            }) : null,
            isSubagent ? /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
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
          style: { flexDirection: "column", paddingLeft: 2, marginTop: 0 },
          children: [
            /* @__PURE__ */ jsx_runtime8.jsx("text", {
              fg: import_theme8.colors.border,
              content: "\u2500".repeat(36)
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("text", {
              fg: import_theme8.colors.dim,
              content: isTruncated ? `${lines.length} lines — showing first ${maxLines}` : "",
              style: { marginBottom: 0 }
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("text", {
              fg: import_theme8.colors.muted,
              content: displayOutput,
              wrapMode: "char"
            })
          ]
        });
      })() : null
    ]
  });
}
