import type { RepoProject } from './repoRunnerTypes';

const REPO_LIBRARY_KEY = 'wolfellama.repoRunner.library';

export function loadRepoLibrary(): RepoProject[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(REPO_LIBRARY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RepoProject[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((project) => project && typeof project.id === 'string' && typeof project.repoUrl === 'string');
  } catch {
    return [];
  }
}

export function saveRepoLibrary(projects: RepoProject[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(REPO_LIBRARY_KEY, JSON.stringify(projects));
}

export function upsertRepoProject(projects: RepoProject[], project: RepoProject) {
  const existing = projects.findIndex((item) => item.id === project.id);
  if (existing === -1) return [project, ...projects];

  const next = [...projects];
  next[existing] = project;
  return next;
}

export function removeRepoProject(projects: RepoProject[], projectId: string) {
  return projects.filter((project) => project.id !== projectId);
}
