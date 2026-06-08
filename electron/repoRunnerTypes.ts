export interface EnvField {
  key: string;
  value: string;
  required: boolean;
  description?: string;
}

export interface DesktopRepoInspectResult {
  localPath: string;
  appType: string;
  packageManager: string;
  installCommand: string;
  runCommands: Array<{ label: string; command: string; port?: number }>;
  selectedRunCommand?: string;
  previewUrl?: string;
  envFields: EnvField[];
  status: string;
  logs: string[];
}

export interface DesktopRepoRunnerApi {
  cloneRepo(repoUrl: string, targetName?: string): Promise<{ localPath: string; name: string; logs: string[] }>;
  inspectRepo(localPath: string): Promise<DesktopRepoInspectResult>;
  installDependencies(projectId: string, localPath: string, installCommand: string): Promise<{ logs: string[] }>;
  startProject(projectId: string, localPath: string, command: string, previewUrl?: string): Promise<{ previewUrl?: string; logs: string[] }>;
  stopProject(projectId: string): Promise<{ logs: string[] }>;
  restartProject(projectId: string, localPath: string, command: string, previewUrl?: string): Promise<{ previewUrl?: string; logs: string[] }>;
  saveEnv(localPath: string, fields: EnvField[]): Promise<{ logs: string[] }>;
  openPreview(previewUrl: string): Promise<void>;
}
