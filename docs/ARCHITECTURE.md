# Architecture

WolfeLlama Cloud Client is intentionally separated from WolfeLlama Dev.

This application is not a repo manager, package tester, sandbox runner, or coding-agent shell. It is a local-first cloud AI chat client.

## Layers

## 1. Desktop Shell

Responsible for:

- Native window lifecycle
- Secure key storage bridge
- Local database bridge
- File import/export bridge
- App updates later, if desired

Recommended implementation:

- Electron main process
- Strict IPC boundaries
- No direct API key access from renderer unless necessary

## 2. Renderer UI

Responsible for:

- Chat screen
- Conversation sidebar
- Provider setup
- Model picker
- Agent profiles
- Memory screen
- Appearance settings

Recommended implementation:

- React
- TypeScript
- Zustand for UI state

## 3. Provider Adapter Layer

Every cloud provider maps into one internal request/response format.

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

Providers should not leak their unique API shapes into the chat UI.

## 4. Local Storage Layer

Responsible for:

- Conversations
- Messages
- Local memory
- Provider settings, excluding API keys
- Agent profile settings
- Appearance settings

Recommended implementation:

- SQLite for chat and memory data
- JSON config for lightweight UI preferences
- OS keychain for API keys

## 5. Security Boundary

API keys should be stored in the operating system keychain.

Do not store API keys in:

- SQLite
- JSON files
- localStorage
- plain text config
- logs

## 6. Excluded System Areas

Do not add:

- GitHub repository connectors
- Pull request tools
- Terminal package runners
- App sandbox launching
- Playwright testing tools
- Repo scanning
- Coding-agent file patching

Those belong in WolfeLlama Dev, not this app.
