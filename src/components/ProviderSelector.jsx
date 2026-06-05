var import_react = __toESM(require_react(), 1);
var import_theme = __toESM(require_theme(), 1);
var import_store = __toESM(require_store(), 1);
var import_config = __toESM(require_config(), 1);
var import_useLayout = __toESM(require_useLayout(), 1);
var jsx_runtime = __toESM(require_jsx_runtime(), 1);

var PROVIDER_ORDER = ["fireworks", "openai", "openrouter", "groq", "gemini", "together", "baseten", "replit", "apex-nova"];

var PROVIDER_EMOJI = {
  fireworks: "🔥",
  openai: "🤖",
  openrouter: "🔀",
  groq: "⚡",
  gemini: "💎",
  together: "🤝",
  baseten: "🔺",
  replit: "🆓",
  "apex-nova": "🌟",
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

  function getStoredKey(key) {
    return import_config.getSavedApiKey(key);
  }

  function loginState(key) {
    return import_config.getProviderLoginState(key);
  }

  function isConfigured(key) {
    return loginState(key) !== "empty";
  }

  function isLoggedIn(key) {
    return loginState(key) === "logged-in";
  }

  function finishLogin(providerKey2, key) {
    import_config.loginProvider(providerKey2, key);
    import_store.setState({
      apiKey: key,
      provider: providerKey2,
      needsConfig: false,
      keyValidationError: null,
    });
  }

  function handleLogin() {
    var key = input.trim();
    if (!key) return;
    finishLogin(providerKey, key);
    setInput("");
    setStep("select");
  }

  function handleLogout() {
    var remaining = import_config.logoutProvider(providerKey);
    if (remaining) {
      import_store.setState({
        apiKey: remaining.apiKey,
        provider: remaining.providerKey,
        needsConfig: false,
      });
    } else {
      import_store.setState({
        apiKey: "",
        provider: providerKey,
        needsConfig: true,
      });
    }
    setInput("");
    setStep("select");
  }

  function handleSelect() {
    var providerObj = providers[providerKey];
    if (providerObj && providerObj.noKey) {
      finishLogin(providerKey, undefined);
      return;
    }
    if (isLoggedIn(providerKey)) {
      handleLogout();
      return;
    }
    if (isConfigured(providerKey)) {
      finishLogin(providerKey, getStoredKey(providerKey));
      return;
    }
    setStep("key");
  }

  // Use useKeyboard hook for proper keyboard handling
  useKeyboard(function (key) {
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
      } else if (key.name === "l") {
        if (isLoggedIn(providerKey) && !providers[providerKey].noKey) handleLogout();
      }
    } else {
      if (key.name === "escape") {
        setStep("select");
        setInput("");
      }
      // Note: Enter in key input is handled by the input's onSubmit
    }
  });

  var selectedState = loginState(providerKey);

  return jsx_runtime.jsx(
    "box",
    {
      style: {
        flexDirection: "column",
        flexGrow: 1,
        paddingTop: 2,
      },
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
                    children: "Choose your AI provider",
                  }),
                }),
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4, marginBottom: 1 },
                  children: jsx_runtime.jsx("text", {
                    fg: import_theme.colors.dim,
                    children:
                      "Use ↑↓ or j/k to navigate. Enter logs in or out depending on the selected provider's state.",
                  }),
                }),
                state.keyValidationError
                  ? jsx_runtime.jsx("box", {
                      style: { paddingLeft: 4, paddingRight: 4, marginBottom: 1 },
                      children: jsx_runtime.jsx("text", {
                        fg: import_theme.colors.red,
                        children: "⚠  " + state.keyValidationError + " — please enter a new key.",
                      }),
                    })
                  : null,
                PROVIDER_ORDER.map(function (key, idx) {
                  var focused = idx === focusedIdx;
                  var stateLabel = loginState(key);
                  var statusFg = (stateLabel === "logged-in" || stateLabel === "no-key")
                    ? import_theme.colors.green
                    : stateLabel === "saved"
                      ? import_theme.colors.yellow
                      : import_theme.colors.dim;
                  var statusText = stateLabel === "no-key"
                    ? "Free (no key)"
                    : stateLabel === "logged-in"
                      ? "Logged in"
                      : stateLabel === "saved"
                        ? "Logged out"
                        : "Needs key";

                  return jsx_runtime.jsxs(
                    "box",
                    {
                      style: {
                        flexDirection: "row",
                        paddingLeft: 4,
                        paddingRight: 4,
                      },
                      onMouseEnter: function () {
                        setFocusedIdx(idx);
                      },
                      onMouseDown: function () {
                        setFocusedIdx(idx);
                        if (providers[key].noKey) {
                          finishLogin(key, undefined);
                        } else if (stateLabel === "logged-in") {
                          handleLogout();
                        } else if (stateLabel === "saved") {
                          finishLogin(key, getStoredKey(key));
                        } else {
                          setStep("key");
                        }
                      },
                      children: [
                        jsx_runtime.jsx("text", {
                          fg: focused ? import_theme.colors.primary : import_theme.colors.dim,
                          attributes: focused ? TextAttributes.BOLD : 0,
                          children: focused ? "▶ " : "  ",
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
                    children: provider.noKey
                      ? "Press Enter to use this provider — no API key required."
                      : selectedState === "logged-in"
                        ? "Press Enter to log out of the selected provider."
                        : selectedState === "saved"
                          ? "Press Enter to log in with the saved key."
                          : "Press Enter to log in with a new key. Keys are stored in ~/.apex-dev/config.json or can be supplied via environment variables.",
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
                      "  ·  Esc to go back",
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
                      onSubmit: handleLogin,
                      placeholder: "Paste your API key here...",
                      fg: import_theme.colors.text,
                    }),
                  }),
                }),
                jsx_runtime.jsx("box", {
                  style: { paddingLeft: 4, paddingRight: 4 },
                  children: jsx_runtime.jsx("text", {
                    fg: import_theme.colors.dim,
                    children: "Press Enter to login",
                  }),
                }),
              ],
            }),
    }
  );
}

globalThis._ProviderSelector = ProviderSelector;
