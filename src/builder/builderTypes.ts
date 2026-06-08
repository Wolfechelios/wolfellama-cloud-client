export type BuilderChangeStatus = 'draft' | 'accepted' | 'rejected';

export interface BuilderFileChange {
  id: string;
  filePath: string;
  summary: string;
  before?: string;
  after: string;
  status: BuilderChangeStatus;
}

export interface BuilderTask {
  id: string;
  goal: string;
  projectName?: string;
  plan: string[];
  changes: BuilderFileChange[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
}
