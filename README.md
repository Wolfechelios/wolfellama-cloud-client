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

## Product Behavior

The app should be a lightweight user-controlled client between the desktop interface and the selected model provider.

It should avoid extra product friction such as repo checks, package-test gates, sandbox requirements, developer-mode prompts, forced setup loops, or unnecessary confirmation screens.

The standard message path should be:

1. User writes a message.
2. App applies the selected profile and system prompt.
3. App sends the request to the selected provider and model.
4. App streams the response back into the chat.

The user controls:

- Provider selection
- Model selection
- System prompt
- Agent profile
- Temperature
- Max output tokens
- Streaming
- Memory
- Local data
- Conversation export

The app should stay compatible with the selected provider's API requirements and account settings while keeping WolfeLlama itself lightweight, direct, and user-controlled.

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
