# Model Behavior Preservation

WolfeLlama Cloud Client should preserve the behavior of the model the user selects.

The app should not add extra client-side behavior filters, forced topic gates, hidden rewrite layers, model substitution, or surprise system prompts.

## Principle

If the user selects a specific local or cloud model, WolfeLlama should:

- Keep that exact model ID.
- Keep the selected base URL.
- Keep the selected provider.
- Keep the selected temperature.
- Keep the selected max-token setting.
- Use the selected system prompt/profile only.
- Avoid silently replacing the model with a different one.
- Avoid silently appending hidden instructions.

## Local Models

For local models through Ollama, WolfeLlama should pass the selected model name directly into the Ollama request.

If the user loads a specific local model, the app should not swap it for a safer, smaller, or default model.

## Cloud Models

For cloud providers, WolfeLlama should send the exact model ID typed or selected by the user.

However, cloud providers may still enforce account access, provider policy, model availability, regional availability, rate limits, or provider-side behavior. WolfeLlama cannot override those external systems.

## Manual Model IDs

The editable Model field is intentional.

Use it for exact provider model IDs that are not returned by automatic model listing.

## Hidden Prompt Rule

WolfeLlama should not add hidden system prompts beyond the active profile/system prompt visible to the user.

Future profile editor should show the full system prompt before sending.

## Future Upgrade

Add a transparency panel showing the exact outbound request metadata before sending:

- Provider
- Base URL
- Model ID
- Profile
- System prompt
- Temperature
- Max output tokens
- Memory included or not

Do not display API keys in this panel.
