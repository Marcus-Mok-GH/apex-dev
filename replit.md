# Apex AI

A terminal-based agentic coding assistant (TUI) built with React + OpenTUI.

## Overview

Apex AI is a CLI tool that runs as a rich terminal UI. It provides an interactive coding assistant powered by NVIDIA-hosted LLMs, with tools for reading/writing code, running shell commands, web search, and sub-agent orchestration.

## Tech Stack

- **Runtime**: Bun 1.3.6
- **UI Framework**: React 19 + @opentui/core + @opentui/react (terminal rendering)
- **AI**: OpenAI SDK connecting to NVIDIA AI Foundation Models
- **Entry Point**: `entry.mjs` (custom ESM entry that provides Bun bundle helpers)

## Project Structure

```
entry.mjs          - Main entry point (provides runtime helpers for bundle format)
index.jsx          - Pre-bundled source (Bun // @bun format)
src/
  agent.js         - Core agentic loop
  config.js        - Model config, session state
  store.js         - App state management
  server.js        - Local proxy server for NVIDIA API
  tools.js         - Tool definitions
  toolExecutors.js - Tool implementations (Read, Write, Bash, WebSearch, etc.)
  prompt.js        - System prompt builder
  commands.js      - Slash command handlers
  thinking.js      - Think block parsing
  utils.js         - Utilities
  theme.js         - Color theme
  app.jsx          - Root React component
  components/      - TUI components
  hooks/           - React hooks
dist/              - Pre-built bundle output
```

## Running

```bash
bun entry.mjs
```

## Environment Variables

- `NVIDIA_API_KEY` - API key for NVIDIA AI Foundation Models
- `APEX_API_KEY` - API key for the Apex API proxy
- `APEX_API_URL` - Custom API URL (defaults to https://apex-api-ten.vercel.app/v1)
- `APEX_LOCAL_SERVER` - Set to "1" to start a local proxy server
- `EXA_API_KEY` - API key for Exa web search

## User Preferences

- Entry point: `entry.mjs` (not `index.jsx` which is pre-bundled Bun format)
- Workflow: console output type (TUI app, not web app)
