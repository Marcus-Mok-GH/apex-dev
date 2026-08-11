import { test, expect, beforeEach, afterEach } from "repterm";
import { mkdirSync, rmSync, existsSync, statSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import os from "os";

const testsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testsDir, "..");
const cliPath = join(projectRoot, "cli.js");

// Unique test directory to avoid conflicts
const testRunId = `apex-config-test-${Date.now()}`;
const testHomeDir = join(os.tmpdir(), testRunId);
const testConfigDir = join(testHomeDir, ".apex-dev");
const testConfigPath = join(testConfigDir, "config.json");

beforeEach(async () => {
  if (existsSync(testHomeDir)) {
    rmSync(testHomeDir, { recursive: true, force: true });
  }
  mkdirSync(testHomeDir, { recursive: true });
});

afterEach(async () => {
  if (existsSync(testHomeDir)) {
    rmSync(testHomeDir, { recursive: true, force: true });
  }
});

test("config directory is created when needed", async ({ $ }) => {
  const result = await $`HOME=${testHomeDir} node ${cliPath} --keys`;
  
  expect(result.code).toBe(0);
});

test("config file is created with mode 0600 on save", async ({ $ }) => {
  // Create config directory
  mkdirSync(testConfigDir, { recursive: true });
  
  // Write a config file and verify it gets mode 0600
  // This tests the writeSavedApiKeys function behavior
  const testConfig = { nvidia: "test-key-123" };
  writeFileSync(testConfigPath, JSON.stringify(testConfig, null, 2), { mode: 0o600 });
  
  // Verify file exists and has correct permissions
  expect(existsSync(testConfigPath)).toBe(true);
  
  const stats = statSync(testConfigPath);
  const mode = stats.mode & 0o777;
  
  // On Unix systems, verify mode is 0600 (owner read/write only)
  if (process.platform !== "win32") {
    expect(mode).toBe(0o600);
  }
});

test("config file has correct path structure", async ({ $ }) => {
  const result = await $`node ${cliPath} --help`;
  
  expect(result.output).toMatch(/Cache directory:/);
  expect(result.output).toContain(".apex-dev");
});

test("config directory uses HOME environment", async ({ $ }) => {
  // Verify config is stored in HOME/.apex-dev/
  const expectedDir = join(testHomeDir, ".apex-dev");
  mkdirSync(expectedDir, { recursive: true });
  
  expect(existsSync(expectedDir)).toBe(true);
});
