# Cloud Provider Wiring

The cloud provider selector now has two levels of support.

## Live Now

These providers use the OpenAI-compatible adapter path:

- OpenAI
- OpenRouter
- Groq
- Mistral
- Together AI
- Perplexity
- Custom Endpoint

The app now provides:

- API key field
- Base URL field
- Connect Cloud button
- Model list fetch when supported
- Chat request dispatch through `/chat/completions`
- Error messages when key, endpoint, or model is wrong

API keys are currently session-only in the React state. The next security pass should move them into the Electron main process and OS keychain.

## Native Adapter Pending

These are visible, but need native provider adapters or a bridge provider:

- Anthropic
- Google Gemini

For now, use OpenRouter if you want access to Anthropic or Gemini-family models through an OpenAI-compatible route.

## Usage

1. Select a cloud provider.
2. Paste the API key.
3. Confirm or edit the base URL.
4. Select or type the model name.
5. Click Connect Cloud.
6. Send a chat message.

If model list fetch fails, the app keeps the default model suggestions visible so the user can still type a known model manually.

## Next Pass

- Move API keys to OS keychain.
- Add Anthropic native adapter.
- Add Gemini native adapter.
- Add streaming output.
- Add stop-generation cancellation.
