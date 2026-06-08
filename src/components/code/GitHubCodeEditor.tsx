import { useState } from 'react';

interface GitHubCodeEditorProps {
  onSendToChat: (text: string) => void;
}

interface GitHubFileResponse {
  path?: string;
  sha?: string;
  content?: string;
  encoding?: string;
}

const DEFAULT_REPO = 'Wolfechelios/wolfellama-cloud-client';

function decodeContent(value: string) {
  const clean = value.replace(/\n/g, '');
  const binary = atob(clean);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeContent(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function GitHubCodeEditor({ onSendToChat }: GitHubCodeEditorProps) {
  const [accessKey, setAccessKey] = useState('');
  const [repo, setRepo] = useState(DEFAULT_REPO);
  const [branch, setBranch] = useState('main');
  const [path, setPath] = useState('src/App.tsx');
  const [commitMessage, setCommitMessage] = useState('Update file from WolfeLlama editor');
  const [fileSha, setFileSha] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('Ready');
  const [isBusy, setIsBusy] = useState(false);

  const hasChanges = content !== originalContent;
  const lineCount = content ? content.split('\n').length : 0;

  function headers() {
    const output: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    if (accessKey.trim()) output.Authorization = `Bearer ${accessKey.trim()}`;
    return output;
  }

  async function loadFile() {
    if (!repo.trim() || !path.trim()) {
      setStatus('Repository and path required');
      return;
    }

    setIsBusy(true);
    setStatus('Loading');

    try {
      const response = await fetch(`https://api.github.com/repos/${repo.trim()}/contents/${path.trim()}?ref=${encodeURIComponent(branch.trim() || 'main')}`, {
        headers: headers(),
      });

      if (!response.ok) throw new Error(`Load failed: ${response.status}`);

      const data = (await response.json()) as GitHubFileResponse;
      if (!data.content || data.encoding !== 'base64') throw new Error('File content unavailable');

      const decoded = decodeContent(data.content);
      setFileSha(data.sha ?? '');
      setOriginalContent(decoded);
      setContent(decoded);
      setStatus(`Loaded ${data.path ?? path}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unknown load error');
    } finally {
      setIsBusy(false);
    }
  }

  async function saveFile() {
    if (!accessKey.trim()) {
      setStatus('Access key required to save');
      return;
    }
    if (!fileSha) {
      setStatus('Load file before saving');
      return;
    }
    if (!hasChanges) {
      setStatus('No changes');
      return;
    }

    setIsBusy(true);
    setStatus('Saving');

    try {
      const response = await fetch(`https://api.github.com/repos/${repo.trim()}/contents/${path.trim()}`, {
        method: 'PUT',
        headers: {
          ...headers(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage.trim() || `Update ${path.trim()}`,
          content: encodeContent(content),
          sha: fileSha,
          branch: branch.trim() || 'main',
        }),
      });

      if (!response.ok) throw new Error(`Save failed: ${response.status}`);

      const data = (await response.json()) as { content?: { sha?: string }; commit?: { sha?: string } };
      setFileSha(data.content?.sha ?? fileSha);
      setOriginalContent(content);
      setStatus(`Saved${data.commit?.sha ? ` ${data.commit.sha.slice(0, 7)}` : ''}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unknown save error');
    } finally {
      setIsBusy(false);
    }
  }

  function sendFileToChat() {
    onSendToChat(`Review and edit this code from ${path}:\n\n\`\`\`\n${content}\n\`\`\``);
  }

  return (
    <section className="code-editor-panel">
      <div className="agent-hero">
        <div>
          <p className="eyebrow">GitHub workspace</p>
          <h3>Code Editor</h3>
          <p>Load a file, edit it here, send it into chat, then commit it back.</p>
        </div>
        <div className="hardware-badge">{status}</div>
      </div>

      <div className="code-editor-grid">
        <label>Access key<input type="password" value={accessKey} onChange={(event) => setAccessKey(event.target.value)} placeholder="Session only" /></label>
        <label>Repository<input value={repo} onChange={(event) => setRepo(event.target.value)} placeholder="owner/repo" /></label>
        <label>Branch<input value={branch} onChange={(event) => setBranch(event.target.value)} placeholder="main" /></label>
        <label>File path<input value={path} onChange={(event) => setPath(event.target.value)} placeholder="src/App.tsx" /></label>
      </div>

      <div className="hardware-actions">
        <button type="button" className="connect-button" onClick={loadFile} disabled={isBusy}>Load File</button>
        <button type="button" className="ghost-button" onClick={sendFileToChat} disabled={!content}>Send to Chat</button>
        <button type="button" className="connect-button" onClick={saveFile} disabled={isBusy || !hasChanges}>Commit File</button>
      </div>

      <label>Commit message<input value={commitMessage} onChange={(event) => setCommitMessage(event.target.value)} /></label>

      <div className="code-editor-meta">
        <span>SHA: {fileSha ? fileSha.slice(0, 12) : 'not loaded'}</span>
        <span>Lines: {lineCount}</span>
        <span>State: {hasChanges ? 'unsaved' : 'clean'}</span>
      </div>

      <textarea className="code-editor-textarea" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Load a GitHub file to edit it here." spellCheck={false} />
    </section>
  );
}
