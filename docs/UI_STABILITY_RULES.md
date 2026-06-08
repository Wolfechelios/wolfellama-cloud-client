# UI Stability Rules

The app must preserve the restored chat-first layout.

## Do Not Break

Do not remove or redesign these without explicit approval:

- Command Room chat screen.
- Provider selector.
- Profile selector.
- Model input.
- Check Local Model / Connect Cloud button.
- Ollama endpoint card.
- Cloud key/base URL card.
- Session Controls panel.
- Terminal Mode toggle.
- Local memory toggle.
- Chameleon Hardware tab.
- Agent Mode tab.

## Terminal Mode Rule

Terminal Mode must remain the clean local-model path:

- Ollama uses `/api/generate`.
- Profile prompt is off.
- UI welcome/status messages are not sent to the model.
- Pin model stays on by default.
- Local memory can be turned on or off.

## Agent Mode Rule

Agent Mode should grow step-by-step.

Allowed first:

- Planning.
- Task memory.
- Step advancement.
- Task logs.
- Manual approval UI.
- Read-only project awareness.

Not allowed until approved:

- Automatic terminal commands.
- File overwrites.
- Package installation.
- Git commits.
- Destructive actions.

## Development Rule

Every future pass should be small and reversible.

Prefer adding one focused feature over changing the full app shell.
