# Product Requirements

## Product Name

WolfeLlama Cloud Client

## Product Type

Desktop cloud AI chat client.

## Primary User Feeling

The app should feel like a private premium AI command center: calm, fast, clean, direct, and powerful.

## Must Have

- Local-first conversation storage
- Secure API key storage
- Cloud provider setup
- Model selector
- Streaming chat
- Searchable chat history
- Agent profiles
- Local memory controls
- Import/export settings
- Dark premium UI

## Must Not Have

- GitHub integration
- Repo loading
- Pull request tools
- Package testing
- npm auditing
- Sandbox app runner
- Playwright test runner
- Project scanner
- Coding-agent file patcher

## First-Run Experience

The first launch should be simple:

1. Welcome screen
2. Choose provider
3. Enter API key
4. Test connection
5. Fetch models
6. Pick default model
7. Start chatting

No terminal setup should be required during normal use.

## Default Agent Profiles

### General Assistant
Balanced general-purpose assistant.

### Electrician Helper
Practical field support for electrical theory, NEC-oriented study, troubleshooting, and planning.

### Mechanic Helper
Vehicle troubleshooting, repair planning, and diagnostic reasoning.

### Engineer Mode
Systems thinking, designs, calculations, architecture, and technical planning.

### Music Writer
Lyrics, song structure, hooks, cadence, concept development, and release assets.

### Business Helper
Estimates, proposals, invoices, customer messaging, job planning, and operational documents.

### Legal Form Helper
Document organization, neutral language drafting, timeline building, and form preparation support. This mode should not claim to be a lawyer.

### Custom Agent
User-defined system prompt, model, memory preference, and appearance label.

## Chat Controls

- Model
- Provider
- System prompt
- Temperature
- Max output tokens
- Streaming on/off
- Memory on/off
- Regenerate
- Stop generation
- Copy response
- Edit and resend user message

## Provider Controls

- Add provider
- Edit provider
- Test connection
- Fetch model list
- Choose default model
- Add custom OpenAI-compatible endpoint
- Delete provider key

## Data Controls

- Export conversations
- Delete conversations
- Search conversations
- Disable local memory
- Delete local memory
- Export/import settings
