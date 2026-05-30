var import_react = __toESM(require_react(), 1);
var import_theme = __toESM(require_theme(), 1);
var import_store = __toESM(require_store(), 1);
var import_config = __toESM(require_config(), 1);
var import_useLayout = __toESM(require_useLayout(), 1);
var jsx_runtime = __toESM(require_jsx_runtime(), 1);

var PROVIDER_ORDER = ["fireworks", "openai", "openrouter", "groq", "gemini", "together"];

var PROVIDER_EMOJI = {
  fireworks: "\uD83C\uDF86",
  openai: "\uD83E\uDD16",
  openrouter: "\uD83D\uDD00",
  groq: "\u26A1",
  gemini: "\uD83D\uDC8E",
  together: "\uD83E\uDD1D",
};

function ProviderSelector() {
  var state = useStore();
  var [input, setInput] = import_react.useState("");
  var [focusedIdx, setFocusedIdx] = import_react.useState(0);
  var [step, setStep] = import_react.useState("select");
  var { width } = import_useLayout.useLayout();

  var providers = import_config.PROVIDERS;
  var providerKey = PROVIDER_ORDER[focusedIdx];
  var provider = providers[providerKey];

  function isConfigured(key) {
    var envKey = providers[key].envKey;
    var hasEnv = Boolean(process.env[envKey]);
    var hasStored = key === state.provider && Boolean(state.apiKey);
    return hasEnv || hasStored;
  }

  function isDefault(key) {
    return key === state.provider && Boolean(state.apiKey);
  }

  function handleSelect() {
    if (isConfigured(providerKey)) {
      var key = process.env[provider.envKey] || state.apiKey;
      import_config.setProvider(providerKey, key);
      import_store.setState({
        apiKey: key,
        provider: providerKey,
        needsConfig: false,
      });
    } else {
      setStep("key");
    }
  }

  function handleSubmitKey() {
    var key = input.trim();
    if (!key) return;
    import_config.setProvider(providerKey, key);
    import_store.setState({ apiKey: key, provider: providerKey, needsConfig: false });
  }

  var handleKeyPress = function (key) {
    if (step === "select") {
      if (key.name === "up" || key.name === "k") {
        setFocusedIdx(function (i) {
          return (i - 1 + PROVIDER_ORDER.length) % PROVIDER_ORDER.length;
        });
      } else if (key.name === "down" || key.name === "j") {
        setFocusedIdx(function (i) {
          return (i + 1) % PROVIDER_ORDER.length;
        });
      } else if (key.name === "return" || key.name === "enter") {
        handleSelect();
      }
    } else {
      if (key.name === "escape") {
        setStep("select");
        setInput("");
      } else if (key.name === "return" || key.name === "enter") {
        handleSubmitKey();
      }
    }
  };

  return jsx_runtime.jsx(
    "box",
    {
      style: {
        flexDirection: "column",
        flexGrow: 1,
        paddingTop: 3,
      },
      onKeyDown: handleKeyPress,
      focused: true,
      children:
        step === "select"
          ? jsx_runtime.jsxs(jsx_runtime.Fragment, {
              children: [
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4, marginBottom: 1 },
                  children: jsx_runtime.jsx("text", {
                    attributes: TextAttributes.BOLD,
                    fg: import_theme.colors.white,
                    children: "\u26A1 Select AI Provider",
                  }),
                }),
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4, marginBottom: 1 },
                  children: jsx_runtime.jsx("text", {
                    fg: import_theme.colors.dim,
                    children:
                      "\u2191\u2193 or j/k to navigate  \u00B7  Enter to select  \u00B7  Ctrl+C to exit",
                  }),
                }),
                PROVIDER_ORDER.map(function (key, idx) {
                  var focused = idx === focusedIdx;
                  var configured = isConfigured(key);
                  var def = isDefault(key);

                  var statusFg = def
                    ? import_theme.colors.accent
                    : configured
                      ? import_theme.colors.green
                      : import_theme.colors.dim;
                  var statusText = def
                    ? "\u2713 Active"
                    : configured
                      ? "\u2713 Configured"
                      : "\u2717 Not configured";

                  return jsx_runtime.jsxs(
                    "box",
                    {
                      style: {
                        flexDirection: "row",
                        paddingLeft: focused ? 4 : 4,
                        paddingRight: 4,
                        paddingTop: 0,
                        paddingBottom: 0,
                      },
                      onMouseEnter: function () {
                        setFocusedIdx(idx);
                      },
                      onMouseDown: function () {
                        setFocusedIdx(idx);
                        handleSelect();
                      },
                      children: [
                        jsx_runtime.jsx("text", {
                          fg: focused ? import_theme.colors.primary : import_theme.colors.dim,
                          attributes: focused ? TextAttributes.BOLD : 0,
                          children: focused ? "\u25B6 " : "  ",
                        }),
                        jsx_runtime.jsx("text", {
                          fg: focused ? import_theme.colors.white : import_theme.colors.text,
                          attributes: focused ? TextAttributes.BOLD : 0,
                          children: PROVIDER_EMOJI[key] + "  " + providers[key].label,
                        }),
                        jsx_runtime.jsx("text", {
                          fg: import_theme.colors.dim,
                          children: "  ",
                        }),
                        jsx_runtime.jsx("text", {
                          fg: statusFg,
                          children: statusText,
                        }),
                      ],
                    },
                    key
                  );
                }),
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4, marginTop: 2 },
                  children: jsx_runtime.jsx("text", {
                    fg: import_theme.colors.dim,
                    children: "Keys are stored in ~/.apex-dev/config.json or set via environment variables",
                  }),
                }),
              ],
            })
          : jsx_runtime.jsxs(jsx_runtime.Fragment, {
              children: [
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4, marginBottom: 0 },
                  children: jsx_runtime.jsx("text", {
                    attributes: TextAttributes.BOLD,
                    fg: import_theme.colors.primary,
                    children:
                      PROVIDER_EMOJI[providerKey] + "  " + provider.label + " API Key",
                  }),
                }),
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4, marginBottom: 2 },
                  children: jsx_runtime.jsxs("text", {
                    fg: import_theme.colors.dim,
                    children: [
                      "Env var: ",
                      jsx_runtime.jsx("span", {
                        fg: import_theme.colors.yellow,
                        children: provider.envKey,
                      }),
                      "  \u00B7  Esc to go back",
                    ],
                  }),
                }),
                jsx_runtime.jsx("box", {
                  style: {
                    paddingLeft: 4,
                    paddingRight: 4,
                    marginBottom: 1,
                  },
                  children: jsx_runtime.jsx("box", {
                    style: {
                      borderStyle: "single",
                      borderColor: import_theme.colors.primary,
                      paddingLeft: 1,
                      paddingRight: 1,
                    },
                    children: jsx_runtime.jsx("input", {
                      focused: true,
                      value: input,
                      onChange: setInput,
                      onSubmit: handleSubmitKey,
                      placeholder: "Paste your API key here...",
                      fg: import_theme.colors.text,
                    }),
                  }),
                }),
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4 },
                  children: jsx_runtime.jsx("text", {
                    fg: import_theme.colors.dim,
                    children: "Press Enter to confirm",
                  }),
                }),
              ],
            }),
    }
  );
}

globalThis._ProviderSelector = ProviderSelector;
