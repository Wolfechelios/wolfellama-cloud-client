export interface ProjectFileEntry {
  path: string;
  name: string;
  kind: 'file' | 'folder';
}

export interface ProjectFileReadResult {
  path: string;
  content: string;
}

export interface ProjectFileWriteResult {
  path: string;
  saved: boolean;
  message: string;
}

export interface ProjectFileEditorApi {
  listFiles(projectPath: string): Promise<ProjectFileEntry[]>;
  readFile(projectPath: string, filePath: string): Promise<ProjectFileReadResult>;
  writeFile(projectPath: string, filePath: string, content: string): Promise<ProjectFileWriteResult>;
  createFile(projectPath: string, filePath: string, content: string): Promise<ProjectFileWriteResult>;
}

declare global {
  interface Window {
    projectFiles?: ProjectFileEditorApi;
  }
}

export {};
