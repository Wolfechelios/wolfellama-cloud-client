# Next Pass

The starter shell is now in place. The next implementation pass should wire the product shell to real local and provider services.

## Priority 1 — Provider Connection Flow

- Add provider settings form
- Save provider metadata locally
- Save API keys through the desktop keychain bridge
- Test provider connection
- Fetch model list
- Set default model

## Priority 2 — Real Chat Requests

- Build request composer from selected profile and visible chat messages
- Call the selected provider adapter
- Render loading state
- Render errors cleanly
- Add stop generation support
- Add regenerate response support

## Priority 3 — Streaming

- Implement streaming for OpenAI-compatible chat completions
- Add chunk parsing
- Update the active assistant message as tokens arrive
- Add cancellation with AbortController

## Priority 4 — Local Storage

- Add SQLite database
- Create tables for conversations, messages, local memory, provider settings, and agent profiles
- Save every message locally
- Add searchable conversation sidebar

## Priority 5 — Desktop Hardening

- Add Electron main and preload process
- Move API key access out of renderer
- Add OS keychain implementation
- Add window controls
- Add production build settings

## Priority 6 — Polish

- First-run setup wizard
- Empty states
- Provider capability badges
- Appearance settings
- Import/export settings
- Local memory screen
