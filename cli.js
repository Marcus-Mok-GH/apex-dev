#!/usr/bin/env node

const os = require("os");
const fs = require("fs");
const path = require("path");
const https = require("https");
const { spawnSync, spawn } = require("child_process");

const VERSION = require("./package.json").version;

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
    process.exit(0);
  }

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