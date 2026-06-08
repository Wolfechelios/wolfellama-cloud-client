export type RepoAppType =
  | 'vite'
  | 'react'
  | 'next'
  | 'electron'
  | 'node'
  | 'python'
  | 'static'
  | 'unknown';

export type RepoPackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun' | 'pip' | 'unknown';

export type RepoProjectStatus =
  | 'new'
  | 'downloaded'
  | 'detected'
  | 'installing'
  | 'ready'
  | 'running'
  | 'stopped'
  | 'error';

export interface EnvField {
  key: string;
  value: string;
  required: boolean;
  description?: string;
}

export interface RepoRunCommand {
  label: string;
  command: string;
  port?: number;
}

export interface RepoProject {
  id: string;
  repoUrl: string;
  name: string;
  localPath?: string;
  appType: RepoAppType;
  packageManager: RepoPackageManager;
  installCommand: string;
  runCommands: RepoRunCommand[];
  selectedRunCommand?: string;
  previewUrl?: string;
  status: RepoProjectStatus;
  envFields: EnvField[];
  logs: string[];
  plainEnglishLogs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RepoRunnerBridge {
  cloneRepo(repoUrl: string, targetName?: string): Promise<{ localPath: string; name: string }>;
  inspectRepo(localPath: string): Promise<Partial<RepoProject>>;
  installDependencies(projectId: string): Promise<{ logs: string[] }>;
  startProject(projectId: string, command: string): Promise<{ previewUrl?: string; logs: string[] }>;
  stopProject(projectId: string): Promise<{ logs: string[] }>;
  restartProject(projectId: string, command: string): Promise<{ previewUrl?: string; logs: string[] }>;
  saveEnv(projectId: string, fields: EnvField[]): Promise<{ logs: string[] }>;
}
