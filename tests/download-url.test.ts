import { test, expect } from "repterm";
import { createRequire } from "module";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const testsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(testsDir, "..");
const cli = require(join(projectRoot, "cli.js"));

test("download URL is valid HTTPS GitHub release asset URL", () => {
  const url = cli.getDownloadUrl();
  const parsed = new URL(url);

  expect(parsed.protocol).toBe("https:");
  expect(parsed.hostname).toBe("github.com");
  expect(parsed.pathname).toContain(`/${cli.RELEASE_OWNER}/${cli.RELEASE_REPO}/releases/download/${cli.RELEASE_TAG}/`);
  expect(parsed.pathname.endsWith(`/${cli.getBinaryName()}`)).toBe(true);
});

test("all binary download sources are valid HTTPS URLs", () => {
  const sources = cli.getDownloadSources();

  expect(sources.length).toBeGreaterThan(0);
  for (const source of sources) {
    const parsed = new URL(source.url);
    expect(parsed.protocol).toBe("https:");
    expect(parsed.pathname).toContain(`/${cli.RELEASE_TAG}/`);
    expect(parsed.pathname.endsWith(`/${cli.getBinaryName()}`)).toBe(true);
  }
});

test("download URL validator rejects non-HTTPS URLs", () => {
  expect(() => cli.assertValidHttpsUrl("http://example.com/apex-dev-linux-amd64")).toThrow(/HTTPS/);
});
