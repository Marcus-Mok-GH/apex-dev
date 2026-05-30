#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getBinaryName, ensureExecutable } from "./lib/platform.js";
import { downloadBinary } from "./lib/download.js";
import { NAME, VERSION, BINARY_BASE_URL, SHA256_MAP } from "./lib/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BIN_DIR = path.join(__dirname, "bin");
const binaryName = getBinaryName(NAME);
const binaryPath = path.join(BIN_DIR, binaryName);

async function install() {
  if (fs.existsSync(binaryPath)) {
    ensureExecutable(binaryPath);
    console.log(`✓ Binary already installed: ${binaryName}`);
    return binaryPath;
  }

  const url = `${BINARY_BASE_URL}/${binaryName}`;
  const expectedSha256 = SHA256_MAP[binaryName];

  console.log(`Downloading ${NAME} v${VERSION} for ${binaryName}...`);

  try {
    const result = await downloadBinary(url, binaryPath, expectedSha256);
    ensureExecutable(binaryPath);
    console.log(`✓ Installed (${(result.size / 1024).toFixed(1)} KB)`);
    return binaryPath;
  } catch (err) {
    console.error(`✗ Failed: ${err.message}`);
    process.exit(1);
  }
}

await install();
