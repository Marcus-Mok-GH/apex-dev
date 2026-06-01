import { test, expect } from "repterm";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const testsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testsDir, "..");
const cliPath = join(projectRoot, "cli.js");

test("invalid flag handling", async ({ $ }) => {
  const result = await $`node ${cliPath} --invalid-flag`;

  expect(result.code).toBe(0);
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
  const result = await $`node ${cliPath} --keys`;

  expect(result.code).toBe(0);
  expect(result.output).toMatch(/select a provider|No API keys|please set your API key/i);
});