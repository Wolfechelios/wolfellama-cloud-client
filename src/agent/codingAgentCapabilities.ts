export type CodingAgentCapabilityStatus = 'ready' | 'partial' | 'blocked';

export interface CodingAgentCapability {
  id: string;
  title: string;
  status: CodingAgentCapabilityStatus;
  summary: string;
  currentSupport: string[];
  nextPass: string[];
}

export const codingAgentCapabilities: CodingAgentCapability[] = [
  {
    id: 'whole-repository-context',
    title: 'Whole-Repository Context',
    status: 'partial',
    summary: 'Builder Mode can intake ZIP projects, filter junk folders, detect framework/root/package manager, and summarize important files.',
    currentSupport: ['Filtered ZIP intake', 'Source-first prioritization', '700 MB ZIP ceiling with large-ZIP guardrails'],
    nextPass: ['Desktop streamed project index', 'Incremental file map cache', 'Search across local project files'],
  },
  {
    id: 'autonomous-file-editing',
    title: 'Autonomous File Editing',
    status: 'partial',
    summary: 'Builder Mode can draft, accept, reject, and export review bundles, but direct local apply still needs the desktop file bridge.',
    currentSupport: ['Draft file changes', 'Accept/reject workflow', 'Accepted bundle export'],
    nextPass: ['Project file bridge', 'Diff preview', 'Apply accepted changes with rollback'],
  },
  {
    id: 'tool-calling',
    title: 'Function and Tool Calling',
    status: 'partial',
    summary: 'Repo Runner and Provider checks exist. Full terminal command execution and scripted tool loops are pending desktop bridge activation.',
    currentSupport: ['Repo Runner UI path', 'Provider checks', 'Chat-to-Builder handoff'],
    nextPass: ['Run scripts', 'Read terminal output', 'Git status and branch operations'],
  },
  {
    id: 'self-correction-loops',
    title: 'Self-Correction Loops',
    status: 'partial',
    summary: 'Live Audit checks app surfaces and Builder internals. Automatic run-observe-rewrite loops are not complete yet.',
    currentSupport: ['Live Audit', 'Builder drill checks', 'Error explanation through chat'],
    nextPass: ['Run build/test', 'Capture errors', 'Generate fix plan', 'Re-run until pass or blocked'],
  },
  {
    id: 'state-memory',
    title: 'State and Memory',
    status: 'ready',
    summary: 'Chat memory, Builder tasks, selected models, ZIP context, and accepted bundles persist locally.',
    currentSupport: ['Chat history memory', 'Builder task memory', 'Builder model memory', 'ZIP context memory'],
    nextPass: ['Per-project memory', 'Change history timeline', 'Rollback log'],
  },
  {
    id: 'agentic-orchestration',
    title: 'Agentic Orchestration',
    status: 'partial',
    summary: 'Agent Mode can plan and step through work. Multi-role planner/writer/tester/reviewer orchestration is defined as the next layer.',
    currentSupport: ['Agent task planning', 'Step advancement', 'Task log persistence'],
    nextPass: ['Planner agent', 'Builder agent', 'Tester agent', 'Reviewer agent', 'Coordinator state machine'],
  },
];

export const codingAgentOrchestrationRoles = [
  {
    role: 'Planner',
    job: 'Turns the user goal and project context into a spec, file map, risk list, and ordered work plan.',
  },
  {
    role: 'Builder',
    job: 'Creates proposed file changes from the plan and keeps changes reviewable before apply.',
  },
  {
    role: 'Tester',
    job: 'Runs build, lint, test, or project-specific checks and reports exact failures.',
  },
  {
    role: 'Reviewer',
    job: 'Checks proposed changes for missing files, regressions, unsafe assumptions, and cleanup tasks.',
  },
  {
    role: 'Coordinator',
    job: 'Tracks state, chooses the next agent, and stops when the task is done, blocked, or needs user approval.',
  },
];
