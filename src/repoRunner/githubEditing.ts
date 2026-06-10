export interface GitHubRepoRef {
  owner: string;
  repo: string;
}

export interface GitHubFilePayload {
  path: string;
  content: string;
  sha: string;
  htmlUrl?: string;
}

export interface GitHubCommitResult {
  commitSha: string;
  htmlUrl?: string;
}

function encodeBase64Utf8(value: string) {
  return window.btoa(unescape(encodeURIComponent(value)));
}

function decodeBase64Utf8(value: string) {
  return decodeURIComponent(escape(window.atob(value.replace(/\n/g, ''))));
}

function buildHeaders(token: string) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export function parseGitHubRepoUrl(repoUrl: string): GitHubRepoRef | undefined {
  const trimmed = repoUrl.trim();
  const httpsMatch = trimmed.match(/github\.com\/([^/]+)\/([^/#?]+)(?:[/?#].*)?$/i);
  const sshMatch = trimmed.match(/git@github\.com:([^/]+)\/([^/#?]+)$/i);
  const match = httpsMatch ?? sshMatch;
  if (!match) return undefined;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, ''),
  };
}

export async function fetchGitHubFile(params: {
  repoUrl: string;
  token: string;
  path: string;
  branch: string;
}): Promise<GitHubFilePayload> {
  const repo = parseGitHubRepoUrl(params.repoUrl);
  if (!repo) throw new Error('Use a valid GitHub URL like https://github.com/owner/repo.');
  if (!params.token.trim()) throw new Error('GitHub token is required.');
  if (!params.path.trim()) throw new Error('File path is required.');

  const encodedPath = params.path
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  const ref = encodeURIComponent(params.branch.trim() || 'main');
  const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodedPath}?ref=${ref}`, {
    headers: buildHeaders(params.token),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message ?? `GitHub returned ${response.status}`);
  }
  if (Array.isArray(data) || data.type !== 'file' || typeof data.content !== 'string' || typeof data.sha !== 'string') {
    throw new Error('That path is not a UTF-8 file GitHub can edit through this panel.');
  }

  return {
    path: data.path,
    content: decodeBase64Utf8(data.content),
    sha: data.sha,
    htmlUrl: data.html_url,
  };
}

export async function commitGitHubFile(params: {
  repoUrl: string;
  token: string;
  path: string;
  branch: string;
  sha: string;
  content: string;
  message: string;
}): Promise<GitHubCommitResult> {
  const repo = parseGitHubRepoUrl(params.repoUrl);
  if (!repo) throw new Error('Use a valid GitHub URL like https://github.com/owner/repo.');
  if (!params.token.trim()) throw new Error('GitHub token is required.');
  if (!params.path.trim()) throw new Error('File path is required.');
  if (!params.sha.trim()) throw new Error('Load the file before committing so GitHub has the current file SHA.');

  const encodedPath = params.path
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
  const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/${encodedPath}`, {
    method: 'PUT',
    headers: {
      ...buildHeaders(params.token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: params.message.trim() || `Update ${params.path}`,
      content: encodeBase64Utf8(params.content),
      sha: params.sha,
      branch: params.branch.trim() || 'main',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message ?? `GitHub returned ${response.status}`);
  }

  return {
    commitSha: data?.commit?.sha ?? '',
    htmlUrl: data?.content?.html_url,
  };
}
