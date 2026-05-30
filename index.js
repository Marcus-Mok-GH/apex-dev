import path from "node:path";
import fs from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { getBinaryName, ensureExecutable } from "./lib/platform.js";
import { downloadBinary } from "./lib/download.js";
import { NAME, VERSION, BINARY_BASE_URL, SHA256_MAP } from "./lib/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN_DIR = path.join(__dirname, "bin");
const BINARY_PATH = path.join(BIN_DIR, getBinaryName(NAME));

let installPromise = null;

export function getBinaryPath() {
  if (fs.existsSync(BINARY_PATH)) {
    ensureExecutable(BINARY_PATH);
    return BINARY_PATH;
  }
  return null;
}

export function ensureBinary() {
  const p = getBinaryPath();
  if (p) return p;
  throw new Error(
    `${NAME} binary not found at ${BINARY_PATH}.\n` +
    `Run "node ${path.join(__dirname, "install.js")}" to download it, ` +
    `or ensure the postinstall script ran during "npm install".`
  );
}

export async function ensureBinaryAsync() {
  const existing = getBinaryPath();
  if (existing) return existing;

  if (!installPromise) {
    const binaryName = getBinaryName(NAME);
    const url = `${BINARY_BASE_URL}/${binaryName}`;
    const expectedSha256 = SHA256_MAP[binaryName];

    installPromise = downloadBinary(url, BINARY_PATH, expectedSha256)
      .then((result) => {
        ensureExecutable(result.path);
        return result.path;
      });
  }

  return installPromise;
}

export function runSync(args = [], opts = {}) {
  const bin = ensureBinary();
  return spawnSync(bin, args, { stdio: "inherit", ...opts });
}

export function run(args = [], opts = {}) {
  const bin = ensureBinary();
  const child = spawn(bin, args, { stdio: "inherit", ...opts });

  return new Promise((resolve, reject) => {
    child.on("close", (code) => {
      if (code === 0) resolve(code);
      else reject(new Error(`${NAME} exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

export async function runAuto(args = [], opts = {}) {
  const bin = await ensureBinaryAsync();
  const child = spawn(bin, args, { stdio: "inherit", ...opts });

  return new Promise((resolve, reject) => {
    child.on("close", (code) => {
      if (code === 0) resolve(code);
      else reject(new Error(`${NAME} exited with code ${code}`));
    });
    child.on("error", reject);
  });
}
