import type { AgentRuntimeContext, AgentTask, AgentTaskLogEntry, AgentStep } from './agentTypes';
import { createDeterministicPlan } from './planner';

function now() {
  return new Date().toISOString();
}

function makeLog(message: string): AgentTaskLogEntry {
  return {
    id: crypto.randomUUID(),
    timestamp: now(),
    message,
  };
}

export function createAgentTask(goal: string, context: AgentRuntimeContext): AgentTask {
  const timestamp = now();

  return {
    id: crypto.randomUUID(),
    goal: goal.trim(),
    status: 'ready',
    createdAt: timestamp,
    updatedAt: timestamp,
    steps: createDeterministicPlan(goal),
    log: [
      makeLog(`Task created for ${context.providerName} using ${context.model}.`),
      makeLog(`Mode: ${context.mode}. Memory: ${context.memoryEnabled ? 'on' : 'off'}.`),
    ],
  };
}

export function runNextAgentStep(task: AgentTask): AgentTask {
  const nextStep = task.steps.find((step) => step.status === 'pending');

  if (!nextStep) {
    return {
      ...task,
      status: 'complete',
      updatedAt: now(),
      log: [...task.log, makeLog('Task complete. No pending steps remain.')],
    };
  }

  const steps = task.steps.map((step): AgentStep => {
    if (step.id !== nextStep.id) return step;

    return {
      ...step,
      status: 'complete',
      result: `Completed: ${step.detail}`,
    };
  });

  const hasPending = steps.some((step) => step.status === 'pending');

  return {
    ...task,
    status: hasPending ? 'running' : 'complete',
    updatedAt: now(),
    steps,
    log: [...task.log, makeLog(`Completed step: ${nextStep.title}`)],
  };
}

export function markAgentBlocked(task: AgentTask, reason: string): AgentTask {
  return {
    ...task,
    status: 'blocked',
    updatedAt: now(),
    log: [...task.log, makeLog(`Blocked: ${reason}`)],
  };
}
