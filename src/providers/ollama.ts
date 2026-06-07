import type { ChatRequest, ChatResponse, CloudModelProvider, ModelInfo } from './types';

interface OllamaModelResponse {
  models?: Array<{
    name: string;
  }>;
}

interface OllamaChatResponse {
  model?: string;
  message?: {
    content?: string;
  };
  done?: boolean;
  prompt_eval_count?: number;
  eval_count?: number;
}

interface OllamaGenerateResponse {
  model?: string;
  response?: string;
  done?: boolean;
  prompt_eval_count?: number;
  eval_count?: number;
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export class OllamaProvider implements CloudModelProvider {
  readonly id = 'ollama';
  readonly name = 'Ollama Local';
  readonly requiresApiKey = false;
  readonly baseUrl: string;

  constructor(baseUrl = 'http://127.0.0.1:11434') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async listModels(): Promise<ModelInfo[]> {
    const response = await fetch(`${this.baseUrl}/api/tags`);

    if (!response.ok) {
      throw new Error(`Ollama model list failed: ${response.status}`);
    }

    const data = (await response.json()) as OllamaModelResponse;

    return (data.models ?? []).map((model) => ({
      id: model.name,
      name: model.name,
      providerId: this.id,
      supportsStreaming: false,
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

  async sendGenerate(request: OllamaGenerateRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        prompt: request.prompt,
        stream: false,
        options: {
          temperature: request.temperature,
          num_predict: request.maxOutputTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama generate failed: ${response.status}`);
    }

    const data = (await response.json()) as OllamaGenerateResponse;

    return {
      model: data.model ?? request.model,
      content: data.response ?? '',
      finishReason: data.done ? 'done' : undefined,
      usage: {
        inputTokens: data.prompt_eval_count,
        outputTokens: data.eval_count,
      },
    };
  }

  async sendChat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        stream: false,
        options: {
          temperature: request.temperature,
          num_predict: request.maxOutputTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama chat failed: ${response.status}`);
    }

    const data = (await response.json()) as OllamaChatResponse;

    return {
      model: data.model ?? request.model,
      content: data.message?.content ?? '',
      finishReason: data.done ? 'done' : undefined,
      usage: {
        inputTokens: data.prompt_eval_count,
        outputTokens: data.eval_count,
      },
    };
  }

  async *streamChat() {
    throw new Error('Ollama streaming will be added after the base adapter is wired.');
  }
}

export const defaultOllamaProvider = new OllamaProvider();
