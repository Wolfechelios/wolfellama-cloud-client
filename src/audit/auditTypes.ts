export type AuditStatus = 'pending' | 'running' | 'pass' | 'warn' | 'fail';

export interface AuditCheckResult {
  status: 'pass' | 'warn' | 'fail';
  summary: string;
  details: string[];
  recommendation?: string;
}

export interface AuditCheck {
  id: string;
  label: string;
  area: string;
  description: string;
  run: () => Promise<AuditCheckResult> | AuditCheckResult;
}

export interface AuditRunItem {
  id: string;
  label: string;
  area: string;
  description: string;
  status: AuditStatus;
  summary?: string;
  details: string[];
  recommendation?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface AuditRunReport {
  id: string;
  startedAt: string;
  completedAt?: string;
  status: AuditStatus;
  passCount: number;
  warnCount: number;
  failCount: number;
  items: AuditRunItem[];
  debugLog: string[];
}
