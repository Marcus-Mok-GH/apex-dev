var import_react = __toESM(require_react(), 1);
var import_theme = __toESM(require_theme(), 1);
var import_store = __toESM(require_store(), 1);
var import_config = __toESM(require_config(), 1);
var import_useLayout = __toESM(require_useLayout(), 1);
var jsx_runtime = __toESM(require_jsx_runtime(), 1);

var PROVIDER_ORDER = ["fireworks", "openai", "openrouter", "groq", "gemini", "together"];

function ApiKeyModal() {
  var [input, setInput] = import_react.useState("");
  var [selectedIdx, setSelectedIdx] = import_react.useState(0);
  var [step, setStep] = import_react.useState("provider"); // "provider" | "key"
  var { width, height } = import_useLayout.useLayout();

  var providers = import_config.PROVIDERS;
  var providerKey = PROVIDER_ORDER[selectedIdx];
  var provider = providers[providerKey];

  var handleKeyPress = function(key) {
    if (step === "provider") {
      if (key.name === "up" || key.name === "k") {
        setSelectedIdx(function(i) { return (i - 1 + PROVIDER_ORDER.length) % PROVIDER_ORDER.length; });
      } else if (key.name === "down" || key.name === "j") {
        setSelectedIdx(function(i) { return (i + 1) % PROVIDER_ORDER.length; });
      } else if (key.name === "return" || key.name === "enter") {
        setStep("key");
      }
    } else {
      if (key.name === "escape") {
        setStep("provider");
        setInput("");
      } else if (key.name === "return" || key.name === "enter") {
        handleSubmit();
      }
    }
  };

  var handleSubmit = function() {
    var key = input.trim();
    if (!key) return;
    import_config.setProvider(providerKey, key);
    import_store.setState({ apiKey: key, provider: providerKey, needsConfig: false });
  };

  var modalWidth = Math.min(62, width - 4);
  var modalHeight = step === "provider" ? PROVIDER_ORDER.length + 6 : 10;
  var left = Math.floor((width - modalWidth) / 2);
  var top = Math.floor((height - modalHeight) / 2);

  var renderProviderStep = function() {
    return jsx_runtime.jsxs(jsx_runtime.Fragment, {
      children: [
        jsx_runtime.jsx("text", {
          style: { marginBottom: 1 },
          attributes: TextAttributes.BOLD,
          fg: import_theme.colors.primary,
          children: "Select AI Provider"
        }),
        jsx_runtime.jsx("text", {
          style: { marginBottom: 1 },
          fg: import_theme.colors.dim,
          children: "Use ↑↓ or j/k to navigate, Enter to confirm"
        }),
        ...PROVIDER_ORDER.map(function(key, idx) {
          var isSelected = idx === selectedIdx;
          return jsx_runtime.jsx("text", {
            fg: isSelected ? import_theme.colors.primary : import_theme.colors.text,
            attributes: isSelected ? TextAttributes.BOLD : 0,
            children: (isSelected ? "▶ " : "  ") + providers[key].label
          }, key);
        })
      ]
    });
  };

  var renderKeyStep = function() {
    return jsx_runtime.jsxs(jsx_runtime.Fragment, {
      children: [
        jsx_runtime.jsx("text", {
          style: { marginBottom: 1 },
          attributes: TextAttributes.BOLD,
          fg: import_theme.colors.primary,
          children: provider.label + " API Key"
        }),
        jsx_runtime.jsx("text", {
          style: { marginBottom: 1 },
          fg: import_theme.colors.dim,
          children: "Env var: " + provider.envKey + "  ·  Esc to go back"
        }),
        jsx_runtime.jsx("box", {
          style: {
            borderStyle: "single",
            borderColor: import_theme.colors.dim,
            paddingLeft: 1,
            paddingRight: 1,
            marginBottom: 1
          },
          children: jsx_runtime.jsx("input", {
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
        jsx_runtime.jsx("text", {
          fg: import_theme.colors.dim,
          children: "Press Enter to confirm"
        })
      ]
    });
  };

  return jsx_runtime.jsx("box", {
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
    onKeyPress: handleKeyPress,
    children: step === "provider" ? renderProviderStep() : renderKeyStep()
  });
}

globalThis._ApiKeyModal = ApiKeyModal;
