// index.jsx
var import_store6 = __toESM(require_store(), 1);
var import_react17 = __toESM(require_react(), 1);
var import_react11 = __toESM(require_react(), 1);
var import_store = __toESM(require_store(), 1);
function useStore() {
  return import_react11.useSyncExternalStore(import_store.subscribe, import_store.getSnapshot);
}
var import_store5 = __toESM(require_store(), 1);
var import_config4 = __toESM(require_config(), 1);
var import_agent = __toESM(require_agent(), 1);
var import_commands = __toESM(require_commands(), 1);
var import_react13 = __toESM(require_react(), 1);
var import_theme = __toESM(require_theme(), 1);
var import_config = __toESM(require_config(), 1);
var NARROW_THRESHOLD = 60;
function useLayout() {
  const { width } = useTerminalDimensions();
  const w2 = width || 80;
  const isNarrow = w2 < NARROW_THRESHOLD;
  return {
    width: w2,
    isNarrow,
    indent: isNarrow ? 2 : 4,
    smallIndent: isNarrow ? 1 : 2
  };
}
var jsx_runtime = __toESM(require_jsx_runtime(), 1);
var path2 = __require("path");
var { execSync } = __require("child_process");
function Header() {
  const [branch, setBranch] = import_react13.useState("");
  const { isNarrow } = useLayout();
  const cwd = path2.basename(import_config.PROJECT_ROOT);
  import_react13.useEffect(() => {
    try {
      const b2 = execSync("git rev-parse --abbrev-ref HEAD 2>/dev/null", {
        encoding: "utf-8",
        cwd: import_config.PROJECT_ROOT
      }).trim();
      setBranch(b2);
    } catch {}
  }, []);
  return /* @__PURE__ */ jsx_runtime.jsx("box", {
    style: { flexDirection: "row", paddingLeft: 1, paddingRight: 1 },
    children: /* @__PURE__ */ jsx_runtime.jsxs("text", {
      children: [
        /* @__PURE__ */ jsx_runtime.jsx("span", {
          fg: import_theme.colors.primary,
          attributes: TextAttributes.BOLD,
          children: "⚡ Apex"
        }),
        /* @__PURE__ */ jsx_runtime.jsx("span", {
          fg: import_theme.colors.dim,
          children: "  "
        }),
        /* @__PURE__ */ jsx_runtime.jsx("span", {
          fg: import_theme.colors.accent,
          children: "[max]"
        }),
        /* @__PURE__ */ jsx_runtime.jsx("span", {
          fg: import_theme.colors.dim,
          children: "  "
        }),
        /* @__PURE__ */ jsx_runtime.jsx("span", {
          fg: import_theme.colors.muted,
          children: isNarrow && cwd.length > 12 ? cwd.slice(0, 12) + "…" : cwd
        }),
        branch && !isNarrow ? /* @__PURE__ */ jsx_runtime.jsxs(jsx_runtime.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime.jsx("span", {
              fg: import_theme.colors.dim,
              children: "  on "
            }),
            /* @__PURE__ */ jsx_runtime.jsx("span", {
              fg: import_theme.colors.text,
              children: branch
            })
          ]
        }) : null
      ]
    })
  });
}
var import_theme2 = __toESM(require_theme(), 1);
var jsx_runtime2 = __toESM(require_jsx_runtime(), 1);
function Divider() {
  const { width } = useLayout();
  const cols = Math.min(width, 120);
  return /* @__PURE__ */ jsx_runtime2.jsx("text", {
    fg: import_theme2.colors.dim,
    content: "─".repeat(cols)
  });
}
var import_theme11 = __toESM(require_theme(), 1);
var import_theme3 = __toESM(require_theme(), 1);
var import_config2 = __toESM(require_config(), 1);
var jsx_runtime3 = __toESM(require_jsx_runtime(), 1);
function Welcome() {
  const { isNarrow } = useLayout();
  return /* @__PURE__ */ jsx_runtime3.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: 1, marginTop: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.white,
        attributes: TextAttributes.BOLD,
        content: "How can I help?"
      }),
      /* @__PURE__ */ jsx_runtime3.jsx("text", {
        fg: import_theme3.colors.dim,
        content: isNarrow ? `Max ${import_config2.MAX_TOOL_ITERATIONS} iterations` : `Tools available · Max ${import_config2.MAX_TOOL_ITERATIONS} iterations per turn`
      })
    ]
  });
}
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
            content: `── ${codeLang} ──`
          }),
          codeLines.map((cl, j2) => /* @__PURE__ */ jsx_runtime5.jsxs("text", {
            children: [
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                fg: import_theme5.colors.dim,
                children: String(j2 + 1).padStart(isNarrow ? 2 : 3) + " │ "
              }),
              /* @__PURE__ */ jsx_runtime5.jsx("span", {
                fg: import_theme5.colors.text,
                children: cl
              })
            ]
          }, j2)),
          /* @__PURE__ */ jsx_runtime5.jsx("text", {
            fg: import_theme5.colors.dim,
            content: "─".repeat(Math.max(separatorWidth, 10))
          })
        ]
      }, `code-${i}`));
    } else if (inCodeBlock) {
      codeLines.push(line);
    } else {
      const processed = line.replace(/`([^`]+)`/g, "«$1»");
      if (processed.includes("«")) {
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
          content: `── ${codeLang} ──`
        }),
        codeLines.map((cl, j2) => /* @__PURE__ */ jsx_runtime5.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime5.jsx("span", {
              fg: import_theme5.colors.dim,
              children: String(j2 + 1).padStart(isNarrow ? 2 : 3) + " │ "
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
        content: "▊"
      }) : null
    ]
  });
}
var import_theme6 = __toESM(require_theme(), 1);
var jsx_runtime6 = __toESM(require_jsx_runtime(), 1);
function ThinkBlock({ content, expanded, onToggle }) {
  const { isNarrow, smallIndent } = useLayout();
  if (!content)
    return null;
  const lines = content.split(`
