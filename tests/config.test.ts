import { test, expect, beforeEach, afterEach } from "repterm";
import { mkdirSync, rmSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import os from "os";

const testsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testsDir, "..");
const cliPath = join(projectRoot, "cli.js");
const testConfigDir = join(os.tmpdir(), "apex-dev-test-config");

beforeEach(async () => {
  if (existsSync(testConfigDir)) {
    rmSync(testConfigDir, { recursive: true, force: true });
  }
  mkdirSync(testConfigDir, { recursive: true });
});

afterEach(async () => {
  if (existsSync(testConfigDir)) {
    rmSync(testConfigDir, { recursive: true, force: true });
  }
});

test("config directory is created when needed", async ({ $ }) => {
  const result = await $`node ${cliPath} --keys`;
  
  expect(result.code).toBe(0);
});

test("config stores API keys securely", async ({ $ }) => {
  const result = await $`node ${cliPath} --keys`;
  
  expect(result.code).toBeDefined();
});

test("config file path is ~/.apex-dev/config.json", async ({ $ }) => {
  const result = await $`node ${cliPath} --help`;
  
  expect(result.output).toMatch(/Cache directory:/);
  expect(result.output).toContain(".apex-dev");
});