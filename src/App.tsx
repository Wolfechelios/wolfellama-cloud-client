import { FormEvent, useMemo, useState } from 'react';
import { agentProfiles } from './data/profiles';
import { providerOptions } from './data/providers';

type MessageRole = 'user' | 'assistant';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

const starterMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'WolfeLlama Cloud Client is ready. Choose a provider, pick a profile, and start a clean cloud-model chat.',
  },
];

function App() {
  const [providerId, setProviderId] = useState('openrouter');
  const [profileId, setProfileId] = useState('general');
  const [model, setModel] = useState('select-model-after-connection');
  const [apiKeyLabel, setApiKeyLabel] = useState('Not connected');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1200);
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  const selectedProvider = useMemo(
    () => providerOptions.find((provider) => provider.id === providerId) ?? providerOptions[0],
    [providerId],
  );

  const selectedProfile = useMemo(
    () => agentProfiles.find((profile) => profile.id === profileId) ?? agentProfiles[0],
    [profileId],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content:
        'Cloud adapter not connected yet. Next pass wires this screen to provider adapters, keychain storage, and streaming responses.',
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput('');
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">WL</div>
          <div>
            <h1>WolfeLlama</h1>
            <p>Cloud Client</p>
          </div>
        </div>

        <button className="new-chat-button" type="button" onClick={() => setMessages(starterMessages)}>
          + New Chat
        </button>

        <section className="sidebar-section">
          <h2>Chats</h2>
          <button className="history-item active" type="button">
            Command Room
          </button>
          <button className="history-item" type="button">
            Provider Setup
          </button>
          <button className="history-item" type="button">
            Local Memory
          </button>
        </section>

        <section className="sidebar-section muted-list">
          <h2>Excluded</h2>
          <span>GitHub tools</span>
          <span>Package testing</span>
          <span>Sandbox runner</span>
          <span>Repo scanner</span>
        </section>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Private cloud AI console</p>
            <h2>{selectedProfile.name}</h2>
          </div>
          <div className="status-pill">{apiKeyLabel}</div>
        </header>

        <section className="control-grid">
          <label>
            Provider
            <select value={providerId} onChange={(event) => setProviderId(event.target.value)}>
              {providerOptions.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Profile
            <select value={profileId} onChange={(event) => setProfileId(event.target.value)}>
              {agentProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Model
            <input value={model} onChange={(event) => setModel(event.target.value)} />
          </label>

          <button className="connect-button" type="button" onClick={() => setApiKeyLabel(`${selectedProvider.name} pending key`)}>
            Connect Provider
          </button>
        </section>

        <section className="workspace">
          <div className="chat-card">
            <div className="chat-header">
              <div>
                <h3>Chat</h3>
                <p>{selectedProvider.description}</p>
              </div>
              <button type="button" className="ghost-button">
                Export
              </button>
            </div>

            <div className="message-list">
              {messages.map((message) => (
                <article key={message.id} className={`message ${message.role}`}>
                  <span>{message.role === 'user' ? 'You' : 'WolfeLlama'}</span>
                  <p>{message.content}</p>
                </article>
              ))}
            </div>

            <form className="composer" onSubmit={handleSubmit}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask the selected cloud model..."
              />
              <button type="submit">Send</button>
            </form>
          </div>

          <aside className="settings-card">
            <h3>Session Controls</h3>
            <label>
              Temperature
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(event) => setTemperature(Number(event.target.value))}
              />
              <strong>{temperature.toFixed(1)}</strong>
            </label>

            <label>
              Max output tokens
              <input
                type="number"
                min="64"
                max="32000"
                value={maxTokens}
                onChange={(event) => setMaxTokens(Number(event.target.value))}
              />
            </label>

            <label className="toggle-row">
              Local memory
              <input
                type="checkbox"
                checked={memoryEnabled}
                onChange={(event) => setMemoryEnabled(event.target.checked)}
              />
            </label>

            <div className="profile-preview">
              <h4>Active System Prompt</h4>
              <p>{selectedProfile.systemPrompt}</p>
            </div>

            <div className="provider-preview">
              <h4>Model Examples</h4>
              {selectedProvider.modelExamples.map((example) => (
                <button key={example} type="button" onClick={() => setModel(example)}>
                  {example}
                </button>
              ))}
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

export default App;
