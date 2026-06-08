import type { EnvField, RepoAppType, RepoPackageManager, RepoProject, RepoRunCommand } from './repoRunnerTypes';

export interface RepoManifestHints {
  packageJson?: {
    scripts?: Record<string, string>;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  fileNames?: string[];
  envExample?: string;
}

function hasDependency(hints: RepoManifestHints, name: string) {
  return Boolean(hints.packageJson?.dependencies?.[name] || hints.packageJson?.devDependencies?.[name]);
}

export function detectAppType(hints: RepoManifestHints): RepoAppType {
  const files = new Set(hints.fileNames ?? []);

  if (hasDependency(hints, 'electron') || files.has('electron/main.ts') || files.has('electron/main.js')) return 'electron';
  if (hasDependency(hints, 'next') || files.has('next.config.js') || files.has('next.config.ts')) return 'next';
  if (hasDependency(hints, 'vite') || files.has('vite.config.ts') || files.has('vite.config.js')) return 'vite';
  if (hasDependency(hints, 'react') || files.has('src/main.tsx') || files.has('src/App.tsx')) return 'react';
  if (files.has('requirements.txt') || files.has('pyproject.toml') || files.has('app.py')) return 'python';
  if (files.has('package.json')) return 'node';
  if (files.has('index.html')) return 'static';
  return 'unknown';
}

export function detectPackageManager(files: string[] = []): RepoPackageManager {
  const names = new Set(files);
  if (names.has('pnpm-lock.yaml')) return 'pnpm';
  if (names.has('yarn.lock')) return 'yarn';
  if (names.has('bun.lockb') || names.has('bun.lock')) return 'bun';
  if (names.has('requirements.txt') || names.has('pyproject.toml')) return 'pip';
  if (names.has('package-lock.json') || names.has('package.json')) return 'npm';
  return 'unknown';
}

export function getInstallCommand(packageManager: RepoPackageManager) {
  switch (packageManager) {
    case 'pnpm':
      return 'pnpm install';
    case 'yarn':
      return 'yarn install';
    case 'bun':
      return 'bun install';
    case 'pip':
      return 'pip install -r requirements.txt';
    case 'npm':
      return 'npm install';
    default:
      return 'Manual setup required';
  }
}

export function detectRunCommands(hints: RepoManifestHints, appType: RepoAppType): RepoRunCommand[] {
  const scripts = hints.packageJson?.scripts ?? {};
  const commands: RepoRunCommand[] = [];

  for (const key of ['dev', 'start', 'preview', 'serve', 'electron', 'desktop']) {
    if (scripts[key]) {
      commands.push({ label: key, command: `npm run ${key}`, port: key === 'dev' || key === 'preview' ? 5173 : undefined });
    }
  }

  if (!commands.length && appType === 'python') commands.push({ label: 'python app', command: 'python app.py', port: 5000 });
  if (!commands.length && appType === 'static') commands.push({ label: 'static preview', command: 'npx serve .', port: 3000 });
  if (!commands.length && appType === 'next') commands.push({ label: 'next dev', command: 'npm run dev', port: 3000 });
  if (!commands.length && appType === 'vite') commands.push({ label: 'vite dev', command: 'npm run dev', port: 5173 });

  return commands;
}

export function parseEnvExample(value = ''): EnvField[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const [key, ...rest] = line.split('=');
      return {
        key: key.trim(),
        value: rest.join('=').trim(),
        required: true,
      };
    });
}

export function explainLogLine(line: string) {
  const text = line.toLowerCase();
  if (text.includes('eaddrinuse') || text.includes('port') && text.includes('in use')) return 'A port is already being used. Stop the other app or choose another port.';
  if (text.includes('module not found') || text.includes('cannot find module')) return 'A dependency is missing. Install dependencies again.';
  if (text.includes('enoent')) return 'A file or folder path is missing. Check the project folder and required files.';
  if (text.includes('permission denied') || text.includes('eacces')) return 'The app does not have permission for this action. Check file permissions.';
  if (text.includes('missing script')) return 'The selected run command does not exist in package.json.';
  if (text.includes('env') && text.includes('required')) return 'A required environment variable is missing.';
  return 'Log captured. Review details or ask AI to explain the issue.';
}

export function createRepoProject(repoUrl: string, hints: RepoManifestHints = {}): RepoProject {
  const timestamp = new Date().toISOString();
  const fileNames = hints.fileNames ?? [];
  const appType = detectAppType(hints);
  const packageManager = detectPackageManager(fileNames);
  const runCommands = detectRunCommands(hints, appType);
  const name = repoUrl.split('/').filter(Boolean).pop()?.replace(/\.git$/, '') ?? 'repo-project';

  return {
    id: crypto.randomUUID(),
    repoUrl,
    name,
    appType,
    packageManager,
    installCommand: getInstallCommand(packageManager),
    runCommands,
    selectedRunCommand: runCommands[0]?.command,
    previewUrl: runCommands[0]?.port ? `http://127.0.0.1:${runCommands[0].port}` : undefined,
    status: 'new',
    envFields: parseEnvExample(hints.envExample),
    logs: [],
    plainEnglishLogs: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
