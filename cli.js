#!/usr/bin/env node

const os = require("os");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { spawnSync, spawn } = require("child_process");

const VERSION = require("./package.json").version;
const RELEASE_OWNER = "Marcus-Mok-GH";
const RELEASE_REPO = "apex-dev";

// ── Config ──────────────────────────────────────────────────────────────────────────
const CONFIG_PATH = path.join(os.homedir(), ".apex-dev", "config.json");

const PROVIDERS = [
  { name: "fireworks", label: "Fireworks AI",  envKey: "FIREWORKS_API_KEY" },
  { name: "openai",    label: "OpenAI",         envKey: "OPENAI_API_KEY" },
  { name: "openrouter",label: "OpenRouter",     envKey: "OPENROUTER_API_KEY" },
  { name: "groq",      label: "Groq",           envKey: "GROQ_API_KEY" },
  { name: "gemini",    label: "Google Gemini",  envKey: "GEMINI_API_KEY" },
  { name: "together",  label: "Together AI",    envKey: "TOGETHER_API_KEY" },
  { name: "baseten",   label: "Baseten",        envKey: "BASETEN_API_KEY" },
  { name: "replit",    label: "Replit (Free)",  envKey: "REPLIT_API_KEY",  noKey: true },
  { name: "apex-nova", label: "Apex Nova",      envKey: "APEX_NOVA_API_KEY", noKey: true },
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

// ── Platform detection ────────────────────────────────────────────────────────
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

function getBinaryCacheDir() {
  return path.join(getCacheDir(), "bin", `v${VERSION}`);
}

function getBinaryMetadataPath() {
  return path.join(getBinaryCacheDir(), `${getBinaryName()}.json`);
}

function readBinaryMetadata() {
  try {
    const metadataPath = getBinaryMetadataPath();
    if (!fs.existsSync(metadataPath)) return null;
    return JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
  } catch {
    return null;
  }
}

function saveBinaryMetadata(metadata) {
  const metadataPath = getBinaryMetadataPath();
  fs.mkdirSync(path.dirname(metadataPath), { recursive: true });
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  fs.chmodSync(metadataPath, 0o600);
}

function clearBinaryMetadata() {
  try { fs.unlinkSync(getBinaryMetadataPath()); } catch {}
}

function fetchReleaseAssetInfo() {
  const apiUrl = `https://api.github.com/repos/${RELEASE_OWNER}/${RELEASE_REPO}/releases/tags/v${VERSION}`;
  return new Promise((resolve, reject) => {
    const req = https.get(apiUrl, {
      headers: {
        "accept": "application/vnd.github+json",
        "user-agent": "apex-dev-installer"
      }
    }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Release metadata request failed with status ${res.statusCode}`));
          return;
        }
        try {
          const release = JSON.parse(body);
          const assetName = getBinaryName();
          const asset = Array.isArray(release.assets) ? release.assets.find((item) => item.name === assetName) : null;
          if (!asset) {
            reject(new Error(`Release asset ${assetName} not found`));
            return;
          }
          resolve({
            id: asset.id,
            name: asset.name,
            size: asset.size,
            updatedAt: asset.updated_at,
            downloadUrl: asset.browser_download_url || getDownloadUrl()
          });
        } catch (err) {
          reject(new Error(`Invalid release metadata: ${err.message}`));
        }
      });
    });
    req.on("error", (err) => reject(err));
    req.setTimeout(DOWNLOAD_TIMEOUT, () => {
      req.destroy(new Error("Release metadata request timed out"));
    });
  });
}

function looksValidBinary(pathToBinary) {
  try {
    return fs.existsSync(pathToBinary) && fs.statSync(pathToBinary).size > 0;
  } catch {
    return false;
  }
}

function getLocalBinaryPath() {
  return path.join(getBinaryCacheDir(), getBinaryName());
}

function getDownloadUrl() {
  const { platform, arch } = detectPlatform();
  return `https://github.com/Marcus-Mok-GH/apex-dev/releases/download/v${VERSION}/apex-dev-${platform}-${arch}`;
}

const DOWNLOAD_TIMEOUT = 10 * 1000;
const PROXY_BASE_URL = 'https://fireworks-api-backend.vercel.app'

function getDownloadSources() {
  const { platform, arch } = detectPlatform()
  const asset = `apex-dev-${platform}-${arch}`
  return [
    {
      name: 'github-releases',
      url: `https://github.com/${RELEASE_OWNER}/${RELEASE_REPO}/releases/download/v${VERSION}/${asset}`,
    },
    {
      name: 'vercel-proxy',
      url: `${PROXY_BASE_URL}/api/releases/download/${RELEASE_OWNER}/${RELEASE_REPO}/v${VERSION}/${asset}`,
    },
  ]
}

function downloadFromUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        const redirectReq = https.get(response.headers.location, (redirectRes) => {
          if (redirectRes.statusCode !== 200) {
            reject(new Error(`Download failed with status ${redirectRes.statusCode}`))
            return
          }
          const chunks = []
          redirectRes.on('data', (c) => chunks.push(c))
          redirectRes.on('end', () => resolve(Buffer.concat(chunks)))
          redirectRes.on('error', reject)
        })
        redirectReq.on('error', reject)
        redirectReq.setTimeout(DOWNLOAD_TIMEOUT, () => reject(new Error('Download timed out')))
        return
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with status ${response.statusCode}`))
        return
      }

      const chunks = []
      response.on('data', (c) => chunks.push(c))
      response.on('end', () => resolve(Buffer.concat(chunks)))
      response.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(DOWNLOAD_TIMEOUT, () => reject(new Error('Download timed out')))
  })
}

async function downloadBinary(destPath) {
  const sources = getDownloadSources()
  const lastErrors = []

  for (const source of sources) {
    console.error(`Trying ${source.name}: ${source.url}`)
    try {
      const buffer = await downloadFromUrl(source.url)
      if (!buffer || buffer.length === 0) {
        throw new Error('Empty response body')
      }
      fs.mkdirSync(path.dirname(destPath), { recursive: true })
      fs.writeFileSync(destPath, buffer, { mode: 0o755 })
      console.error(`✓ Downloaded from ${source.name} (${buffer.length} bytes)`)
      return source.name
    } catch (err) {
      console.error(`✗ ${source.name} failed: ${err.message}`)
      lastErrors.push(`${source.name}: ${err.message}`)
    }
  }

  throw new Error(`All download sources failed:\n  - ${lastErrors.join('\n  - ')}`)
}

async function ensureBinary() {
  const localPath = getLocalBinaryPath();
  const cachedMetadata = readBinaryMetadata();

  let releaseMetadata = null;
  try {
    releaseMetadata = await fetchReleaseAssetInfo();
  } catch {
    releaseMetadata = null;
  }

  const binaryExists = looksValidBinary(localPath);

  if (binaryExists) {
    if (!releaseMetadata || !cachedMetadata) {
      return localPath;
    }

    const cacheMatches =
      cachedMetadata.assetId === releaseMetadata.id &&
      cachedMetadata.assetSize === releaseMetadata.size &&
      cachedMetadata.assetUpdatedAt === releaseMetadata.updatedAt;

    if (cacheMatches) {
      return localPath;
    }

    try { fs.unlinkSync(localPath); } catch {}
    clearBinaryMetadata();
  }

  try {
    await downloadBinary(localPath);
    if (releaseMetadata) {
      saveBinaryMetadata({
        assetId: releaseMetadata.id,
        assetSize: releaseMetadata.size,
        assetUpdatedAt: releaseMetadata.updatedAt,
        downloadedAt: new Date().toISOString()
      });
    }
    console.error(`Binary downloaded to ${localPath}`);
    return localPath;
  } catch (err) {
    console.error(`Failed to download binary: ${err.message}`);
    try { fs.unlinkSync(localPath); } catch {}
    clearBinaryMetadata();
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
  const scriptPath = path.join(__dirname, "apex.mjs");
  if (!fs.existsSync(scriptPath)) {
    // Fallback to dist/index.js for npm-installed usage
    const distPath = path.join(__dirname, "dist", "index.js");
    if (!fs.existsSync(distPath)) {
      console.error("Neither apex.mjs nor dist/index.js found for bun fallback.");
      process.exit(1);
    }
    const child = spawn(bunPath, [distPath, ...process.argv.slice(2)], {
      stdio: "inherit",
    });
    child.on("error", (err) => {
      console.error(`Failed to launch bun: ${err.message}`);
      process.exit(1);
    });
    child.on("exit", (code) => {
      process.exit(code || 0);
    });
    return;
  }
  const child = spawn(bunPath, [scriptPath, ...process.argv.slice(2)], {
    stdio: "inherit",
  });
  child.on("error", (err) => {
    console.error(`Failed to launch bun: ${err.message}`);
    process.exit(1);
  });
  child.on("exit", (code) => {
    process.exit(code || 0);
  });
}

// ── API key orchestration ────────────────────────────────────────────────────
async function ensureApiKeys() {
  const args = process.argv.slice(2);

  // --setup: re-prompt for every provider, overwriting stored keys
  if (args.includes("--setup")) {
    const config = {};
    console.error("API Key Setup\n");
    for (const provider of PROVIDERS) {
      if (provider.noKey) {
        console.error(`  ${provider.label}: no API key required`);
        continue;
      }
      const key = await promptKey(provider.label);
      if (key) {
        config[provider.name] = key;
        process.env[provider.envKey] = key;
      }
    }
    saveConfig(config);
    const providersWithKeys = PROVIDERS.filter((p) => process.env[p.envKey]).length;
    if (providersWithKeys > 0) {
      console.error(`\n✓ ${providersWithKeys} API key(s) saved to ~/.apex-dev/config.json`);
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
      if (provider.noKey) {
        console.error(`✓ ${provider.label} (no key required)`);
        count++;
      } else if (process.env[provider.envKey] || config[provider.name]) {
        console.error(`✓ ${provider.label} (${provider.envKey})`);
        count++;
      }
    }
    if (count === 0) {
      console.error("⚠ No API keys configured. Run apex-dev --setup to add keys.");
    } else {
      console.error(`\n${count} provider(s) configured.`);
    }
    process.exit(0);
  }

  // Normal flow: fill missing keys from config (non-interactive — TUI handles selection)
  const config = readConfig();

  for (const provider of PROVIDERS) {
    if (process.env[provider.envKey]) continue;

    const stored = config[provider.name];
    if (stored) {
      process.env[provider.envKey] = stored;
    }
  }

  // Summary
  const configured = PROVIDERS.filter((p) => process.env[p.envKey]);
  if (configured.length > 0) {
    console.error(`\n✓ ${configured.length} provider(s) configured`);
  } else {
    console.error("\n⚠ No API keys configured. Launching interactive provider selection.");
    process.env.APEX_DEV_NEEDS_CONFIG = "true";
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
    child.on("error", (err) => {
      console.error(`Failed to launch binary: ${err.message}`);
      process.exit(1);
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
