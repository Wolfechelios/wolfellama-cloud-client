import { existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

export const repoRunnerProjectsRoot = path.join(homedir(), 'WolfeLlamaProjects');

export function ensureRepoRunnerProjectsRoot() {
  if (!existsSync(repoRunnerProjectsRoot)) {
    mkdirSync(repoRunnerProjectsRoot, { recursive: true });
  }

  return repoRunnerProjectsRoot;
}

export function sanitizeProjectName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').slice(0, 80) || 'repo-project';
}

export function repoNameFromUrl(repoUrl: string) {
  const fallback = `repo-${Date.now()}`;
  const withoutGit = repoUrl.replace(/\.git$/, '');
  return sanitizeProjectName(withoutGit.split('/').filter(Boolean).pop() ?? fallback);
}
