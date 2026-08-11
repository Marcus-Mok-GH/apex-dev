# Changelog

## 2026-08-11

- Refined the terminal UI with a richer indigo theme, stronger visual hierarchy, cleaner project/status header, polished welcome panel, improved message labels, safer narrow-terminal dividers, and a more focused command input.
- Synchronized CLI and TUI provider selection with the NVIDIA-first provider registry and updated model resolution to follow the active provider.
- Made the generated entry bundle use an injected package version instead of resolving package.json at runtime, and centralized provider fetch options.
- Restored the text-valid provider configuration and corrected the generated entry build's OpenAI import collision so the project can validate and build.
- Fixed the provider setup selector's malformed no-key guidance string discovered during the build check.
- Updated provider and configuration tests for the current provider registry.
