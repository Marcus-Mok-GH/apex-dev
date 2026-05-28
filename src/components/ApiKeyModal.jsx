var import_react = __toESM(require_react(), 1);
var import_theme = __toESM(require_theme(), 1);
var import_store = __toESM(require_store(), 1);
var import_config = __toESM(require_config(), 1);
var jsx_runtime = __toESM(require_jsx_runtime(), 1);

function ApiKeyModal() {
  const [input, setInput] = import_react.useState("");
  const { width, height } = useLayout();
  
  const handleSubmit = () => {
    if (input.trim()) {
      import_config.setApiKey(input.trim());
      import_store.setState({ apiKey: input.trim(), needsConfig: false });
    }
  };

  const handleKeyPress = (key) => {
    if (key.name === "return" || key.name === "enter") {
      handleSubmit();
    }
  };

  const modalWidth = Math.min(60, width - 4);
  const modalHeight = 10;
  const left = Math.floor((width - modalWidth) / 2);
  const top = Math.floor((height - modalHeight) / 2);

  return /* @__PURE__ */ jsx_runtime.jsx("box", {
    style: {
      position: "absolute",
      left,
      top,
      width: modalWidth,
      height: modalHeight,
      borderStyle: "round",
      borderColor: import_theme.colors.primary,
      paddingLeft: 2,
      paddingRight: 2,
      paddingTop: 1,
      flexDirection: "column"
    },
    children: /* @__PURE__ */ jsx_runtime.jsxs(jsx_runtime.Fragment, {
      children: [
        /* @__PURE__ */ jsx_runtime.jsx("text", {
          style: { marginBottom: 1 },
          attributes: TextAttributes.BOLD,
          fg: import_theme.colors.primary,
          children: "Fireworks AI API Key Required"
        }),
        /* @__PURE__ */ jsx_runtime.jsx("text", {
          style: { marginBottom: 1 },
          children: "Please enter your API key to start using Apex:"
        }),
        /* @__PURE__ */ jsx_runtime.jsx("box", {
          style: {
            borderStyle: "single",
            borderColor: import_theme.colors.dim,
            paddingLeft: 1,
            paddingRight: 1,
            marginBottom: 1
          },
          children: /* @__PURE__ */ jsx_runtime.jsx("input", {
            focused: true,
            value: input,
            onChange: setInput,
            onKeyPress: handleKeyPress,
            onSubmit: handleSubmit,
            placeholder: "Paste your API key here...",
            mask: "*",
            fg: import_theme.colors.text
          })
        }),
        /* @__PURE__ */ jsx_runtime.jsx("text", {
          fg: import_theme.colors.dim,
          children: "Press Enter to confirm"
        })
      ]
    })
  });
}

globalThis._ApiKeyModal = ApiKeyModal;
