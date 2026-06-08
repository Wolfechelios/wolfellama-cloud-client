import { useEffect, useMemo, useState } from 'react';
import { createRepoProject, explainLogLine } from '../../repoRunner/repoDetection';
import { loadRepoLibrary, removeRepoProject, saveRepoLibrary, upsertRepoProject } from '../../repoRunner/repoLibrary';
import type { EnvField, RepoProject } from '../../repoRunner/repoRunnerTypes';

interface RepoRunnerPanelProps {
  onExplainWithChat: (text: string) => void;
}

function updateTimestamp(project: RepoProject): RepoProject {
  return { ...project, updatedAt: new Date().toISOString() };
}

function addLog(project: RepoProject, line: string): RepoProject {
  const logs = [...project.logs, line];
  const plainEnglishLogs = [...project.plainEnglishLogs, explainLogLine(line)];
  return updateTimestamp({ ...project, logs, plainEnglishLogs });
}

export function RepoRunnerPanel({ onExplainWithChat }: RepoRunnerPanelProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [projects, setProjects] = useState<RepoProject[]>(() => loadRepoLibrary());
  const [activeProjectId, setActiveProjectId] = useState(() => loadRepoLibrary()[0]?.id ?? '');
  const activeProject = useMemo(() => projects.find((project) => project.id === activeProjectId), [activeProjectId, projects]);

  useEffect(() => {
    saveRepoLibrary(projects);
  }, [projects]);

  function setProject(project: RepoProject) {
    setProjects((current) => upsertRepoProject(current, project));
    setActiveProjectId(project.id);
  }

  function handleAddRepo() {
    const trimmed = repoUrl.trim();
    if (!trimmed) return;
    const project = createRepoProject(trimmed, { fileNames: ['package.json'] });
    setProject(addLog(project, 'Repo added. Native clone bridge not connected yet.'));
    setRepoUrl('');
  }

  function handleDetectProject(project: RepoProject) {
    const detected = updateTimestamp({ ...project, status: 'detected' });
    setProject(addLog(detected, `Detected ${detected.appType} app using ${detected.packageManager}.`));
  }

  function handleInstall(project: RepoProject) {
    const next = updateTimestamp({ ...project, status: 'installing' });
    setProject(addLog(next, `Install command ready: ${project.installCommand}`));
  }

  function handleRun(project: RepoProject) {
    const command = project.selectedRunCommand ?? project.runCommands[0]?.command ?? 'Manual run command required';
    const next = updateTimestamp({ ...project, status: 'running' });
    setProject(addLog(next, `Run command ready: ${command}`));
  }

  function handleStop(project: RepoProject) {
    const next = updateTimestamp({ ...project, status: 'stopped' });
    setProject(addLog(next, 'Project stopped. Native process control bridge pending.'));
  }

  function handleRestart(project: RepoProject) {
    const command = project.selectedRunCommand ?? project.runCommands[0]?.command ?? 'Manual run command required';
    const next = updateTimestamp({ ...project, status: 'running' });
    setProject(addLog(next, `Restart requested: ${command}`));
  }

  function handleEnvChange(project: RepoProject, index: number, nextField: EnvField) {
    const fields = project.envFields.map((field, fieldIndex) => (fieldIndex === index ? nextField : field));
    setProject(updateTimestamp({ ...project, envFields: fields }));
  }

  function handleAddEnv(project: RepoProject) {
    setProject(updateTimestamp({ ...project, envFields: [...project.envFields, { key: '', value: '', required: true }] }));
  }

  function handleRemoveProject(projectId: string) {
    const next = removeRepoProject(projects, projectId);
    setProjects(next);
    setActiveProjectId(next[0]?.id ?? '');
  }

  function explainLogs(project: RepoProject) {
    onExplainWithChat(`Explain these repo runner logs in plain English and suggest the next fix:\n\n${project.logs.join('\n')}`);
  }

  return (
    <section className="repo-runner-panel">
      <div className="agent-hero">
        <div>
          <p className="eyebrow">No-code GitHub launcher</p>
          <h3>Repo Runner</h3>
          <p>Paste a GitHub URL, detect the app type, prepare install/run commands, manage env fields, and save projects.</p>
        </div>
        <div className="hardware-badge">{activeProject?.status ?? 'ready'}</div>
      </div>

      <div className="repo-runner-url-row">
        <label>
          GitHub repo URL
          <input value={repoUrl} onChange={(event) => setRepoUrl(event.target.value)} placeholder="https://github.com/owner/repo" />
        </label>
        <button type="button" className="connect-button" onClick={handleAddRepo}>Add Repo</button>
      </div>

      <div className="repo-runner-layout">
        <aside className="repo-library-card">
          <h4>Project Library</h4>
          {projects.length === 0 && <p>No repos saved yet.</p>}
          {projects.map((project) => (
            <button key={project.id} type="button" className={project.id === activeProjectId ? 'active' : ''} onClick={() => setActiveProjectId(project.id)}>
              <strong>{project.name}</strong>
              <span>{project.appType} • {project.status}</span>
            </button>
          ))}
        </aside>

        <div className="repo-project-card">
          {!activeProject ? (
            <p>Paste a GitHub URL to create a project.</p>
          ) : (
            <>
              <div className="repo-project-header">
                <div>
                  <h4>{activeProject.name}</h4>
                  <p>{activeProject.repoUrl}</p>
                </div>
                <button type="button" className="ghost-button" onClick={() => handleRemoveProject(activeProject.id)}>Remove</button>
              </div>

              <div className="repo-facts-grid">
                <span>Type: {activeProject.appType}</span>
                <span>Package: {activeProject.packageManager}</span>
                <span>Install: {activeProject.installCommand}</span>
                <span>Preview: {activeProject.previewUrl ?? 'not detected'}</span>
              </div>

              <div className="hardware-actions">
                <button type="button" className="ghost-button" onClick={() => handleDetectProject(activeProject)}>Detect</button>
                <button type="button" className="ghost-button" onClick={() => handleInstall(activeProject)}>Install</button>
                <button type="button" className="connect-button" onClick={() => handleRun(activeProject)}>Run</button>
                <button type="button" className="ghost-button" onClick={() => handleStop(activeProject)}>Stop</button>
                <button type="button" className="ghost-button" onClick={() => handleRestart(activeProject)}>Restart</button>
                <button type="button" className="ghost-button" onClick={() => explainLogs(activeProject)}>Explain Logs With AI</button>
              </div>

              <div className="repo-env-card">
                <div className="repo-project-header">
                  <h4>Environment Fields</h4>
                  <button type="button" className="ghost-button" onClick={() => handleAddEnv(activeProject)}>Add Field</button>
                </div>
                {activeProject.envFields.length === 0 && <p>No env fields yet. Add keys required by the repo.</p>}
                {activeProject.envFields.map((field, index) => (
                  <div className="repo-env-row" key={`${field.key}-${index}`}>
                    <input value={field.key} onChange={(event) => handleEnvChange(activeProject, index, { ...field, key: event.target.value })} placeholder="KEY" />
                    <input value={field.value} onChange={(event) => handleEnvChange(activeProject, index, { ...field, value: event.target.value })} placeholder="value" />
                  </div>
                ))}
              </div>

              <div className="repo-log-card">
                <h4>Terminal Logs In Plain English</h4>
                {activeProject.logs.length === 0 && <p>No logs yet.</p>}
                {activeProject.logs.map((line, index) => (
                  <article key={`${line}-${index}`}>
                    <code>{line}</code>
                    <p>{activeProject.plainEnglishLogs[index]}</p>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
