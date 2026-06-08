export interface RepoBridgeLogResult {
  logs: string[];
}

export interface RepoBridgeCloneResult extends RepoBridgeLogResult {
  localPath: string;
  name: string;
}

export interface RepoBridgeStartResult extends RepoBridgeLogResult {
  previewUrl?: string;
}

export interface RepoBridgeEnvField {
  key: string;
  value: string;
  required: boolean;
  description?: string;
}

export interface RepoBridgeApi {
  cloneRepo(repoUrl: string, targetName?: string): Promise<RepoBridgeCloneResult>;
  inspectRepo(localPath: string): Promise<Record<string, unknown>>;
  installDependencies(projectId: string, localPath: string, installCommand: string): Promise<RepoBridgeLogResult>;
  startProject(projectId: string, localPath: string, command: string, previewUrl?: string): Promise<RepoBridgeStartResult>;
  stopProject(projectId: string): Promise<RepoBridgeLogResult>;
  restartProject(projectId: string, localPath: string, command: string, previewUrl?: string): Promise<RepoBridgeStartResult>;
  saveEnv(localPath: string, fields: RepoBridgeEnvField[]): Promise<RepoBridgeLogResult>;
  openPreview(previewUrl: string): Promise<void>;
}

declare global {
  interface Window {
    repoRunner?: RepoBridgeApi;
  }
}

export {};
