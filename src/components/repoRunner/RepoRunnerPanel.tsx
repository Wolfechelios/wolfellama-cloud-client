import { useEffect, useMemo, useState } from 'react';
import { createRepoProject, explainLogLine } from '../../repoRunner/repoDetection';
import { commitGitHubFile, fetchGitHubFile } from '../../repoRunner/githubEditing';
import { loadRepoLibrary, removeRepoProject, saveRepoLibrary, upsertRepoProject } from '../../repoRunner/repoLibrary';
import type { EnvField, RepoProject } from '../../repoRunner/repoRunnerTypes';

interface RepoRunnerPanelProps {
  onExplainWithChat: (text: string) => void;
}

const GITHUB_TOKEN_KEY = 'wolfellama.githubToken';

function updateTimestamp(project: RepoProject): RepoProject {
  return { ...project, updatedAt: new Date().toISOString() };
}

function addLog(project: RepoProject, line: string): RepoProject {
  const logs = [...project.logs, line];
  const plainEnglishLogs = [...project.plainEnglishLogs, explainLogLine(line)];
  return updateTimestamp({ ...project, logs, plainEnglishLogs });
}

function getSavedGitHubToken() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(GITHUB_TOKEN_KEY) ?? '';
}

export function RepoRunnerPanel({ onExplainWithChat }: RepoRunnerPanelProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [projects, setProjects] = useState<RepoProject[]>(() => loadRepoLibrary());
  const [activeProjectId, setActiveProjectId] = useState(() => loadRepoLibrary()[0]?.id ?? '');
  const [githubToken, setGithubToken] = useState(getSavedGitHubToken);
  const [githubBranch, setGithubBranch] = useState('main');
  const [githubFilePath, setGithubFilePath] = useState('src/App.tsx');
  const [githubFileSha, setGithubFileSha] = useState('');
  const [githubFileContent, setGithubFileContent] = useState('');
  const [githubCommitMessage, setGithubCommitMessage] = useState('Update code from WolfeLlama');
  const [githubEditorStatus, setGithubEditorStatus] = useState('Token stays local in this app. Use a fine-grained GitHub token with Contents read/write.');
  const [githubEditorBusy, setGithubEditorBusy] = useState(false);
  const activeProject = useMemo(() => projects.find((project) => project.id === activeProjectId), [activeProjectId, projects]);

  useEffect(() => {
    saveRepoLibrary(projects);
  }, [projects]);

  useEffect(() => {
    window.localStorage.setItem(GITHUB_TOKEN_KEY, githubToken);
  }, [githubToken]);

  function setProject(project: RepoProject) {
    setProjects((current) => upsertRepoProject(current, project));
    setActiveProjectId(project.id);
  }

  function handleAddRepo() {
    const trimmed = repoUrl.trim();
    if (!trimmed) return;
    const project = createRepoProject(trimmed, { fileNames: ['package.json'] });
    setProject(addLog(project, 'Repo added. Native clone bridge not connected yet. GitHub editor is available for direct file edits.'));
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

  async function handleLoadGitHubFile(project: RepoProject) {
    setGithubEditorBusy(true);
    setGithubEditorStatus('Loading file from GitHub...');
    try {
      const file = await fetchGitHubFile({
        repoUrl: project.repoUrl,
        token: githubToken,
        path: githubFilePath,
        branch: githubBranch,
      });
      setGithubFilePath(file.path);
      setGithubFileSha(file.sha);
      setGithubFileContent(file.content);
      setGithubEditorStatus(`Loaded ${file.path}. Edit below, then commit back to ${githubBranch || 'main'}.`);
      setProject(addLog(project, `GitHub file loaded: ${file.path}`));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown GitHub load error';
      setGithubEditorStatus(message);
      setProject(addLog(project, `GitHub load failed: ${message}`));
    } finally {
      setGithubEditorBusy(false);
    }
  }

  async function handleCommitGitHubFile(project: RepoProject) {
    setGithubEditorBusy(true);
    setGithubEditorStatus('Committing file to GitHub...');
    try {
      const result = await commitGitHubFile({
        repoUrl: project.repoUrl,
        token: githubToken,
        path: githubFilePath,
        branch: githubBranch,
        sha: githubFileSha,
        content: githubFileContent,
        message: githubCommitMessage,
      });
      setGithubEditorStatus(`Committed to GitHub${result.commitSha ? `: ${result.commitSha.slice(0, 7)}` : ''}. Reload file before the next edit.`);
      setProject(addLog(project, `GitHub commit complete: ${githubCommitMessage || `Update ${githubFilePath}`}`));
      await handleLoadGitHubFile(project);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown GitHub commit error';
      setGithubEditorStatus(message);
      setProject(addLog(project, `GitHub commit failed: ${message}`));
    } finally {
      setGithubEditorBusy(false);
    }
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
          <p>Paste a GitHub URL, detect the app type, prepare install/run commands, edit repo files, and commit directly to GitHub.</p>
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

              <div className="github-editor-card">
                <div className="repo-project-header">
                  <div>
                    <h4>Direct GitHub Code Editor</h4>
                    <p>Load a file from the selected repo, edit it here, then commit it straight to GitHub.</p>
                  </div>
                  <div className="hardware-badge">{githubEditorBusy ? 'working' : githubFileSha ? 'file loaded' : 'ready'}</div>
                </div>

                <div className="github-editor-grid">
                  <label>
                    GitHub token
                    <input type="password" value={githubToken} onChange={(event) => setGithubToken(event.target.value)} placeholder="Fine-grained token: Contents read/write" />
                  </label>
                  <label>
                    Branch
                    <input value={githubBranch} onChange={(event) => setGithubBranch(event.target.value)} placeholder="main" />
                  </label>
                  <label>
                    File path
                    <input value={githubFilePath} onChange={(event) => setGithubFilePath(event.target.value)} placeholder="src/App.tsx" />
                  </label>
                </div>

                <div className="hardware-actions">
                  <button type="button" className="ghost-button" onClick={() => handleLoadGitHubFile(activeProject)} disabled={githubEditorBusy}>Load File</button>
                  <button type="button" className="connect-button" onClick={() => handleCommitGitHubFile(activeProject)} disabled={githubEditorBusy || !githubFileSha}>Commit To GitHub</button>
                </div>

                <label>
                  Commit message
                  <input value={githubCommitMessage} onChange={(event) => setGithubCommitMessage(event.target.value)} placeholder="Update code from WolfeLlama" />
                </label>

                <label>
                  Code editor
                  <textarea className="github-code-editor" value={githubFileContent} onChange={(event) => setGithubFileContent(event.target.value)} placeholder="Load a file to edit code here." spellCheck={false} />
                </label>
                <p>{githubEditorStatus}</p>
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