`);
  const maxPreview = isNarrow ? 2 : 4;
  const displayLines = expanded ? lines : lines.slice(0, maxPreview);
  const isTruncated = !expanded && lines.length > maxPreview;
  return /* @__PURE__ */ jsx_runtime6.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: smallIndent, marginTop: 0 },
    onMouseDown: onToggle,
    children: [
      /* @__PURE__ */ jsx_runtime6.jsx("text", {
        fg: import_theme6.colors.dim,
        attributes: TextAttributes.ITALIC,
        content: "▸ Thinking"
      }),
      displayLines.map((line, i) => line.trim() ? /* @__PURE__ */ jsx_runtime6.jsx("text", {
        fg: import_theme6.colors.dim,
        attributes: TextAttributes.ITALIC,
        style: { paddingLeft: smallIndent },
        content: line
      }, i) : null),
      isTruncated ? /* @__PURE__ */ jsx_runtime6.jsx("text", {
        fg: import_theme6.colors.dim,
        attributes: TextAttributes.ITALIC,
        style: { paddingLeft: smallIndent },
        content: isNarrow ? `+${lines.length - maxPreview} more (tap)` : `... +${lines.length - maxPreview} more lines (click to expand)`
      }) : null
    ]
  });
}
var import_theme8 = __toESM(require_theme(), 1);
var import_store2 = __toESM(require_store(), 1);
var import_react14 = __toESM(require_react(), 1);
var import_theme7 = __toESM(require_theme(), 1);
var jsx_runtime7 = __toESM(require_jsx_runtime(), 1);
var FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
function Spinner({ label }) {
  const [frame, setFrame] = import_react14.useState(0);
  const timerRef = import_react14.useRef(null);
  import_react14.useEffect(() => {
    timerRef.current = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
    }, 80);
    return () => clearInterval(timerRef.current);
  }, []);
  return /* @__PURE__ */ jsx_runtime7.jsxs("text", {
    children: [
      /* @__PURE__ */ jsx_runtime7.jsx("span", {
        fg: import_theme7.colors.accent,
        children: FRAMES[frame]
      }),
      label ? /* @__PURE__ */ jsx_runtime7.jsx("span", {
        fg: import_theme7.colors.dim,
        children: " " + label
      }) : null
    ]
  });
}
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
              children: success ? "✓" : "✗"
            }),
            isSubagent ? /* @__PURE__ */ jsx_runtime8.jsx("span", {
              fg: import_theme8.colors.dim,
              children: expanded ? " ▾" : " ▸"
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
      expanded && output ? isSubagent ? /* @__PURE__ */ jsx_runtime8.jsxs("box", {
        style: { flexDirection: "column", paddingLeft: indent, marginTop: 0, borderStyle: "single", borderColor: import_theme8.colors.border, paddingRight: 1 },
        children: [
          /* @__PURE__ */ jsx_runtime8.jsx("text", {
            fg: import_theme8.colors.dim,
            attributes: TextAttributes.ITALIC,
            style: { marginBottom: 0 },
            children: `── ${name} output ──`
          }),
          /* @__PURE__ */ jsx_runtime8.jsx("text", {
            fg: import_theme8.colors.text,
            content: output,
            wrapMode: "char"
          })
        ]
      }) : /* @__PURE__ */ jsx_runtime8.jsx("box", {
        style: { paddingLeft: indent, marginTop: 0 },
        children: /* @__PURE__ */ jsx_runtime8.jsx("text", {
          fg: import_theme8.colors.dim,
          content: truncate(output, 500),
          wrapMode: "char"
        })
      }) : null
    ]
  });
}
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
var import_theme10 = __toESM(require_theme(), 1);
var import_store3 = __toESM(require_store(), 1);
var jsx_runtime10 = __toESM(require_jsx_runtime(), 1);
function SystemMessage({ message }) {
  const { isNarrow, smallIndent } = useLayout();
  const { id, content = "", label, expanded } = message;
  if (!content)
    return null;
  const lines = content.split(`
