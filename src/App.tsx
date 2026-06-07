import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ChameleonGuiPanel } from './components/hardware/ChameleonGuiPanel';
import { agentProfiles } from './data/profiles';
import { providerOptions } from './data/providers';
import { OllamaProvider } from './providers/ollama';
import { OpenAICompatibleProvider } from './providers/openaiCompatible';
import type { ChatMessage as ProviderChatMessage } from './providers/types';

type MessageRole = 'user' | 'assistant';
type ActiveView = 'chat' | 'hardware';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  sendToModel?: boolean;
}

const starterMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    sendToModel: false,
    content:
      'WolfeLlama Cloud Client is ready. This welcome message is UI-only and is not sent to your model.',
  },
];

function getSavedText(key: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

function getSavedBool(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback;
  const value = window.localStorage.getItem(key);
  if (value === null) return fallback;
  return value === 'true';
}

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('chat');
  const [providerId, setProviderId] = useState(() => getSavedText('wolfellama.providerId', 'ollama'));
  const [profileId, setProfileId] = useState(() => getSavedText('wolfellama.profileId', 'general'));
  const [model, setModel] = useState(() => getSavedText('wolfellama.model', 'llama3.1'));
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(() => getSavedText('wolfellama.ollamaBaseUrl', 'http://127.0.0.1:11434'));
  const [cloudBaseUrl, setCloudBaseUrl] = useState(() => getSavedText('wolfellama.cloudBaseUrl', ''));
  const [cloudApiKey, setCloudApiKey] = useState('');
  const [apiKeyLabel, setApiKeyLabel] = useState('Ollama local');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [temperature, setTemperature] = useState(() => Number(getSavedText('wolfellama.temperature', '0.7')));
  const [maxTokens, setMaxTokens] = useState(() => Number(getSavedText('wolfellama.maxTokens', '1200')));
  const [memoryEnabled, setMemoryEnabled] = useState(() => getSavedBool('wolfellama.memoryEnabled', true));
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [pinnedModel, setPinnedModel] = useState(() => getSavedBool('wolfellama.pinnedModel', true));
  const [sendSystemPrompt, setSendSystemPrompt] = useState(() => getSavedBool('wolfellama.sendSystemPrompt', false));
  const [ollamaTerminalMode, setOllamaTerminalMode] = useState(() => getSavedBool('wolfellama.ollamaTerminalMode', true));

  const selectedProvider = useMemo(
    () => providerOptions.find((provider) => provider.id === providerId) ?? providerOptions[0],
    [providerId],
  );

  const visibleModels = useMemo(() => {
    if (providerId === 'ollama' && availableModels.length) {
      return availableModels;
    }

    if (providerId !== 'ollama' && availableModels.length) {
      return availableModels;
    }

    return selectedProvider.modelExamples;
  }, [availableModels, providerId, selectedProvider.modelExamples]);

  const selectedProfile = useMemo(
    () => agentProfiles.find((profile) => profile.id === profileId) ?? agentProfiles[0],
    [profileId],
  );

  const ollamaProvider = useMemo(() => new OllamaProvider(ollamaBaseUrl), [ollamaBaseUrl]);

  const cloudProvider = useMemo(() => {
    if (!selectedProvider.openAICompatible || providerId === 'ollama') return undefined;

    return new OpenAICompatibleProvider({
      id: selectedProvider.id,
      name: selectedProvider.name,
      baseUrl: cloudBaseUrl || selectedProvider.baseUrlHint || '',
      apiKey: cloudApiKey,
      defaultModels: selectedProvider.modelExamples.map((name) => ({
        id: name,
        name,
        providerId: selectedProvider.id,
        supportsStreaming: false,
      })),
    });
  }, [cloudApiKey, cloudBaseUrl, providerId, selectedProvider]);

  useEffect(() => {
    window.localStorage.setItem('wolfellama.providerId', providerId);
    window.localStorage.setItem('wolfellama.profileId', profileId);
    window.localStorage.setItem('wolfellama.model', model);
    window.localStorage.setItem('wolfellama.ollamaBaseUrl', ollamaBaseUrl);
    window.localStorage.setItem('wolfellama.cloudBaseUrl', cloudBaseUrl);
    window.localStorage.setItem('wolfellama.temperature', String(temperature));
    window.localStorage.setItem('wolfellama.maxTokens', String(maxTokens));
    window.localStorage.setItem('wolfellama.memoryEnabled', String(memoryEnabled));
    window.localStorage.setItem('wolfellama.pinnedModel', String(pinnedModel));
    window.localStorage.setItem('wolfellama.sendSystemPrompt', String(sendSystemPrompt));
    window.localStorage.setItem('wolfellama.ollamaTerminalMode', String(ollamaTerminalMode));
  }, [cloudBaseUrl, memoryEnabled, maxTokens, model, ollamaBaseUrl, ollamaTerminalMode, pinnedModel, profileId, providerId, sendSystemPrompt, temperature]);

  function buildProviderMessages(userText: string): ProviderChatMessage[] {
    const priorMessages = messages
      .filter((message) => message.sendToModel !== false)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    const outboundMessages: ProviderChatMessage[] = [];

    if (sendSystemPrompt && selectedProfile.systemPrompt.trim()) {
      outboundMessages.push({
        role: 'system',
        content: selectedProfile.systemPrompt,
      });
    }

    outboundMessages.push(...priorMessages);
    outboundMessages.push({
      role: 'user',
      content: userText,
    });

    return outboundMessages;
  }

  function handleProviderChange(nextProviderId: string) {
    const nextProvider = providerOptions.find((provider) => provider.id === nextProviderId) ?? providerOptions[0];
    setProviderId(nextProviderId);
    setAvailableModels([]);
    if (!pinnedModel) {
      setModel(nextProvider.modelExamples[0] ?? 'select-model');
    }

    if (nextProviderId === 'ollama') {
      setApiKeyLabel('Ollama local');
      return;
    }

    setCloudBaseUrl(nextProvider.baseUrlHint ?? '');
    setApiKeyLabel(nextProvider.openAICompatible ? `${nextProvider.name} ready for API key` : `${nextProvider.name} native adapter pending`);
  }

  function handleModelChange(nextModel: string) {
    setModel(nextModel);
    setPinnedModel(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsBusy(true);

    try {
      if (providerId === 'ollama') {
        const response = ollamaTerminalMode
          ? await ollamaProvider.sendGenerate({
              model,
              prompt: trimmed,
              temperature,
              maxOutputTokens: maxTokens,
            })
          : await ollamaProvider.sendChat({
              model,
              temperature,
              maxOutputTokens: maxTokens,
              messages: buildProviderMessages(trimmed),
            });

        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: response.content || 'Ollama returned an empty response.',
          },
        ]);
      } else if (cloudProvider) {
        const response = await cloudProvider.sendChat({
          model,
          temperature,
          maxOutputTokens: maxTokens,
          messages: buildProviderMessages(trimmed),
        });

        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: response.content || `${selectedProvider.name} returned an empty response.`,
          },
        ]);
      } else {
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content:
              `${selectedProvider.name} is visible, but it needs a native adapter. Use OpenAI, OpenRouter, Groq, Mistral, Together, Perplexity, or Custom for live cloud chat right now.`,
          },
        ]);
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          sendToModel: false,
          content: `Provider error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
      ]);
    } finally {
      setIsBusy(false);
    }
  }

  function sendHardwareOutputToChat(text: string) {
    setInput(text);
    setActiveView('chat');
  }

  async function handleConnectProvider() {
    if (providerId !== 'ollama') {
      if (!selectedProvider.openAICompatible || !cloudProvider) {
        setApiKeyLabel(`${selectedProvider.name} native adapter pending`);
        setAvailableModels(selectedProvider.modelExamples);
        return;
      }

      if (!cloudApiKey.trim()) {
        setApiKeyLabel(`${selectedProvider.name} needs API key`);
        setAvailableModels(selectedProvider.modelExamples);
        return;
      }

      setIsBusy(true);
      try {
        const models = await cloudProvider.listModels();
        const names = models.map((item) => item.name);
        const nextModels = names.length ? names : selectedProvider.modelExamples;
        setAvailableModels(nextModels);
        if (!pinnedModel) {
          setModel(nextModels[0] ?? model);
        }
        setApiKeyLabel(`${selectedProvider.name} connected • ${nextModels.length} models`);
      } catch (error) {
        setAvailableModels(selectedProvider.modelExamples);
        setApiKeyLabel(`${selectedProvider.name} model fetch failed`);
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            sendToModel: false,
            content:
              `${selectedProvider.name} connection failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nModel selection is kept as: ${model}`,
          },
        ]);
      } finally {
        setIsBusy(false);
      }
      return;
    }

    setIsBusy(true);
    try {
      const models = await ollamaProvider.listModels();
      const names = models.map((item) => item.name);
      setAvailableModels(names);
      setApiKeyLabel(names.length ? `Ollama connected • ${names.length} models` : 'Ollama connected • no models found');
      if (names.length && !pinnedModel) {
        setModel(names[0]);
      }
    } catch (error) {
      setApiKeyLabel('Ollama not reachable');
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          sendToModel: false,
          content:
            `Ollama connection failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nModel selection is kept as: ${model}`,
        },
      ]);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">WL</div>
          <div>
            <h1>WolfeLlama</h1>
            <p>Cloud + Local Client</p>
          </div>
        </div>

        <button className="new-chat-button" type="button" onClick={() => setMessages(starterMessages)}>
          + New Chat
        </button>

        <section className="sidebar-section">
          <h2>Workspace</h2>
          <button
            className={`history-item ${activeView === 'chat' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveView('chat')}
          >
            Command Room
          </button>
          <button
            className={`history-item ${activeView === 'hardware' ? 'active' : ''}`}
            type="button"
            onClick={() => setActiveView('hardware')}
          >
            Hardware
          </button>
          <button className="history-item" type="button">
            Provider Setup
          </button>
          <button className="history-item" type="button">
            Local Memory
          </button>
        </section>

        <section className="sidebar-section muted-list">
          <h2>Live Now</h2>
          <span>Ollama local</span>
          <span>OpenAI-compatible cloud</span>
          <span>OpenRouter</span>
          <span>Groq / Mistral / Together</span>
          <span>Perplexity / Custom</span>
        </section>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Private AI console</p>
            <h2>{activeView === 'hardware' ? 'Hardware' : selectedProfile.name}</h2>
          </div>
          <div className="status-pill">{activeView === 'hardware' ? 'Chameleon companion' : apiKeyLabel}</div>
        </header>

        {activeView === 'hardware' ? (
          <ChameleonGuiPanel onSendToChat={sendHardwareOutputToChat} />
        ) : (
          <>
            <section className="control-grid">
              <label>
                Provider
                <select value={providerId} onChange={(event) => handleProviderChange(event.target.value)}>
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
                <input list="available-models" value={model} onChange={(event) => handleModelChange(event.target.value)} />
                <datalist id="available-models">
                  {visibleModels.map((visibleModel) => (
                    <option key={visibleModel} value={visibleModel} />
                  ))}
                </datalist>
              </label>

              <button className="connect-button" type="button" onClick={handleConnectProvider} disabled={isBusy}>
                {isBusy ? 'Working...' : providerId === 'ollama' ? 'Connect Ollama' : 'Connect Cloud'}
              </button>
            </section>

            {providerId === 'ollama' ? (
              <section className="local-provider-card">
                <label>
                  Ollama local endpoint
                  <input value={ollamaBaseUrl} onChange={(event) => setOllamaBaseUrl(event.target.value)} />
                </label>
                <p>
                  Terminal Mode uses Ollama generate format. Turn it off only if you want structured chat-role behavior.
                </p>
              </section>
            ) : (
              <section className="local-provider-card cloud-config-card">
                <label>
                  Cloud API key
                  <input
                    type="password"
                    value={cloudApiKey}
                    onChange={(event) => setCloudApiKey(event.target.value)}
                    placeholder="Paste provider API key"
                  />
                </label>
                <label>
                  Base URL
                  <input value={cloudBaseUrl || selectedProvider.baseUrlHint || ''} onChange={(event) => setCloudBaseUrl(event.target.value)} />
                </label>
                <p>
                  {selectedProvider.openAICompatible
                    ? 'Live cloud chat is wired for this provider. Keys are currently session-only until OS keychain storage is connected.'
                    : 'This provider needs a native adapter. Use OpenRouter as a bridge for this model family for now.'}
                </p>
              </section>
            )}

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
                    placeholder={providerId === 'ollama' ? 'Ask your local Ollama model...' : `Ask ${selectedProvider.name}...`}
                  />
                  <button type="submit" disabled={isBusy}>{isBusy ? '...' : 'Send'}</button>
                </form>
              </div>

              <aside className="settings-card">
                <h3>Session Controls</h3>
                <label className="toggle-row">
                  Pin model
                  <input
                    type="checkbox"
                    checked={pinnedModel}
                    onChange={(event) => setPinnedModel(event.target.checked)}
                  />
                </label>

                {providerId === 'ollama' && (
                  <label className="toggle-row">
                    Terminal Mode
                    <input
                      type="checkbox"
                      checked={ollamaTerminalMode}
                      onChange={(event) => setOllamaTerminalMode(event.target.checked)}
                    />
                  </label>
                )}

                <label className="toggle-row">
                  Send profile prompt
                  <input
                    type="checkbox"
                    checked={sendSystemPrompt}
                    onChange={(event) => setSendSystemPrompt(event.target.checked)}
                    disabled={providerId === 'ollama' && ollamaTerminalMode}
                  />
                </label>

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
                  <h4>Prompt Mode</h4>
                  <p>
                    {providerId === 'ollama' && ollamaTerminalMode
                      ? 'Terminal Mode — app sends only the current typed prompt through Ollama generate.'
                      : sendSystemPrompt
                        ? selectedProfile.systemPrompt
                        : 'Profile prompt off — model receives chat messages without an added system prompt.'}
                  </p>
                </div>

                <div className="provider-preview">
                  <h4>{providerId === 'ollama' && availableModels.length ? 'Installed Models' : 'Available Models'}</h4>
                  {visibleModels.map((example) => (
                    <button key={example} type="button" onClick={() => handleModelChange(example)}>
                      {example}
                    </button>
                  ))}
                </div>
              </aside>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
