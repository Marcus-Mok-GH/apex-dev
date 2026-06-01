import { test, expect } from "repterm";

test("apex --help shows version and flags", async ({ terminal, $ }) => {
  const result = await $`apex --help`;
  
  expect(result.code).toBe(0);
  expect(result.output).toMatch(/apex-dev v\d+\.\d+\.\d+/);
  expect(result.output).toContain("--setup");
  expect(result.output).toContain("--keys");
  expect(result.output).toContain("--help");
});

test("apex -h shows same help output", async ({ terminal, $ }) => {
  const result = await $`apex -h`;
  
  expect(result.code).toBe(0);
  expect(result.output).toMatch(/apex-dev v\d+\.\d+\.\d+/);
  expect(result.output).toContain("--setup");
  expect(result.output).toContain("--keys");
});

test("apex --keys shows provider status", async ({ terminal, $ }) => {
  const result = await $`apex --keys`;
  
  // Exits with 0 (shows status) - may show no keys if not configured
  expect([0, 0]).toContain(result.code);
  
  // Should mention providers or show "No API keys" message
  const hasProviders = result.output.includes("Fireworks") || 
                       result.output.includes("OpenAI") ||
                       result.output.includes("No API keys");
  expect(hasProviders).toBe(true);
});

test("apex shows version in help output", async ({ terminal, $ }) => {
  const result = await $`apex --help`;
  
  // Version format: major.minor.patch
  expect(result.output).toMatch(/v\d+\.\d+\.\d+/);
});