`);
  const maxPreview = isNarrow ? 3 : 6;
  const displayLines = expanded ? lines : lines.slice(0, maxPreview);
  const isTruncated = !expanded && lines.length > maxPreview;
  return /* @__PURE__ */ jsx_runtime10.jsxs("box", {
    style: { flexDirection: "column", paddingLeft: smallIndent, marginTop: 1 },
    onMouseDown: () => import_store3.toggleMessageExpanded(id),
    children: [
      label ? /* @__PURE__ */ jsx_runtime10.jsx("text", {
        fg: import_theme10.colors.accent,
        attributes: TextAttributes.BOLD,
        content: label
      }) : null,
      displayLines.map((line, i) => /* @__PURE__ */ jsx_runtime10.jsx("text", {
        fg: import_theme10.colors.muted,
        content: line
      }, i)),
      isTruncated ? /* @__PURE__ */ jsx_runtime10.jsx("text", {
        fg: import_theme10.colors.dim,
        content: isNarrow ? `+${lines.length - maxPreview} more (tap)` : `... +${lines.length - maxPreview} more lines (click to expand)`
      }) : null
    ]
  });
}
var import_store4 = __toESM(require_store(), 1);
var jsx_runtime11 = __toESM(require_jsx_runtime(), 1);
function MessageItem({ message }) {
  const { width } = useLayout();
  switch (message.role) {
    case "user":
      return /* @__PURE__ */ jsx_runtime11.jsx(UserMessage, {
        content: message.content
      });
    case "assistant":
      return /* @__PURE__ */ jsx_runtime11.jsxs("box", {
        style: { flexDirection: "column", marginTop: 1 },
        children: [
          /* @__PURE__ */ jsx_runtime11.jsx("text", {
            fg: import_theme11.colors.primary,
            attributes: TextAttributes.BOLD,
            style: { paddingLeft: 1 },
            content: "Apex"
          }),
          /* @__PURE__ */ jsx_runtime11.jsx(AssistantMessage, {
            content: message.content
          })
        ]
      });
    case "thinking":
      return /* @__PURE__ */ jsx_runtime11.jsx(ThinkBlock, {
        content: message.content,
        expanded: message.expanded,
        onToggle: () => import_store4.toggleMessageExpanded(message.id)
      });
    case "tool":
      return /* @__PURE__ */ jsx_runtime11.jsx(ToolCallItem, {
        message
      });
    case "diff":
      return /* @__PURE__ */ jsx_runtime11.jsx(DiffView, {
        filename: message.filename,
        content: message.content
      });
    case "system":
      return /* @__PURE__ */ jsx_runtime11.jsx(SystemMessage, {
        message
      });
    case "divider":
      return /* @__PURE__ */ jsx_runtime11.jsx("text", {
        fg: import_theme11.colors.dim,
        style: { paddingLeft: 1 },
        content: "─".repeat(Math.max(width - 2, 10))
      });
    default:
      return null;
  }
}
function ChatArea({ messages, streamingContent, streamingThinking, isProcessing }) {
  const { indent } = useLayout();
  return /* @__PURE__ */ jsx_runtime11.jsx("scrollbox", {
    style: { flexGrow: 1 },
    focused: true,
    stickyScroll: true,
    stickyStart: "bottom",
    scrollY: true,
    children: /* @__PURE__ */ jsx_runtime11.jsxs("box", {
      style: { flexDirection: "column" },
      children: [
        /* @__PURE__ */ jsx_runtime11.jsx(Welcome, {}),
        messages.map((msg) => /* @__PURE__ */ jsx_runtime11.jsx(MessageItem, {
          message: msg
        }, msg.id)),
        streamingThinking ? /* @__PURE__ */ jsx_runtime11.jsx("box", {
          style: { paddingLeft: 2, marginTop: 0 },
          children: /* @__PURE__ */ jsx_runtime11.jsxs("text", {
            fg: import_theme11.colors.dim,
            attributes: TextAttributes.ITALIC,
            children: [
              /* @__PURE__ */ jsx_runtime11.jsx("span", {
                fg: import_theme11.colors.dim,
                children: "▸ Thinking: "
              }),
              /* @__PURE__ */ jsx_runtime11.jsx("span", {
                fg: import_theme11.colors.dim,
                children: streamingThinking.slice(-100)
              })
            ]
          })
        }) : null,
        streamingContent ? /* @__PURE__ */ jsx_runtime11.jsx("box", {
          style: { flexDirection: "column", marginTop: 0 },
          children: /* @__PURE__ */ jsx_runtime11.jsx(AssistantMessage, {
            content: streamingContent,
            isStreaming: true
          })
        }) : null,
        isProcessing && !streamingContent && !streamingThinking ? /* @__PURE__ */ jsx_runtime11.jsx("box", {
          style: { paddingLeft: indent, marginTop: 1 },
          children: /* @__PURE__ */ jsx_runtime11.jsx(Spinner, {
            label: "Reasoning..."
          })
        }) : null,
        /* @__PURE__ */ jsx_runtime11.jsx("box", {
          style: { height: 1 }
        })
      ]
    })
  });
}
var import_react15 = __toESM(require_react(), 1);
var import_theme12 = __toESM(require_theme(), 1);
var jsx_runtime12 = __toESM(require_jsx_runtime(), 1);
function InputBar({ disabled, onSubmit }) {
  const inputRef = import_react15.useRef(null);
  const { isNarrow } = useLayout();
  const handleSubmit = (value) => {
    const trimmed = value.trim();
    if (!trimmed)
      return;
    if (inputRef.current)
      inputRef.current.value = "";
    onSubmit(trimmed);
  };
  return /* @__PURE__ */ jsx_runtime12.jsxs("box", {
    style: { flexDirection: "column" },
    children: [
      /* @__PURE__ */ jsx_runtime12.jsx("text", {
        fg: import_theme12.colors.dim,
        style: { paddingLeft: isNarrow ? 1 : 2 },
        content: isNarrow ? "^C exit · /help" : "Ctrl+C to exit · /help for commands"
      }),
      /* @__PURE__ */ jsx_runtime12.jsxs("box", {
        style: { flexDirection: "row", paddingLeft: 1 },
        children: [
          /* @__PURE__ */ jsx_runtime12.jsx("text", {
            fg: import_theme12.colors.primary,
            content: "❯ "
          }),
          /* @__PURE__ */ jsx_runtime12.jsx("input", {
            ref: inputRef,
            focused: !disabled,
            placeholder: disabled ? "Processing..." : "Type a message...",
            onSubmit: handleSubmit,
            fg: import_theme12.colors.text,
            style: { flexGrow: 1 }
          })
        ]
      })
    ]
  });
}
var import_theme13 = __toESM(require_theme(), 1);
var import_config3 = __toESM(require_config(), 1);
var jsx_runtime13 = __toESM(require_jsx_runtime(), 1);
function StatusBar({ isProcessing }) {
  const { isNarrow } = useLayout();
  const elapsed = ((Date.now() - import_config3.session.startTime) / 1000 / 60).toFixed(1);
  return /* @__PURE__ */ jsx_runtime13.jsx("box", {
    style: { flexDirection: "row", paddingLeft: isNarrow ? 1 : 2, paddingRight: isNarrow ? 1 : 2 },
    children: /* @__PURE__ */ jsx_runtime13.jsxs("text", {
      children: [
        /* @__PURE__ */ jsx_runtime13.jsxs("span", {
          fg: import_theme13.colors.dim,
          children: [
            elapsed,
            "min"
          ]
        }),
        /* @__PURE__ */ jsx_runtime13.jsx("span", {
          fg: import_theme13.colors.dim,
          children: " · "
        }),
        /* @__PURE__ */ jsx_runtime13.jsxs("span", {
          fg: import_theme13.colors.dim,
          children: [
            import_config3.session.turnCount,
            " turns"
          ]
        }),
        !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.dim,
              children: " · "
            }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: [
                import_config3.session.toolCallCount,
                " tools"
              ]
            })
          ]
        }) : null,
        !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.dim,
              children: " · "
            }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.dim,
              children: [
                import_config3.session.totalTokens.toLocaleString(),
                " tok"
              ]
            })
          ]
        }) : null,
        /* @__PURE__ */ jsx_runtime13.jsx("span", {
          fg: import_theme13.colors.dim,
          children: " · "
        }),
        /* @__PURE__ */ jsx_runtime13.jsx("span", {
          fg: import_theme13.colors.dim,
          children: "$" + import_config3.session.totalCost.toFixed(4)
        }),
        import_config3.session.filesModified.size > 0 && !isNarrow ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.dim,
              children: " · "
            }),
            /* @__PURE__ */ jsx_runtime13.jsxs("span", {
              fg: import_theme13.colors.yellow,
              children: [
                import_config3.session.filesModified.size,
                " files modified"
              ]
            })
          ]
        }) : null,
        isProcessing ? /* @__PURE__ */ jsx_runtime13.jsxs(jsx_runtime13.Fragment, {
          children: [
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.dim,
              children: " · "
            }),
            /* @__PURE__ */ jsx_runtime13.jsx("span", {
              fg: import_theme13.colors.accent,
              children: isNarrow ? "..." : "processing"
            })
          ]
        }) : null
      ]
    })
  });
}
var import_theme14 = __toESM(require_theme(), 1);
var jsx_runtime14 = __toESM(require_jsx_runtime(), 1);
var COMMANDS = [
  { cmd: "/help", desc: "Show this menu" },
  { cmd: "/compact", desc: "Compact/summarize conversation context" },
  { cmd: "/files", desc: "Show project file tree" },
  { cmd: "/clear", desc: "Clear conversation" },
  { cmd: "/cost", desc: "Show session stats" },
  { cmd: "/undo", desc: "Undo last edit" },
  { cmd: "/diff", desc: "Show git diff" },
  { cmd: "/git <cmd>", desc: "Run a git command" },
  { cmd: "/quit", desc: "Exit" }
];
var TOOLS = [
  "Read",
  "Write",
  "Edit",
  "Patch",
  "Bash",
  "Grep",
  "Glob",
  "ListDir",
  "UndoEdit",
  "Task",
  "CodeReview"
];
var SUBAGENTS = [
  "FilePickerMax",
  "Thinker",
  "ThinkerBestOfN*",
  "EditorMultiPrompt*",
  "CodeReviewMulti*",
  "Commander",
  "ContextPruner"
];
function HelpModal({ onClose, onCommand }) {
  const { isNarrow } = useLayout();
  useKeyboard((key) => {
    if (key.name === "escape" || key.name === "q") {
      onClose();
    }
  });
  return /* @__PURE__ */ jsx_runtime14.jsxs("box", {
    zIndex: 100,
    border: true,
    borderColor: import_theme14.colors.primary,
    backgroundColor: "#0d0d1a",
    title: " Help ",
    titleAlignment: "center",
    style: {
      position: "absolute",
      top: 2,
      left: isNarrow ? 1 : 4,
      bottom: 2,
      right: isNarrow ? 1 : 4,
      padding: 1,
      flexDirection: "column"
    },
    children: [
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.white,
        attributes: TextAttributes.BOLD,
        content: "Commands"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("box", {
        style: { flexDirection: "column", marginTop: 0 },
        children: COMMANDS.map(({ cmd, desc }) => /* @__PURE__ */ jsx_runtime14.jsx("box", {
          style: { flexDirection: "row" },
          onMouseDown: () => {
            const slashCmd = cmd.split(" ")[0];
            if (onCommand && !cmd.includes("<"))
              onCommand(slashCmd);
            onClose();
          },
          children: /* @__PURE__ */ jsx_runtime14.jsxs("text", {
            children: [
              /* @__PURE__ */ jsx_runtime14.jsx("span", {
                fg: import_theme14.colors.accent,
                children: cmd.padEnd(isNarrow ? 10 : 14)
              }),
              /* @__PURE__ */ jsx_runtime14.jsx("span", {
                fg: import_theme14.colors.text,
                children: desc
              })
            ]
          })
        }, cmd))
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.white,
        attributes: TextAttributes.BOLD,
        style: { marginTop: 1 },
        content: "Tools"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.dim,
        content: TOOLS.join(", ")
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.white,
        attributes: TextAttributes.BOLD,
        style: { marginTop: 1 },
        content: "Sub-Agents"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.dim,
        content: SUBAGENTS.join(", ")
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.dim,
        content: "  * = MAX mode only"
      }),
      /* @__PURE__ */ jsx_runtime14.jsx("text", {
        fg: import_theme14.colors.dim,
        style: { marginTop: 1 },
        content: "Press ESC or q to close"
      })
    ]
  });
}
var jsx_runtime15 = __toESM(require_jsx_runtime(), 1);
function exitApp() {
  const renderer = import_store5.getRenderer();
  if (renderer)
    renderer.destroy();
  const elapsed = ((Date.now() - import_config4.session.startTime) / 1000 / 60).toFixed(1);
  const parts = [
    `${elapsed} min`,
    `${import_config4.session.turnCount} turns`,
    `${import_config4.session.toolCallCount} tool calls`,
    `${import_config4.session.totalTokens.toLocaleString()} tokens`,
    `$${import_config4.session.totalCost.toFixed(4)}`
  ];
  if (import_config4.session.filesModified.size > 0)
    parts.push(`${import_config4.session.filesModified.size} files modified`);
  if (import_config4.session.commandsRun.length > 0)
    parts.push(`${import_config4.session.commandsRun.length} commands`);
  console.log(`
  Session: ${parts.join(" · ")}
