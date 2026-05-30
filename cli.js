#!/usr/bin/env node

const os = require("os");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { spawnSync, spawn } = require("child_process");

const VERSION = require("./package.json").version;

// ── Config ────────────────────────────────────────────────────────────────
const CONFIG_PATH = path.join(os.homedir(), ".apex-dev", "config.json");

const PROVIDERS = [
  { name: "fireworks", label: "Fireworks AI",  envKey: "FIREWORKS_API_KEY" },
  { name: "openai",    label: "OpenAI",         envKey: "OPENAI_API_KEY" },
  { name: "openrouter",label: "OpenRouter",     envKey: "OPENROUTER_API_KEY" },
  { name: "groq",      label: "Groq",           envKey: "GROQ_API_KEY" },
  { name: "gemini",    label: "Google Gemini",  envKey: "GEMINI_API_KEY" },
  { name: "together",  label: "Together AI",    envKey: "TOGETHER_API_KEY" },
];

function readConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    }
  } catch {}
  return {};
}

function saveConfig(config) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  fs.chmodSync(CONFIG_PATH, 0o600);
}

function promptKey(providerName) {
  return new Promise((resolve) => {
    const prompt = `Enter your ${providerName} API key (or press Enter to skip): `;
    process.stdout.write(prompt);

    const stdin = process.stdin;

    try {
      stdin.setRawMode(true);
    } catch {
      // Not a TTY — fall back to line-buffered input
      stdin.resume();
      let buf = "";
      const onData = (data) => {
        buf += data.toString();
        const idx = buf.indexOf("\n");
        if (idx !== -1) {
          stdin.removeListener("data", onData);
          stdin.pause();
          process.stdout.write("\n");
          resolve(buf.slice(0, idx).trim());
        }
      };
      stdin.on("data", onData);
      return;
    }

    stdin.resume();
    let key = "";

    const onData = (data) => {
      const chars = data.toString();
      for (const ch of chars) {
        if (ch === "\r" || ch === "\n") {
          stdin.removeListener("data", onData);
          stdin.setRawMode(false);
          stdin.pause();
          process.stdout.write("\n");
          resolve(key);
          return;
        }
        if (ch === "\x7f" || ch === "\b") {
          if (key.length > 0) {
            key = key.slice(0, -1);
            process.stdout.write("\b \b");
          }
          continue;
        }
        if (ch === "\x03") {
          process.exit(1);
        }
        key += ch;
        process.stdout.write("*");
      }
    };

    stdin.on("data", onData);
  });
}

// ── Platform detection ────────────────────────────────────────────────────
function detectPlatform() {
  const platformMap = {
    linux: "linux",
    darwin: "macos",
    win32: "windows",
  };
  const archMap = {
    x64: "amd64",
    arm64: "arm64",
  };
  const platform = platformMap[process.platform];
  const arch = archMap[process.arch];
  if (!platform) {
    console.error(`Unsupported platform: ${process.platform}`);
    process.exit(1);
  }
  if (!arch) {
    console.error(`Unsupported architecture: ${process.arch}`);
    process.exit(1);
  }
  return { platform, arch };
}

function getBinaryName() {
  const { platform, arch } = detectPlatform();
  return `apex-dev-${platform}-${arch}`;
}

function getCacheDir() {
  const dir = path.join(os.homedir(), ".apex-dev");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getLocalBinaryPath() {
  const cacheDir = getCacheDir();
  return path.join(cacheDir, getBinaryName());
}

function getDownloadUrl() {
  const { platform, arch } = detectPlatform();
  return `https://github.com/Marcus-Mok-GH/apex-dev/releases/download/v${VERSION}/apex-dev-${platform}-${arch}`;
}

function downloadBinary(destPath) {
  const url = getDownloadUrl();
  console.error(`Downloading apex-dev v${VERSION} for ${detectPlatform().platform}-${detectPlatform().arch}...`);
  console.error(`URL: ${url}`);

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath, { mode: 0o755 });
    https
      .get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          https.get(response.headers.location, (redirectRes) => {
            if (redirectRes.statusCode !== 200) {
              reject(new Error(`Download failed with status ${redirectRes.statusCode}`));
              return;
            }
            redirectRes.pipe(file);
            file.on("finish", () => {
              file.close();
              resolve();
            });
          }).on("error", reject);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Download failed with status ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", reject);
  });
}

async function ensureBinary() {
  const localPath = getLocalBinaryPath();

  if (fs.existsSync(localPath)) {
    return localPath;
  }

  try {
    await downloadBinary(localPath);
    console.error(`Binary downloaded to ${localPath}`);
    return localPath;
  } catch (err) {
    console.error(`Failed to download binary: ${err.message}`);
    return null;
  }
}

