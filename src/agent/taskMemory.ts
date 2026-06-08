import type { AgentTask } from './agentTypes';

const AGENT_TASK_KEY = 'wolfellama.agentTask';

export function loadAgentTask(): AgentTask | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const raw = window.localStorage.getItem(AGENT_TASK_KEY);
    if (!raw) return undefined;

    const parsed = JSON.parse(raw) as AgentTask;
    if (!parsed || typeof parsed.id !== 'string' || typeof parsed.goal !== 'string') return undefined;

    return parsed;
  } catch {
    return undefined;
  }
}

export function saveAgentTask(task: AgentTask) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AGENT_TASK_KEY, JSON.stringify(task));
}

export function clearAgentTask() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AGENT_TASK_KEY);
}
