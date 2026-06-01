import { test, expect } from "repterm";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, rmSync, existsSync } from "fs";
import os from "os";

const testsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testsDir, "..");
const cliPath = join(projectRoot, "cli.js");

const testRunId = `apex-err-test-${Date.now()}`;
const testHomeDir = join(os.tmpdir(), testRunId);

test("help flag exits cleanly", async ({ $ }) => {
  // Test --help works correctly
  const result = await $`node ${cliPath} --help`;

  expect(result.code).toBe(0);
  expect(result.output).toMatch(/apex-dev v\d+\.\d+\.\d+/);
});

test("platform detection shows correct info", async ({ $ }) => {
  const result = await $`node ${cliPath} --help`;
  
  expect(result.output).toMatch(/Detected platform:/);
  expect(result.output).toMatch(/Binary name:/);
  expect(result.output).toMatch(/Cache directory:/);
});

test("binary download URL is shown", async ({ $ }) => {
  const result = await $`node ${cliPath} --help`;
  
  expect(result.output).toMatch(/Download URL:/);
  expect(result.output).toContain("github.com");
});

test("handles missing API keys gracefully", async ({ $ }) => {
  // Run with isolated HOME and no keys
  mkdirSync(testHomeDir, { recursive: true });
  
  const result = await $`HOME=${testHomeDir} FIREWORKS_API_KEY= OPENAI_API_KEY= OPENROUTER_API_KEY= GROQ_API_KEY= GEMINI_API_KEY= TOGETHER_API_KEY= ANTHROPIC_API_KEY= node ${cliPath} --keys`;

  expect(result.code).toBe(0);
  expect(result.stderr).toMatch(/No API keys|provider/i);
});
