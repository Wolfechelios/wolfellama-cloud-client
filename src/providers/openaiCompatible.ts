import type { ChatRequest, ChatResponse, CloudModelProvider, ModelInfo } from './types';

export interface OpenAICompatibleProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  defaultModels?: ModelInfo[];
}

export class OpenAICompatibleProvider implements CloudModelProvider {
  readonly id: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly requiresApiKey = true;

  private readonly apiKey?: string;
  private readonly defaultModels: ModelInfo[];

  constructor(config: OpenAICompatibleProviderConfig) {
    this.id = config.id;
    this.name = config.name;
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.defaultModels = config.defaultModels ?? [];
  }

  async listModels(): Promise<ModelInfo[]> {
    if (!this.apiKey) return this.defaultModels;

    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Model list failed for ${this.name}: ${response.status}`);
    }

    const data = await response.json();
    const models = Array.isArray(data.data) ? data.data : [];

    return models.map((model: { id: string }) => ({
      id: model.id,
      name: model.id,
      providerId: this.id,
      supportsStreaming: true,
    }));
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.listModels();
      return true;
    } catch {
      return false;
    }
  }

  async sendChat(request: ChatRequest): Promise<ChatResponse> {
    if (!this.apiKey) {
      throw new Error(`Missing API key for ${this.name}`);
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        max_tokens: request.maxOutputTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed for ${this.name}: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    return {
      id: data.id,
      model: data.model ?? request.model,
      content,
      finishReason: data.choices?.[0]?.finish_reason,
      usage: {
        inputTokens: data.usage?.prompt_tokens,
        outputTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
    };
  }

  async *streamChat() {
    throw new Error('Streaming adapter will be implemented in the provider wiring pass.');
  }
}
