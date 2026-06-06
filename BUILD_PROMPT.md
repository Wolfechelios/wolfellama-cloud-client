# WolfeLlama Cloud Client — Full Build Prompt

Build a separate desktop application called WolfeLlama Cloud Client.

This app must **not** include GitHub integration, repo loading, coding package testing, npm auditing, sandbox app runners, Playwright tests, project scanners, or developer workflow tools.

The app should be a polished local-first desktop chat client for cloud AI models.

## Core Goal

Create a private AI chat console where I can connect my own cloud AI provider API keys, choose models, chat with them, save conversations locally, and switch between different assistant profiles.

## Required Cloud Provider Support

The app should support:

- OpenAI-compatible APIs
- OpenAI
- Anthropic
- Google Gemini
- OpenRouter
- Groq
- Mistral
- Together AI
- Perplexity
- Custom base URL providers

## Required Features

Include:

- Clean chat UI
- Streaming responses
- Conversation history
- Searchable local chat archive
- Secure API key storage using OS keychain
- SQLite local database
- Provider setup screen
- Model selector
- System prompt editor
- Temperature controls
- Token controls
- Import/export settings
- Local memory system
- Agent profile system
- Dark premium interface

## Agent Profiles

Include these profiles:

- General Assistant
- Electrician Helper
- Mechanic Helper
- Engineer Mode
- Music Writer
- Business Helper
- Legal Form Helper
- Custom Agent

Each profile should only change the system prompt, model defaults, and memory behavior.

Do not include GitHub, repo, package, sandbox, test, or code execution features.

## First Launch Flow

1. Welcome screen
2. Choose provider
3. Enter API key
4. Test connection
5. Fetch model list
6. Pick default model
7. Start chatting

## Design

The app should feel like a private premium AI command center.

Use:

- Dark mode first
- Graphite / glossy black background
- Electric blue or copper accent
- Large centered chat input on first launch
- Minimal sidebar
- Smooth model dropdown
- Provider status pill
- Hidden advanced controls unless opened

Avoid terminal clutter, developer noise, npm warnings, and GitHub-style UI.

## Product Behavior

The app should be a lightweight user-controlled client between the desktop interface and the selected model provider.

It should avoid extra product friction such as repo checks, package-test gates, sandbox requirements, developer-mode prompts, forced setup loops, or unnecessary confirmation screens.

The standard message path should be:

1. User writes a message.
2. App applies the selected profile and system prompt.
3. App sends the request to the selected provider and model.
4. App streams the response back into the chat.

The user controls provider selection, model selection, system prompt, agent profile, temperature, max output tokens, streaming, memory, local data, and conversation export.

The app should stay compatible with the selected provider's API requirements and account settings while keeping WolfeLlama itself lightweight, direct, and user-controlled.

## Architecture

Use:

- Electron
- React
- TypeScript
- SQLite
- OS keychain storage
- Provider adapter layer
- Local settings store
- Local conversation database

Create a provider adapter interface:

```ts
export interface CloudModelProvider {
  id: string;
  name: string;
  baseUrl?: string;
  requiresApiKey: boolean;

  listModels(): Promise<ModelInfo[]>;
  testConnection(): Promise<boolean>;
  sendChat(request: ChatRequest): Promise<ChatResponse>;
  streamChat(request: ChatRequest): AsyncIterable<ChatChunk>;
}
```

All providers should map into one internal chat format.

The app should be future-proof so new providers can be added without rewriting the chat system.
