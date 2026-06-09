export type BuilderChangeStatus = 'draft' | 'accepted' | 'rejected';

export interface BuilderFileChange {
  id: string;
  filePath: string;
  summary: string;
  before?: string;
  after: string;
  status: BuilderChangeStatus;
}

export interface BuilderIgnoredFolder {
  folder: string;
  count: number;
}

export interface BuilderZipContext {
  name: string;
  size: number;
  rootPath: string;
  framework: string;
  packageManager: string;
  fileCount: number;
  textFileCount: number;
  ignoredCount: number;
  ignoredFolders: BuilderIgnoredFolder[];
  files: Array<{
    path: string;
    size: number;
    isText: boolean;
    content?: string;
  }>;
  summary: string;
}

export interface BuilderTask {
  id: string;
  goal: string;
  projectName?: string;
  zipContext?: BuilderZipContext;
  plan: string[];
  changes: BuilderFileChange[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
}
