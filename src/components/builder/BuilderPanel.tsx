import { useEffect, useState } from 'react';
import { createBuilderTask, loadBuilderTask, saveBuilderTask } from '../../builder/builderMemory';
import type { BuilderFileChange, BuilderTask } from '../../builder/builderTypes';

interface BuilderPanelProps {
  onSendToChat: (text: string) => void;
}

function updateTask(task: BuilderTask): BuilderTask {
  return { ...task, updatedAt: new Date().toISOString() };
}

export function BuilderPanel({ onSendToChat }: BuilderPanelProps) {
  const [goal, setGoal] = useState('');
  const [task, setTask] = useState<BuilderTask | undefined>(() => loadBuilderTask());
  const [filePath, setFilePath] = useState('src/App.tsx');
  const [changeSummary, setChangeSummary] = useState('Describe the intended change.');
  const [afterContent, setAfterContent] = useState('');

  useEffect(() => {
    saveBuilderTask(task);
  }, [task]);

  function startTask() {
    const trimmed = goal.trim();
    if (!trimmed) return;
    setTask(createBuilderTask(trimmed));
    setGoal('');
  }

  function clearTask() {
    setTask(undefined);
  }

  function askAiForPlan(currentTask: BuilderTask) {
    onSendToChat(`You are Builder Mode for WolfeLlama. Build or fix this app request:\n\n${currentTask.goal}\n\nReturn a practical plan, likely files to edit, and a safe patch strategy. Do not save files yet. Show changes for review first.`);
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
    onSendToChat(`Review this proposed file change for ${change.filePath}:\n\nSummary: ${change.summary}\n\nProposed content:\n\n\`\`\`\n${change.after}\n\`\`\`\n\nTell me if this is safe, what it changes, and whether anything else must be updated.`);
  }

  return (
    <section className="builder-panel">
      <div className="agent-hero">
        <div>
          <p className="eyebrow">AI app builder</p>
          <h3>Builder Mode</h3>
          <p>Describe what to build, get a plan, propose file changes, review them, then send changes to chat for AI help.</p>
        </div>
        <div className="hardware-badge">{task ? 'active build' : 'ready'}</div>
      </div>

      <div className="builder-goal-card">
        <label>
          What do you want to build or fix?
          <textarea value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Example: Add a project file editor with diff preview and save button." />
        </label>
        <button type="button" className="connect-button" onClick={startTask}>Start Builder Task</button>
      </div>

      {!task ? (
        <div className="builder-empty-card">
          <h4>No active build task</h4>
          <p>Start with a goal. Builder Mode will organize the plan and proposed file changes.</p>
        </div>
      ) : (
        <div className="builder-layout">
          <div className="builder-task-card">
            <div className="repo-project-header">
              <div>
                <h4>Goal</h4>
                <p>{task.goal}</p>
              </div>
              <button type="button" className="ghost-button" onClick={clearTask}>Clear</button>
            </div>

            <div className="builder-plan-card">
              <h4>Plan</h4>
              <ol>
                {task.plan.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </div>

            <div className="hardware-actions">
              <button type="button" className="connect-button" onClick={() => askAiForPlan(task)}>Ask AI For Build Plan</button>
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
