import { unzipSync, strFromU8 } from 'fflate';

export interface ZipProjectFile {
  path: string;
  size: number;
  isText: boolean;
  content?: string;
}

export interface ZipProjectContext {
  name: string;
  size: number;
  fileCount: number;
  textFileCount: number;
  files: ZipProjectFile[];
  summary: string;
}

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.html', '.md', '.txt', '.env', '.example', '.yml', '.yaml', '.toml', '.py', '.rb', '.go', '.rs', '.java', '.kt', '.swift', '.php', '.sh', '.sql', '.xml', '.svg', '.vue', '.svelte',
]);

const IMPORTANT_NAMES = new Set([
  'package.json', 'vite.config.ts', 'vite.config.js', 'next.config.js', 'next.config.ts', 'tsconfig.json', 'README.md', 'readme.md', '.env.example', 'requirements.txt', 'pyproject.toml', 'src/App.tsx', 'src/main.tsx', 'src/App.jsx', 'src/main.jsx', 'index.html',
]);

function extensionOf(path: string) {
  const clean = path.toLowerCase();
  const dotIndex = clean.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return clean.slice(dotIndex);
}

function looksText(path: string) {
  const name = path.split('/').pop() ?? path;
  if (IMPORTANT_NAMES.has(path) || IMPORTANT_NAMES.has(name)) return true;
  return TEXT_EXTENSIONS.has(extensionOf(path));
}

function rankFile(path: string) {
  const name = path.split('/').pop() ?? path;
  if (IMPORTANT_NAMES.has(path) || IMPORTANT_NAMES.has(name)) return 0;
  if (path.startsWith('src/')) return 1;
  if (path.includes('/src/')) return 2;
  return 3;
}

export async function readZipProject(file: File): Promise<ZipProjectContext> {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const entries = unzipSync(buffer);
  const files: ZipProjectFile[] = [];

  for (const [path, data] of Object.entries(entries)) {
    if (path.endsWith('/')) continue;
    const isText = looksText(path);
    const entry: ZipProjectFile = { path, size: data.length, isText };

    if (isText && data.length <= 120_000) {
      try {
        entry.content = strFromU8(data);
      } catch {
        entry.content = undefined;
      }
    }

    files.push(entry);
  }

  const sorted = files.sort((a, b) => rankFile(a.path) - rankFile(b.path) || a.path.localeCompare(b.path));
  const selected = sorted.filter((item) => item.isText && item.content).slice(0, 18);

  const summary = selected
    .map((item) => `FILE: ${item.path}\n${item.content?.slice(0, 6000) ?? ''}`)
    .join('\n\n---\n\n');

  return {
    name: file.name,
    size: file.size,
    fileCount: files.length,
    textFileCount: files.filter((item) => item.isText).length,
    files: sorted.slice(0, 250),
    summary,
  };
}
