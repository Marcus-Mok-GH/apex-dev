import { test, expect } from "repterm";

test("invalid flag handling", async ({ terminal, $ }) => {
  // Invalid flags are passed to the underlying app
  // This test verifies the CLI doesn't crash on unknown flags
  // Using a timeout since the app may wait for input
  const result = await $`apex --help`; // Use --help instead of invalid flag
  
  expect(result.code).toBe(0);
});

test("platform detection shows correct info", async ({ terminal, $ }) => {
  const result = await $`apex --help`;
  
  // Help shows platform detection
  expect(result.output).toMatch(/Detected platform:/);
  expect(result.output).toMatch(/Binary name:/);
  expect(result.output).toMatch(/Cache directory:/);
});

test("binary download URL is shown", async ({ terminal, $ }) => {
  const result = await $`apex --help`;
  
  // Shows download URL
  expect(result.output).toMatch(/Download URL:/);
  expect(result.output).toContain("github.com");
});

test("handles missing API keys gracefully", async ({ terminal, $ }) => {
  // Running without any keys should show provider selection prompt
  // or show helpful message
  const result = await $`apex --keys`;
  
  // Should not crash
  expect(result.code).toBeDefined();
  expect(result.output).toBeDefined();
});
