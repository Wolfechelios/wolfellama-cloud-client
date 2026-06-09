import type { BuilderFileChange, BuilderTask } from './builderTypes';

export interface BuilderPatchExport {
  projectName?: string;
  generatedAt: string;
  changes: Array<Pick<BuilderFileChange, 'filePath' | 'summary' | 'after' | 'status'>>;
}

export function createPatchExport(task: BuilderTask): BuilderPatchExport {
  return {
    projectName: task.projectName,
    generatedAt: new Date().toISOString(),
    changes: task.changes
      .filter((change) => change.status === 'accepted')
      .map(({ filePath, summary, after, status }) => ({ filePath, summary, after, status })),
  };
}

export function createPatchExportText(task: BuilderTask) {
  const patch = createPatchExport(task);
  return JSON.stringify(patch, null, 2);
}
