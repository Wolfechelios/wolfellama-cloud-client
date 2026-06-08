import type { BuilderTask } from './builderTypes';

const BUILDER_TASK_KEY = 'wolfellama.builder.task';

export function loadBuilderTask(): BuilderTask | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const raw = window.localStorage.getItem(BUILDER_TASK_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as BuilderTask;
    if (!parsed || typeof parsed.id !== 'string' || typeof parsed.goal !== 'string') return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export function saveBuilderTask(task: BuilderTask | undefined) {
  if (typeof window === 'undefined') return;

  if (!task) {
    window.localStorage.removeItem(BUILDER_TASK_KEY);
    return;
  }

  window.localStorage.setItem(BUILDER_TASK_KEY, JSON.stringify(task));
}

export function createBuilderTask(goal: string): BuilderTask {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    goal,
    plan: [
      'Understand the requested build or fix.',
      'Identify the files likely to change.',
      'Ask AI to propose a patch plan.',
      'Review proposed changes before saving anything.',
      'Run or inspect the project after changes are accepted.',
    ],
    changes: [],
    notes: ['Builder Mode is online as a planning and patch-review workspace. File saving needs the local file editor bridge.'],
    createdAt: now,
    updatedAt: now,
  };
}
