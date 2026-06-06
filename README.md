# WolfeLlama Cloud Client

WolfeLlama Cloud Client is a separate desktop AI chat application focused only on cloud AI model conversations.

This version does **not** include GitHub integration, repository loading, coding package testing, npm auditing, Playwright tests, sandbox app runners, project scanners, or developer workflow tools.

It is a local-first cloud AI chat client.

## Core Purpose

Create a private AI command center where the user can:

- Connect cloud AI providers with their own API keys
- Chat with multiple models
- Switch providers and models quickly
- Save conversations locally
- Manage local memory
- Create assistant profiles
- Use custom OpenAI-compatible endpoints

## Supported Providers

- OpenAI
- Anthropic
- Google Gemini
- OpenRouter
- Groq
- Mistral
- Together AI
- Perplexity
- Custom OpenAI-compatible API endpoints

## Design Goal

The app should feel like a premium private AI terminal:

- Dark interface
- Clean chat layout
- Minimal clutter
- Fast first-run setup
- Secure local storage
- Local conversation archive
- Provider status indicator
- Model selector
- Assistant profile system

## Explicitly Excluded

This app must not include:

- GitHub tools
- Repo loading
- Pull request tools
- npm package testing
- Playwright testing
- Sandbox browser
- App runner
- File-editing coding agent
- CI/CD tools
- Package diagnostics

This is a pure cloud-model chat client.

## Control Philosophy

The app should not add unnecessary internal censorship, artificial workflow blocks, forced moral lectures, repo restrictions, package-test gates, or developer-tool limitations.

The client should send the user's prompt directly to the selected cloud model, respect the chosen provider's API rules, and give the user full control over:

- Provider selection
- Model selection
- System prompt
- Temperature
- Max output tokens
- Streaming
- Memory
- Local data
- Conversation export

## Recommended Stack

- Electron
- React
- TypeScript
- SQLite
- OS keychain storage
- Provider adapter layer
- Local settings store
- Local conversation database

## First-Run Flow

1. Welcome screen
2. Choose provider
3. Enter API key
4. Test connection
5. Fetch model list
6. Pick default model
7. Start chatting
