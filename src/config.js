const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const os = require("os");

const CONFIG_PATH = path.join(os.homedir(), ".apex-dev", "config.json");

function readSavedApiKeys() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return {};
    const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeSavedApiKeys(config) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  fs.chmodSync(CONFIG_PATH, 0o600);
}

function getSavedApiKey(providerKey) {
  const config = readSavedApiKeys();
  return config[providerKey] || "";
}

function getProviderLoginState(providerKey) {
  const provider = PROVIDERS[providerKey];
  if (!provider) return "empty";
  if (provider.noKey) return "logged-in";
  if (process.env[provider.envKey]) return "logged-in";
  if (getSavedApiKey(providerKey)) return "saved";
  return "empty";
}

function updateSavedApiKey(providerKey, apiKey) {
  const config = readSavedApiKeys();
  if (apiKey) {
    config[providerKey] = apiKey;
  } else {
    delete config[providerKey];
  }
  if (Object.keys(config).length === 0) {
    try {
      fs.unlinkSync(CONFIG_PATH);
    } catch {}
    return config;
  }
  writeSavedApiKeys(config);
  return config;
}

function clearSavedApiKey(providerKey) {
  return updateSavedApiKey(providerKey, "");
}

function loginProvider(providerKey, apiKey) {
  updateSavedApiKey(providerKey, apiKey);
  setProvider(providerKey, apiKey);
  return { providerKey, apiKey };
}

function logoutProvider(providerKey) {
  clearSavedApiKey(providerKey);
  const provider = PROVIDERS[providerKey];
  if (provider) {
    delete process.env[provider.envKey];
    if (currentProvider === providerKey) {
      setProvider(providerKey, "");
    }
  }
  const remaining = getFirstSavedProvider();
  if (remaining) {
    currentProvider = remaining.providerKey;
    process.env[remaining.provider.envKey] = remaining.apiKey;
    setProvider(remaining.providerKey, remaining.apiKey);
  }
  return remaining;
}

function getFirstSavedProvider() {
  const config = readSavedApiKeys();
  for (const [providerKey, provider] of Object.entries(PROVIDERS)) {
    if (config[providerKey]) {
      return { providerKey, apiKey: config[providerKey], provider };
    }
  }
  return null;
}

// ──௺ Provider registry ───────────────────────────────────────────────────
const PROVIDER = {
  fireworks: {t"    label: "Fireworks AI",
    baseURL: process.env.APEX_API_URL || "https://api.fireworks.ai/inference/v1",
    envKey: "FIREwERK(API_KEY",
    models: {},
  },
  openai: {
    label: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    envKey: "OPENAI_API_KEY",
    models: {},
  },
};
