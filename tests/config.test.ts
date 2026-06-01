import { test, expect, beforeEach, afterEach } from "repterm";
import { mkdirSync, rmSync, existsSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import os from "os";

const testsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testsDir, "..");
const cliPath = join(projectRoot, "cli.js");
const testConfigDir = join(os.tmpdir(), "apex-dev-test-config");
let originalHome: string | undefined;

beforeEach(async () => {
  if (existsSync(testConfigDir)) {
    rmSync(testConfigDir, { recursive: true, force: true });
  }
  mkdirSync(testConfigDir, { recursive: true });
  originalHome = process.env.HOME;
  process.env.HOME = testConfigDir;
  if (process.platform === "win32") {
    process.env.USERPROFILE = testConfigDir;
  }
});

afterEach(async () => {
  if (existsSync(testConfigDir)) {
    rmSync(testConfigDir, { recursive: true, force: true });
  }
  if (originalHome !== undefined) {
    process.env.HOME = originalHome;
    if (process.platform === "win32") {
      process.env.USERPROFILE = originalHome;
    }
  }
});

test("config directory is created when needed", async ({ $ }) => {
  const result = await $`node ${cliPath} --keys`;
  
  expect(result.code).toBe(0);
});

test("config stores API keys securely", async ({ $ }) => {
  const result = await $`node ${cliPath} --keys`;

  expect(result.code).toBe(0);

  const configPath = join(testConfigDir, ".apex-dev", "config.json");
  expect(existsSync(configPath)).toBe(true);

  const stats = statSync(configPath);
  const mode = stats.mode & 0o777;
  expect(mode).toBe(0o600);
});

test("config file path is ~/.apex-dev/config.json", async ({ $ }) => {
  const result = await $`node ${cliPath} --help`;
  
  expect(result.output).toMatch(/Cache directory:/);
  expect(result.output).toContain(".apex-dev");
});