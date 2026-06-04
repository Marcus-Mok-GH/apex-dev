#!/usr/bin/env node
// Build the standalone binary for distribution.
// Steps:
//   1. Bundle entry.mjs with all node_modules inlined (this is the CLI entry,
//      not the npm-published cli.js wrapper).
//   2. Compile the bundle into a single-file bun binary for linux-x64.

import { existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TMP = resolve(ROOT, "release-tmp");

const { execSync } = await import("node:child_process");

if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

console.log("1/2  Bundling entry.mjs with node_modules inlined...");
execSync(`bun build entry.mjs --target=bun --outdir=${TMP}/`, {
  cwd: ROOT,
  stdio: "inherit",
});

console.log("\n2/2  Compiling bundle to standalone linux-x64 binary...");
execSync(
  `bun build ${TMP}/entry.js --compile --target=bun-linux-x64 --outfile=${TMP}/apex-dev-linux-amd64`,
  { cwd: ROOT, stdio: "inherit" },
);

console.log(`\nBinary: ${TMP}/apex-dev-linux-amd64`);
