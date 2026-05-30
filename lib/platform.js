import os from "node:os";
import fs from "node:fs";

const KNOWN_GOOS = new Set(["linux", "darwin", "win32", "freebsd", "openbsd"]);
const KNOWN_GOARCH = new Set(["x64", "arm64", "ia32", "arm", "s390x", "ppc64", "riscv64"]);

const goarchMap = {
  x64: "amd64",
  arm64: "arm64",
  ia32: "386",
  arm: "armv7l",
  s390x: "s390x",
  ppc64: "ppc64le",
  riscv64: "riscv64",
};

const goosMap = {
  linux: "linux",
  darwin: "darwin",
  win32: "windows",
  freebsd: "freebsd",
  openbsd: "openbsd",
};

function mapToCanonical(platform, mapping, label) {
  const value = mapping[platform];
  if (!value) {
    throw new Error(
      `Unsupported ${label}: ${platform}. ` +
      `Supported values: ${Object.keys(mapping).join(", ")}`
    );
  }
  return value;
}

export function getPlatform() {
  const platform = os.platform();
  const arch = os.arch();
  return {
    os: mapToCanonical(platform, goosMap, "OS"),
    arch: mapToCanonical(arch, goarchMap, "architecture"),
    rawOs: platform,
    rawArch: arch,
  };
}

export function getBinaryName(name) {
  const { os: goos, arch } = getPlatform();
  const ext = goos === "windows" ? ".exe" : "";
  return `${name}-${goos}-${arch}${ext}`;
}

export function getTriple() {
  const { os: goos, arch } = getPlatform();
  return `${goos}-${arch}`;
}

export function ensureExecutable(filePath) {
  try {
    const mode = fs.statSync(filePath).mode;
    fs.chmodSync(filePath, mode | 0o111);
  } catch {
    // file may not exist yet — caller handles
  }
}
