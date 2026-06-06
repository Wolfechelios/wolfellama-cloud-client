import type { CloudModelProvider } from './types';

export class ProviderRegistry {
  private readonly providers = new Map<string, CloudModelProvider>();

  register(provider: CloudModelProvider) {
    this.providers.set(provider.id, provider);
  }

  get(providerId: string) {
    return this.providers.get(providerId);
  }

  list() {
    return Array.from(this.providers.values());
  }
}

export const providerRegistry = new ProviderRegistry();
