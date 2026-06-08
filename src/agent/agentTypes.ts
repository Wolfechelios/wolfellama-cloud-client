export type AgentTaskStatus = 'idle' | 'planning' | 'ready' | 'running' | 'blocked' | 'complete' | 'failed';

export type AgentStepStatus = 'pending' | 'running' | 'complete' | 'blocked' | 'failed';

export interface AgentStep {
  id: string;
  title: string;
  detail: string;
  status: AgentStepStatus;
  result?: string;
}

export interface AgentTaskLogEntry {
  id: string;
  timestamp: string;
  message: string;
}

export interface AgentTask {
  id: string;
  goal: string;
  status: AgentTaskStatus;
  createdAt: string;
  updatedAt: string;
  steps: AgentStep[];
  log: AgentTaskLogEntry[];
}

export interface AgentRuntimeContext {
  providerId: string;
  providerName: string;
  model: string;
  mode: string;
  memoryEnabled: boolean;
}