function tryBun() {
  const bunPath = process.env.BUN_PATH || "bun";
  const result = spawnSync(bunPath, ["--version"], { stdio: "pipe" });
  if (result.status === 0) {
    return true;
  }
  return false;
}

function runWithBun() {
  const bunPath = process.env.BUN_PATH || "bun";
  const scriptPath = path.join(__dirname, "dist", "index.js");
  if (!fs.existsSync(scriptPath)) {
    console.error("dist/index.js not found for bun fallback.");
    process.exit(1);
  }
  const child = spawn(bunPath, [scriptPath, ...process.argv.slice(2)], {
    stdio: "inherit",
  });
  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}

// ── API key orchestration ─────────────────────────────────────────────────
async function ensureApiKeys() {
  const args = process.argv.slice(2);

  // --setup: re-prompt for every provider, overwriting stored keys
  if (args.includes("--setup")) {
    const config = {};
    console.error("API Key Setup\n");
    for (const provider of PROVIDERS) {
      const key = await promptKey(provider.label);
      if (key) {
        config[provider.name] = key;
        process.env[provider.envKey] = key;
      }
    }
    saveConfig(config);
    const count = PROVIDERS.filter((p) => process.env[p.envKey]).length;
    if (count > 0) {
      console.error(`\n\u2713 ${count} API key(s) saved to ~/.apex-dev/config.json`);
    } else {
      console.error("\nNo keys were entered. Configuration unchanged.");
    }
    process.exit(0);
  }

  // --keys: list which providers have keys (without revealing the key)
  if (args.includes("--keys")) {
    const config = readConfig();
    let count = 0;
    for (const provider of PROVIDERS) {
      if (process.env[provider.envKey] || config[provider.name]) {
        console.error(`\u2713 ${provider.label} (${provider.envKey})`);
        count++;
      }
    }
    if (count === 0) {
      console.error("\u26A0 No API keys configured. Run apex-dev --setup to add keys.");
    } else {
      console.error(`\n${count} provider(s) configured.`);
    }
    process.exit(0);
  }

  // Normal flow: fill missing keys from config or prompt
  const config = readConfig();
  let newKeys = false;

  for (const provider of PROVIDERS) {
    if (process.env[provider.envKey]) continue;

    const stored = config[provider.name];
    if (stored) {
      process.env[provider.envKey] = stored;
    } else {
      if (!newKeys) {
        console.error("");
        newKeys = true;
      }
      const key = await promptKey(provider.label);
      if (key) {
        process.env[provider.envKey] = key;
        config[provider.name] = key;
      }
    }
  }

  if (newKeys) {
    saveConfig(config);
  }

  // Summary
  const configured = PROVIDERS.filter((p) => process.env[p.envKey]);
  if (configured.length > 0) {
    console.error(`\n\u2713 Using ${configured.length} provider(s)`);
  } else {
    console.error("\n\u26A0 No API keys configured. Run apex-dev --setup to add keys.");
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    const { platform, arch } = detectPlatform();
    console.log(`apex-dev v${VERSION}`);
    console.log(`Detected platform: ${platform}-${arch}`);
    console.log(`Binary name: ${getBinaryName()}`);
    console.log(`Cache directory: ${getCacheDir()}`);
    console.log(`Local binary path: ${getLocalBinaryPath()}`);
    console.log(`Download URL: ${getDownloadUrl()}`);
    console.log(`Binary exists locally: ${fs.existsSync(getLocalBinaryPath())}`);
    console.log("");
    console.log("Apex AI - a friendly agentic coding assistant for the terminal");
    console.log("");
    console.log("Flags:");
    console.log("  --setup            Re-prompt for all API keys from scratch");
    console.log("  --keys             Show which providers have keys configured");
    console.log("  --help, -h         Show this help message");
    process.exit(0);
  }

  await ensureApiKeys();

  const binaryPath = await ensureBinary();

  if (binaryPath && fs.existsSync(binaryPath)) {
    const child = spawn(binaryPath, args, {
      stdio: "inherit",
    });
    child.on("exit", (code) => {
      process.exit(code || 0);
    });
  } else if (tryBun()) {
    console.error("Binary not available, falling back to bun runtime.");
    runWithBun();
  } else {
    console.error("No binary available and bun is not installed.");
    console.error("Please install bun (https://bun.sh) or download the binary manually:");
    console.error(`  ${getDownloadUrl()}`);
    process.exit(1);
  }
}

main();
