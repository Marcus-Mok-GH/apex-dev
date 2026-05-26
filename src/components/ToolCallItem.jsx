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
  const truncLen = isNarrow ? 30 : 50;
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
          label: `[${name}] ${truncate(detail || "...", truncLen)}`
        }) : /* @__PURE__ */ jsx_runtime8.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: success ? import_theme8.colors.green : import_theme8.colors.red,
              children: success ? "\u2713" : "\u2717"
            }),
            isSubagent ? /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: expanded ? " \u25BE" : " \u25B8"
            }) : null,
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: " ["
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.accent,
              children: name
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: "] "
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: truncate(detail || "", truncLen)
            }),
            elapsed != null ? /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: "  " + formatElapsed(elapsed)
            }) : null
          ]
        })
      }),
      expanded && output ? (() => {
        const lines = output.split("\n");
        const maxLines = 20;
        const isTruncated = lines.length > maxLines;
        const displayOutput = isTruncated ? lines.slice(0, maxLines).join("\n") + "\n..." : output;
        
        return isSubagent ? /* @__PURE__ */ jsx_runtime8.jsxs("box", {
          style: { flexDirection: "column", paddingLeft: indent, marginTop: 0, borderStyle: "single", borderColor: import_theme8.colors.border, paddingRight: 1 },
          children: [
            /* @__PURE__ */ jsx_runtime8.jsx("text", {
              fg: import_theme8.colors.dim,
              attributes: TextAttributes.ITALIC,
              style: { marginBottom: 0 },
              children: `\u2500\u2500 ${name} output ${isTruncated ? `(${lines.length} lines, showing ${maxLines})` : ""} \u2500\u2500`
            }),
            /* @__PURE__ */ jsx_runtime8.jsx("text", {
              fg: import_theme8.colors.text,
              content: displayOutput,
              wrapMode: "char"
            })
          ]
        }) : /* @__PURE__ */ jsx_runtime8.jsx("box", {
          style: { paddingLeft: indent, marginTop: 0 },
          children: /* @__PURE__ */ jsx_runtime8.jsx("text", {
            fg: import_theme8.colors.dim,
            content: truncate(displayOutput, 1000),
            wrapMode: "char"
          })
        });
      })() : null
    ]
  });
}

