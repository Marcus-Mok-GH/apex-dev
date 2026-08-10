# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Changed
- Replace the Fireworks AI provider with **NVIDIA (Free)** as the default
  - New keyless provider points at the Zo-hosted NVIDIA proxy (`https://nvidia-api-server-marcusmok.zocomputer.io`); no client API key required
  - NVIDIA models wired across all agent roles (`deepseek-v4-flash-0731`, `gemma-3-12b-it`, `gpt-oss-20b`, plus `kimi-k2.6` where available)
  - `nvidia` is now `detectInitialProvider()` default and sits first in the provider selector UI
- Remove the `replit` and `apex-nova` providers
- Update provider-order arrays and emoji map in the TUI (ApiKeyModal, ProviderSelector) to match the new provider list
- Drop `package-lock.json`/`bun.lock` registry lock pointing at the dead Replit firewall; npm install now resolves from `registry.npmjs.org`
