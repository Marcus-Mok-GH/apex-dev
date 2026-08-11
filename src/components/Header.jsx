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

  const snapshot = import_store_h.getSnapshot();
  const configReady = !snapshot.needsConfig;
  const projectLabel = isNarrow && cwd.length > 14 ? cwd.slice(0, 14) + "…" : cwd;

  return /* @__PURE__ */ jsx_runtime.jsxs("box", {
    style: { flexDirection: "row", paddingLeft: 2, paddingRight: 2, paddingTop: 1, paddingBottom: 1 },
    children: [
      /* @__PURE__ */ jsx_runtime.jsx("box", {
        style: { flexGrow: 1 },
        children: /* @__PURE__ */ jsx_runtime.jsxs("text", {
          children: [
            /* @__PURE__ */ jsx_runtime.jsx("span", {
              fg: import_theme.colors.primary,
              attributes: TextAttributes.BOLD,
              children: "✦ apex"
            }),
            /* @__PURE__ */ jsx_runtime.jsx("span", {
              fg: import_theme.colors.borderStrong,
              children: "  /  "
            }),
            /* @__PURE__ */ jsx_runtime.jsx("span", {
              fg: import_theme.colors.blue,
              children: projectLabel
            }),
            branch && !isNarrow ? /* @__PURE__ */ jsx_runtime.jsxs(jsx_runtime.Fragment, {
              children: [
                /* @__PURE__ */ jsx_runtime.jsx("span", {
                  fg: import_theme.colors.borderStrong,
                  children: "  ·  "
                }),
                /* @__PURE__ */ jsx_runtime.jsx("span", {
                  fg: import_theme.colors.muted,
                  children: "⎇ " + branch
                })
              ]
            }) : null
          ]
        })
      }),
      !isNarrow ? /* @__PURE__ */ jsx_runtime.jsxs("text", {
        children: [
          /* @__PURE__ */ jsx_runtime.jsx("span", {
            fg: configReady ? import_theme.colors.green : import_theme.colors.yellow,
            children: configReady ? "● ready" : "○ unavailable"
          })
        ]
      }) : null
    ]
  });
}
