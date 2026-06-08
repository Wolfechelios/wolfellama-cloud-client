import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AgentPanel } from './components/agent/AgentPanel';
import { BuilderPanel } from './components/builder/BuilderPanel';
import { ChameleonGuiPanel } from './components/hardware/ChameleonGuiPanel';
import { RepoRunnerPanel } from './components/repoRunner/RepoRunnerPanel';
import { agentProfiles } from './data/profiles';
import { providerOptions } from './data/providers';
import { OllamaProvider } from './providers/ollama';
import { OpenAICompatibleProvider } from './providers/openaiCompatible';
import type { ChatMessage as ProviderChatMessage } from './providers/types';

type MessageRole = 'user' | 'assistant';
type ActiveView = 'chat' | 'agent' | 'builder' | 'repoRunner' | 'hardware';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  sendToModel?: boolean;
}

const MEMORY_MESSAGES_KEY = 'wolfellama.messages';

const starterMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    sendToModel: false,
    content: 'WolfeLlama Cloud Client is ready. This welcome message is UI-only and is not sent to your model.',
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

function getSavedMessages() {
  if (typeof window === 'undefined') return starterMessages;

  try {
    const raw = window.localStorage.getItem(MEMORY_MESSAGES_KEY);
    if (!raw) return starterMessages;

    const parsed = JSON.parse(raw) as ChatMessage[];
    if (!Array.isArray(parsed) || parsed.length === 0) return starterMessages;

    return parsed.filter((message) => {
      return (
        message &&
        typeof message.id === 'string' &&
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string'
      );
    });
  } catch {
    return starterMessages;
  }
}

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('chat');
  const [providerId, setProviderId] = useState(() => getSavedText('wolfellama.providerId', 'ollama'));
  const [profileId, setProfileId] = useState(() => getSavedText('wolfellama.profileId', 'terminal'));
  const [model, setModel] = useState(() => getSavedText('wolfellama.model', 'reefer/monica:latest'));
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState(() => getSavedText('wolfellama.ollamaBaseUrl', 'http://127.0.0.1:11434'));
  const [cloudBaseUrl, setCloudBaseUrl] = useState(() => getSavedText('wolfellama.cloudBaseUrl', ''));
  const [cloudApiKey, setCloudApiKey] = useState('');
  const [statusLabel, setStatusLabel] = useState('Selected');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(getSavedMessages);
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

  const selectedProfile = useMemo(
    () => agentProfiles.find((profile) => profile.id === profileId) ?? agentProfiles[0],
    [profileId],
  );

  const visibleModels = useMemo(() => {
    if (availableModels.length) return availableModels;
    return selectedProvider.modelExamples;
  }, [availableModels, selectedProvider.modelExamples]);

  const effectiveTerminalMode = profileId === 'terminal' || (providerId === 'ollama' && ollamaTerminalMode);
  const activeBaseUrl = providerId === 'ollama' ? ollamaBaseUrl : cloudBaseUrl || selectedProvider.baseUrlHint || '';
  const promptLayerOn = sendSystemPrompt && !effectiveTerminalMode;

  const agentContext = useMemo(
    () => ({
      providerId,
      providerName: selectedProvider.name,
      model,
      mode: effectiveTerminalMode ? 'Terminal Mode' : selectedProfile.name,
      memoryEnabled,
    }),
    [effectiveTerminalMode, memoryEnabled, model, providerId, selectedProfile.name, selectedProvider.name],
  );

  const ollamaProvider = useMemo(() => new OllamaProvider(ollamaBaseUrl), [ollamaBaseUrl]);

  const cloudProvider = useMemo(() => {
    if (!selectedProvider.openAICompatible || providerId === 'ollama') return undefined;

    return new OpenAICompatibleProvider({
      id: selectedProvider.id,
      name: selectedProvider.name,
      baseUrl: activeBaseUrl,
      apiKey: cloudApiKey,
      defaultModels: selectedProvider.modelExamples.map((name) => ({
        id: name,
        name,
        providerId: selectedProvider.id,
        supportsStreaming: false,
      })),
    });
  }, [activeBaseUrl, cloudApiKey, providerId, selectedProvider]);

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

  useEffect(() => {
    if (memoryEnabled) {
      window.localStorage.setItem(MEMORY_MESSAGES_KEY, JSON.stringify(messages));
    }
  }, [memoryEnabled, messages]);

  useEffect(() => {
    if (profileId === 'terminal') {
      setSendSystemPrompt(false);
      setOllamaTerminalMode(true);
    }
  }, [profileId]);

  function getModelVisibleHistory() {
    if (!memoryEnabled) return [];
    return messages.filter((message) => message.sendToModel !== false);
  }

  function buildTerminalPrompt(userText: string) {
    const history = getModelVisibleHistory();
    if (!history.length) return userText;

    const priorTurns = history
      .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
      .join('\n\n');

    return `${priorTurns}\n\nUser: ${userText}\nAssistant:`;
  }

  function buildProviderMessages(userText: string): ProviderChatMessage[] {
    const priorMessages = getModelVisibleHistory().map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const outboundMessages: ProviderChatMessage[] = [];

    if (promptLayerOn && selectedProfile.systemPrompt.trim()) {
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
    setStatusLabel(nextProviderId === 'ollama' ? 'Selected' : 'Needs API key');

    if (!pinnedModel) {
      setModel(nextProvider.modelExamples[0] ?? 'select-model');
    }

    if (nextProviderId !== 'ollama') {
      setCloudBaseUrl(nextProvider.baseUrlHint ?? '');
    }
  }

  function handleModelChange(nextModel: string) {
    setModel(nextModel);
    setPinnedModel(true);
    setStatusLabel('Selected');
  }

  function handleNewChat() {
    setMessages(starterMessages);
    window.localStorage.removeItem(MEMORY_MESSAGES_KEY);
    setStatusLabel('New chat');
  }

  function handleClearMemory() {
    setMessages(starterMessages);
    window.localStorage.removeItem(MEMORY_MESSAGES_KEY);
    setStatusLabel('Memory cleared');
  }

  function sendTextToChat(text: string) {
    setInput(text);
    setActiveView('chat');
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
        const response = effectiveTerminalMode
          ? await ollamaProvider.sendGenerate({
              model,
              prompt: buildTerminalPrompt(trimmed),
              temperature,
              maxOutputTokens: maxTokens,
            })
          : await ollamaProvider.sendChat({
              model,
              temperature,
              maxOutputTokens: maxTokens,
              messages: buildProviderMessages(trimmed),
            });

        setStatusLabel('Ready');
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

        setStatusLabel('Ready');
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: response.content || `${selectedProvider.name} returned an empty response.`,
          },
        ]);
      } else {
        setStatusLabel('Provider unavailable');
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            sendToModel: false,
            content: `${selectedProvider.name} needs a native adapter. Use an OpenAI-compatible provider or Custom Endpoint for live cloud chat right now.`,
          },
        ]);
      }
    } catch (error) {
      setStatusLabel('Error');
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

  async function handleConnectProvider() {
    if (providerId !== 'ollama') {
      if (!selectedProvider.openAICompatible || !cloudProvider) {
        setStatusLabel('Provider unavailable');
        setAvailableModels(selectedProvider.modelExamples);
        return;
      }

      if (!cloudApiKey.trim()) {
        setStatusLabel('Needs API key');
        setAvailableModels(selectedProvider.modelExamples);
        return;
      }

      setIsBusy(true);
      setStatusLabel('Checking');
      try {
        const models = await cloudProvider.listModels();
        const names = models.map((item) => item.name);
        const nextModels = names.length ? names : selectedProvider.modelExamples;
        setAvailableModels(nextModels);
        if (!pinnedModel) {
          setModel(nextModels[0] ?? model);
        }
        setStatusLabel('Ready');
      } catch (error) {
        setAvailableModels(selectedProvider.modelExamples);
        setStatusLabel('Endpoint error');
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            sendToModel: false,
            content: `${selectedProvider.name} connection failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nModel selection is kept as: ${model}`,
          },
        ]);
      } finally {
        setIsBusy(false);
      }
      return;
    }

    setIsBusy(true);
    setStatusLabel('Checking');
    try {
      const models = await ollamaProvider.listModels();
      const names = models.map((item) => item.name);
      setAvailableModels(names);
      const exists = names.includes(model);
      setStatusLabel(exists ? 'Loaded locally' : 'Model not found');
      if (names.length && !pinnedModel) {
        setModel(names[0]);
      }
    } catch (error) {
      setStatusLabel('Ollama offline');
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          sendToModel: false,
          content: `Ollama connection failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nModel selection is kept as: ${model}`,
        },
      ]);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="app-shell" lang="en">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">WL</div>
          <div>
            <h1>WolfeLlama</h1>
            <p>GitHub Repo Runner</p>
          </div>
        </div>

        <button className="new-chat-button" type="button" onClick={handleNewChat}>
          + New Chat
        </button>

        <section className="sidebar-section">
          <h2>Workspace</h2>
          <button className={`history-item ${activeView === 'repoRunner' ? 'active' : ''}`} type="button" onClick={() => setActiveView('repoRunner')}>Repo Runner</button>
          <button className={`history-item ${activeView === 'builder' ? 'active' : ''}`} type="button" onClick={() => setActiveView('builder')}>Builder Mode</button>
          <button className={`history-item ${activeView === 'chat' ? 'active' : ''}`} type="button" onClick={() => setActiveView('chat')}>Command Room</button>
          <button className={`history-item ${activeView === 'agent' ? 'active' : ''}`} type="button" onClick={() => setActiveView('agent')}>Agent Mode</button>
          <button className={`history-item ${activeView === 'hardware' ? 'active' : ''}`} type="button" onClick={() => setActiveView('hardware')}>Hardware</button>
          <button className="history-item" type="button">Provider Setup</button>
          <button className="history-item" type="button" onClick={handleClearMemory}>Clear Memory</button>
        </section>

        <section className="sidebar-section muted-list">
          <h2>Live Now</h2>
          <span>Paste GitHub URL</span>
          <span>Builder planning</span>
          <span>Draft file changes</span>
          <span>Project library</span>
          <span>Plain-English logs</span>
          <span>AI error explanation</span>
        </section>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">Private AI console</p>
            <h2>{activeView === 'builder' ? 'Builder Mode' : activeView === 'repoRunner' ? 'Repo Runner' : activeView === 'hardware' ? 'Hardware' : activeView === 'agent' ? 'Agent Mode' : selectedProfile.name}</h2>
          </div>
          <div className="status-pill">{activeView === 'builder' ? 'AI build workspace' : activeView === 'repoRunner' ? 'GitHub app launcher' : activeView === 'hardware' ? 'Chameleon companion' : activeView === 'agent' ? 'Task workspace' : statusLabel}</div>
        </header>

        {activeView === 'builder' ? (
          <BuilderPanel onSendToChat={sendTextToChat} />
        ) : activeView === 'repoRunner' ? (
          <RepoRunnerPanel onExplainWithChat={sendTextToChat} />
        ) : activeView === 'hardware' ? (
          <ChameleonGuiPanel onSendToChat={sendTextToChat} />
        ) : activeView === 'agent' ? (
          <AgentPanel context={agentContext} />
        ) : (
          <>
            <section className="control-grid">
              <label>Provider<select value={providerId} onChange={(event) => handleProviderChange(event.target.value)}>{providerOptions.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}</select></label>
              <label>Profile<select value={profileId} onChange={(event) => setProfileId(event.target.value)}>{agentProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></label>
              <label>Model<input list="available-models" value={model} onChange={(event) => handleModelChange(event.target.value)} /><datalist id="available-models">{visibleModels.map((visibleModel) => <option key={visibleModel} value={visibleModel} />)}</datalist></label>
              <button className="connect-button" type="button" onClick={handleConnectProvider} disabled={isBusy}>{isBusy ? 'Working...' : providerId === 'ollama' ? 'Check Local Model' : 'Connect Cloud'}</button>
            </section>

            {providerId === 'ollama' ? (
              <section className="local-provider-card">
                <label>Ollama local endpoint<input value={ollamaBaseUrl} onChange={(event) => setOllamaBaseUrl(event.target.value)} /></label>
                <p>Active: {model} • {effectiveTerminalMode ? 'Terminal Mode' : 'Chat Mode'} • Prompt Layer {promptLayerOn ? 'On' : 'Off'} • Memory {memoryEnabled ? 'On' : 'Off'}</p>
              </section>
            ) : (
              <section className="local-provider-card cloud-config-card">
                <label>Cloud API key<input type="password" value={cloudApiKey} onChange={(event) => setCloudApiKey(event.target.value)} placeholder="Paste provider API key" /></label>
                <label>Base URL<input value={activeBaseUrl} onChange={(event) => setCloudBaseUrl(event.target.value)} /></label>
                <p>Active: {model} • {selectedProvider.name} • Memory {memoryEnabled ? 'On' : 'Off'}</p>
              </section>
            )}

            <section className="workspace">
              <div className="chat-card">
                <div className="chat-header"><div><h3>Chat</h3><p>{selectedProvider.description}</p></div><button type="button" className="ghost-button" onClick={handleClearMemory}>Clear Memory</button></div>
                <div className="message-list">{messages.map((message) => <article key={message.id} className={`message ${message.role}`}><span>{message.role === 'user' ? 'You' : 'WolfeLlama'}</span><p>{message.content}</p></article>)}</div>
                <form className="composer" onSubmit={handleSubmit}><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder={providerId === 'ollama' ? 'Ask your local Ollama model...' : `Ask ${selectedProvider.name}...`} /><button type="submit" disabled={isBusy}>{isBusy ? '...' : 'Send'}</button></form>
              </div>

              <aside className="settings-card">
                <h3>Session Controls</h3>
                <label className="toggle-row">Pin model<input type="checkbox" checked={pinnedModel} onChange={(event) => setPinnedModel(event.target.checked)} /></label>
                {providerId === 'ollama' && <label className="toggle-row">Terminal Mode<input type="checkbox" checked={ollamaTerminalMode} onChange={(event) => setOllamaTerminalMode(event.target.checked)} /></label>}
                <label className="toggle-row">Send profile prompt<input type="checkbox" checked={sendSystemPrompt} onChange={(event) => setSendSystemPrompt(event.target.checked)} disabled={effectiveTerminalMode} /></label>
                <label>Temperature<input type="range" min="0" max="2" step="0.1" value={temperature} onChange={(event) => setTemperature(Number(event.target.value))} /><strong>{temperature.toFixed(1)}</strong></label>
                <label>Max output tokens<input type="number" min="64" max="32000" value={maxTokens} onChange={(event) => setMaxTokens(Number(event.target.value))} /></label>
                <label className="toggle-row">Local memory<input type="checkbox" checked={memoryEnabled} onChange={(event) => setMemoryEnabled(event.target.checked)} /></label>
                <div className="profile-preview"><h4>Prompt Mode</h4><p>{effectiveTerminalMode ? `Terminal Mode — ${memoryEnabled ? 'keeps prior turns in local memory.' : 'sends only the current prompt.'}` : promptLayerOn ? selectedProfile.systemPrompt : 'Profile prompt off — model receives chat messages without an added system prompt.'}</p></div>
                <div className="provider-preview"><h4>{providerId === 'ollama' && availableModels.length ? 'Installed Models' : 'Model Suggestions'}</h4>{visibleModels.map((example) => <button key={example} type="button" onClick={() => handleModelChange(example)}>{example}</button>)}</div>
              </aside>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default App;
