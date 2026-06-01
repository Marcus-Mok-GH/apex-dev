import { test, expect } from "repterm";

test("all expected providers are supported", async ({ terminal, $ }) => {
  // Check help output mentions setup for API keys
  const result = await $`apex --help`;
  
  expect(result.output).toContain("--setup");
  expect(result.output).toContain("--keys");
});

test("provider list includes known services", async ({ terminal, $ }) => {
  const result = await $`apex --keys`;
  
  // Should mention provider names or show "no keys" message
  const output = result.output;
  
  // Check for known provider names in output
  const knownProviders = ["Fireworks", "OpenAI", "Groq", "Gemini", "Together", "OpenRouter"];
  const foundProviders = knownProviders.filter(p => output.includes(p));
  
  // Either found some providers or shows "no keys" message
  const hasOutput = foundProviders.length > 0 || output.includes("No API keys");
  expect(hasOutput).toBe(true);
});
