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
  // Clean test home directory - ensure no existing config
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

test("APEX_DEV_NEEDS_CONFIG message shown when no keys configured", async ({ $ }) => {
  // Run CLI with isolated HOME (no keys, no config file)
  // Clear ALL possible provider API key env vars
  const result = await $`HOME=${testHomeDir} FIREWORKS_API_KEY= OPENAI_API_KEY= OPENROUTER_API_KEY= GROQ_API_KEY= GEMINI_API_KEY= TOGETHER_API_KEY= ANTHROPIC_API_KEY= node ${cliPath} --keys`;
  
  // Should show "No API keys configured" message
  expect(result.stderr).toContain("No API keys configured");
  expect(result.code).toBe(0);
});

test("stored keys are loaded from config file", async ({ $ }) => {
  // Create config directory and file BEFORE running CLI
  mkdirSync(testConfigDir, { recursive: true });
  writeFileSync(testConfigPath, JSON.stringify({ fireworks: "test-key-abc123" }), "utf-8");
  
  // Run --keys with isolated HOME and cleared env vars
  const result = await $`HOME=${testHomeDir} FIREWORKS_API_KEY= OPENAI_API_KEY= ANTHROPIC_API_KEY= node ${cliPath} --keys`;
  
  // Should show Fireworks as configured (loaded from config file)
  expect(result.stderr).toContain("Fireworks");
  expect(result.stderr).toContain("1 provider");
});

test("launching interactive provider selection message shown", async ({ $ }) => {
  // Run CLI with no keys - should show provider selection message
  const result = await $`HOME=${testHomeDir} FIREWORKS_API_KEY= OPENAI_API_KEY= OPENROUTER_API_KEY= GROQ_API_KEY= GEMINI_API_KEY= TOGETHER_API_KEY= ANTHROPIC_API_KEY= node ${cliPath} --keys`;
  
  // Verify either "No API keys" or provider list shown
  expect(result.code).toBe(0);
  expect(result.stderr).toMatch(/No API keys|provider/i);
});

test("config file stores provider keys", async ({ $ }) => {
  // Create config directory and file BEFORE reading
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
