import type { AgentStep } from './agentTypes';

function makeStep(title: string, detail: string, index: number): AgentStep {
  return {
    id: `step-${index + 1}`,
    title,
    detail,
    status: 'pending',
  };
}

export function createDeterministicPlan(goal: string): AgentStep[] {
  const cleanGoal = goal.trim();

  return [
    makeStep('Clarify the goal', `Restate the requested outcome: ${cleanGoal}`, 0),
    makeStep('Identify constraints', 'List boundaries, existing features to preserve, and assumptions.', 1),
    makeStep('Break work into modules', 'Separate the task into smaller pieces that can be reviewed independently.', 2),
    makeStep('Prepare implementation order', 'Choose the order that keeps the existing app stable.', 3),
    makeStep('Complete the next step', 'Produce the next concrete result for the task.', 4),
    makeStep('Check the result', 'Compare the output against the goal and note missing pieces.', 5),
    makeStep('Save progress', 'Store what was done so the task can resume after reload.', 6),
    makeStep('Report status', 'Summarize completed work, blocked items, and the next step.', 7),
  ];
}
