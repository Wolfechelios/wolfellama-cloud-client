export interface ConversationRecord {
  id: string;
  title: string;
  providerId: string;
  model: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  createdAt: string;
}

export interface LocalMemoryRecord {
  id: string;
  profileId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderSettingsRecord {
  providerId: string;
  displayName: string;
  baseUrl?: string;
  defaultModel?: string;
  createdAt: string;
  updatedAt: string;
}
