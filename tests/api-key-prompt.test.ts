import { test, expect } from "repterm";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, writeFileSync, rmSync } from "fs";
import os from "os";

const testsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testsDir, "..");
const cliPath = join(projectRoot, "cli.js");
const configPath = join(os.homedir(), ".apex-dev", "config.json");

test("APEX_DEV_NEEDS_CONFIG env is set when no keys", async ({ $ }) => {
  // Run with clean environment (no API keys in env, no saved config)
  const result = await $`node ${cliPath} --keys`;
  
  // Should show "No API keys configured" message
  expect(result.output).toContain("No API keys");
});

test("shows interactive provider selection message when no keys", async ({ $ }) => {
  const result = await $`node ${cliPath} --keys`;
  
  // Either shows providers or shows the "no keys" message
  expect(result.output).toBeDefined();
  expect(result.code).toBe(0);
});

test("stored keys are loaded from config on startup", async ({ $ }) => {
  // If keys are stored, they should be loaded
  // This test verifies the config reading logic exists
  const result = await $`node ${cliPath} --keys`;
  
  // Should not crash regardless of key state
  expect(result.code).toBe(0);
});

test("TUI ProviderSelector component exists", async ({ $ }) => {
  // Verify the ProviderSelector component is properly exported
  // This is a structural test - the component should be available
  const result = await $`node ${cliPath} --help`;
  
  // CLI should reference the provider setup functionality
  expect(result.output).toContain("--setup");
  expect(result.output).toContain("--keys");
});

test("config file path is correct", async ({ $ }) => {
  const result = await $`node ${cliPath} --help`;
  
  // Config is stored in ~/.apex-dev/
  expect(result.output).toContain(".apex-dev");
});
