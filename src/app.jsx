var import_react17 = __toESM(require_react(), 1);

var import_store5 = __toESM(require_store(), 1);
var import_config4 = __toESM(require_config(), 1);
var import_agent = __toESM(require_agent(), 1);
var import_commands = __toESM(require_commands(), 1);

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
  Session: ${parts.join(" \xB7 ")}
`);
  console.log(`  Goodbye! \u2726
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
  const showConfig = state.needsConfig || process.env.APEX_DEV_NEEDS_CONFIG === "true";
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
        disabled: state.isProcessing || state.showHelp || state.needsConfig,
        onSubmit: handleInput
      }),
      state.showHelp ? /* @__PURE__ */ jsx_runtime15.jsx(HelpModal, {
        onClose: () => import_store5.setState({ showHelp: false }),
        onCommand: handleHelpCommand
      }) : null,
      showConfig ? /* @__PURE__ */ jsx_runtime15.jsx(globalThis._ApiKeyModal, {}) : null,
      state.needsConfig ? /* @__PURE__ */ jsx_runtime15.jsx(globalThis._ProviderSelector, {}) : null
    ]
  });
}

globalThis._App = App;