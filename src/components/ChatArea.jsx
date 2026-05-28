var import_react = __toESM(require_react(), 1);
var import_theme11 = __toESM(require_theme(), 1);

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
  const renderedMessages = import_react.useMemo(() =>
    messages.map((msg) => /* @__PURE__ */ jsx_runtime11.jsx(MessageItem, {
      message: msg
    }, msg.id)),
    [messages]
  );

  return /* @__PURE__ */ jsx_runtime11.jsx("scrollbox", {
    style: { flexGrow: 1 },
    focused: true,
    stickyScroll: true,
    stickyStart: "bottom",
    scrollY: true,
    key: "main-chat-scroll",
    children: /* @__PURE__ */ jsx_runtime11.jsxs("box", {
      style: { flexDirection: "column" },
      children: [
        /* @__PURE__ */ jsx_runtime11.jsx(Welcome, {}),
        renderedMessages,
        // Thinking preview while streaming — show last 200 chars with a cleaner indicator
        streamingThinking ? /* @__PURE__ */ jsx_runtime11.jsxs("box", {
          style: { paddingLeft: indent, marginTop: 1 },
          children: [
            /* @__PURE__ */ jsx_runtime11.jsxs("text", {
              children: [
                /* @__PURE__ */ jsx_runtime11.jsx("span", {
                  fg: import_theme11.colors.accent,
                  attributes: TextAttributes.ITALIC,
                  children: "◆ "
                }),
                /* @__PURE__ */ jsx_runtime11.jsx("span", {
                  fg: import_theme11.colors.dim,
                  attributes: TextAttributes.ITALIC,
                  children: "thinking"
                })
              ]
            }),
            /* @__PURE__ */ jsx_runtime11.jsx("text", {
              fg: import_theme11.colors.dim,
              attributes: TextAttributes.ITALIC,
              style: { paddingLeft: 2 },
              content: streamingThinking.slice(-200)
            })
          ]
        }) : null,
        // Streaming response — show "Apex" label for visual consistency with committed messages
        streamingContent ? /* @__PURE__ */ jsx_runtime11.jsxs("box", {
          style: { flexDirection: "column", marginTop: 1 },
          children: [
            /* @__PURE__ */ jsx_runtime11.jsx("text", {
              fg: import_theme11.colors.primary,
              attributes: TextAttributes.BOLD,
              style: { paddingLeft: 1 },
              content: "Apex"
            }),
            /* @__PURE__ */ jsx_runtime11.jsx(AssistantMessage, {
              content: streamingContent,
              isStreaming: true
            })
          ]
        }) : null,
        // Idle processing state — spinner while waiting for first token
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
