export interface KeychainService {
  getApiKey(providerId: string): Promise<string | undefined>;
  setApiKey(providerId: string, apiKey: string): Promise<void>;
  deleteApiKey(providerId: string): Promise<void>;
}

export class BrowserKeychainPlaceholder implements KeychainService {
  private readonly keys = new Map<string, string>();

  async getApiKey(providerId: string) {
    return this.keys.get(providerId);
  }

  async setApiKey(providerId: string, apiKey: string) {
    this.keys.set(providerId, apiKey);
  }

  async deleteApiKey(providerId: string) {
    this.keys.delete(providerId);
  }
}

export const keychain = new BrowserKeychainPlaceholder();
