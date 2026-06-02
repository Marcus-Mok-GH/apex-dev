var require_prompt = __commonJS((exports, module2) => {
  var fs2 = __require("fs");
  var path2 = __require("path");
  var { execSync } = __require("child_process");
  var { PROJECT_ROOT, MAX_TOOL_ITERATIONS, APEX_SYSTEM_PROMPT } = require_config();
  function buildSystemPrompt() {
    let gitInfo = "";
    try {
      const branch = execSync("git rev-parse --abbrev-ref HEAD 2>/dev/null", { encoding: "utf-8", cwd: PROJECT_ROOT }).trim();
      const status = execSync("git status --short 2>/dev/null", { encoding: "utf-8", cwd: PROJECT_ROOT }).trim();
      const remoteUrl = execSync("git config --get remote.origin.url 2>/dev/null", { encoding: "utf-8", cwd: PROJECT_ROOT }).trim();
      gitInfo = `
Git branch: ${branch}
Git remote: ${remoteUrl}
Git status:
${status || "(clean)"}`;
    } catch {}
    let projectInfo = "";
    try {
      const pkg = JSON.parse(fs2.readFileSync(path2.join(PROJECT_ROOT, "package.json"), "utf-8"));
      projectInfo = `
Project: ${pkg.name || "unknown"} v${pkg.version || "0.0.0"}`;
      if (pkg.dependencies)
        projectInfo += `
Dependencies: ${Object.keys(pkg.dependencies).join(", ")}`;
      if (pkg.devDependencies)
        projectInfo += `
Dev dependencies: ${Object.keys(pkg.devDependencies).join(", ")}`;
      if (pkg.scripts)
        projectInfo += `
Scripts: ${Object.keys(pkg.scripts).join(", ")}`;
    } catch {}
    const currentDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    // Prepend context info to the Apex/Apex system prompt
    return `Current date: ${currentDate}.
${gitInfo}
${projectInfo}

${APEX_SYSTEM_PROMPT}`;
  }
  module2.exports = { buildSystemPrompt };
});

