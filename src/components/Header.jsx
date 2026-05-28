var import_react13 = __toESM(require_react(), 1);
var import_theme = __toESM(require_theme(), 1);
var import_config = __toESM(require_config(), 1);
var import_store_h = __toESM(require_store(), 1);

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

  // Get current provider label (stable, set at startup)
  const provider = import_store_h.getSnapshot().provider;
  const providerLabel = import_config.PROVIDERS[provider]?.label || provider;

  return /* @__PURE__ */ jsx_runtime.jsxs("box", {
    style: { flexDirection: "row", paddingLeft: 1, paddingRight: 1 },
    children: [
      // Left: logo · mode · project · branch
      /* @__PURE__ */ jsx_runtime.jsx("box", {
        style: { flexGrow: 1 },
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
      }),
      // Right: provider label
      !isNarrow ? /* @__PURE__ */ jsx_runtime.jsxs("text", {
        children: [
          /* @__PURE__ */ jsx_runtime.jsx("span", {
            fg: import_theme.colors.dim,
            children: "·  "
          }),
          /* @__PURE__ */ jsx_runtime.jsx("span", {
            fg: import_theme.colors.muted,
            children: providerLabel
          })
        ]
      }) : null
    ]
  });
}
