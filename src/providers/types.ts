export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'openrouter'
  | 'groq'
  | 'mistral'
  | 'together'
  | 'perplexity'
  | 'custom';

export interface ModelInfo {
  id: string;
  name: string;
  providerId: ProviderId | string;
  contextWindow?: number;
  supportsStreaming?: boolean;
  supportsVision?: boolean;
  supportsFiles?: boolean;
  supportsWebSearch?: boolean;
}

export interface ChatMessage {
  id?: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  createdAt?: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
}

export interface ChatResponse {
  id?: string;
  model: string;
  content: string;
  finishReason?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
}

export interface ChatChunk {
  id?: string;
  delta: string;
  done?: boolean;
}

export interface CloudModelProvider {
  id: ProviderId | string;
  name: string;
  baseUrl?: string;
  requiresApiKey: boolean;

  listModels(): Promise<ModelInfo[]>;
  testConnection(): Promise<boolean>;
  sendChat(request: ChatRequest): Promise<ChatResponse>;
  streamChat(request: ChatRequest): AsyncIterable<ChatChunk>;
}
