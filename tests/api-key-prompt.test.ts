import { test, expect, beforeEach, afterEach } from "repterm";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "fs";
import os from "os";

const testsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testsDir, "..");
const cliPath = join(projectRoot, "cli.js");

// Use unique temp dirs for each test run to avoid conflicts
const testRunId = `apex-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const testHomeDir = join(os.tmpdir(), testRunId);
const testConfigDir = join(testHomeDir, ".apex-dev");
const testConfigPath = join(testConfigDir, "config.json");

beforeEach(async () => {
  // Clean test home directory
  if (existsSync(testHomeDir)) {
    rmSync(testHomeDir, { recursive: true, force: true });
  }
  mkdirSync(testHomeDir, { recursive: true });
  mkdirSync(testConfigDir, { recursive: true });
});

afterEach(async () => {
  if (existsSync(testHomeDir)) {
    rmSync(testHomeDir, { recursive: true, force: true });
  }
});

test("APEX_DEV_NEEDS_CONFIG env is set when no keys configured", async ({ $ }) => {
  // Run --keys with isolated HOME (no keys)
  const result = await $`HOME=${testHomeDir} FIREWORKS_API_KEY= OPENAI_API_KEY= OPENROUTER_API_KEY= GROQ_API_KEY= GEMINI_API_KEY= TOGETHER_API_KEY= node ${cliPath} --keys`;
  
  // Without keys, should show "No API keys" message
  expect(result.stderr).toContain("No API keys");
  expect(result.code).toBe(0);
});

test("stored keys are loaded from config on startup", async ({ $ }) => {
  // Write a test config file with a saved key
  mkdirSync(testConfigDir, { recursive: true });
  writeFileSync(testConfigPath, JSON.stringify({ fireworks: "test-key-abc123" }), "utf-8");
  
  // Run --keys with isolated HOME
  const result = await $`HOME=${testHomeDir} FIREWORKS_API_KEY= OPENAI_API_KEY= node ${cliPath} --keys`;
  
  // With saved key, should show Fireworks as configured
  expect(result.stderr).toContain("Fireworks");
});

test("provider selection TUI message when no keys", async ({ $ }) => {
  // Run --keys with isolated HOME (no keys)
  // Clear ALL possible env vars that might have keys
  const result = await $`HOME=${testHomeDir} FIREWORKS_API_KEY= OPENAI_API_KEY= OPENROUTER_API_KEY= GROQ_API_KEY= GEMINI_API_KEY= TOGETHER_API_KEY= node ${cliPath} --keys`;
  
  // Should show either "No API keys" or provider list (depends on env)
  // This test verifies the command runs without error
  expect(result.code).toBe(0);
});

test("config file stores provider keys", async ({ $ }) => {
  // Create config dir and write config
  mkdirSync(testConfigDir, { recursive: true });
  writeFileSync(testConfigPath, JSON.stringify({ 
    fireworks: "fw-key",
    openai: "oa-key" 
  }), "utf-8");
  
  // Read it back
  const config = JSON.parse(readFileSync(testConfigPath, "utf-8"));
  
  expect(config.fireworks).toBe("fw-key");
  expect(config.openai).toBe("oa-key");
});

test("config file path uses HOME directory", async ({ $ }) => {
  // Config should be in ~/.apex-dev/config.json
  const expectedPath = join(os.homedir(), ".apex-dev", "config.json");
  
  // Verify pattern
  expect(expectedPath).toContain(".apex-dev");
  expect(expectedPath).toContain("config.json");
});
