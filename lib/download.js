import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

export async function downloadBinary(url, destPath, expectedSha256) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  const tmpPath = `${destPath}.tmp.${Date.now()}`;

  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "binary-downloader/1.0" },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to download binary: HTTP ${response.status} ${response.statusText}\nURL: ${url}`
      );
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.length === 0) {
      throw new Error(`Downloaded binary is empty (0 bytes): ${url}`);
    }

    if (expectedSha256) {
      const actual = createHash("sha256").update(buffer).digest("hex");
      if (actual !== expectedSha256) {
        throw new Error(
          `SHA256 mismatch.\n  Expected: ${expectedSha256}\n  Got:      ${actual}`
        );
      }
    }

    fs.writeFileSync(tmpPath, buffer);
    fs.renameSync(tmpPath, destPath);

    return { path: destPath, size: buffer.length };
  } catch (err) {
    try { fs.unlinkSync(tmpPath); } catch {}
    throw err;
  }
}
