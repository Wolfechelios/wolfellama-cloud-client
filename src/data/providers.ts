export interface ProviderOption {
  id: string;
  name: string;
  description: string;
  baseUrlHint?: string;
  modelExamples: string[];
  local?: boolean;
  requiresApiKey?: boolean;
  openAICompatible?: boolean;
}

export const providerOptions: ProviderOption[] = [
  {
    id: 'ollama',
    name: 'Ollama Local',
    description: 'Built-in local model provider through Ollama on this machine. No cloud key required.',
    baseUrlHint: 'http://127.0.0.1:11434',
    modelExamples: ['llama3.1', 'qwen2.5-coder', 'mistral', 'gemma2'],
    local: true,
    requiresApiKey: false,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'OpenAI-compatible cloud models using an API key.',
    baseUrlHint: 'https://api.openai.com/v1',
    modelExamples: ['gpt-4.1', 'gpt-4.1-mini'],
    requiresApiKey: true,
    openAICompatible: true,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude models. Native adapter pending.',
    modelExamples: ['claude-sonnet', 'claude-haiku'],
    requiresApiKey: true,
    openAICompatible: false,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini models. Native adapter pending.',
    modelExamples: ['gemini-pro', 'gemini-flash'],
    requiresApiKey: true,
    openAICompatible: false,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'One key for many model providers.',
    baseUrlHint: 'https://openrouter.ai/api/v1',
    modelExamples: ['openai/gpt-4.1-mini', 'anthropic/claude', 'google/gemini'],
    requiresApiKey: true,
    openAICompatible: true,
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Fast hosted inference for supported models.',
    baseUrlHint: 'https://api.groq.com/openai/v1',
    modelExamples: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    requiresApiKey: true,
    openAICompatible: true,
  },
  {
    id: 'mistral',
    name: 'Mistral',
    description: 'Mistral hosted models.',
    baseUrlHint: 'https://api.mistral.ai/v1',
    modelExamples: ['mistral-large-latest', 'mistral-small-latest'],
    requiresApiKey: true,
    openAICompatible: true,
  },
  {
    id: 'together',
    name: 'Together AI',
    description: 'Hosted open model access.',
    baseUrlHint: 'https://api.together.xyz/v1',
    modelExamples: ['meta-llama-model', 'qwen-coder-model'],
    requiresApiKey: true,
    openAICompatible: true,
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'Cloud models with optional online answer modes.',
    baseUrlHint: 'https://api.perplexity.ai',
    modelExamples: ['sonar', 'sonar-pro'],
    requiresApiKey: true,
    openAICompatible: true,
  },
  {
    id: 'custom',
    name: 'Custom Endpoint',
    description: 'Any OpenAI-compatible cloud endpoint.',
    baseUrlHint: 'https://api.example.com/v1',
    modelExamples: ['custom-model-name'],
    requiresApiKey: true,
    openAICompatible: true,
  },
];
