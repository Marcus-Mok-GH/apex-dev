import { test, expect } from "repterm";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get absolute path to cli.js
const testsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testsDir, "..");
const cliPath = join(projectRoot, "cli.js");

test("apex --help shows version and flags", async ({ $ }) => {
  const result = await $`node ${cliPath} --help`;
  
  expect(result.code).toBe(0);
  expect(result.output).toMatch(/apex-dev v\d+\.\d+\.\d+/);
  expect(result.output).toContain("--setup");
  expect(result.output).toContain("--keys");
  expect(result.output).toContain("--help");
});

test("apex -h shows same help output", async ({ $ }) => {
  const result = await $`node ${cliPath} -h`;
  
  expect(result.code).toBe(0);
  expect(result.output).toMatch(/apex-dev v\d+\.\d+\.\d+/);
  expect(result.output).toContain("--setup");
  expect(result.output).toContain("--keys");
});

test("apex --keys shows provider status", async ({ $ }) => {
  const result = await $`node ${cliPath} --keys`;
  
  expect(result.code).toBe(0);
  
  const hasProviders = result.output.includes("Fireworks") || 
                       result.output.includes("OpenAI") ||
                       result.output.includes("No API keys");
  expect(hasProviders).toBe(true);
});

test("apex shows version in help output", async ({ $ }) => {
  const result = await $`node ${cliPath} --help`;

  expect(result.code).toBe(0);
  expect(result.output).toMatch(/v\d+\.\d+\.\d+/);
});