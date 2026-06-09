import { DragEvent, useEffect, useState } from 'react';
import { createBuilderTask, loadBuilderTask, saveBuilderTask } from '../../builder/builderMemory';
import type { BuilderFileChange, BuilderTask, BuilderZipContext } from '../../builder/builderTypes';
import { readZipProject } from '../../builder/zipProjectReader';

interface BuilderPanelProps {
  onSendToChat: (text: string) => void;
  activeModel: string;
  modelOptions: string[];
  providerName: string;
}

const BUILDER_MODEL_KEY = 'wolfellama.builder.model';

function getSavedBuilderModel(fallback: string) {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(BUILDER_MODEL_KEY) ?? fallback;
}

function updateTask(task: BuilderTask): BuilderTask {
  return { ...task, updatedAt: new Date().toISOString() };
}

export function BuilderPanel({ onSendToChat, activeModel, modelOptions, providerName }: BuilderPanelProps) {
  const [goal, setGoal] = useState('');
  const [task, setTask] = useState<BuilderTask | undefined>(() => loadBuilderTask());
  const [filePath, setFilePath] = useState('src/App.tsx');
  const [changeSummary, setChangeSummary] = useState('Describe the intended change.');
  const [afterContent, setAfterContent] = useState('');
  const [builderModel, setBuilderModel] = useState(() => getSavedBuilderModel(activeModel));
  const [zipStatus, setZipStatus] = useState('No ZIP loaded yet.');

  useEffect(() => {
    saveBuilderTask(task);
  }, [task]);

  useEffect(() => {
    window.localStorage.setItem(BUILDER_MODEL_KEY, builderModel);
  }, [builderModel]);

  useEffect(() => {
    if (!builderModel && activeModel) setBuilderModel(activeModel);
  }, [activeModel, builderModel]);

  function startTask() {
    const trimmed = goal.trim();
    if (!trimmed) return;
    setTask(createBuilderTask(trimmed));
    setGoal('');
  }

  function clearTask() {
    setTask(undefined);
    setZipStatus('No ZIP loaded yet.');
  }

  async function attachZip(file: File) {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setZipStatus('Only .zip files are supported here.');
      return;
    }

    setZipStatus(`Reading ${file.name}...`);
    try {
      const zipContext = await readZipProject(file);
      const currentTask = task ?? createBuilderTask(goal.trim() || `Continue coding from ${file.name}`);
      const nextTask = updateTask({
        ...currentTask,
        projectName: zipContext.name,
        zipContext: zipContext as BuilderZipContext,
        notes: [
          ...currentTask.notes,
          `Loaded ZIP ${zipContext.name} with ${zipContext.fileCount} files and ${zipContext.textFileCount} text-like files.`,
        ],
      });
      setTask(nextTask);
      setGoal('');
      setZipStatus(`Loaded ${zipContext.name}: ${zipContext.fileCount} files, ${zipContext.textFileCount} text-like files.`);
    } catch (error) {
      setZipStatus(error instanceof Error ? error.message : 'Could not read ZIP file.');
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files.item(0);
    if (file) void attachZip(file);
  }

  function askAiForPlan(currentTask: BuilderTask) {
    const zipText = currentTask.zipContext
      ? `\n\nZIP PROJECT CONTEXT:\nName: ${currentTask.zipContext.name}\nFiles: ${currentTask.zipContext.fileCount}\nText-like files: ${currentTask.zipContext.textFileCount}\n\nEXTRACTED IMPORTANT FILES:\n${currentTask.zipContext.summary}`
      : '';

    onSendToChat(`Use this model as the Builder Mode model: ${builderModel}\nProvider: ${providerName}\n\nYou are Builder Mode for WolfeLlama. Continue coding from the uploaded project context when available.\n\nBuild or fix this request:\n\n${currentTask.goal}${zipText}\n\nReturn a practical plan, likely files to edit, and proposed file changes. Do not assume missing files. Do not save files yet. Show changes for review first.`);
  }

  function askAiToContinueFromZip(currentTask: BuilderTask) {
    if (!currentTask.zipContext) return;
    onSendToChat(`Use this model as the Builder Mode model: ${builderModel}\nProvider: ${providerName}\n\nI uploaded this ZIP project into Builder Mode. Continue coding based on what is inside.\n\nProject: ${currentTask.zipContext.name}\nFiles: ${currentTask.zipContext.fileCount}\nText-like files: ${currentTask.zipContext.textFileCount}\n\nImportant extracted files:\n${currentTask.zipContext.summary}\n\nTell me what the app is, what framework it uses, what files matter first, and what you would change next.`);
  }

  function addDraftChange(currentTask: BuilderTask) {
    if (!filePath.trim() || !afterContent.trim()) return;

    const change: BuilderFileChange = {
      id: crypto.randomUUID(),
      filePath: filePath.trim(),
      summary: changeSummary.trim() || 'Draft file change',
      after: afterContent,
      status: 'draft',
    };

    setTask(updateTask({ ...currentTask, changes: [...currentTask.changes, change] }));
    setAfterContent('');
  }

  function setChangeStatus(currentTask: BuilderTask, changeId: string, status: BuilderFileChange['status']) {
    setTask(
      updateTask({
        ...currentTask,
        changes: currentTask.changes.map((change) => (change.id === changeId ? { ...change, status } : change)),
      }),
    );
  }

  function sendChangeToChat(change: BuilderFileChange) {
    onSendToChat(`Use this model as the Builder Mode model: ${builderModel}\nProvider: ${providerName}\n\nReview this proposed file change for ${change.filePath}:\n\nSummary: ${change.summary}\n\nProposed content:\n\n\`\`\`\n${change.after}\n\`\`\`\n\nTell me if this is safe, what it changes, and whether anything else must be updated.`);
  }

  return (
    <section className="builder-panel">
      <div className="agent-hero">
        <div>
          <p className="eyebrow">AI app builder</p>
          <h3>Builder Mode</h3>
          <p>Drop a ZIP, choose a build model, continue coding from the files inside, and review proposed changes.</p>
        </div>
        <div className="hardware-badge">{task ? 'active build' : 'ready'}</div>
      </div>

      <div className="builder-model-card">
        <label>
          Builder model
          <input list="builder-model-options" value={builderModel} onChange={(event) => setBuilderModel(event.target.value)} placeholder={activeModel} />
          <datalist id="builder-model-options">
            {[builderModel, activeModel, ...modelOptions].filter(Boolean).map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </label>
        <p>Provider: {providerName} • Builder model: {builderModel || activeModel}</p>
      </div>

      <div className="builder-zip-drop" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
        <h4>Drop ZIP Project Here</h4>
        <p>{zipStatus}</p>
        <label>
          Choose ZIP file
          <input type="file" accept=".zip,application/zip" onChange={(event) => {
            const file = event.target.files?.item(0);
            if (file) void attachZip(file);
          }} />
        </label>
      </div>

      <div className="builder-goal-card">
        <label>
          What do you want to build or fix?
          <textarea value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Example: Continue this uploaded ZIP project and add a file editor with diff preview." />
        </label>
        <button type="button" className="connect-button" onClick={startTask}>Start Builder Task</button>
      </div>

      {!task ? (
        <div className="builder-empty-card">
          <h4>No active build task</h4>
          <p>Drop a ZIP or start with a goal. Builder Mode will organize the plan and proposed file changes.</p>
        </div>
      ) : (
        <div className="builder-layout">
          <div className="builder-task-card">
            <div className="repo-project-header">
              <div>
                <h4>Goal</h4>
                <p>{task.goal}</p>
                {task.zipContext && <p>ZIP: {task.zipContext.name} • {task.zipContext.fileCount} files</p>}
              </div>
              <button type="button" className="ghost-button" onClick={clearTask}>Clear</button>
            </div>

            <div className="builder-plan-card">
              <h4>Plan</h4>
              <ol>
                {task.plan.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </div>

            {task.zipContext && (
              <div className="builder-zip-summary">
                <h4>ZIP Files</h4>
                <p>{task.zipContext.textFileCount} text-like files detected. Showing first {Math.min(task.zipContext.files.length, 30)} files.</p>
                <div>
                  {task.zipContext.files.slice(0, 30).map((file) => (
                    <span key={file.path}>{file.path}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="hardware-actions">
              <button type="button" className="connect-button" onClick={() => askAiForPlan(task)}>Ask AI For Build Plan</button>
              {task.zipContext && <button type="button" className="ghost-button" onClick={() => askAiToContinueFromZip(task)}>Continue From ZIP</button>}
            </div>
          </div>

          <div className="builder-task-card">
            <h4>Draft File Change</h4>
            <label>
              File path
              <input value={filePath} onChange={(event) => setFilePath(event.target.value)} />
            </label>
            <label>
              Change summary
              <input value={changeSummary} onChange={(event) => setChangeSummary(event.target.value)} />
            </label>
            <label>
              Proposed content
              <textarea value={afterContent} onChange={(event) => setAfterContent(event.target.value)} placeholder="Paste proposed file content or AI patch here." />
            </label>
            <button type="button" className="ghost-button" onClick={() => addDraftChange(task)}>Add Draft Change</button>
          </div>

          <div className="builder-task-card builder-changes-card">
            <h4>Proposed Changes</h4>
            {task.changes.length === 0 && <p>No proposed changes yet.</p>}
            {task.changes.map((change) => (
              <article key={change.id}>
                <div className="repo-project-header">
                  <div>
                    <strong>{change.filePath}</strong>
                    <p>{change.summary}</p>
                    <p>Status: {change.status}</p>
                  </div>
                  <button type="button" className="ghost-button" onClick={() => sendChangeToChat(change)}>Ask AI</button>
                </div>
                <pre>{change.after}</pre>
                <div className="hardware-actions">
                  <button type="button" className="ghost-button" onClick={() => setChangeStatus(task, change.id, 'accepted')}>Accept</button>
                  <button type="button" className="ghost-button" onClick={() => setChangeStatus(task, change.id, 'rejected')}>Reject</button>
                  <button type="button" className="ghost-button" onClick={() => setChangeStatus(task, change.id, 'draft')}>Back To Draft</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
