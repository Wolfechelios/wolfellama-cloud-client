# Ollama Native Provider

Ollama is now treated as a built-in local provider inside WolfeLlama Cloud Client.

It is not a cloud key provider and does not require API key storage.

## Default Endpoint

```text
http://127.0.0.1:11434
```

## App Behavior

On launch, the app defaults to:

```text
Provider: Ollama Local
Model: llama3.1
Endpoint: http://127.0.0.1:11434
```

The user can change the endpoint in the local provider card.

## Connection Flow

1. Start Ollama on the machine.
2. Pull or install a model.
3. Open WolfeLlama Cloud Client.
4. Provider defaults to Ollama Local.
5. Click Connect Provider.
6. App calls `/api/tags` and fills the model picker.
7. Send chat messages through `/api/chat`.

## Useful Commands

```bash
ollama serve
ollama pull llama3.1
ollama pull qwen2.5-coder
ollama list
```

## Current Implementation

Files:

```text
src/providers/ollama.ts
src/providers/types.ts
src/data/providers.ts
src/App.tsx
src/styles.css
```

Implemented:

- Ollama provider catalog entry
- Ollama provider type
- Local endpoint setting
- Connect Provider button calls `/api/tags`
- Model picker uses installed models when available
- Chat requests use `/api/chat`
- No API key required

## Next Upgrade

Add streaming token output from Ollama.

Recommended next files:

```text
src/providers/ollamaStream.ts
src/chat/chatService.ts
src/chat/types.ts
```

The streaming upgrade should use an AbortController so the user can stop generation.
