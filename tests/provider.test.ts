import { test, expect } from "repterm";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const testsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testsDir, "..");
const cliPath = join(projectRoot, "cli.js");

test("help exposes managed service flags", async ({ $ }) => {
  const result = await $`node ${cliPath} --help`;

  expect(result.code).toBe(0);
  expect(result.output).toContain("--setup");
  expect(result.output).toContain("--keys");
});

test("keys reports the managed service without listing providers", async ({ $ }) => {
  const result = await $`node ${cliPath} --keys`;

  expect(result.code).toBe(0);
  expect(result.stderr).toContain("service ready");
  expect(result.stderr).not.toMatch(/NVIDIA|OpenAI|OpenRouter|Groq|Gemini|Together|Baseten/);
});
