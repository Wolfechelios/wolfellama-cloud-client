import { useEffect, useMemo, useState } from 'react';
import { codingAgentCapabilities, codingAgentOrchestrationRoles } from '../../agent/codingAgentCapabilities';
import { createAgentTask, markAgentBlocked, runNextAgentStep } from '../../agent/agentRunner';
import type { AgentRuntimeContext, AgentTask } from '../../agent/agentTypes';
import { clearAgentTask, loadAgentTask, saveAgentTask } from '../../agent/taskMemory';

interface AgentPanelProps {
  context: AgentRuntimeContext;
}

export function AgentPanel({ context }: AgentPanelProps) {
  const [goal, setGoal] = useState('');
  const [task, setTask] = useState<AgentTask | undefined>(() => loadAgentTask());
  const completedCount = useMemo(() => task?.steps.filter((step) => step.status === 'complete').length ?? 0, [task]);
  const totalCount = task?.steps.length ?? 0;

  useEffect(() => {
    if (task) saveAgentTask(task);
  }, [task]);

  function handleCreateTask() {
    const trimmed = goal.trim();
    if (!trimmed) return;

    setTask(createAgentTask(trimmed, context));
    setGoal('');
  }

  function handleAdvanceStep() {
    if (!task) return;
    setTask(runNextAgentStep(task));
  }

  function handleBlocked() {
    if (!task) return;
    setTask(markAgentBlocked(task, 'Manual review requested before continuing.'));
  }

  function handleClearTask() {
    clearAgentTask();
    setTask(undefined);
    setGoal('');
  }

  return (
    <section className="agent-panel">
      <div className="agent-hero">
        <div>
          <p className="eyebrow">Delegation workspace</p>
          <h3>Agent Mode</h3>
          <p>Plan larger tasks, track coding-agent capabilities, advance step by step, and resume progress after reload.</p>
        </div>
        <div className="hardware-badge">{task?.status ?? 'idle'}</div>
      </div>

      <div className="agent-context-card">
        <strong>Active model:</strong> {context.providerName} / {context.model} / {context.mode}
      </div>

      <div className="agent-capability-grid">
        {codingAgentCapabilities.map((capability) => (
          <article key={capability.id} className={`agent-capability-card ${capability.status}`}>
            <div className="repo-project-header">
              <h4>{capability.title}</h4>
              <span>{capability.status}</span>
            </div>
            <p>{capability.summary}</p>
            <strong>Current support</strong>
            <ul>
              {capability.currentSupport.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <strong>Next pass</strong>
            <ul>
              {capability.nextPass.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </div>

      <div className="agent-log-card">
        <h4>Agentic orchestration roles</h4>
        {codingAgentOrchestrationRoles.map((role) => (
          <p key={role.role}>
            <span>{role.role}</span> {role.job}
          </p>
        ))}
      </div>

      <label>
        Goal
        <textarea
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
          placeholder="Delegate a larger task here. Example: Add provider setup without breaking Terminal Mode."
        />
      </label>

      <div className="hardware-actions">
        <button type="button" className="connect-button" onClick={handleCreateTask}>
          Create Plan
        </button>
        <button type="button" className="ghost-button" onClick={handleAdvanceStep} disabled={!task}>
          Advance Step
        </button>
        <button type="button" className="ghost-button" onClick={handleBlocked} disabled={!task}>
          Mark Blocked
        </button>
        <button type="button" className="ghost-button" onClick={handleClearTask}>
          Clear Task
        </button>
      </div>

      {task && (
        <>
          <div className="agent-progress">
            Progress: {completedCount}/{totalCount} steps complete
          </div>

          <div className="agent-task-card">
            <h4>{task.goal}</h4>
            <ol>
              {task.steps.map((step) => (
                <li key={step.id} className={`agent-step ${step.status}`}>
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                  {step.result && <small>{step.result}</small>}
                </li>
              ))}
            </ol>
          </div>

          <div className="agent-log-card">
            <h4>Task Log</h4>
            {task.log.map((entry) => (
              <p key={entry.id}>
                <span>{new Date(entry.timestamp).toLocaleTimeString()}</span> {entry.message}
              </p>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