`);
  console.log(`  Goodbye! ✦
`);
  process.exit(0);
}
function App() {
  const state = useStore();
  useKeyboard((key) => {
    if (key.ctrl && key.name === "c") {
      exitApp();
    }
  });
  const handleInput = import_react17.useCallback(async (value) => {
    if (value === "exit" || value === "quit") {
      exitApp();
      return;
    }
    if (value.startsWith("/")) {
      const result = await import_commands.handleSlashCommand(value);
      if (result?.action === "quit") {
        exitApp();
      }
      return;
    }
    import_agent.handleUserInput(value).catch((err) => {
      import_store5.addMessage({ role: "system", content: `Error: ${err.message}` });
      import_store5.setState({ isProcessing: false });
    });
  }, []);
  const handleHelpCommand = import_react17.useCallback((cmd) => {
    if (cmd) {
      import_commands.handleSlashCommand(cmd).then((result) => {
        if (result?.action === "quit")
          exitApp();
      });
    }
  }, []);
  return /* @__PURE__ */ jsx_runtime15.jsxs("box", {
    style: { flexDirection: "column", flexGrow: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime15.jsx(Header, {}),
      /* @__PURE__ */ jsx_runtime15.jsx(Divider, {}),
      /* @__PURE__ */ jsx_runtime15.jsx(ChatArea, {
        messages: state.messages,
        streamingContent: state.streamingContent,
        streamingThinking: state.streamingThinking,
        isProcessing: state.isProcessing
      }),
      /* @__PURE__ */ jsx_runtime15.jsx(Divider, {}),
      /* @__PURE__ */ jsx_runtime15.jsx(StatusBar, {
        isProcessing: state.isProcessing
      }),
      /* @__PURE__ */ jsx_runtime15.jsx(InputBar, {
        disabled: state.isProcessing || state.showHelp,
        onSubmit: handleInput
      }),
      state.showHelp ? /* @__PURE__ */ jsx_runtime15.jsx(HelpModal, {
        onClose: () => import_store5.setState({ showHelp: false }),
        onCommand: handleHelpCommand
      }) : null
    ]
  });
}
var jsx_runtime16 = __toESM(require_jsx_runtime(), 1);
async function main2() {
  if (process.env.APEX_LOCAL_SERVER === "1") {
    const { startServer } = await Promise.resolve().then(() => __toESM(require_server(), 1));
    await startServer();
  }
  const renderer = await createCliRenderer({
    useAlternateScreen: true,
    exitOnCtrlC: false,
    useMouse: true
  });
  import_store6.setRenderer(renderer);
  const root = createRoot(renderer);
  root.render(/* @__PURE__ */ jsx_runtime16.jsx(App, {}));
  renderer.start();
}
main2().catch((err) => {
  console.error("Failed to start Apex:", err);
  process.exit(1);
});
