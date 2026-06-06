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

## Control Philosophy

The app should not add unnecessary internal censorship, artificial workflow blocks, forced moral lectures, repo restrictions, package-test gates, or developer-tool limitations.

The client should send the user's prompt directly to the selected cloud model, respect the chosen provider's API rules, and give the user full control over model selection, system prompts, temperature, memory, and local data.

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
