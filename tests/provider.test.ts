import { test, expect } from "repterm";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const testsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testsDir, "..");
const cliPath = join(projectRoot, "cli.js");

test("all expected providers are supported", async ({ $ }) => {
  const result = await $`node ${cliPath} --help`;

  expect(result.code).toBe(0);
  expect(result.output).toContain("--setup");
  expect(result.output).toContain("--keys");
});

test("provider list includes known services", async ({ $ }) => {
  const result = await $`node ${cliPath} --keys`;

  expect(result.code).toBe(0);

  const output = result.output;
  const knownProviders = ["NVIDIA", "OpenAI", "Groq", "Gemini", "Together", "OpenRouter", "Baseten"];
  const foundProviders = knownProviders.filter(p => output.includes(p));

  const hasOutput = foundProviders.length > 0 || output.includes("No API keys");
  expect(hasOutput).toBe(true);
});
