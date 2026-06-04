#!/usr/bin/env node
// Build the standalone binary for distribution.
//
// Bun's --compile flag bundles the entrypoint (and its imports) into a single
// executable. We invoke it once with `--compile` against entry.mjs so that
// react / openai / opentui etc. are all resolved at build time, not at runtime.
// Without this, the binary fails with "Cannot find package 'react'".
//
// Run after `npm run build` (which regenerates entry.mjs via build-entry.mjs).

import { execSync } from "child_process";
import { mkdirSync, rmSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { platform, arch } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TMP = resolve(ROOT, "release-tmp");

const PLATFORM_MAP = { linux: "linux", darwin: "macos", win32: "windows" };
const ARCH_MAP = { x64: "amd64", arm64: "arm64" };

const platformName = PLATFORM_MAP[platform()];
const archName = ARCH_MAP[arch()];

if (!platformName || !archName) {
  console.error(`Unsupported platform: ${platform()}/${arch()}`);
  process.exit(1);
}

const assetName = `apex-dev-${platformName}-${archName}`;
const outfile = resolve(TMP, assetName);

if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const target = `bun-${platformName}-${archName}`;
console.log(`Compiling entry.mjs to standalone ${target} binary...`);

execSync(
  `bun build entry.mjs --compile --target=${target} --outfile=${outfile}`,
  { stdio: "inherit", cwd: ROOT }
);

console.log(`\nBinary: ${outfile}`);
console.log(`Asset:  ${assetName}`);
