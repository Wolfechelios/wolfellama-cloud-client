export type ModelSource =
  | 'local-ollama'
  | 'openai'
  | 'openrouter'
  | 'groq'
  | 'mistral'
  | 'together'
  | 'perplexity'
  | 'custom';

export interface ModelCatalogItem {
  source: ModelSource;
  providerId: string;
  label: string;
  modelId: string;
  baseUrl?: string;
  requiresApiKey: boolean;
  statusHint: string;
}

export const savedModelCatalog: ModelCatalogItem[] = [
  {
    source: 'local-ollama',
    providerId: 'ollama',
    label: 'Ollama: reefer/monica:latest',
    modelId: 'reefer/monica:latest',
    baseUrl: 'http://127.0.0.1:11434',
    requiresApiKey: false,
    statusHint: 'Check local Ollama',
  },
  {
    source: 'local-ollama',
    providerId: 'ollama',
    label: 'Ollama: llama3.1',
    modelId: 'llama3.1',
    baseUrl: 'http://127.0.0.1:11434',
    requiresApiKey: false,
    statusHint: 'Check local Ollama',
  },
  {
    source: 'local-ollama',
    providerId: 'ollama',
    label: 'Ollama: qwen2.5-coder',
    modelId: 'qwen2.5-coder',
    baseUrl: 'http://127.0.0.1:11434',
    requiresApiKey: false,
    statusHint: 'Check local Ollama',
  },
  {
    source: 'openrouter',
    providerId: 'openrouter',
    label: 'OpenRouter: manual model ID',
    modelId: 'provider/model-name',
    baseUrl: 'https://openrouter.ai/api/v1',
    requiresApiKey: true,
    statusHint: 'API key required',
  },
  {
    source: 'openai',
    providerId: 'openai',
    label: 'OpenAI: gpt-4.1-mini',
    modelId: 'gpt-4.1-mini',
    baseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    statusHint: 'API key required',
  },
  {
    source: 'groq',
    providerId: 'groq',
    label: 'Groq: llama-3.3-70b-versatile',
    modelId: 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
    requiresApiKey: true,
    statusHint: 'API key required',
  },
  {
    source: 'mistral',
    providerId: 'mistral',
    label: 'Mistral: mistral-large-latest',
    modelId: 'mistral-large-latest',
    baseUrl: 'https://api.mistral.ai/v1',
    requiresApiKey: true,
    statusHint: 'API key required',
  },
  {
    source: 'together',
    providerId: 'together',
    label: 'Together AI: manual model ID',
    modelId: 'custom-model-name',
    baseUrl: 'https://api.together.xyz/v1',
    requiresApiKey: true,
    statusHint: 'API key required',
  },
  {
    source: 'perplexity',
    providerId: 'perplexity',
    label: 'Perplexity: sonar-pro',
    modelId: 'sonar-pro',
    baseUrl: 'https://api.perplexity.ai',
    requiresApiKey: true,
    statusHint: 'API key required',
  },
  {
    source: 'custom',
    providerId: 'custom',
    label: 'Custom Endpoint: manual model ID',
    modelId: 'custom-model-name',
    baseUrl: 'https://api.example.com/v1',
    requiresApiKey: true,
    statusHint: 'Configure endpoint',
  },
];
